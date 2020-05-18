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
    import {getIcon, iconMap} from "@/utils/icon";
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
                        name: this.itemIconGroup.paper,
                        toolTip: '切换到Paper模式',
                        disabled: this.$route.name === 'paper-normal' || this.$route.name === 'paper-edit',
                        _func: this.changeView,
                        payload: 'paper'
                    },
                    {
                        name: this.itemIconGroup.graph,
                        toolTip: '切换到Graph模式',
                        disabled: this.$route.name === 'graph-normal' || this.$route.name === 'graph-edit',
                        _func: this.changeView,
                        payload: 'graph'
                    },
                    {
                        name: getIcon('i-edit-able', this.editMode),
                        toolTip: this.editMode ? '切换到普通模式' : '切换到编辑模式',
                        _func: this.changeEdit,
                    },
                ]
            },
            editMode: function (): boolean {
                return this.$route.name !== undefined && this.editRegex.test(this.$route.name)
            },
            viewMode: function (): string {
                return this.$route.name === undefined
                    ? 'graph'
                    : this.$route.name.split('-')[0]
            }
        },
        methods: {
            changeMode(type: 'normal' | 'geo' | 'timeline') {
                this.$router.push({name: 'graph-' + type, params: {id: this.document._id.toString()}})
            },
            changeView(type: 'graph' | 'paper') {
                let mode = this.editMode
                    ? 'edit'
                    : 'normal'
                this.$router.push({name: `${type}-${mode}`, params: {id: this.document._id.toString()}})
            },
            changeEdit() {
                let mode = this.editMode
                    ? 'normal'
                    : 'edit'
                this.$router.push({name: `${this.viewMode}-${mode}`, params: {id: this.document._id.toString()}})
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
