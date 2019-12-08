<template>
    <v-treeview
        dense
        hoverable
        activatable
        :selectable="editMode"
        :items="[graphItem[0]]"
        :value="selection"
        @input="selection = $event"
    >
        <template v-slot:prepend="{ item }">
            <v-icon>{{typeIcon(item)}}</v-icon>
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
    import {commitItemChange} from "@/store/modules/_mutations";
    import {
        id,
        BaseType,
        LinkInfoPart,
        LinkSettingPart,
        MediaSettingPart,
        NodeInfoPart,
        NodeSettingPart, getMediaIcon, GraphSelfPart
    } from "@/utils/graphClass";

    interface DirectoryItem {
        id: id,
        type: BaseType
        label: string,
        name: string,
        icon: string,
        deletable: boolean,
        editable: boolean,
        root: boolean,
        children?: DirectoryItem[]
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
            activeGraphList(): GraphSelfPart[] {
                return this.document.getChildGraph().filter(graph => graph &&
                    !graph.Conf.State.isDeleted &&
                    graph.Conf.State.isExplode)
            }

        },
        methods: {
            nodeToItem: (node: NodeSettingPart) => ({
                id: node.Setting._id,
                type: node.Setting._type, //这里是目录意义上的节点
                label: node.Setting._label,
                name: node.Setting._name,
                icon: 'mdi-cube-outline',
                deletable: node.parent.Conf.State.isSelf,
                editable: node.State.isSelf,
                root: false,
                children: node.Setting._type === 'node' ? undefined : []
            }) as DirectoryItem,

            linkToItem: (link: LinkSettingPart) => ({
                id: link.Setting._id,
                type: link.Setting._type,
                label: link.Setting._label,
                icon: 'mdi-arrow-top-right',
                name: link.Setting._start.Setting._name + ' --> ' + link.Setting._end.Setting._name,
                deletable: link.parent.Conf.State.isSelf,
                editable: link.State.isSelf,
                root: false
            }) as DirectoryItem,

            mediaToItem: (media: MediaSettingPart) => ({
                id: media.Setting._id,
                type: media.Setting._type,
                label: media.Setting._label,
                name: media.Setting._name,
                icon: getMediaIcon(media.Setting._label),
                deletable: media.parent.Conf.State.isSelf,
                editable: false,
                root: false
            }) as DirectoryItem,

            deleteItem(item: DirectoryItem) {

            },
            editItem(item: DirectoryItem) {

            },

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
