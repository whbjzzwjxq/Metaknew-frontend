<template>
    <v-treeview
        :items="[graphItem[0]]"
        :load-children="getDocument"
        :selectable="editMode"
        activatable
        dense
        hoverable
        return-object
        v-model="selection"
    >
        <template v-slot:prepend="{ item }">
            <v-icon>{{ item.icon }}</v-icon>
        </template>

        <template v-if="editMode" v-slot:append="{ item }">
            <template v-if="!item.root">
                <v-btn icon @click="deleteItem(item)" :disabled="!item.isSelf">
                    <v-icon small>{{item.isSelf ? 'mdi-delete' : 'mdi-delete-off'}}</v-icon>
                </v-btn>

                <v-btn icon @click="editItem(item)" :disabled="!item.isSelf">
                    <v-icon small>{{item.isSelf ? 'mdi-pencil' : 'mdi-pencil-off'}}</v-icon>
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
        id,
        BaseType,
        LinkSettingPart,
        MediaSettingPart,
        NodeSettingPart, getMediaIcon, GraphSelfPart
    } from "@/utils/graphClass";
    import {snackBarStatePayload} from "@/store/modules/componentSnackBar";
    import {getInfoPart} from "@/utils/utils";

    interface DirectoryItem {
        id: id,
        type: BaseType
        label: string,
        name: string,
        icon: string,
        deletable: boolean,
        editable: boolean,
        parent: GraphSelfPart,
        children?: DirectoryItem[]
    }

    interface SettingPartDict {
        nodes: NodeSettingPart[]
        links: LinkSettingPart[]
        medias: MediaSettingPart[]
    }

    export default Vue.extend({
        name: "CardPageDirectory",
        components: {},
        data() {
            return {}
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
            childGraphList(): GraphSelfPart[] {
                return this.document.getChildGraph()
            },
            // 不包含自身
            activeGraphList(): GraphSelfPart[] {
                return this.childGraphList.filter(graph => graph &&
                    !graph.Conf.State.isDeleted &&
                    graph.Conf.State.isExplode)
            },

        },
        methods: {
            nodeToItem: (node: NodeSettingPart) => ({
                id: node.Setting._id,
                type: node.Setting._type, //这里是目录意义上的节点
                label: node.Setting._label,
                name: node.Setting._name,
                icon: 'mdi-cube-outline',
                isSelected: node.State.isSelected,
                deletable: node.parent.Conf.State.isSelf,
                editable: node.State.isSelf,
                parent: node.parent,
                children: node.Setting._type === 'node' ? undefined : []
            }) as DirectoryItem,

            linkToItem: (link: LinkSettingPart) => ({
                id: link.Setting._id,
                type: link.Setting._type,
                label: link.Setting._label,
                icon: 'mdi-arrow-top-right',
                isSelected: link.State.isSelected,
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
                icon: getMediaIcon(media.Setting._label),
                isSelected: media.State.isSelected,
                deletable: media.parent.Conf.State.isSelf,
                editable: false,
                parent: media.parent
            }) as DirectoryItem,

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
                } as snackBarStatePayload;
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
                return item.parent.getOriginSetting(item.id, item.type)
            },

            async getDocument() {

            },

            buildDirectory() {

            }

        },
        watch: {},
        record: {
            status: 'empty'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/6
* Updated by []
*/
