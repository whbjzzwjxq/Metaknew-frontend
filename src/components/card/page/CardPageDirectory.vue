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
        open-on-click
        selection-type="leaf"
        v-model="selection"
    >
        <template v-slot:prepend="{ item }">
            <v-icon>{{ item.icon }}</v-icon>
        </template>

        <template v-if="editMode" v-slot:append="{ item }">
            <template>
                <v-btn
                    v-if="item.id === dataManager.currentGraph.id"
                    style="font-weight: bolder;"
                    color="#42b983"
                    x-small
                    depressed
                    text
                    >
                    Current
                </v-btn>
                <v-btn icon @click="deleteItem(item)" :disabled="!item.deletable" x-small>
                    <v-icon>{{getIcon('i-delete-able', item.deletable)}}</v-icon>
                </v-btn>

                <v-btn icon @click="editItem(item)" :disabled="!item.editable" x-small>
                    <v-icon>{{getIcon('i-edit-able', item.editable)}}</v-icon>
                </v-btn>
            </template>
        </template>

    </v-treeview>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {commitGraphChange, commitItemChange, commitSnackbarOn} from "@/store/modules/_mutations";
    import {
        GraphSelfPart,
        LinkSettingPart,
        MediaSettingPart,
        NodeSettingPart,
        NoteSettingPart
    } from "@/utils/graphClass";
    import {getInfoPart, mergeList} from "@/utils/utils";
    import {getIcon} from "@/utils/icon";
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
        children: DirectoryItem[],
        childDoc: DirectoryItemDocument[]
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
                docItemDict: {} as Record<id, DirectoryItemDocument>,
                docLayerDict: {} as Record<number, GraphSelfPart[]>, // 用层级记录的Item信息
                lastOpenList: [] as DirectoryItem[],
            }
        },
        props: {
            editMode: {
                type: Boolean as () => boolean,
                default: false
            },
        },
        computed: {
            dataManager: function (): DataManagerState {
                return this.$store.state.dataManager
            },
            document: function () {
               return this.dataManager.rootGraph
            },
            // 不包含自身
            childDocumentList: function (): GraphSelfPart[] {
                return this.document.getChildDocument()
            },
            // 不包含自身
            activeDocumentList: function (): GraphSelfPart[] {
                return this.childDocumentList.filter(graph => graph &&
                    !graph.Conf.State.isDeleted) // 这里不要Explode是一次性加载完 不要重新构建目录
            },

            // 控制buildStructure
            activeDocumentIdList: function () {
                return this.activeDocumentList.map(document => document.id)
            },

            //包含自身
            documents: function (): GraphSelfPart[] {
                return [this.document].concat(this.activeDocumentList)
            },

            //Document-Children Dict
            allDocToItemDict: function (): Record<id, DirectoryItem[]> {
                let result: Record<id, DirectoryItem[]> = {};
                this.documents.map(document => {
                    result[document.id] = this.getDocumentChildList(document)
                });
                return result
            },

            // 包含除了根节点之外的所有内容
            baseItemList: function (): DirectoryItem[] {
                return mergeList(Object.values(this.allDocToItemDict))
            },

            baseItemLength: function () {
                // 用length监听Directory变化有些粗糙 后续开发注意Length不变的情况
                return this.baseItemList.length
            },

            selection: {
                get(): DirectoryItem[] {
                    // 逃生舱式写法 获取根节点级别的选择集
                    let root = this.tree.filter(root => {
                        let node = this.document.Graph.nodes.filter(item => item.Setting._id === root.id)[0];
                        return node.State.isSelected
                    }) as DirectoryItem[];
                    return root.concat(this.baseItemList.filter(item => this.getOriginItem(item).State.isSelected))
                },
                set(value: DirectoryItem[]) {
                    let idList = value.map(item => item.id);
                    console.log(value)
                    // 用id 因为item可能变化了
                    this.baseItemList.map(item => {
                        let origin = this.getOriginItem(item);
                        this.$set(origin.State, 'isSelected', idList.includes(item.id))
                    });
                    this.tree.map(root => {
                        let origin = this.document.Graph.nodes.filter(item => item.Setting._id === root.id)[0];
                        this.$set(origin.State, 'isSelected', idList.includes(root.id))
                    })
                }
            }
        },
        methods: {
            buildStructure: function () {
                let docItemDict: Record<id, DirectoryItemDocument> = {};
                let docLayerDict: Record<number, GraphSelfPart[]> = {};
                let tree: DirectoryItemDocument[] = [];
                let max = 0;
                this.documents.map(document => {
                    docItemDict[document.id] = this.documentToItem(document);
                    let layer = document.rootList.length;
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
                                parentItem.children.push(childItem);
                                parentItem.childDoc.push(childItem)
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

            buildDirectory: function () {
                let vm = this;
                let update = function (docItem: DirectoryItemDocument) {
                    docItem.childDoc.map(item => update(item));
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
                    parent: document.Conf.parent,
                    childDoc: []
                } as DirectoryItemDocument;
            },

            updateItemsToParent: function (documentItem: DirectoryItemDocument) {
                let currentDocument = documentItem.children.filter(item => isDocument(item));
                let currentDocumentId = currentDocument.map(item => item.id);
                // let currentChildrenId = documentItem.children.map(item => item.id);
                let newItemList = this.allDocToItemDict[documentItem.id];
                let newChildren = currentDocument;
                newItemList.map(item => {
                    let id = item.id;
                    if (currentDocumentId.includes(id)) {
                        //do Nothing 节点被抛弃 因为已经替换成了DocumentItem
                    } else {
                        newChildren.push(item)
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
                if (item.type === 'node' || item.type === 'link') {
                    let info = getInfoPart(item.id, item.type, this.dataManager);
                    commitItemChange(info)
                } else if (item.type === 'media') {
                    // media编辑
                } else if (item.type === 'note') {
                    // note编辑
                } else if (item.type === 'document') {
                    let graph = this.dataManager.graphManager[item.id];
                    graph && commitGraphChange({graph: graph})
                };
            },

            getOriginItem(item: DirectoryItem) {
                return item.parent.getSubItemById(item.id, item.type)
            },

            async getDocument(nodeItem: DirectoryItem) {
                let node = this.getOriginItem(nodeItem) as NodeSettingPart;
                let document = nodeItem.parent;
                await dispatchNodeExplode({node, document});
            },

            open(itemList: DirectoryItem[]) {
                // let closeItems = this.lastOpenList.filter(item => !itemList.includes(item));
                // let openItems = itemList.filter(item => !this.lastOpenList.includes(item));
                // closeItems.map(item => {
                //     let targetDocument = this.documents.filter(doc => doc.id === item.id)[0];
                //     if (targetDocument && targetDocument.Conf.State.isExplode) {
                //         // 如果是打开的就关闭
                //         targetDocument.explode()
                //     } else {
                //         // todo open合理化
                //     }
                // });
                // openItems.map(item => {
                //     let targetDocument = this.documents.filter(doc => doc.id === item.id)[0];
                //     if (targetDocument && !targetDocument.Conf.State.isExplode) {
                //         // 如果是关闭的就打开
                //         targetDocument.explode()
                //     } else {
                //         //
                //     }
                // });
                // this.lastOpenList = itemList;
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

        },
        watch: {
            activeDocumentIdList: function () {
                this.buildStructure()
            },
            // id发生变化的时候监听
            baseItemLength: function () {
                this.buildDirectory()
            }

        },
        mounted: function (): void {
            this.buildStructure();
            this.buildDirectory()
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
* Updated by [whb on 2020/01/02]
*/
