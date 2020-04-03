<template>
    <sub-tool-block :icon="modeIconGroup.state" text="Change Mode">
        <template v-slot:subToolContent>
            <icon-group :icon-list="iconList" small></icon-group>
        </template>
    </sub-tool-block>
</template>

<script lang="ts">
    import Vue from 'vue'
    import SubToolBlock from "@/components/toolbar/SubToolBlock.vue";
    import {iconMap} from "@/utils/icon";
    import {GraphSelfPart} from "@/class/graphItem";
    export default Vue.extend({
        name: "SubToolDocumentMethod",
        components: {
            SubToolBlock
        },
        data: function () {
            return {
                editGroup: iconMap['i-edit']
            }
        },
        props: {},
        computed: {
            iconLiSt: function (): IconItem[] {
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

            graph: function (): GraphSelfPart {
                return this.dataManager.currentGraph
            }
        },
        methods: {
            collectItemsToNewGraph(deleteSource: boolean) {

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
