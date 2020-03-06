<template>
    <v-treeview
        :items="directory"
        :selectable="editMode"
        :selection-type="'independent'"
        :active.sync="active"
        @update:open="open"
        activatable
        dense
        hoverable
        return-object
        v-model="selection"
    >
        <template v-slot:prepend="{ item }">
            <v-icon>{{ item.icon }}</v-icon>
        </template>

        <template v-slot:append="{ item }">
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
                <template v-if="editMode">
                    <v-btn icon @click="deleteItem(item)" :disabled="!item.deletable" x-small>
                        <v-icon>{{getIcon('i-delete-able', item.deletable)}}</v-icon>
                    </v-btn>

                    <v-btn icon @click="changeItem(item)" :disabled="!item.editable" x-small>
                        <v-icon>{{getIcon('i-edit-able', item.editable)}}</v-icon>
                    </v-btn>
                </template>
                <template v-else>
                    <v-btn icon @click="changeItem(item)" x-small>
                        <v-icon>{{getIcon('i-edit', 'search')}}</v-icon>
                    </v-btn>
                </template>
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
        commitSnackbarOn
    } from "@/store/modules/_mutations";
    import {GraphSelfPart, LinkSettingPart, MediaSettingPart, NodeSettingPart} from "@/class/graphItem";
    import {getIcon} from "@/utils/icon";
    import {dispatchGraphQuery} from "@/store/modules/_dispatch";
    import {frontendIdRegex} from "@/utils/utils";

    interface DirectoryItem {
        id: id,
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

    interface DirectoryNode {
        self: GraphSelfPart,
        childDoc: DirectoryNode[]
    }

    export default Vue.extend({
        name: "CardPageDirectory",
        components: {},
        data() {
            return {
                tree: [] as DirectoryNode[],
                docItemDict: {} as Record<id, DirectoryNode>,
                docLayerDict: {} as Record<number, GraphSelfPart[]>, // 用层级记录的Item信息
                lastOpenList: [] as DirectoryItem[],
                active: []
            }
        },
        props: {
            editMode: {
                type: Boolean,
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
            itemList: function (): DirectoryItem[] {
                let result: DirectoryItem[] = [];
                this.documents.map(document => {
                    result.push(...this.getDocumentChildList(document))
                });
                return result
            },

            directory: function (): DirectoryItemDocument[] {
                let vm = this;
                let tree = this.tree;
                let update = function (docItem: DirectoryNode): DirectoryItemDocument {
                    // Document节点转化为item
                    let subRoot = vm.documentToItem(docItem.self);
                    // 取得所有子document的Item形式
                    let childDocumentItemList = docItem.childDoc.map(item => update(item));
                    subRoot.children.push(...childDocumentItemList);
                    // 记录下跟Document绑定的node
                    let currentDocId = subRoot.children.map(item => item.id);
                    currentDocId.push(docItem.self._id);
                    // 加入所有普通item
                    let childSubItemList = vm.itemList.filter(item => item.parent === subRoot.id)
                        .filter(item => !currentDocId.includes(item.id) || item.type !== ('node' || 'document'));
                    subRoot.children.push(...childSubItemList);
                    return subRoot
                };
                return tree.map(item => update(item));
            },

            selection: {
                get(): DirectoryItem[] {
                    let root = this.directory.filter(root => {
                        let node = this.document.Content.nodes.filter(item => item._id === root.id)[0];
                        return node.State.isSelected
                    }) as DirectoryItem[];
                    return root.concat(this.itemList.filter(item => this.getOriginItem(item).State.isSelected))
                },
                set(value: DirectoryItem[]) {
                    console.log(value)
                    let newIdList = value.map(item => item.id);
                    let oldIdList = this.selection.map(item => item.id);
                    let selectedItems = value.filter(item => !oldIdList.includes(item.id));
                    let unselectedItems = this.selection.filter(item => !newIdList.includes(item.id));
                    selectedItems.map(item => {
                        let origin = this.getOriginItem(item)
                        origin.updateState('isSelected', true)
                    });
                    unselectedItems.map(item => {
                        let origin = this.getOriginItem(item)
                        origin.updateState('isSelected', false)
                    });
                    // 把root级别的subNode也找到
                    this.directory.map(root => {
                        let origin = this.document.Content.nodes.filter(item => item._id === root.id)[0];
                        origin.updateState('isSelected', newIdList.includes(root.id));
                    })
                }
            }
        },
        methods: {
            buildStructure: function () {
                let docItemDict: Record<id, DirectoryNode> = {};
                let docLayerDict: Record<number, GraphSelfPart[]> = {};
                let tree: DirectoryNode[] = [];
                let max = 0;
                this.documents.map(document => {
                    docItemDict[document._id] = {
                        self: document,
                        childDoc: [],
                    } as DirectoryNode;
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

            nodeToItem: (node: NodeSettingPart) => {
                let result = {
                    id: node._id,
                    type: 'node', //这里是目录意义上的节点
                    label: node._label,
                    name: node.Setting._name,
                    icon: getIcon('i-item', 'node'),
                    deletable: node.parent.isSelf,
                    editable: node.isSelf,
                    parent: node.parent._id
                } as DirectoryItem;
                node._type === 'document' && (result.children = []);
                return result
            },

            linkToItem: (link: LinkSettingPart) => ({
                id: link._id,
                type: link._type,
                label: link._label,
                icon: getIcon('i-item', 'link'),
                name: link.Setting._start.Setting._name + ' --> ' + link.Setting._end.Setting._name,
                deletable: link.parent.isSelf,
                editable: link.isSelf,
                parent: link.parent._id
            }) as DirectoryItem,

            mediaToItem: (media: MediaSettingPart) => ({
                id: media._id,
                type: media._type,
                label: media._label,
                name: media.Setting._name,
                icon: getIcon("i-media-type", media._label),
                deletable: media.parent.isSelf,
                editable: media.isSelf,
                parent: media.parent._id
            }) as DirectoryItem,

            documentToItem: function (document: GraphSelfPart) {
                let parent = document.Conf.parent;
                return {
                    id: document._id,
                    type: 'document',
                    label: document.baseNode._label,
                    name: document.baseNode.Setting._name,
                    icon: getIcon('i-item', document.baseNode._label),
                    deletable: false,
                    editable: document.isSelf,
                    children: [], // 注意这里的children是空的
                    parent: parent ? document._id : '$_-1', // 注意这里对rootGraph的parent进行了一个假设
                    childDoc: []
                } as DirectoryItemDocument;
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

            changeItem(item: DirectoryItem) {
                if (item.type === 'node') {
                    let info = this.dataManager.nodeManager[item.id];
                    commitItemChange(info);
                    commitChangeSubTab('info');
                } else if (item.type === 'link') {
                    let info = this.dataManager.linkManager[item.id];
                    commitItemChange(info);
                    commitChangeSubTab('info');
                } else if (item.type === 'media') {
                    // media编辑
                } else if (item.type === 'text') {
                    let text = this.getOriginItem(item);
                    text.updateState('isEditing')
                } else if (item.type === 'document') {
                    let graph = this.dataManager.graphManager[item.id];
                    graph && commitGraphChange({graph: graph})
                }
            },

            getOriginItem(item: DirectoryItem) {
                let document;
                item.parent !== '$_-1'
                    ? document = this.dataManager.graphManager[item.parent]
                    : document = this.document;
                return document.getSubItemById(item.id, item.type)
            },

            async getDocument(nodeItem: DirectoryItem) {
                console.log('async');
                if (!frontendIdRegex.test(String(nodeItem.id))) {
                    let node = this.getOriginItem(nodeItem) as NodeSettingPart;
                    let parent = node.parent;
                    return dispatchGraphQuery({_id: node._id, parent});
                } else {
                    return true
                }
            },

            open(item: DirectoryItemDocument) {
                console.log(item)
            },

            getDocumentChildList(document: GraphSelfPart): DirectoryItem[] {
                let nodes = document.Content.nodes.filter(item => !item.State.isDeleted)
                    .map(node => this.nodeToItem(node));

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
