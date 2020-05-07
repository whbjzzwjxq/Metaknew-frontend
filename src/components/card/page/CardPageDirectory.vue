<template>
    <v-treeview
        :items="directory"
        :selectable="editMode"
        :load-children="getDocument"
        :selection-type="'independent'"
        :active.sync="activeList"
        @update:open="open"
        activatable
        multiple-active
        dense
        hoverable
        return-object
        v-model="selection"
        class="unselected"
    >
        <template v-slot:prepend="{ item }">
            <v-icon>{{ item.icon }}</v-icon>
        </template>

        <template v-slot:append="{ item }">
            <template>
                <v-btn
                    v-if="item.isCurrent"
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
    import {commitDocumentChange, commitItemChange, commitSubTabChange} from "@/store/modules/_mutations";
    import {getIcon} from "@/utils/icon";
    import {dispatchGraphQuery} from "@/store/modules/_dispatch";
    import {frontendIdRegex} from "@/utils/utils";
    import {VirtualFunc, VirtualNodeContent, VirtualTree} from "@/interface/interfaceTree";
    import {isDirectoryItemDocument} from "@/utils/typeCheck";
    import {
        DirectoryBuildPayload,
        DirectoryItem,
        DirectoryItemAll,
        DirectoryNode
    } from "@/interface/interfaceInComponent";
    import {DocumentSelfPart, LinkSettingPart, MediaSettingPart, NodeSettingPart} from "@/class/settingBase";

    export default Vue.extend({
        name: "CardPageDirectory",
        components: {},
        data() {
            return {
                tree: [] as VirtualTree<DocumentSelfPart, DirectoryNode, DirectoryBuildPayload>[],
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
            rootDocumentList: function (): DocumentSelfPart[] {
                return this.dataManager.rootDocument
            },

            //包含自身
            documentList: function (): DocumentSelfPart[] {
                let result: DocumentSelfPart[] = []
                this.rootDocumentList.map(doc => {
                    result.push(...doc.docsChildren)
                    result.push(doc)
                })
                return result
            },

            //Document-Children Dict
            itemList: function (): DirectoryItemAll[] {
                let result: DirectoryItemAll[] = [];
                this.documentList.map(document => {
                    result.push(...this.getDocumentChildList(document))
                });
                return result
            },

            //所有的GraphSelfPart
            documentItemList: function (): DirectoryNode[] {
                return this.tree.map(tree => tree.activeNode).flat(1)
            },

            directory: function (): DirectoryNode[] {
                let updateFunc = (node: DirectoryNode) => {
                    node.children = this.getDocumentChildList(node._origin.boundObject)
                    //push 那些没被删除的专题
                    let nodes = node._children.filter(child => !child._origin.isDeleted).map(node => updateFunc(node))
                    node.children.push(...nodes)
                    return node
                }
                return this.tree.map(tree => updateFunc(tree.root))
            },

            selection: {
                get(): DirectoryItemAll[] {
                    let root: DirectoryItemAll[] = this.documentItemList.filter(docItem =>
                        this.documentList.filter(doc => doc._id === docItem.id)[0].nodeSelf.State.isSelected
                    );
                    let sub = this.itemList.filter(item => this.getOriginItem(item).State.isSelected);
                    return root.concat(sub)
                },
                set(value: DirectoryItemAll[]) {
                    let idList = value.map(item => item.id);
                    this.itemList.map(item => this.getOriginItem(item)).map(
                        item => item.updateState('isSelected', idList.includes(item._id))
                    );
                    this.documentItemList.map(docItem =>
                        this.documentList.filter(doc => doc._id === docItem.id)[0].nodeSelf).map(
                        item => item.updateState('isSelected', idList.includes(item._id))
                    )
                }
            },

            activeList: {
                get(): DirectoryItemAll[] {
                    let root: DirectoryItemAll[] = this.documentItemList.filter(docItem =>
                        this.documentList.filter(doc => doc._id === docItem.id)[0].nodeSelf.State.isMouseOn
                    );
                    let sub = this.itemList.filter(item => this.getOriginItem(item).State.isMouseOn);
                    return root.concat(sub)
                },
                set(value: DirectoryItemAll[]) {
                    let idList = value.map(item => item.id);
                    this.itemList.map(item => this.getOriginItem(item)).map(
                        item => item.updateState('isMouseOn', idList.includes(item._id))
                    );
                    this.documentItemList.map(docItem =>
                        this.documentList.filter(doc => doc._id === docItem.id)[0].nodeSelf).map(
                        item => item.updateState('isMouseOn', idList.includes(item._id))
                    )
                }
            }
        },
        methods: {
            buildDirectory: function () {
                let _func: VirtualFunc<DocumentSelfPart, DirectoryNode, DirectoryBuildPayload> =
                    (parent, document) => {
                        return this.documentToItem(document.boundObject)
                    }
                this.tree = this.rootDocumentList.map((doc, index) => new VirtualTree<DocumentSelfPart, DirectoryNode, DirectoryBuildPayload>(doc.treeNode, _func, {}, 'Directory' + index))
            },

            nodeToItem: (node: NodeSettingPart) => {
                return {
                    id: node._id,
                    type: 'node', //这里是目录意义上的节点
                    label: node._label,
                    name: node._name,
                    icon: getIcon('i-item', 'node'),
                    deletable: node.parent.isSelf,
                    editable: node.isSelf,
                    origin: node,
                    children: node._type === 'document' && node._id !== node.parent._id ? [] : undefined
                } as DirectoryItem<NodeSettingPart>
            },

            linkToItem: (link: LinkSettingPart) => ({
                id: link._id,
                type: link._type,
                label: link._label,
                icon: getIcon('i-item', 'link'),
                name: link._name,
                deletable: link.parent.isSelf,
                editable: link.isSelf,
                origin: link,
            }) as DirectoryItem<LinkSettingPart>,

            mediaToItem: (media: MediaSettingPart) => ({
                id: media._id,
                type: media._type,
                label: media._label,
                name: media._name,
                icon: getIcon("i-media-type", media._label),
                deletable: media.parent.isSelf,
                editable: media.isSelf,
                origin: media,
            }) as DirectoryItem<MediaSettingPart>,

            documentToItem: function (document: DocumentSelfPart) {
                return {
                    id: document._id,
                    type: 'document',
                    label: document._label,
                    name: document._name,
                    icon: getIcon('i-item', document._label),
                    deletable: !document.isRoot,
                    editable: document.isSelf,
                    children: [], //子节点和叶子节点
                    origin: document,
                    isCurrent: document._id === this.dataManager.currentDocument._id
                } as VirtualNodeContent<DocumentSelfPart, DirectoryNode>;
            },

            deleteItem(item: DirectoryItemAll) {
                this.getOriginItem(item).parent.deleteItem({_id: item.id, _type: item.type})
            },

            changeItem(item: DirectoryItemAll) {
                if (item.type === 'node') {
                    let info = this.dataManager.nodeManager[item.id];
                    commitItemChange(info);
                    commitSubTabChange('info');
                } else if (item.type === 'link') {
                    let info = this.dataManager.linkManager[item.id];
                    commitItemChange(info);
                    commitSubTabChange('info');
                } else if (item.type === 'media') {
                    // media编辑
                } else if (item.type === 'text') {
                    //text暂时不呈现
                    // let text = this.getOriginItem(item);
                    // text.updateState('isEditing')
                } else if (item.type === 'document') {
                    let graph = this.dataManager.documentManager[item.id];
                    graph && commitDocumentChange({graph: graph})
                }
            },

            getOriginItem(item: DirectoryItemAll): SubItemSettingPart {
                //返回父亲专题内的SettingPart
                let parent = item.origin.parent
                return isDirectoryItemDocument(item)
                    ? parent !== null
                        ? parent.getItemById({_id: item.id, _type: item.type})
                        : item.origin.nodeSelf
                    : item.origin as SubItemSettingPart
            },

            async getDocument(nodeItem: DirectoryItemAll) {
                if (!frontendIdRegex.test(String(nodeItem.id))) {
                    let node = this.getOriginItem(nodeItem) as NodeSettingPart;
                    let parent = node.parent;
                    return dispatchGraphQuery({_id: node._id, parent});
                } else {
                    return true
                }
            },

            open(docList: DirectoryNode[]) {
                let idList = docList.map(item => item.id);
                // 根专题不会缩回 其他的专题检查是否在list中
                this.documentList.map(doc => {
                    (doc.explode(idList.includes(doc._id) || doc.parent === null))
                })
            },

            getDocumentChildList(document: DocumentSelfPart): DirectoryItemAll[] {
                let result: DirectoryItemAll[] = [];
                let subDocIdList = document.docsChildren.map(child => child._id)
                let nodes = document.nodesWithoutSelf.filter(item => !subDocIdList.includes(item._id))
                    .map(node => this.nodeToItem(node));

                let links = document.links
                    .map(link => this.linkToItem(link));

                let medias = document.medias
                    .map(media => this.mediaToItem(media));
                result.push(...nodes, ...links, ...medias)
                return result
            },

            getIcon(name: IconGroup, type: string) {
                return getIcon(name, type)
            },
        },
        watch: {},
        created: function (): void {
            this.buildDirectory();
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
