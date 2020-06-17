<template>
    <v-container>
        <v-hover v-slot:default="{ hover }">
            <v-card
                class="d-flex flex-column unselected"
                min-height="108"
                outlined
                :elevation="hover ? 6 : 0"
                :id="index">
                <v-row no-gutters class="pa-0 flex-nowrap flex-row-reverse" style="height: 48px">
                    <v-col cols="12" class="pa-4 pb-0">
                        <field-title
                            :text="setting.title.text"
                            :edit-mode="editMode"
                            label="Title"
                            :hide-details="false"
                            @update-text="setting.title.text = $event">

                        </field-title>
                    </v-col>
                    <v-col class="offset-1 pa-2 pt-0" v-show="showLeft">
                        <v-card width="120" :elevation="hover ? 6 : 0">
                            <v-card-text>
                                <field-title
                                    :text="setting.left.text"
                                    :edit-mode="editMode"
                                    label="Tag"
                                    @update-text="leftUpdate">

                                </field-title>
                            </v-card-text>
                            <v-card-actions>
                                <icon-group :icon-list="iconListInLeft" x-small></icon-group>
                            </v-card-actions>
                        </v-card>
                    </v-col>
                </v-row>
                <div v-show="!isCollapse">
                    <slot name="content"></slot>
                </div>
                <v-card-actions v-if="editMode">
                    <icon-group :icon-list="iconListInBottom"></icon-group>
                </v-card-actions>
            </v-card>
        </v-hover>
    </v-container>
</template>

<script lang="ts">
    import Vue from 'vue'
    import IconGroup from "@/components/IconGroup.vue";
    import FieldTitle from "@/components/field/FieldTitle.vue";
    import {getIcon} from "@/utils/icon";
    import {PaperSection, PaperSectionCtrlSetting} from "@/class/settingPaper";

    export default Vue.extend({
        name: "PaperSectionRender",
        components: {
            IconGroup,
            FieldTitle
        },
        data: function () {
            return {
                isCollapse: false
            }
        },
        props: {
            section: {
                type: Object as () => PaperSection,
                required: true
            },
            editMode: {
                type: Boolean,
                default: false
            },
            index: {
                type: Number,
                required: true
            }
        },
        computed: {
            iconListInLeft: function (): IconItem[] {
                return [
                    {
                        name: getIcon('i-collapse', !this.isCollapse),
                        _func: this.collapse,
                        toolTip: !this.isCollapse ? '收起内容' : '展开内容'
                    },
                    {
                        name: getIcon('i-arrow', 'up'),
                        _func: this.pushUp,
                        toolTip: '跳转到上一节'
                    },
                    {
                        name: getIcon('i-arrow', 'down'),
                        _func: this.pushDown,
                        toolTip: '跳转到下一节'
                    },
                    {
                        name: getIcon('i-arrow-double', 'up'),
                        _func: this.pushTop,
                        toolTip: '跳转到顶部'
                    },
                    {
                        name: getIcon('i-arrow-double', 'down'),
                        _func: this.pushBottom,
                        toolTip: '跳转到底部'
                    }
                ]
            },
            iconListInBottom: function (): IconItem[] {
                return [
                    {
                        name: getIcon('i-edit', 'add'),
                        _func: this.addSectionNext,
                        toolTip: '在之后插入一节',
                    },
                    {
                        name: getIcon('i-edit', 'decrease'),
                        _func: this.deleteSelf,
                        toolTip: '删除这一节',
                    },
                    {
                        name: getIcon('i-eye', this.showLeft),
                        _func: this.leftOff,
                        toolTip: '关闭左边栏',
                    }
                ]
            },
            setting: function (): PaperSectionCtrlSetting {
                return this.section.Setting
            },
            showLeft: function (): boolean {
                return this.setting.left.show
            }
        },
        methods: {
            collapse: function () {
                this.isCollapse = !this.isCollapse
            },
            pushUp: function () {
                this.$emit('push-up')
            },
            pushDown: function () {
                this.$emit('push-down')
            },
            pushTop: function () {
                this.$emit('push-top')
            },
            pushBottom: function () {
                this.$emit('push-bottom')
            },
            leftOff: function () {
                this.setting.left.show = !this.setting.left.show
            },
            leftUpdate: function (value: string) {
                this.setting.left.text = value
            },
            addSectionNext: function() {
                this.section.addSectionNext()
            },
            deleteSelf: function() {
                this.section.deleteSelf()
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
