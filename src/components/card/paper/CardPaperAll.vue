<template>
    <v-card
        @dragstart="dragStart"
        @drag="drag"
        @dragend="dragEnd"
        @dragenter="dragEnter"
        @dragover.prevent="dragOver"
        @drop.prevent="drop"
        :flat="styleSettingCard.isFlat"
        :tile="styleSettingCard.isTile"
        :outlined="styleSettingCard.isOutlined"
        class="pa-0 d-flex flex-column">
        <div class="scrollY cardItem" :style="divStyle">
            <template v-if="type === 'node' || type === 'document'">
                <card-page-node-info :base-data="info" :width="width" :setting-in-paper="styleSettingShow" :edit-in-paper="editMode">

                </card-page-node-info>
            </template>
            <template v-else-if="type === 'link'">
                <card-page-link-info :base-data="info" :document="document">

                </card-page-link-info>
            </template>
            <template v-else-if="type === 'media'">
                <card-page-media-info :media="info" :width="width" :height="height" :setting-in-paper="styleSettingShow" :edit-in-paper="editMode">

                </card-page-media-info>
            </template>
            <template v-else-if="type === 'text'">
                <markdown-render :text="setting._text" :edit-base="editMode" :render-tool-bar="editMode" @update-text="updateText">

                </markdown-render>
            </template>
        </div>
        <div class="pa-2" v-if="editMode">
            <icon-group :icon-list="iconList" x-small></icon-group>
        </div>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import CardPageNodeInfo from "@/components/card/page/CardPageNodeInfo.vue";
    import CardPageLinkInfo from "@/components/card/page/CardPageLinkInfo.vue";
    import CardPageMediaInfo from "@/components/card/page/CardPageMediaInfo.vue";
    import MarkdownRender from "@/components/markdown/MarkdownRender.vue";
    import IconGroup from "@/components/IconGroup.vue";
    import {InfoPart} from "@/class/info";
    import {DocumentSelfPart} from "@/class/settingBase";
    import {getIcon, iconMap} from "@/utils/icon";

    export default Vue.extend({
        name: "CardPaperAll",
        components: {
            CardPageNodeInfo,
            CardPageLinkInfo,
            CardPageMediaInfo,
            IconGroup,
            MarkdownRender
        },
        data: function () {
            return {
                sizeIconGroup: iconMap['i-resize'],
                cardStyleGroup: iconMap['i-card'],
                minWidth: 180,
                maxWidth: 1440, //templateStylePaper
            }
        },
        props: {
            row: {
                type: Object as () => PaperRowSetting,
                required: true
            },
            setting: {
                type: Object as () => DocumentItemSetting,
                required: true
            },
            state: {
                type: Object as () => DocumentItemState,
                required: true
            },
            editMode: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            iconList: function (): IconItem[] {
                return [
                    {
                        name: this.sizeIconGroup.plus,
                        _func: this.changeSize,
                        payload: 60,
                        disabled: !this.checkAvailable(60),
                        toolTip: '宽度加60'
                    },
                    {
                        name: this.sizeIconGroup.minus,
                        _func: this.changeSize,
                        payload: -60,
                        disabled: !this.checkAvailable(-60),
                        toolTip: '宽度减60'
                    },
                    {
                        name: this.sizeIconGroup.one,
                        _func: this.changeSize,
                        payload: this.minWidth - this.width,
                        disabled: !this.checkAvailable(this.minWidth - this.width),
                        toolTip: '宽度最小'
                    }, {
                        name: this.sizeIconGroup.double,
                        _func: this.changeSize,
                        payload: this.maxWidth - this.rowTotalWidth,
                        disabled: !this.checkAvailable(this.maxWidth - this.rowTotalWidth),
                        toolTip: '宽度最大'
                    },
                    {
                        name: ''
                    },
                    {
                        name: this.cardStyleGroup.flat,
                        _func: this.changeCardStyle,
                        payload: 'isFlat',
                        toolTip: '打开/关闭阴影'
                    },
                    {
                        name: this.cardStyleGroup.radius,
                        _func: this.changeCardStyle,
                        payload: 'isTile',
                        toolTip: '打开/关闭圆角'
                    },
                    {
                        name: this.cardStyleGroup.outlined,
                        _func: this.changeCardStyle,
                        payload: 'isOutlined',
                        toolTip: '打开/关闭边框'
                    },
                    {
                        name: this.cardStyleGroup.reset,
                        _func: this.reset,
                        toolTip: '重设关闭内容'
                    },
                    {
                        name: getIcon('i-edit', 'delete'),
                        _func: this.deleteItem,
                        toolTip: '删除内容'
                    }
                ]
            },
            id: function (): id {
                return this.setting._id
            },
            type: function (): DocumentItemType {
                return this.setting._type
            },
            dataManager: function (): DataManagerState {
                return this.$store.state.dataManager
            },
            document: function (): DocumentSelfPart {
                return this.dataManager.currentDocument
            },
            info: function (): InfoPart {
                if (this.type === 'node' || this.type === 'document') {
                    return this.dataManager.nodeManager[this.id]
                } else if (this.type === 'link') {
                    return this.dataManager.linkManager[this.id]
                } else {
                    return this.dataManager.mediaManager[this.id]
                }
            },
            styleSetting: function (): ItemStyleSettingPaper {
                return this.setting.InPaper
            },
            styleSettingCard: function (): CardStyleInPaper {
                return this.styleSetting.Card
            },
            styleSettingShow: function (): ItemShowInPaper {
                return this.styleSetting.Show
            },
            width: {
                get(): number {
                    return this.styleSetting.Base.width
                },
                set(value: number): void {
                    this.styleSetting.Base.width = value
                }
            },
            rowTotalWidth: function (): number {
                let result = 0;
                this.row.Items.map(item => {
                    result += item.StyleInPaper.Base.width
                })
                return result
            },
            height: function (): number {
                return this.row.isAlign ? this.row.height : this.styleSetting.Base.height
            },
            divStyle: function (): CSSProp {
                return {
                    width: this.width + 'px',
                    height: this.height + 'px' //滚动条位置
                }
            }
        },
        methods: {
            changeCardStyle: function (prop: 'isFlat' | 'isOutlined' | 'isTile') {
                this.setting.InPaper.Card[prop] = !this.setting.InPaper.Card[prop]
            },
            checkAvailable: function (num: number) {
                return this.width + num >= this.minWidth && this.rowTotalWidth + num <= this.maxWidth
            },
            changeSize: function (num: number) {
                this.checkAvailable(num) && (this.width += num)
            },
            reset: function () {
                Object.keys(this.styleSettingShow).map(key => {
                    this.styleSetting.Show[key] = true
                })
            },
            dragStart: function ($event: DragEvent) {
                this.$emit('drag-start-card', $event)
            },
            drag: function ($event: DragEvent) {
                this.$emit('drag-card', $event)
            },
            dragEnter: function ($event: DragEvent) {
                this.$emit('drag-enter-card', $event)
            },
            dragEnd: function ($event: DragEvent) {
                this.$emit('drag-end-card', $event)
            },
            dragOver: function () {

            },
            drop: function ($event: DragEvent) {
                this.$emit('drop-card', $event)
            },
            deleteItem: function () {
                this.$emit('delete-item')
            },
            updateText: function (value: string) {
                this.setting._text = value
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
