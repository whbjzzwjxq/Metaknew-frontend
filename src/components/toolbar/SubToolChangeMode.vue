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
    import IconGroup from "@/components/IconGroup.vue";
    import {iconMap} from "@/utils/icon";
    export default Vue.extend({
        name: "SubToolChangeMode",
        components: {
            SubToolBlock,
            IconGroup
        },
        data: function () {
            return {
                modeIconGroup: iconMap['i-mode'],
            }
        },
        props: {},
        computed: {
            iconList: function (): IconItem[] {
                return [
                    {
                        name: this.modeIconGroup.timeline,
                        toolTip: '切换到时间轴模式',
                        _func: this.changeMode,
                        payload: 'timeline'
                    },
                    {
                        name: this.modeIconGroup.geo,
                        toolTip: '切换到地理模式',
                        _func: this.changeMode,
                        payload: 'geo'
                    },
                    {
                        name: this.modeIconGroup.edit,
                        toolTip: '切换到编辑模式',
                        _func: this.changeMode,
                        payload: 'edit'
                    },
                    {
                        name: this.modeIconGroup.normal,
                        toolTip: '切换到普通模式',
                        _func: this.changeMode,
                        payload: 'normal'
                    }
                ]
            }
        },
        methods: {
            changeMode(type: 'normal' | 'geo' | 'timeline' | 'edit') {
                this.$router.push({name: 'graph-' + type})
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
