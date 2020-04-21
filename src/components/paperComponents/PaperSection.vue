<template>
    <v-hover v-slot:default="{ hover }">
        <v-card
            class="d-flex flex-column unselected"
            min-height="90"
            outlined
            :elevation="hover ? 6 : 0"
            :id="index"
            @mouseenter="mouseEnter"
            @mouseleave="mouseLeave"
            @mousemove="mouseMove">
            <v-row no-gutters class="pa-0 flex-nowrap flex-row-reverse" style="height: 48px">
                <v-col cols="12" class="pa-2">
                    <field-title
                        :text="setting.Title.text"
                        :edit-mode="editMode"
                        label="Title"
                        :hide-details="false"
                        @update-text="setting.Title.text = $event">

                    </field-title>
                </v-col>
                <v-col class="offset-1 pa-2 pt-0" v-show="showLeft">
                    <v-card width="120">
                        <v-card-text class="pa-2">
                            <field-title
                                :text="setting.Left.info"
                                :edit-mode="editMode"
                                @update-text="setting.Left.info = $event">

                            </field-title>
                        </v-card-text>
                        <v-card-actions class="pa-2">
                            <icon-group :icon-list="iconListInLeft" x-small></icon-group>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
            <div v-show="!isCollapse" class="pa-2">
                <slot name="content"></slot>
            </div>
            <v-card-actions v-if="editMode" class="pa-2">
                <icon-group :icon-list="iconListInBottom"></icon-group>
            </v-card-actions>
        </v-card>
    </v-hover>
</template>

<script lang="ts">
    import Vue from 'vue'
    import IconGroup from "@/components/IconGroup.vue";
    import FieldTitle from "@/components/field/FieldTitle.vue";
    import {getIcon} from "@/utils/icon";
    import {paperDefaultRow} from "@/interface/style/templateStylePaper";

    export default Vue.extend({
        name: "PaperSection",
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
                type: Object as () => PaperSectionSettingPart,
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
                        name: getIcon('i-arrow-double', true),
                        _func: this.pushUp,

                    }
                ]
            },
            iconListInBottom: function (): IconItem[] {
                return [
                    {
                        name: getIcon('i-edit', 'add'),
                        _func: this.addRow,
                        toolTip: '添加一行',
                    },
                    {
                        name: getIcon('i-eye', this.showLeft),
                        _func: this.leftOff,
                        toolTip: '关闭左边栏',
                    }
                ]
            },
            setting: function (): PaperSectionSetting {
                return this.section.Setting
            },
            showLeft: function(): boolean {
                return this.setting.Left.show
            }
        },
        methods: {
            collapse: function () {
                this.isCollapse = !this.isCollapse
            },
            mouseEnter: function () {
                this.$emit('mouse-enter')
            },
            mouseLeave: function () {
                this.$emit('mouse-leave')
            },
            mouseMove: function () {
                this.$emit('mouse-move')
            },
            addRow: function () {
                this.setting.Rows.push(paperDefaultRow())
            },
            leftOff: function () {
                this.setting.Left.show = !this.showLeft
            },
            pushUp: function () {
                this.$emit('push-up')
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
