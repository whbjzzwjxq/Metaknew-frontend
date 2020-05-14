<template>
    <sub-tool-block :icon="editGroup.select" text="Selection">
        <template v-slot:subToolContent>
            <icon-group :icon-list="iconList" small></icon-group>
        </template>
    </sub-tool-block>
</template>

<script lang="ts">
    import Vue from 'vue'
    import SubToolBlock from "@/components/toolbar/SubToolBlock.vue";
    import IconGroup from "@/components/IconGroup.vue";
    import {iconMap} from "@/utils/icon";
    import {DocumentSelfPart} from "@/class/settingBase";
    import {getIndex} from "@/utils/utils";
    export default Vue.extend({
        name: "SubToolSelectionMethod",
        components: {
            SubToolBlock,
            IconGroup
        },
        data: function () {
            return {
                editGroup: iconMap['i-edit']
            }
        },
        props: {},
        computed: {
            iconList: function (): IconItem[] {
                return [
                    {
                        name: this.editGroup.collect,
                        _func: this.collectItemsToNewGraph,
                        payload: true,
                        toolTip: '把选中的内容置为专题(删除原专题内的内容)'
                    },
                    {
                        name: this.editGroup.newOne,
                        _func: this.collectItemsToNewGraph,
                        payload: false,
                        toolTip: '把选中的内容置为专题(不删除原专题内的内容)'
                    },
                ]
            },

            dataManager: function (): DataManagerState {
                return this.$store.state.dataManager
            },

            graph: function (): DocumentSelfPart {
                return this.dataManager.currentDocument
            }
        },
        methods: {
            collectItemsToNewGraph(deleteSource: boolean) {
                let _id = getIndex();
                let parent = this.graph;
                let items = parent.itemsAllSubDoc.filter(item => item.isSelected);
                return DocumentSelfPart.initCollect({_id, parent, commitToVuex: true}, items, deleteSource);
            }
        },
        record: {
            status: 'empty',
            description: ''
        }
    })
</script>

<style scoped>

</style>
