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
            <v-col cols="2" class="pa-0 ma-0">
                <sub-tool-selection-method>

                </sub-tool-selection-method>
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
    import SubToolSelectionMethod from "@/components/toolbar/SubToolSelectionMethod.vue";
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
            SubToolDocSave,
            SubToolSelectionMethod
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
