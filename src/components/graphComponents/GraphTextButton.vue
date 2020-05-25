<template>
    <div :style="divStyle">
        <icon-group :icon-list="iconList" :hide="hide" x-small vertical
                    :container-style="buttonGroupStyle"></icon-group>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import IconGroup from "@/components/IconGroup.vue";
    import {getIcon} from "@/utils/icon";
    import {TextSettingPart} from "@/class/settingBase";

    export default Vue.extend({
        name: "GraphTextButton",
        components: {
            IconGroup
        },
        data: function () {
            return {}
        },
        props: {
            textSetting: {
                type: Object as () => NodeSettingSimply,
                required: true
            },

            text: {
                type: Object as () => TextSettingPart,
                required: true
            },

            hide: {
                type: Boolean,
                default: false
            },

            editMode: {
                type: Boolean,
                default: true
            }
        },
        computed: {
            iconList: function (): IconItem[] {
                return [
                    {
                        name: getIcon('i-edit', 'delete'),
                        _func: this.deleteItem,
                        toolTip: '删除文本框',
                        render: this.editMode
                    },
                    {
                        name: getIcon('i-eye', this.text.StyleInGraph.Show.showAll),
                        _func: this.unShow,
                        toolTip: '显示关闭'
                    },
                ]
            },
            x: function (): number {
                return this.textSetting.x + this.textSetting.width
            },
            y: function (): number {
                return this.textSetting.y
            },
            divStyle: function (): CSSProp {
                return {
                    width: '24px',
                    height: '120px',
                    left: this.x + 'px',
                    top: this.y + 'px',
                    position: 'absolute',
                }
            },
            buttonGroupStyle: function (): CSSProp {
                return {
                    width: '18px',
                    height: '120px',
                    left: '3px',
                    top: 0,
                    position: 'absolute',
                }
            },
        },
        methods: {
            deleteItem() {
                this.text.parent.deleteItem(this.text)
            },
            unShow() {
                this.text.StyleInGraph.Show.showAll = !this.text.StyleInGraph.Show.showAll
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
