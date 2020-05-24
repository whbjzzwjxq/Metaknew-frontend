<template>
    <toolbar-bottom>
        <template v-slot:subTool>
            <v-col cols="2" class="pa-0 ma-0">
                <sub-tool-new-item>
                </sub-tool-new-item>
            </v-col>
            <v-col cols="2" class="pa-0 ma-0">
                <sub-tool-style>
                </sub-tool-style>
            </v-col>
            <v-col cols="2" class="pa-0 ma-0">
                <sub-tool-change-mode>

                </sub-tool-change-mode>
            </v-col>
            <v-col cols="2" class="pa-0 ma-0">
                <sub-tool-svg>

                </sub-tool-svg>
            </v-col>
            <v-col cols="2" class="pa-0 ma-0">
                <sub-tool-edit-document>

                </sub-tool-edit-document>
            </v-col>
            <v-col cols="2" class="pa-0 ma-0">
                <sub-tool-graph-layer edit-mode>

                </sub-tool-graph-layer>
            </v-col>
        </template>
    </toolbar-bottom>
</template>

<script lang="ts">
    import Vue from 'vue'
    import ToolbarBottom from "@/components/toolbar/ToolbarBottom.vue";
    import SubToolNewItem from "@/components/toolbar/SubToolAllNewItem.vue";
    import SubToolStyle from "@/components/toolbar/SubToolGraphStyle.vue";
    import SubToolPath from "@/components/toolbar/SubToolPath.vue";
    import SubToolSvg from "@/components/toolbar/SubToolGraphText.vue";
    import SubToolEditDocument from "@/components/toolbar/SubToolAllEditDocument.vue";
    import SubToolChangeMode from "@/components/toolbar/SubToolAllChangeMode.vue";
    import SubToolGraphLayer from "@/components/toolbar/SubToolGraphLayer.vue";
    import {DocumentSelfPart} from "@/class/settingBase";
    import {commitBottomDynamicBarChange} from "@/store/modules/_mutations";

    export default Vue.extend({
        name: "ToolbarBottomGraphEdit",
        components: {
            ToolbarBottom,
            SubToolNewItem,
            SubToolStyle,
            SubToolPath,
            SubToolSvg,
            SubToolEditDocument,
            SubToolChangeMode,
            SubToolGraphLayer
        },
        data: function () {
            return {}
        },
        props: {},
        computed: {
            dataManager: function (): DataManagerState {
                return this.$store.state.dataManager
            },
            graph: function (): DocumentSelfPart {
                return this.dataManager.currentDocument
            }
        },
        methods: {
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
