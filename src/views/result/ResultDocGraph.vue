<template>
    <div class="ma-0 pa-0" :style="viewBoxStyle" id="viewBox" v-if="!loading">
        <graph-view-box
            :container="container"
            :document="document"
            render-selector
            render-label-selector
            render-media>

        </graph-view-box>
        <result-doc-graph-toolbar-edit
            :document="document"
            v-if="editMode"
            @add-note="addNote"
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
    import {ComponentSize, StyleManagerState} from "@/store/modules/styleComponentSize"
    import GraphViewBox from '@/components/graphComponents/GraphViewBox.vue';
    import {AreaRect, Point, RectByPoint} from "@/utils/geoMetric";
    import {
        getIndex,
        GraphSelfPart,
        LinkInfoPart, LinkSettingPart,
        NodeInfoPart,
        NodeSettingPart,
        VisualNodeSettingPart
    } from "@/utils/graphClass";
    import {DataManagerState} from "@/store/modules/dataManager";
    import * as CSS from 'csstype'
    import {commitGraphAdd, commitGraphChange, commitInfoAdd} from "@/store/modules/_mutations";
    import ResultDocGraphToolbarEdit from "@/views/result/ResultDocGraphToolbarEdit.vue";
    import ResultDocGraphToolbar from "@/views/result/ResultDocGraphToolbar.vue";

    export default Vue.extend({
        name: "ResultDocGraph",
        components: {
            GraphViewBox,
            ResultDocGraphToolbar,
            ResultDocGraphToolbarEdit
        },
        data() {
            return {
                container: new RectByPoint({x: 0, y: 0}, {x: 0, y: 0}),
                loading: true,
                editPageRegex: new RegExp('edit-.*')
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
            viewBox(): AreaRect {
                return this.$store.getters.viewBox
            },
            viewBoxStyle(): CSS.Properties {
                return {
                    position: "absolute",
                    left: this.viewBox.x + 'px',
                    top: this.viewBox.y + 'px',
                    width: this.viewBox.width + 'px',
                    height: this.viewBox.height + 'px'
                }
            },
            document(): GraphSelfPart {
                return this.dataManager.currentGraph
            },
            editMode(): boolean {
                return this.editPageRegex.test(String(this.$route.name))
            }
        },
        methods: {
            getContainer(): { start: Point, end: Point, border: number } {
                let {x, y, width, height} = this.viewBox;
                return {
                    start: {x, y},
                    end: {x: x + width, y: y + height},
                    border: 10
                };
            },
            newNode(_type: 'node' | 'document', _label: string) {
                //Info Ctrl部分
                let id = getIndex();
                let info = NodeInfoPart.emptyNodeInfoPart(id, 'node', _label);
                commitInfoAdd({item: info});
                let setting = NodeSettingPart.emptyNodeSetting(id, 'node', _label, 'NewNode' + id, '', this.document);
                this.document.addNodes([setting]);
            },

            newLink(start: VisualNodeSettingPart, end: VisualNodeSettingPart) {
                let id = getIndex();
                let info = LinkInfoPart.emptyLinkInfo(id, 'default', start, end);
                commitInfoAdd({item: info});
                let setting = LinkSettingPart.emptyLinkSetting(id, 'default', start, end, this.document);
                this.document.addLinks([setting])
            },

            addNote() {
                this.document.addNote()
            },
            saveDocument() {

            }
        },
        watch: {
            viewBoxStyle() {
                let {start, end, border} = this.getContainer();
                this.$set(this.container, 'start', start);
                this.$set(this.container, 'end', end);
                this.$set(this.container, 'border', border);
            }
        },
        created(): void {
            if (this.document.id === '$_-1') {
                let id = getIndex();
                let graph = GraphSelfPart.emptyGraphSelfPart(id, null);
                let info = NodeInfoPart.emptyNodeInfoPart(id, 'document', 'DocGraph');
                commitGraphAdd({graph, strict: true});
                commitInfoAdd({item: info, strict: true});
                commitGraphChange({graph, viewBox: this.container.getPositiveRect()})
                this.loading = false
            } else {
                this.loading = false
            }
            let {start, end, border} = this.getContainer();
            this.container = new RectByPoint(start, end, border)
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
