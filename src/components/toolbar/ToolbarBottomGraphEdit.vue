<template>
    <toolbar-bottom>
        <template v-slot:subTool>
            <v-col cols="2" class="pa-0 ma-0">
                <sub-tool-new-item
                    @add-empty-node="newNode"
                    @add-empty-link="newLink"
                    @add-media="addMedia"
                    @add-empty-note="newNote"
                    @add-empty-document="addDocument"
                >
                </sub-tool-new-item>
            </v-col>
            <v-col cols="2" class="pa-0 ma-0">
                <sub-tool-style>
                </sub-tool-style>
            </v-col>
            <v-col cols="2" class="pa-0 ma-0">
                <sub-tool-path :edit-mode="true" @path-open-current="openCurrent">

                </sub-tool-path>
            </v-col>
            <v-col cols="2" class="pa-0 ma-0">
                <sub-tool-svg>

                </sub-tool-svg>
            </v-col>
            <v-col cols="2" class="pa-0 ma-0">
                <sub-tool-doc-save>

                </sub-tool-doc-save>
            </v-col>
        </template>
    </toolbar-bottom>
</template>

<script lang="ts">
    import Vue from 'vue'
    import ToolbarBottom from "@/components/toolbar/ToolbarBottom.vue";
    import SubToolNewItem from "@/components/toolbar/SubToolNewItem.vue";
    import SubToolStyle from "@/components/toolbar/SubToolStyle.vue";
    import SubToolPath from "@/components/toolbar/SubToolPath.vue";
    import SubToolSvg from "@/components/toolbar/SubToolSvg.vue";
    import SubToolDocSave from "@/components/toolbar/SubToolDocSave.vue";
    import {GraphSelfPart, MediaSettingPart, NoteSettingPart} from "@/class/graphItem";
    import {commitBottomDynamicBarChange} from "@/store/modules/_mutations";

    export default Vue.extend({
        name: "ToolbarBottomGraphEdit",
        components: {
            ToolbarBottom,
            SubToolNewItem,
            SubToolStyle,
            SubToolPath,
            SubToolSvg,
            SubToolDocSave
        },
        data: function () {
            return {}
        },
        props: {},
        computed: {
            dataManager: function (): DataManagerState {
                return this.$store.state.dataManager
            },
            graph: function (): GraphSelfPart {
                return this.dataManager.currentGraph
            },
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
                NoteSettingPart.emptyNoteSetting('note', '', '', graph._id, true)
            },

            addMedia: function (mediaIdList: id[], graph?: GraphSelfPart) {
                let defaultDoc = this.graph;
                graph || (graph = defaultDoc);
                let mediaSettingList = mediaIdList.map(_id => this.dataManager.mediaManager[_id])
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

            openCurrent: function () {
                commitBottomDynamicBarChange({on: true, type: 'path'})
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
