<template>
    <div style="width: 100%; height: 100%;" ref="viewBox" v-resize="onResize">
        <div :style="containerStyle" class="scrollY cardItem" ref="container" v-if="!loading">
            <div class="d-flex flex-row" ref="page" v-resize="onResizePage">
                <v-card class="flex-grow-1 drag-on" :min-height="viewBox.height" flat tile>

                </v-card>
                <!--正式渲染区域-->
                <v-card class="pr-2 drag-on" :width="rightWidth" :min-height="viewBox.height" flat tile>
                    <v-container fluid class="pa-0 d-flex flex-column" style="height: 100%">
                        <paper-section
                            v-for="(section, index) in structure"
                            :key="index"
                            :section="section"
                            :index="index"
                            :edit-mode="editMode"
                            class="pa-0 pt-4"
                        >
                            <template v-slot:content>
                                <v-container class="d-flex flex-column pa-4 pb-2">
                                    <v-container v-for="(row, index) in section.Setting.Rows" :key="index" :class="`pa-0 pb-2 order-${row.order}`">
                                        <paper-row
                                            :row="row"
                                            :section="section"
                                            :edit-mode="editMode"
                                            @drag-enter-card="dragEnterCard"
                                            @drag-card="dragCard"
                                            @drag-start-card="dragStartCard"
                                            @drag-end-card="dragEndCard"
                                            @drop-card="dropCard"
                                        >

                                        </paper-row>
                                    </v-container>
                                </v-container>
                            </template>
                        </paper-section>
                    </v-container>
                </v-card>
            </div>
            <v-card :height="bottomBarHeight" width="100%" color="blue-grey lighten-4" flat tile>

            </v-card>
            <v-card :style="floatBarStyle" class="float" v-show="paperQueueOn" color="grey lighten-4">
                <queue
                    :items="itemListNotInRow"
                    :max-num="4"
                    draggable
                    @drag-start="dragStartCard({
                        event: arguments[0],
                        row: itemListNotRowVirtual,
                        section: null,
                        item: arguments[2]
                    })"
                    @drag-subitem="dragCard({
                        event: arguments[0],
                        row: itemListNotRowVirtual,
                        section: null,
                        item: arguments[2]
                    })"
                    @drag-end="dragEndCard"
                >
                    <template v-slot:content="{item}">
                        <card-simp-all :item="item">

                        </card-simp-all>
                    </template>
                </queue>
            </v-card>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {
        DocumentSelfPart,
        ItemSettingPart,
        LinkSettingPart,
        MediaSettingPart,
        NodeSettingPart,
        TextSettingPart
    } from "@/class/settingBase";
    import {RectByPoint} from "@/class/geometric";
    import CardPageNodeInfo from "@/components/card/page/CardPageNodeInfo.vue";
    import PaperSection from "@/components/paperComponents/PaperSection.vue";
    import IconGroup from "@/components/IconGroup.vue";
    import PaperEmptyCard from "@/components/paperComponents/PaperEmptyCard.vue";
    import Queue from "@/components/Queue.vue";
    import CardSimpAll from "@/components/card/standard/CardSimpAll.vue";
    import CardPaperAll from "@/components/card/paper/CardPaperAll.vue";
    import PaperRow from "@/components/paperComponents/PaperRow.vue";
    import {getIcon} from "@/utils/icon";
    import {commitChangePaperDraggingItem} from "@/store/modules/_mutations";
    import {DragEventWithTarget} from "@/interface/interfaceInComponent";
    import {paperRowSettingTemplate} from "@/interface/style/templateStylePaper";

    interface EventPayloadInPaper {
        event: DragEvent,
        item?: ItemSettingPart,
        row: PaperRowSetting,
        section: PaperSection,
    }

    interface EventPayloadInPaperWithTarget extends EventPayloadInPaper {
        event: DragEventWithTarget
    }

    export default Vue.extend({
        name: "PaperViewBox",
        components: {
            CardPageNodeInfo,
            PaperSection,
            IconGroup,
            PaperEmptyCard,
            Queue,
            CardSimpAll,
            CardPaperAll,
            PaperRow
        },
        data: function () {
            return {
                //视口 始终包含了bottomBar
                viewBox: RectByPoint.emptyRect(),
                rightWidth: 0,
                leftWidthMin: 180,
                gridWith: 120,
                loading: true,
                //最终渲染矩形
                page: RectByPoint.emptyRect(),
                structure: [] as PaperSectionSettingPart[],
                isDragging: false, // 是否拖拽移动 也就是在上下界才触发
                lastDragY: 0, //上次drag的Y坐标
                movingTarget: null as null | Element, //dragOn的目标
                exchangeTimer: 0,
            }
        },
        props: {
            document: {
                type: Object as () => DocumentSelfPart,
                required: true
            },
            editMode: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            dataManager: function (): DataManagerState {
                return this.$store.state.dataManager
            },
            nodes: function (): NodeSettingPart[] {
                return this.document.nodes
            },
            links: function (): LinkSettingPart[] {
                return this.document.links
            },
            medias: function (): MediaSettingPart[] {
                return this.document.medias
            },
            texts: function (): TextSettingPart[] {
                return this.document.texts
            },
            itemList: function (): ItemSettingPart[] {
                return this.document.allItems
            },
            containerStyle: function (): CSSProp {
                return {
                    width: '100%',
                    height: this.viewBox.height + 'px',
                    position: "relative",
                    overflowX: 'auto'
                }
            },
            //替代底栏占据空间
            bottomBarHeight: function (): number {
                return this.$store.state.styleComponentSize.bottomBar.height
            },
            sectionList: function (): PaperSectionSettingPart[] {
                return this.document.CompInPaper.SubSection
            },
            rowIconList: function (): IconItem[] {
                return [
                    {
                        name: getIcon('i-arrow-double', 'up'),
                        _isTrigger: true,
                        _eventName: 'arrow-double-up',
                        toolTip: '向上移动到顶端'
                    },
                    {
                        name: getIcon('i-arrow', 'up'),
                        _isTrigger: true,
                        _eventName: 'arrow-up',
                        toolTip: '向上移动一行'
                    },
                    {
                        name: getIcon('i-arrow', 'down'),
                        _isTrigger: true,
                        _eventName: 'arrow-down',
                        toolTip: '向下移动一行'
                    },
                    {
                        name: getIcon('i-arrow-double', 'down'),
                        _isTrigger: true,
                        _eventName: 'arrow-double-down',
                        toolTip: '向下移动到低端'
                    },
                    {
                        name: getIcon('i-edit', 'delete'),
                        _isTrigger: true,
                        _eventName: 'delete',
                        toolTip: '删除该行'
                    },
                ]
            },

            floatBarStyle: function (): CSSProp {
                return {
                    position: "fixed",
                    bottom: this.bottomBarHeight + 12 + 'px',
                    width: this.viewBox.width - 96 + 'px',
                    height: '216px',
                    right: '12px',
                    zIndex: 4
                }
            },
            itemListNotInRow: function (): ItemSettingPart[] {
                return this.document.allItems.filter(item => !item.State.isInRow)
            },
            itemListNotRowVirtual: function (): PaperRowSetting {
                return {
                    ...paperRowSettingTemplate(-1),
                    Items: this.itemListNotInRow,
                    isVirtual: true,
                }
            },
            viewBoxRealHeight: function (): number {
                return this.viewBox.height - this.bottomBarHeight
            },
            paperQueueOn: function (): boolean {
                return this.$store.state.componentState.paperQueueOn
            },
            draggingState: function (): PaperDraggingState {
                return this.$store.state.componentState.paperDraggingState
            }
        },
        methods: {
            onResize: function () {
                //@ts-ignore
                let viewBox: HTMLElement = this.$refs.viewBox;
                let rect = viewBox.getBoundingClientRect();
                this.viewBox.updateFromArea(rect);
                this.rightWidth = this.viewBox.width - this.leftWidthMin;
                this.loading = false
            },
            onResizePage: function () {
                //通过这个方法得知全部渲染高度
                //@ts-ignore
                let page: HTMLElement = this.$refs.page;
                let rect = page.getBoundingClientRect();
                this.page.updateFromArea(rect);
            },

            clearMovingTarget: function () {
                this.movingTarget && this.movingTarget.classList.remove('drag-on')
                this.movingTarget = null
            },

            //事件顺序Start-Drag-Enter-DragOver-Drop-DragEnd
            dragStartCard: function (payload: EventPayloadInPaper) {
                let {row, item} = payload
                item && commitChangePaperDraggingItem({
                    row,
                    item
                })
            },
            dragEnterCard: function (payload: EventPayloadInPaperWithTarget) {
                let {item, event} = payload;
                let {draggingItem} = this.draggingState;
                let target = event.mouseOnTarget
                if (draggingItem && (item === undefined || draggingItem._id !== item._id)) {
                    this.clearMovingTarget()
                    target && target.classList.add('drag-on')
                    this.movingTarget = target
                } else {
                    this.clearMovingTarget()
                }
            },
            dragCard: function (payload: EventPayloadInPaper) {
                let {event} = payload
                let {y} = event
                const detectedDelta = 40;
                if (y + detectedDelta > this.viewBoxRealHeight || y - detectedDelta <= this.viewBox.start.y) {
                    this.isDragging = true
                }
                if (this.isDragging) {
                    //@ts-ignore
                    let container = this.$refs.container as HTMLElement
                    let delta = y - this.lastDragY
                    container.scrollBy(0, delta)
                }
                this.lastDragY = y;
            },

            dropCard: function (payload: EventPayloadInPaper) {
                let {item, row} = payload;
                let {draggingRow, draggingItem} = this.draggingState;
                if (draggingRow && draggingItem && (item === undefined || draggingItem._id !== item._id)) {
                    this.clearMovingTarget()
                    draggingRow && draggingItem && this.exchangeItem(draggingRow, draggingItem, row, item)
                }
            },
            dragEndCard: function () {
                this.isDragging = false
                this.clearMovingTarget()
            },

            buildStructure: function () {
                let itemList = this.document.allItems
                this.structure = this.sectionList.map((section, index) => {
                    let itemsMatchSection = itemList.filter(item => item.StyleInPaper.Base.section === index)
                    let {Setting, State} = section;
                    return {
                        State,
                        Setting: {
                            ...Setting,
                            Rows: section.Setting.Rows.map((row, index) => {
                                let itemsMatchRow = itemsMatchSection.filter(item => item.StyleInPaper.Base.row === index)
                                return {
                                    ...row,
                                    Items: itemsMatchRow.map(item => {
                                        item.State.isInRow = true
                                        return item
                                    })
                                } as PaperRowSetting
                            }),
                        }
                    }
                })
            },

            exchangeSection: function (source: PaperSectionSettingPart, target: PaperSectionSettingPart) {
                let index1 = this.structure.indexOf(source)
                let index2 = this.structure.indexOf(target)
                this.structure.splice(index1, 1, target)
                this.structure.splice(index2, 1, source)
            },
            exchangeRow: function (section: PaperSectionSettingPart, index1: number, index2: number) {
                let rows = section.Setting.Rows
                let row1 = rows[index1]
                let row2 = rows[index2]
                if (row1 && row2) {
                    rows.splice(index1, 1, row2)
                    rows.splice(index2, 1, row1)
                }
            },
            exchangeItem: function (rowA: PaperRowSetting, itemA: ItemSettingPart, rowB: PaperRowSetting, itemB?: ItemSettingPart) {
                //itemA一定来自于现有Row或者QueueRow itemB有可能是空行
                let indexA = rowA.Items.indexOf(itemA)
                //有实际内容就是实际内容 否则是rowB最后一个
                let indexB = itemB !== undefined
                    ? rowB.Items.indexOf(itemB)
                    : rowB.Items.length
                //确认itemB存在
                if (indexB > -1) {
                    rowB.Items.splice(indexB, 1, itemA)
                    //如果rowA是QueueRow 那么把itemB置为未排版
                    rowA.isVirtual && itemB && (itemB.State.isInRow = false)
                }
                if (indexA > -1 && itemB !== undefined) {
                    rowA.Items.splice(indexA, 1, itemB)
                    rowA.isVirtual && (itemA.State.isInRow = true)
                } else {
                    rowA.Items.splice(indexA, 1)
                    rowA.isVirtual && (itemA.State.isInRow = true)
                }
            },
            _pushUp: function() {

            }
        },

        mounted(): void {
            this.onResize()
            this.buildStructure()
        },
        record: {
            status: 'empty',
            description: ''
        }
    })
</script>

<style scoped>
    .drag-on {
        background-color: rgba(140, 150, 170, 0.4) !important;
    }
</style>
