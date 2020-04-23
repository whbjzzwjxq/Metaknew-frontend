<template>
    <div
        style="width: 100%; height: 100%; position: relative"
        v-resize="onResize"
        ref="viewBox"
    >
        <div :style="containerStyle" class="cardItem" v-if="!loading">
            <div class="d-flex flex-row" v-resize="onResizeAll" ref="viewBoxAll">
                <v-card class="flex-grow-1" :min-height="viewBox.height" color="blue-grey lighten-4">

                </v-card>
                <!--正式渲染区域-->
                <v-card :width="rightWidth" :min-height="viewBox.height" tile flat color="blue-grey lighten-4"
                        class="pr-2">
                    <v-container fluid class="pa-0 d-flex flex-column" style="height: 100%">
                        <paper-section
                            v-for="(section, index) in structure"
                            :key="index"
                            :section="section"
                            :index="index"
                            :edit-mode="editMode"
                            draggable="true"
                            @mouse-enter="mouseEnterSection"
                            @mouse-down="mouseEnterSection"
                        >
                            <template v-slot:content>
                                <v-container class="d-flex flex-column pa-4 pb-2">
                                    <v-container
                                        v-for="(row, index1) in section.Setting.Rows"
                                        :key="index1"
                                        :id="index1.toString()"
                                        class="pa-0 pb-1 d-flex flex-row">
                                        <div v-if="editMode">
                                            <icon-group
                                                :icon-list="rowIconList"
                                                vertical
                                                small
                                                @arrow-double-up="_arrowDoubleUp(section, row)"
                                                @arrow-double-down="_arrowDoubleDown(section, row)"
                                                @arrow-up="_arrowUp(section, row)"
                                                @arrow-down="_arrowDown(section, row)"
                                                @delete="_deleteRow(section, row)"
                                            >

                                            </icon-group>
                                        </div>
                                        <v-card
                                            :height="row.height"
                                            tile
                                            flat
                                            color="grey lighten-4"
                                            class="d-flex flex-row flex-grow-1"
                                        >
                                            <v-col
                                                v-for="(subItem, index2) in row.Items"
                                                :key="index2"
                                                :cols="subItem.StyleInPaper.Base.width"
                                                class="pa-0"
                                                @dragenter="dragEnterCard(arguments[0], row, subItem)"
                                                @dragstart="dragStartCard(subItem)"
                                                @drag="dragCard"
                                                draggable="true">
                                                <v-card tile outlined
                                                        :height="row.forceAlign ? row.height : subItem.StyleInPaper.Base.height">
                                                    {{ subItem._name }}
                                                </v-card>
                                            </v-col>
                                            <v-col class="flex-shrink-1 pa-0">
                                                <paper-empty-card></paper-empty-card>
                                            </v-col>
                                        </v-card>
                                    </v-container>
                                </v-container>
                            </template>
                        </paper-section>
                    </v-container>
                </v-card>
            </div>
            <div :style="bottomBarHeight">

            </div>
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
    import {NodeInfoPart} from "@/class/info";
    import CardPageNodeInfo from "@/components/card/page/CardPageNodeInfo.vue";
    import CardPaperNodeInfo from "@/components/card/paper/CardPaperNodeInfo.vue";
    import PaperSection from "@/components/paperComponents/PaperSection.vue";
    import IconGroup from "@/components/IconGroup.vue";
    import PaperEmptyCard from "@/components/paperComponents/PaperEmptyCard.vue";
    import {getIcon} from "@/utils/icon";

    export default Vue.extend({
        name: "PaperViewBox",
        components: {
            CardPageNodeInfo,
            CardPaperNodeInfo,
            PaperSection,
            IconGroup,
            PaperEmptyCard
        },
        data: function () {
            return {
                viewBox: RectByPoint.emptyRect(),
                rightWidth: 0,
                leftWidthMin: 180,
                gridWith: 120,
                loading: true,
                //最终渲染高度
                viewBoxAll: RectByPoint.emptyRect(),
                structure: [] as PaperSectionSettingPartWithItems[],
                isDragging: false,
                movingItem: null as unknown as ItemSettingPart
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
            nodeInfoList: function (): NodeInfoPart[] {
                return this.nodes.map(node => this.dataManager.nodeManager[node._id])
            },
            containerStyle: function (): CSSProp {
                return {
                    width: this.viewBox.width + 'px',
                    height: this.viewBox.height + 'px'
                }
            },
            //替代底栏占据空间
            bottomBarHeight: function (): CSSProp {
                return {
                    height: this.$store.state.styleComponentSize.bottomBar.height + 'px'
                }
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
            onResizeAll: function () {
                //@ts-ignore
                let viewBoxAll: HTMLElement = this.$refs.viewBoxAll;
                let rect = viewBoxAll.getBoundingClientRect();
                this.viewBoxAll.updateFromArea(rect);
            },

            mouseEnterSection: function () {
                console.log('enter')
            },

            dragCard: function ($event: DragEvent) {
                // console.log('drag', $event)
            },
            dragStartCard: function (item: ItemSettingPart) {
                this.movingItem = item
            },
            dragEnterCard: function ($event: DragEvent, row: RowSettingWithItem, item: ItemSettingPart) {
                let index = row.Items.indexOf(item)
                if (item._id !== this.movingItem._id && index > -1) {
                    let indexMovingItem = row.Items.indexOf(this.movingItem)
                    row.Items.splice(index, 1, ...[this.movingItem, item])
                    row.Items.splice(indexMovingItem, 1)
                    this.movingItem.StyleInPaper.Base.order = index
                    item.StyleInPaper.Base.order = index + 1
                }
            },

            _arrowDoubleUp: function (section: PaperSectionSettingPart, row: RowSetting) {
                let index = section.Setting.Rows.indexOf(row)
                index > 0 && this.changeRow(section, index, 0)
            },

            _arrowDoubleDown: function (section: PaperSectionSettingPart, row: RowSetting) {
                let len = section.Setting.Rows.length;
                let index = section.Setting.Rows.indexOf(row)
                index < len - 1 && this.changeRow(section, index, len - 1)
            },

            _arrowUp: function () {

            },

            _arrowDown: function () {

            },

            _deleteRow: function () {

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
                                } as RowSettingWithItem
                            }),
                        }
                    }
                })
            },

            changeSection: function (source: PaperSectionSettingPartWithItems, target: PaperSectionSettingPartWithItems) {
                let index1 = this.structure.indexOf(source)
                let index2 = this.structure.indexOf(target)
                this.structure.splice(index1, 1, target)
                this.structure.splice(index2, 1, source)
                let itemList = source.Setting.Rows.map(row => row.Items).flat(1)
                itemList.map(item => {
                    item.StyleInPaper.Base.section = index2
                })
                itemList = target.Setting.Rows.map(row => row.Items).flat(1)
                itemList.map(item => {
                    item.StyleInPaper.Base.section = index1
                })
            },
            changeRow: function (section: PaperSectionSettingPart, index1: number, index2: number) {
                let rows = section.Setting.Rows
                let row1 = rows[index1]
                let row2 = rows[index2]
                if (row1 && row2) {
                    rows.splice(index1, 1, row2)
                    rows.splice(index2, 1, row1)
                }
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

</style>
