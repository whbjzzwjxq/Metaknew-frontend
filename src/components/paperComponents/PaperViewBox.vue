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
                <v-card :width="rightWidth" :min-height="viewBox.height" tile flat elevation="1">
                    <v-container fluid class="pa-0 pt-2" style="height: 100%">
                        <paper-section
                            v-for="(item, index) in structure"
                            :key="index"
                            :section="item.section"
                            :index="index"
                            :edit-mode="editMode"
                            @mouse-enter="mouseEnterSection"
                            @mouse-down="mouseEnterSection"
                        >
                            <template v-slot:content>
                                <v-card
                                    v-for="(row, index1) in item.section.Setting.Rows"
                                    :key="index1"
                                    :height="row.height"
                                    flat
                                    tile
                                    color="blue-grey lighten-4"
                                    class="d-flex flex-row">
                                    <v-col
                                        v-for="(subItem, index2) in getItemListByIndex(index, index1)"
                                        :key="index2"
                                        :cols="subItem.StyleInPaper.Base.width"
                                        class="pa-0">
                                        <v-card color="grey lighten-4" tile outlined
                                                :height="row.forceAlign ? row.height : subItem.StyleInPaper.Base.height">
                                            {{ subItem._name }}
                                        </v-card>
                                    </v-col>
                                </v-card>
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

    interface SectionWithItems {
        section: PaperSectionSettingPart,
        items: ItemSettingPart[][]
    }

    export default Vue.extend({
        name: "PaperViewBox",
        components: {
            CardPageNodeInfo,
            CardPaperNodeInfo,
            PaperSection
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
                structure: [] as SectionWithItems[]
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

            buildStructure: function () {
                let itemList = this.document.allItems
                this.structure = this.sectionList.map((section, index) => {
                    let items = itemList.filter(item => item.StyleInPaper.Base.section === index)
                    return {
                        section,
                        items: section.Setting.Rows.map((row, index) => {
                            let itemsInRow = items.filter(item => item.StyleInPaper.Base.row === index)
                            return itemsInRow.map(item => {
                                item.State.isInRow = true
                                return item
                            })
                        }),
                    }
                })
            },
            mouseEnterSection: function () {
                console.log('watch')
            },
            getItemListByIndex: function (index: number, index1: number) {
                return this.structure[index]
                    ? this.structure[index].items[index1]
                        ? this.structure[index].items[index1]
                        : []
                    : []
            },
            sectionChange: function (source: SectionWithItems, target: SectionWithItems) {
                let index1 = this.structure.indexOf(source)
                let index2 = this.structure.indexOf(target)
                this.structure.splice(index1, 1, target)
                this.structure.splice(index2, 1, source)
                let itemList = source.items.flat(1)
                itemList.map(item => {
                    item.StyleInPaper.Base.section = index2
                })
                itemList = target.items.flat(1)
                itemList.map(item => {
                    item.StyleInPaper.Base.section = index1
                })
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
