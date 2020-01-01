<template>
    <div v-if="!loading" :style="viewBoxStyle">
        <graph-view-box
            :document="document"
            :container="viewBox"
            render-selector
            render-label-selector
            render-media>

        </graph-view-box>
        <result-doc-graph-toolbar-edit
            :document="document"
            v-if="editMode"
            @add-note="newNote"
            @add-empty-node="newNode('node', arguments[0])"
            @add-link="newLink(arguments[0], arguments[1])"
            @save-doc="saveDocument(arguments[0], false)">

        </result-doc-graph-toolbar-edit>
        <result-doc-graph-toolbar v-else>

        </result-doc-graph-toolbar>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {StyleManagerState} from "@/store/modules/styleComponentSize"
    import GraphViewBox from '@/components/graphComponents/GraphViewBox.vue';
    import {RectByPoint} from "@/utils/geoMetric";
    import {
        getIndex,
        GraphSelfPart,
        LinkInfoPart, LinkSettingPart, MediaInfoPart, MediaSettingPart,
        NodeInfoPart,
        NodeSettingPart,
        VisualNodeSettingPart
    } from "@/utils/graphClass";
    import {DataManagerState} from "@/store/modules/dataManager";
    import {commitGraphAdd, commitGraphChange, commitInfoAdd} from "@/store/modules/_mutations";
    import ResultDocGraphToolbarEdit from "@/views/result/ResultDocGraphToolbarEdit.vue";
    import ResultDocGraphToolbar from "@/views/result/ResultDocGraphToolbar.vue";
    import * as CSS from "csstype";

    export default Vue.extend({
        name: "ResultDocGraph",
        components: {
            GraphViewBox,
            ResultDocGraphToolbar,
            ResultDocGraphToolbarEdit
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
            newNode(_type: 'node' | 'document', _label: string) {
                //Info Ctrl部分
                let id = getIndex();
                let info = NodeInfoPart.emptyNodeInfoPart(id, 'node', _label);
                commitInfoAdd({item: info});
                let setting = NodeSettingPart.emptyNodeSetting(id, 'node', _label, 'NewNode' + id, '', this.document);
                this.document.addItems([setting]);
            },

            newLink(start: VisualNodeSettingPart, end: VisualNodeSettingPart) {
                let id = getIndex();
                let info = LinkInfoPart.emptyLinkInfo(id, 'default', start, end);
                commitInfoAdd({item: info});
                let setting = LinkSettingPart.emptyLinkSetting(id, 'default', start, end, this.document);
                this.document.addItems([setting]);
            },

            newNote() {

            },
            saveDocument() {

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
                this.loading = false
            } else {
                this.loading = false
            }

            // TEST
            let id = getIndex();
            let graph = GraphSelfPart.emptyGraphSelfPart(id, this.dataManager.currentGraph);
            let info = NodeInfoPart.emptyNodeInfoPart(id, 'document', 'DocGraph');
            let newBaseNode = NodeSettingPart.emptyNodeSetting(id, 'document', 'DocGraph', 'NewDocument', '', graph);
            commitInfoAdd({item: info, strict: true});

            let nodeId = getIndex();
            let node = NodeSettingPart.emptyNodeSetting(nodeId, 'node', 'DocGraph', '1', '', graph);
            let nodeInfo = NodeInfoPart.emptyNodeInfoPart(nodeId, 'node', 'DocGraph');
            commitInfoAdd({item: nodeInfo});
            graph.addItems([node]);
            commitGraphAdd({graph, strict: true});
            this.dataManager.currentGraph.addItems([newBaseNode]);
        },
        mounted(): void {

        },
        record: {
            status: 'empty'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/4
* Updated by []
*/
