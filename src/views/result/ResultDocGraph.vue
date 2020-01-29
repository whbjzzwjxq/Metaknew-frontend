<template>
    <div>
        <div :style="viewBoxStyle">
            <graph-view-box
                :graph="graph"
                :view-box="viewBox"
                render-selector
                render-label-selector
                render-media>

            </graph-view-box>
        </div>
        <toolbar-bottom>
            <template v-slot:subTool>
                <div style="width: 100%; height: 100%" class="d-flex flex-row">
                    <div style="width: 80px; height: 100%">

                    </div>
                    <v-col cols="2" class="pa-0 ma-0">
                        <sub-tool-new-item
                            @add-empty-node="newNode"
                            @add-empty-link="newLink"
                            @add-media="addMedia"
                            @add-empty-note="newNote"
                        >
                        </sub-tool-new-item>
                    </v-col>
                    <v-col cols="2" class="pa-0 ma-0">
                        <sub-tool-style>
                        </sub-tool-style>
                    </v-col>
                    <v-col cols="2" class="pa-0 ma-0">
                        <sub-tool-path
                            :edit-mode="editMode"
                            @path-open-current="bottomSheetOn('path')"
                        >

                        </sub-tool-path>
                    </v-col>
                    <v-col cols="2" class="pa-0 ma-0">

                    </v-col>
                </div>
            </template>
        </toolbar-bottom>
        <v-card :style="bottomSheetStyle" v-show="bottomSheet" class="unselected">
            <v-card-title>
                <template v-if="bottomSheetKey === 'path'">
                    Current Path
                </template>
                <v-spacer></v-spacer>
                <icon-group :icon-list="bottomSheetIconList"></icon-group>
            </v-card-title>
            <v-card-text class="pa-0 ma-0">
                <path-drawer :container="bottomSheetRect">

                </path-drawer>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {RectByPoint} from "@/utils/geoMetric";
    import {
        getIndex,
        GraphSelfPart,
        NodeInfoPart,
        MediaSettingPart
    } from "@/utils/graphClass";
    import {
        commitBottomDynamicBarResize,
        commitGraphAdd,
        commitGraphChange,
        commitInfoAdd,
        commitRootGraph, commitUserConcernAdd
    } from "@/store/modules/_mutations";
    import GraphViewBox from '@/components/graphComponents/GraphViewBox.vue';
    import PathDrawer from "@/components/path/PathDrawer.vue";
    import ToolbarBottom from "@/components/toolbar/ToolbarBottom.vue";
    import SubToolNewItem from "@/components/toolbar/SubToolNewItem.vue";
    import SubToolStyle from "@/components/toolbar/SubToolStyle.vue";
    import SubToolPath from "@/components/toolbar/SubToolPath.vue";
    import IconGroup from "@/components/IconGroup.vue";
    import {getIcon} from "@/utils/icon";
    import {userConcernTemplate} from "@/utils/template";

    export default Vue.extend({
        name: "ResultDocGraph",
        components: {
            GraphViewBox,
            ToolbarBottom,
            SubToolNewItem,
            SubToolStyle,
            SubToolPath,
            IconGroup,
            PathDrawer
        },
        data() {
            return {
                editPageRegex: new RegExp('edit-.*'),
                bottomSheet: false,
                bottomSheetKey: 'path'
            }
        },
        props: {},
        computed: {
            dataManager: function (): DataManagerState {
                return this.$store.state.dataManager
            },
            allComponentsStyle: function (): StyleManagerState {
                return this.$store.state.styleComponentSize
            },
            viewBox: function (): RectByPoint {
                return this.allComponentsStyle.viewBox
            },
            viewBoxStyle: function (): CSSProp {
                return this.viewBox.getDivCSS({overflow: "hidden"}, true)
            },

            graph: function (): GraphSelfPart {
                return this.dataManager.currentGraph
            },
            editMode: function (): boolean {
                return this.editPageRegex.test(String(this.$route.name))
            },
            bottomSheetRect: function (): RectByPoint {
                return this.allComponentsStyle.bottomDynamicBar
            },
            bottomSheetStyle: function (): CSSProp {
                return this.bottomSheetRect.getDivCSS({zIndex: 5}, true)
            },
            bottomSheetIconList: function (): IconItem[] {
                return [
                    {name: getIcon('i-collapse-arrow-double', true), _func: this.bottomSheetLarge},
                    {name: getIcon('i-collapse-arrow-double', false), _func: this.bottomSheetDecrease},
                    {name: getIcon('i-edit', 'close'), _func: this.bottomSheetOff},
                ]
            }
        },
        methods: {
            newNode: function (_label: string, graph?: GraphSelfPart) {
                graph || (graph = this.graph);
                //Info Ctrl部分
                return graph.addEmptyNode('node', _label);
            },
            newLink: function (start: VisNodeSettingPart, end: VisNodeSettingPart, graph?: GraphSelfPart) {
                graph || (graph = this.graph);
                //Info Ctrl部分
                return graph.addEmptyLink(start, end);
            },

            newNote: function (graph?: GraphSelfPart) {
                graph || (graph = this.graph);
                return graph.addEmptyNote();
            },

            addMedia: function (mediaIdList: id[], graph?: GraphSelfPart) {
                let defaultDoc = this.graph;
                graph || (graph = defaultDoc);
                let mediaSettingList = mediaIdList.map(id => this.dataManager.mediaManager[id])
                    .map(info => {
                        graph || (graph = defaultDoc);
                        return MediaSettingPart.emptyMediaSettingFromInfo(info, graph)
                    });
                graph.addItems(mediaSettingList);
                return mediaSettingList
            },

            addDocument: function (_label: 'DocGraph' | 'DocPaper', graph?: GraphSelfPart) {
                graph || (graph = this.graph);
                return graph.addSubGraph();
            },

            saveDocument() {

            },

            bottomSheetOn: function (key: string) {
                this.bottomSheet = true;
                this.bottomSheetKey = key
            },
            bottomSheetOff: function () {
                this.bottomSheet = false
            },

            bottomSheetLarge: function () {
                this.bottomSheetResize(true);
            },

            bottomSheetDecrease: function () {
                this.bottomSheetResize(false);
            },

            bottomSheetResize: function (large?: boolean) {
                large === undefined && (large = true);
                let height = this.bottomSheetRect.start.y;
                large ? (height -= 240) : (height += 240);
                commitBottomDynamicBarResize(height)
            }
        },
        watch: {},
        created(): void {

        },
        mounted(): void {

        },
        record: {
            status: 'editing',
            description: ''
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/4
* Updated by []
*/
