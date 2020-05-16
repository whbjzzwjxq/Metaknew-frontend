<template>
    <div style="width: 100%; height: 100%;" ref="viewBox" v-resize="onResize">
        <div :style="containerStyle" class="scrollY cardItem" ref="container" v-if="!loading">
            <div class="d-flex flex-row" ref="page" v-resize="onResizePage">
                <v-card class="flex-grow-1 drag-on" :min-height="viewBox.height" flat tile>

                </v-card>
                <!--正式渲染区域-->
                <v-card class="pr-2 drag-on" :width="rightWidth" :min-height="viewBox.height" flat tile>
                    <v-container fluid class="pa-0 d-flex flex-column" style="height: 100%">
                        <paper-section-render
                            v-for="(section, index) in sectionList"
                            :key="index"
                            :section="section"
                            :index="index"
                            :edit-mode="editMode"
                            class="pa-0 pt-4"
                        >
                            <template v-slot:content>
                                <v-container class="d-flex flex-column pa-4 pb-2">
                                    <v-container v-for="(row, index) in section.children" :key="index" :class="`pa-0 pb-2 order-${row.order}`">
                                        <paper-row-render
                                            :row="row"
                                            :section="section"
                                            :edit-mode="editMode"
                                            @drag-enter-card="dragEnterCard"
                                            @drag-card="dragCard"
                                            @drag-start-card="dragStartCard"
                                            @drag-end-card="dragEndCard"
                                            @drop-card="dropCard"
                                        >

                                        </paper-row-render>
                                    </v-container>
                                </v-container>
                            </template>
                        </paper-section-render>
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
                        row: rowVirtual,
                        section: null,
                        item: arguments[2]
                    })"
                    @drag-subitem="dragCard({
                        event: arguments[0],
                        row: rowVirtual,
                        section: null,
                        item: arguments[2]
                    })"
                    @drag-end="dragEndCard"
                >
                    <template v-slot:content="{item}">
                        <card-simp-all :item="item" small>

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
    import PaperSectionRender from "@/components/paperComponents/PaperSectionRender.vue";
    import IconGroup from "@/components/IconGroup.vue";
    import PaperEmptyCard from "@/components/paperComponents/PaperEmptyCard.vue";
    import Queue from "@/components/Queue.vue";
    import CardSimpAll from "@/components/card/standard/CardSimpAll.vue";
    import CardPaperAll from "@/components/paperComponents/CardPaperAll.vue";
    import PaperRowRender from "@/components/paperComponents/PaperRowRender.vue";
    import {commitChangePaperDraggingItem} from "@/store/modules/_mutations";
    import {DragEventWithTarget} from "@/interface/interfaceInComponent";
    import {PaperRow, PaperSection} from "@/class/settingPaper";

    interface EventPayloadInPaper {
        event: DragEvent,
        item?: ItemSettingPart,
        row: PaperRow,
        section: PaperSection,
    }

    interface EventPayloadInPaperWithTarget extends EventPayloadInPaper {
        event: DragEventWithTarget
    }

    export default Vue.extend({
        name: "PaperViewBox",
        components: {
            CardPageNodeInfo,
            PaperSectionRender,
            IconGroup,
            PaperEmptyCard,
            Queue,
            CardSimpAll,
            CardPaperAll,
            PaperRowRender
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
                isDragging: false, // 是否拖拽移动 也就是在上下界才触发
                lastDragY: 0, //上次drag的Y坐标
                movingTarget: null as null | Element, //dragOn的目标
                exchangeTimer: 0,
                //虚拟Row
                rowVirtual: null as unknown as PaperRow,
                rowVirtualRender: false
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
                return this.document.itemsAll
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
            sectionList: function (): PaperSection[] {
                return this.document.CompInPaper.Sections.children
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
                return this.document.itemsAll.filter(item => !item.State.isInRow)
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
                    draggingRow.exchangeItem(draggingItem, row, item)
                }
            },
            dragEndCard: function () {
                this.isDragging = false
                this.clearMovingTarget()
            },

            buildStructure: function () {
                //至少渲染一个Section
                this.sectionList.length === 0 && (this.document.CompInPaper.Sections.addSection(0))
                //渲染待选队列
                this.rowVirtual = PaperRow.initEmptyRow(-1, this.sectionList[0])
                this.rowVirtualRender = true
            },
        },

        mounted(): void {
            this.onResize()
            this.buildStructure()
        },

        watch: {
            itemListNotInRow(): void {
                this.rowVirtual.children = this.itemListNotInRow
            }
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
