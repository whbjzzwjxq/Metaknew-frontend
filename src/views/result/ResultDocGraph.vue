<template>
    <div>
        <div v-if="!loading" :style="viewBoxStyle">
            <graph-view-box
                :document="document"
                :container="viewBox"
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
                            @add-empty-node="newNode(arguments[0])"
                            @add-media="addMedia"
                        >
                        </sub-tool-new-item>
                    </v-col>
                    <v-col cols="2" class="pa-0 ma-0">
                        <sub-tool-style

                        >
                        </sub-tool-style>
                    </v-col>
                </div>
            </template>
        </toolbar-bottom>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {StyleManagerState} from "@/store/modules/styleComponentSize"
    import GraphViewBox from '@/components/graphComponents/GraphViewBox.vue';
    import {RectByPoint} from "@/utils/geoMetric";
    import {
        getIndex,
        GraphSelfPart, id,
        LinkInfoPart,
        LinkSettingPart,
        NodeInfoPart,
        NodeSettingPart,
        VisualNodeSettingPart,
        MediaSettingPart
    } from "@/utils/graphClass";
    import {DataManagerState} from "@/store/modules/dataManager";
    import {commitGraphAdd, commitGraphChange, commitInfoAdd} from "@/store/modules/_mutations";
    import * as CSS from "csstype";
    import ToolbarBottom from "@/components/toolbar/ToolbarBottom.vue";
    import SubToolNewItem from "@/components/toolbar/SubToolNewItem.vue";
    import SubToolStyle from "@/components/toolbar/SubToolStyle.vue";

    export default Vue.extend({
        name: "ResultDocGraph",
        components: {
            GraphViewBox,
            ToolbarBottom,
            SubToolNewItem,
            SubToolStyle
        },
        data() {
            return {
                loading: true,
                editPageRegex: new RegExp('edit-.*'),
                baseNode: {
                    x: 0,
                    y: 0
                }
            }
        },
        props: {},
        computed: {
            dataManager(): DataManagerState {
                return this.$store.state.dataManager
            },
            allComponentsStyle(): StyleManagerState {
                return this.$store.state.styleComponentSize
            },
            viewBox(): RectByPoint {
                return this.allComponentsStyle.viewBox
            },
            viewBoxStyle: function (): CSS.Properties {
                return this.viewBox.getDivCSS(
                    {borderWidth: 0, overflow: "hidden"}
                )
            },

            document(): GraphSelfPart {
                return this.dataManager.currentGraph
            },
            editMode(): boolean {
                return this.editPageRegex.test(String(this.$route.name))
            }
        },
        methods: {
            newNode(_label: string, document?: GraphSelfPart) {
                //Info Ctrl部分
                let id = getIndex();
                let info = NodeInfoPart.emptyNodeInfoPart(id, 'node', _label);
                commitInfoAdd({item: info});
                document || (document = this.document);
                let setting = NodeSettingPart.emptyNodeSetting(id, 'node', _label, 'NewNode' + id, '', document);
                document.addItems([setting]);
                return setting
            },

            newLink(start: VisualNodeSettingPart, end: VisualNodeSettingPart, document?: GraphSelfPart) {
                let id = getIndex();
                let info = LinkInfoPart.emptyLinkInfo(id, 'default', start, end);
                commitInfoAdd({item: info});
                document || (document = this.document);
                let setting = LinkSettingPart.emptyLinkSetting(id, 'default', start, end, document);
                document.addItems([setting]);
                return setting
            },

            newNote() {

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
                document.addItems([graph.baseNode]);
                commitGraphAdd({graph, strict: true});
                commitInfoAdd({item: info, strict: true});
                return graph
            },

            saveDocument() {

            },
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
                this.loading = false
            } else {
                this.loading = false
            }
            let newGraph = this.addDocument('DocGraph');
            this.newNode('BaseNode');
            this.addDocument('DocGraph', newGraph);
            this.newNode('BaseNode', newGraph)
        },
        mounted(): void {

        },
        record: {
            status: 'empty'
        }
    })
</script>

<style scoped>
    .empty {
        height: 100%;
        width: 12px;
    }
</style>

/**
* Created by whb on 2019/12/4
* Updated by []
*/
