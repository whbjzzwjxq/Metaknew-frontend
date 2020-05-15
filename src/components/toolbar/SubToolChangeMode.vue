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
    import {DocumentSelfPart} from "@/class/settingBase";
    export default Vue.extend({
        name: "SubToolChangeMode",
        components: {
            SubToolBlock,
            IconGroup
        },
        data: function () {
            return {
                modeIconGroup: iconMap['i-mode'],
                itemIconGroup: iconMap['i-item'],
                editRegex: /.*-edit/
            }
        },
        props: {},
        computed: {
            document: function(): DocumentSelfPart {
                return this.$store.state.dataManager.currentDocument
            },
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
                        name: this.itemIconGroup.paper,
                        toolTip: '切换到Paper模式',
                        _func: this.changeView,
                        payload: 'paper'
                    },
                    {
                        name: this.itemIconGroup.graph,
                        toolTip: '切换到Graph模式',
                        _func: this.changeView,
                        payload: 'graph'
                    }
                ]
            },
            editMode: function (): boolean {
                return this.$route.name !== undefined && this.editRegex.test(this.$route.name)
            }
        },
        methods: {
            changeMode(type: 'normal' | 'geo' | 'timeline' | 'edit') {
                this.$router.push({name: 'graph-' + type})
            },
            changeView(type: 'graph' | 'paper') {
                let mode = this.editMode
                    ? 'normal'
                    : 'edit'
                this.$router.push({name: `${type}-${mode}`, params: {id: this.document._id.toString()}})
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
