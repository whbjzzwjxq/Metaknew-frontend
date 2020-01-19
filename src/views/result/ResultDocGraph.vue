<template>
    <div>
        <div v-if="!loading" :style="viewBoxStyle">
            <graph-view-box
                :document="document"
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
        commitRootGraph
    } from "@/store/modules/_mutations";
    import GraphViewBox from '@/components/graphComponents/GraphViewBox.vue';
    import PathDrawer from "@/components/path/PathDrawer.vue";
    import ToolbarBottom from "@/components/toolbar/ToolbarBottom.vue";
    import SubToolNewItem from "@/components/toolbar/SubToolNewItem.vue";
    import SubToolStyle from "@/components/toolbar/SubToolStyle.vue";
    import SubToolPath from "@/components/toolbar/SubToolPath.vue";
    import IconGroup from "@/components/iconGroup/IconGroup.vue";
    import {getIcon} from "@/utils/icon";

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
                loading: true,
                editPageRegex: new RegExp('edit-.*'),
                baseNode: {
                    x: 0,
                    y: 0
                },
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
                return this.viewBox.getDivCSS(
                    {borderWidth: 0, overflow: "hidden"}
                )
            },

            document: function (): GraphSelfPart {
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
            newNode: function (_label: string, document?: GraphSelfPart) {
                document || (document = this.document);
                //Info Ctrl部分
                return document.addEmptyNode(_label);
            },
            newLink: function (start: VisNodeSettingPart, end: VisNodeSettingPart, document?: GraphSelfPart) {
                document || (document = this.document);
                //Info Ctrl部分
                return document.addEmptyLink(start, end);
            },

            newNote: function (document?: GraphSelfPart) {
                document || (document = this.document);
                return document.addEmptyNote();
            },

            addMedia: function (mediaIdList: id[], document?: GraphSelfPart) {
                let defaultDoc = this.document;
                document || (document = defaultDoc);
                let mediaSettingList = mediaIdList.map(id => this.dataManager.mediaManager[id])
                    .map(info => {
                        document || (document = defaultDoc);
                        return MediaSettingPart.emptyMediaSettingFromInfo(info, document)
                    });
                document.addItems(mediaSettingList);
                return mediaSettingList
            },

            addDocument: function (_label: 'DocGraph' | 'DocPaper', document?: GraphSelfPart) {
                let defaultDoc = this.document;
                document || (document = defaultDoc);
                let id = getIndex();
                let graph = GraphSelfPart.emptyGraphSelfPart(id, document);
                let info = NodeInfoPart.emptyNodeInfoPart(id, 'document', _label);
                document.addItems([graph.baseNode.deepCloneSelf()]);
                commitGraphAdd({graph, strict: true});
                commitInfoAdd({item: info, strict: true});
                return graph
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
            if (this.document.id === '$_-1') {
                let id = getIndex();
                let graph = GraphSelfPart.emptyGraphSelfPart(id, null);
                let info = NodeInfoPart.emptyNodeInfoPart(id, 'document', 'DocGraph');
                commitGraphAdd({graph, strict: true});
                commitInfoAdd({item: info, strict: true});
                commitGraphChange({graph});
                commitRootGraph({graph});
                this.loading = false
            } else {
                this.loading = false
            }
            let newGraph = this.addDocument('DocGraph');
            this.newNode('BaseNode');
            this.addDocument('DocGraph', newGraph);
            this.newNode('BaseNode', newGraph);
            // path test
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
