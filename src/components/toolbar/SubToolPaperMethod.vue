<template>
    <sub-tool-block :icon="paperIcon" text="Paper">
        <template slot="subToolContent">
            <icon-group :icon-list="iconList"></icon-group>
        </template>
    </sub-tool-block>
</template>

<script lang="ts">
    import Vue from 'vue'
    import SubToolBlock from "@/components/toolbar/SubToolBlock.vue";
    import IconGroup from "@/components/IconGroup.vue";
    import {getIcon} from "@/utils/icon";
    import {commitChangePaperQueue} from "@/store/modules/_mutations";
    export default Vue.extend({
        name: "SubToolPaperMethod",
        components: {
            SubToolBlock,
            IconGroup
        },
        data: function () {
            return {
                paperIcon: getIcon('i-item', 'paper')
            }
        },
        props: {},
        computed: {
            iconList: function(): IconItem[] {
                return [
                    {
                        name: getIcon('i-paper', 'list'),
                        _func: this.changePaperQueue,
                        toolTip: '打开/关闭文档待选队列'
                    }
                ]
            }
        },
        methods: {
            changePaperQueue: function() {
                commitChangePaperQueue({})
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
