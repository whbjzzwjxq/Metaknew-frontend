<template>
    <v-treeview
        :items="tree"
        :load-children="getDocument"
        :selectable="editMode"
        @update:open="open"
        activatable
        dense
        hoverable
        return-object
        :selection-type="'leaf'"
        v-model="selection"
    >
        <template v-slot:prepend="{ item }">
            <v-icon>{{ item.icon }}</v-icon>
        </template>

        <template v-if="editMode" v-slot:append="{ item }">
            <template>
                <v-btn icon @click="deleteItem(item)" :disabled="!item.deletable">
                    <v-icon small>{{getIcon('i-delete-able', item.deletable)}}</v-icon>
                </v-btn>

                <v-btn icon @click="editItem(item)" :disabled="!item.editable">
                    <v-icon small>{{getIcon('i-edit-able', item.editable)}}</v-icon>
                </v-btn>
            </template>
        </template>

    </v-treeview>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {DataManagerState} from "@/store/modules/dataManager";
    import {commitItemChange, commitSnackbarOn} from "@/store/modules/_mutations";
    import {
        BaseType,
        GraphSelfPart,
        id,
        LinkSettingPart,
        MediaSettingPart,
        NodeSettingPart,
        NoteSettingPart
    } from "@/utils/graphClass";
    import {SnackBarStatePayload} from "@/store/modules/componentSnackBar";
    import {deepClone, getInfoPart, mergeList} from "@/utils/utils";
    import {getIcon, IconGroup} from "@/utils/icon";
    import {dispatchNodeExplode} from "@/store/modules/_dispatch";

    interface DirectoryItem {
        id: id,
        type: BaseType,
        label: string,
        name: string,
        icon: string,
        deletable: boolean,
        editable: boolean,
        parent: GraphSelfPart,
        children?: DirectoryItem[]
    }

    interface DirectoryItemDocument extends DirectoryItem {
        type: 'document',
        children: DirectoryItem[]
    }

    const isDocument = (item: DirectoryItem): item is DirectoryItemDocument => {
        return item.type === 'document'
    };

    export default Vue.extend({
        name: "CardPageDirectory",
        components: {},
        data() {
            return {
                tree: [] as DirectoryItemDocument[],
                allItemList: [] as DirectoryItem[],
                docItemDict: {} as Record<id, DirectoryItemDocument>,
                docLayerDict: {} as Record<number, GraphSelfPart[]>,
                lastOpenList: [] as DirectoryItem[],
                selection: []
            }
        },
        props: {
            document: {
                type: Object as () => GraphSelfPart,
                required: true
            },
            editMode: {
                type: Boolean as () => boolean,
                default: false
            },
        },
        computed: {
            dataManager(): DataManagerState {
                return this.$store.state.dataManager
            },
            // 不包含自身
            childDocumentList: function (): GraphSelfPart[] {
                return this.document.getChildDocument()
            },
            // 不包含自身
            activeDocumentList: function (): GraphSelfPart[] {
                return this.childDocumentList.filter(graph => graph &&
                    !graph.Conf.State.isDeleted)
            },

            //包含自身
            documents: function (): GraphSelfPart[] {
                return this.activeDocumentList.concat(this.document)
            },

            //Document-Children Dict
            allDocToItemDict: function () {
                let result: Record<id, DirectoryItem[]> = {};
                this.documents.map(document => {
                    result[document.id] = this.getDocumentChildList(document)
                });
                return result
            },

            // 只包含节点关系媒体等内容的ItemList
            baseItemList: function () {
                return mergeList(Object.values(this.allDocToItemDict))
            },

            // selection: function () {
            //     let result = this.allItemList.filter(item => this.getOriginState(item).isSelected);
            //     console.log('get', result);
            //     return result;
            // }
        },
        methods: {
            buildStructure: function () {
                console.log('build');
                let docItemDict: Record<id, DirectoryItemDocument> = {};
                let docLayerDict: Record<number, GraphSelfPart[]> = {};
                let tree: DirectoryItemDocument[] = [];
                let max = 0;
                this.documents.map(document => {
                    docItemDict[document.id] = this.documentToItem(document);
                    let layer = document.getChildDocument().length;
                    docLayerDict[layer] || (docLayerDict[layer] = []);
                    docLayerDict[layer].push(document);
                    layer > max && (max = layer)
                });
                for (let i = 0; i <= max; i++) {
                    let docList = docLayerDict[i];
                    if (docList) {
                        docList.map(doc => {
                            let childItem = docItemDict[doc.id];
                            if (doc.Conf.parent) {
                                let parentItem = docItemDict[doc.Conf.parent.id];
                                parentItem.children.push(childItem)
                            } else {
                                // 已经是顶级目录
                                tree.push(childItem)
                            }
                        })
                    }
                }
                this.tree = tree;
                this.docItemDict = docItemDict;
                this.docLayerDict = docLayerDict;
            },

            directory: function () {
                console.log('directory')
                let vm = this;
                this.allItemList = [];
                let update = function (docItem: DirectoryItemDocument) {
                    docItem.children.map(item => {
                        if (isDocument(item)) {
                            update(item)
                        }
                    });
                    vm.updateItemsToParent(docItem)
                };
                this.tree.map(item => update(item));
            },

            nodeToItem: (node: NodeSettingPart) => ({
                id: node.Setting._id,
                type: 'node', //这里是目录意义上的节点
                label: node.Setting._label,
                name: node.Setting._name,
                icon: getIcon('i-item', 'node'),
                deletable: node.parent.Conf.State.isSelf,
                editable: node.State.isSelf,
                parent: node.parent,
                children: node.Setting._type === 'document' && node.Setting._id !== node.parent.id ? [] : undefined
            }) as DirectoryItem,

            linkToItem: (link: LinkSettingPart) => ({
                id: link.Setting._id,
                type: link.Setting._type,
                label: link.Setting._label,
                icon: getIcon('i-item', 'link'),
                name: link.Setting._start.Setting._name + ' --> ' + link.Setting._end.Setting._name,
                deletable: link.parent.Conf.State.isSelf,
                editable: link.State.isSelf,
                parent: link.parent
            }) as DirectoryItem,

            mediaToItem: (media: MediaSettingPart) => ({
                id: media.Setting._id,
                type: media.Setting._type,
                label: media.Setting._label,
                name: media.Setting._name,
                icon: getIcon("i-media-type", media.Setting._label),
                deletable: media.parent.Conf.State.isSelf,
                editable: false,
                parent: media.parent
            }) as DirectoryItem,

            noteToItem: (note: NoteSettingPart) => ({
                id: note.Setting._id,
                type: note.Setting._type,
                label: note.Setting._label,
                name: note.Setting._title,
                icon: getIcon('i-note-type', note.Setting._label),
                deletable: true,
                editable: false,
                parent: note.parent,
            }) as DirectoryItem,

            documentToItem: function (document: GraphSelfPart) {
                return {
                    id: document.id,
                    type: 'document',
                    label: document.baseNode.Setting._label,
                    name: document.baseNode.Setting._name,
                    icon: getIcon('i-item', document.baseNode.Setting._label),
                    deletable: false,
                    editable: document.Conf.State.isSelf,
                    children: [], // 注意这里的children是空的
                    parent: document.Conf.parent
                } as DirectoryItemDocument;
            },
            updateItemsToParent: function (documentItem: DirectoryItemDocument) {
                this.allItemList.push(documentItem);
                let currentDocument = documentItem.children.filter(item => isDocument(item));
                let currentDocumentId = currentDocument.map(item => item.id);
                let currentChildrenId = documentItem.children.map(item => item.id);
                let newItemList = this.allDocToItemDict[documentItem.id];
                let newChildren = currentDocument;
                newItemList.map(item => {
                    let id = item.id;
                    if (currentDocumentId.includes(id)) {
                        //do Nothing 节点被抛弃 因为已经替换成了DocumentItem
                    } else {
                        this.allItemList.push(item);
                        newChildren.push(item)
                        //todo 更加轻量的update方式
                    }
                });
                this.$set(documentItem, 'children', newChildren);
            },

            deleteItem(item: DirectoryItem) {
                this.$set(this.getOriginItem(item).State, 'isDeleted', true);
                let payload = {
                    timeout: 3000,
                    color: 'warning',
                    content: '删除了' + item.type,
                    buttonText: '撤销',
                    action: this.rollBackDelete,
                    actionObject: this.getOriginItem(item),
                    actionName: 'deleteItemFromGraph',
                    once: false
                } as SnackBarStatePayload;
                commitSnackbarOn(payload)
            },

            rollBackDelete(item: DirectoryItem) {
                this.$set(this.getOriginItem(item).State, "isDeleted", false)
            },

            editItem(item: DirectoryItem) {
                let info = getInfoPart(item.id, item.type, this.dataManager);
                commitItemChange(info)
            },

            getOriginItem(item: DirectoryItem) {
                return item.parent.getItemById(item.id, item.type)
            },

            async getDocument(nodeItem: DirectoryItem) {
                let node = this.getOriginItem(nodeItem) as NodeSettingPart;
                let document = nodeItem.parent;
                await dispatchNodeExplode({node, document})
            },

            open(itemList: DirectoryItem[]) {
                if (itemList.length > 0) {
                    // 一定不能监听itemList = 0 的时候的事件 会让Explode重复 增加
                    let idList = itemList.map(item => item.id);
                    this.childDocumentList.filter(document => idList.includes(document.id)).map(document => document.explode())
                }
                this.lastOpenList = itemList;
            },

            getDocumentChildList(document: GraphSelfPart): DirectoryItem[] {
                let nodes = document.Graph.nodes.map(node => this.nodeToItem(node)).filter(item => item.id !== document.id);
                let links = document.Graph.links.map(link => this.linkToItem(link));
                let medias = document.Graph.medias.map(media => this.mediaToItem(media));
                let notes = document.Graph.notes.map(note => this.noteToItem(note));
                return nodes.concat(links).concat(medias).concat(notes)
            },

            getIcon(name: IconGroup, type: string) {
                return getIcon(name, type)
            },

            getOriginState(item: DirectoryItem) {
                let origin;
                if (item.type === 'document') {
                    origin = this.documents.filter(document => (document.id) === item.id)[0].Conf.State
                } else {
                    origin = this.getOriginItem(item).State
                }
                return origin
            },

            updateSelection(value: DirectoryItem[]) {
                console.log(value)
            }

        },
        watch: {
            activeDocumentList() {
                this.buildStructure()
            },
            baseItemList() {
                this.directory()
            }

        },
        mounted(): void {
            this.buildStructure();
            this.directory()
        },
        record: {
            status: 'editing',
            description: '专题目录'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/6
* Updated by [
whb on 2020/01/02
]
*/
