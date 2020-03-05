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
        selection-type="independent"
        v-model="selection"
    >
        <template v-slot:prepend="{ item }">
            <v-icon>{{ item.icon }}</v-icon>
        </template>

        <template v-if="editMode" v-slot:append="{ item }">
            <template>
                <v-btn
                    v-if="item._id === dataManager.currentGraph._id"
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
    import {
        commitChangeSubTab,
        commitGraphChange,
        commitItemChange,
        commitRefreshDirectory,
        commitSnackbarOn
    } from "@/store/modules/_mutations";
    import {GraphSelfPart, LinkSettingPart, MediaSettingPart, NodeSettingPart} from "@/class/graphItem";
    import {mergeList} from "@/utils/utils";
    import {getIcon} from "@/utils/icon";

    interface DirectoryItem {
        _id: id,
        type: GraphItemType,
        label: string,
        name: string,
        icon: string,
        deletable: boolean,
        editable: boolean,
        parent: id,
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
            document: function (): GraphSelfPart {
                return this.dataManager.rootGraph
            },
            // 不包含自身
            childDocumentList: function (): GraphSelfPart[] {
                let docList = this.$store.getters.documentList as GraphSelfPart[];
                return docList.filter(doc => doc.root && doc.root._id === this.document._id)
            },
            // 不包含自身
            activeDocumentList: function (): GraphSelfPart[] {
                return this.childDocumentList.filter(graph => graph &&
                    !graph.Conf.State.isDeleted) // 这里不要Explode是一次性加载完 不要重新构建目录
            },

            // 控制buildStructure
            activeDocumentIdList: function (): id[] {
                return this.activeDocumentList.map(document => document._id)
            },

            //包含自身
            documents: function (): GraphSelfPart[] {
                return [this.document].concat(this.activeDocumentList)
            },

            //Document-Children Dict
            allDocToItemDict: function (): Record<id, DirectoryItem[]> {
                let result: Record<id, DirectoryItem[]> = {};
                this.documents.map(document => {
                    result[document._id] = this.getDocumentChildList(document)
                });
                return result
            },

            // 包含除了根节点之外的所有内容
            baseItemList: function (): DirectoryItem[] {
                return mergeList(Object.values(this.allDocToItemDict))
            },

            baseItemLength: function (): number {
                // 用length监听Directory变化有些粗糙 后续开发注意Length不变的情况
                return this.baseItemList.length
            },

            refresh: function (): boolean {
                return this.$store.state.componentState.refreshDirectory
            },

            selection: {
                get(): DirectoryItem[] {
                    // 逃生舱式写法 获取根节点级别的选择集
                    let root = this.tree.filter(root => {
                        let node = this.document.Content.nodes.filter(item => item._id === root._id)[0];
                        return node.State.isSelected
                    }) as DirectoryItem[];
                    return root.concat(this.baseItemList.filter(item => this.getOriginItem(item).State.isSelected))
                },
                set(value: DirectoryItem[]) {
                    // let newIdList = value.map(item => item._id);
                    // let oldIdList = this.selection.map(item => item._id);
                    // let selectedItems = value.filter(item => !oldIdList.includes(item._id));
                    // let unselectedItems = this.selection.filter(item => !newIdList.includes(item._id));
                    // let select = (list: DirectoryItem[], state: boolean) => {
                    //     list.map(item => {
                    //         let origin = this.getOriginItem(item);
                    //         origin.updateState('isSelected', state);
                    //         if (item.type === 'document') {
                    //             let subNode = origin.parent.getSubItemById(item._id, item.type);
                    //             subNode.updateState('isSelected', state);
                    //             // 如果是新选中的Document
                    //             if (state) {
                    //                 this.dataManager.graphManager[item._id].selectAll('isSelected', true)
                    //             }
                    //         }
                    //     })
                    // };
                    // select(selectedItems, true);
                    // select(unselectedItems, false);
                    // // 把root级别的subNode也找到
                    // this.tree.map(root => {
                    //     let origin = this.document.Content.nodes.filter(item => item._id === root._id)[0];
                    //     origin.updateState('isSelected', newIdList.includes(root._id));
                    // })
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
                    docItemDict[document._id] = this.documentToItem(document);
                    let layer = document.rootList.length;
                    docLayerDict[layer] || (docLayerDict[layer] = []);
                    docLayerDict[layer].push(document);
                    layer > max && (max = layer)
                });
                for (let i = 0; i <= max; i++) {
                    let docList = docLayerDict[i];
                    if (docList) {
                        docList.map(doc => {
                            let childItem = docItemDict[doc._id];
                            if (doc.Conf.parent) {
                                let parentItem = docItemDict[doc.Conf.parent._id];
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
                this.buildDirectory();
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
                _id: node._id,
                type: 'node', //这里是目录意义上的节点
                label: node._label,
                name: node.Setting._name,
                icon: getIcon('i-item', 'node'),
                deletable: node.parent.isSelf,
                editable: node.isSelf,
                parent: node.parent._id,
                children: node._type === 'document' && node._id !== node.parent._id ? [] : undefined
            }) as DirectoryItem,

            linkToItem: (link: LinkSettingPart) => ({
                _id: link._id,
                type: link._type,
                label: link._label,
                icon: getIcon('i-item', 'link'),
                name: link.Setting._start.Setting._name + ' --> ' + link.Setting._end.Setting._name,
                deletable: link.parent.isSelf,
                editable: link.isSelf,
                parent: link.parent._id
            }) as DirectoryItem,

            mediaToItem: (media: MediaSettingPart) => ({
                _id: media._id,
                type: media._type,
                label: media._label,
                name: media.Setting._name,
                icon: getIcon("i-media-type", media._label),
                deletable: media.parent.isSelf,
                editable: media.isSelf,
                parent: media.parent._id
            }) as DirectoryItem,

            documentToItem: function (document: GraphSelfPart) {
                return {
                    _id: document._id,
                    type: 'document',
                    label: document.baseNode._label,
                    name: document.baseNode.Setting._name,
                    icon: getIcon('i-item', document.baseNode._label),
                    deletable: false,
                    editable: document.isSelf,
                    children: [], // 注意这里的children是空的
                    parent: document.Conf.parent ? document._id : '$_-1', // 注意这里对rootGraph的parent进行了一个假设
                    childDoc: []
                } as DirectoryItemDocument;
            },

            updateItemsToParent: function (documentItem: DirectoryItemDocument) {
                let currentDocument = documentItem.children.filter(item => isDocument(item));
                let currentDocumentId = currentDocument.map(item => item._id);
                let newItemList = this.allDocToItemDict[documentItem._id];
                let newChildren = currentDocument;
                newItemList.map(item => {
                    let _id = item._id;
                    if (currentDocumentId.includes(_id)) {
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
                    actionObject: item,
                    actionName: 'deleteItemFromGraph',
                    once: false
                } as SnackBarStatePayload;
                commitSnackbarOn(payload)
            },

            rollBackDelete(item: DirectoryItem) {
                this.$set(this.getOriginItem(item).State, "isDeleted", false)
            },

            editItem(item: DirectoryItem) {
                if (item.type === 'node') {
                    let info = this.dataManager.nodeManager[item._id];
                    commitItemChange(info);
                    commitChangeSubTab('info');
                } else if (item.type === 'link') {
                    let info = this.dataManager.linkManager[item._id];
                    commitItemChange(info);
                    commitChangeSubTab('info');
                } else if (item.type === 'media') {
                    // media编辑
                } else if (item.type === 'text') {
                    let svg = this.getOriginItem(item);
                    svg.updateState('isEditing')
                } else if (item.type === 'document') {
                    let graph = this.dataManager.graphManager[item._id];
                    graph && commitGraphChange({graph: graph})
                }
            },

            getOriginItem(item: DirectoryItem) {
                let document;
                item.parent !== '$_-1'
                    ? document = this.dataManager.graphManager[item.parent]
                    : document = this.document;
                return document.getSubItemById(item._id, item.type)
            },

            async getDocument(nodeItem: DirectoryItem) {
                // let node = this.getOriginItem(nodeItem) as NodeSettingPart;
                // let document = node.parent;
                // await dispatchNodeExplode({node, document});
            },

            open(itemList: DirectoryItem[]) {
                this.buildDirectory()
            },

            getDocumentChildList(document: GraphSelfPart): DirectoryItem[] {
                let nodes = document.Content.nodes.filter(item => !item.State.isDeleted)
                    .map(node => this.nodeToItem(node))
                    .filter(item => item._id !== document._id);

                let links = document.Content.links.filter(item => !item.State.isDeleted)
                    .map(link => this.linkToItem(link));

                let medias = document.Content.medias.filter(item => !item.State.isDeleted)
                    .map(media => this.mediaToItem(media));

                return nodes.concat(links).concat(medias)
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
            },

            refresh: function () {
                console.log('refresh');
                if (this.refresh) {
                    this.buildDirectory();
                    commitRefreshDirectory(false)
                }
            }
        },
        mounted: function (): void {
            this.buildStructure();
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
