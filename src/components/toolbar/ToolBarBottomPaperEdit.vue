<template>
    <toolbar-bottom>
        <template v-slot:subTool>
            <v-col cols="2" class="pa-0 ma-0">
                <sub-tool-new-item>

                </sub-tool-new-item>
            </v-col>
            <v-col cols="2" class="pa-0 ma-0">
                <sub-tool-path :edit-mode="true"></sub-tool-path>
            </v-col>
            <v-col cols="2" class="pa-0 ma-0">
                <sub-tool-paper-method></sub-tool-paper-method>
            </v-col>
            <v-col cols="2" class="pa-0 ma-0">
                <sub-tool-change-mode></sub-tool-change-mode>
            </v-col>
            <v-col cols="2" class="pa-0 ma-0">
                <sub-tool-doc-save></sub-tool-doc-save>
            </v-col>
        </template>
    </toolbar-bottom>
</template>

<script lang="ts">
    import Vue from 'vue'
    import ToolbarBottom from "@/components/toolbar/ToolbarBottom.vue";
    import SubToolNewItem from "@/components/toolbar/SubToolNewItem.vue";
    import SubToolPath from "@/components/toolbar/SubToolPath.vue";
    import SubToolDocSave from "@/components/toolbar/SubToolDocSave.vue";
    import SubToolPaperMethod from "@/components/toolbar/SubToolPaperMethod.vue";
    import SubToolChangeMode from "@/components/toolbar/SubToolChangeMode.vue";

    export default Vue.extend({
        name: "ToolBarBottomPaperEdit",
        components: {
            ToolbarBottom,
            SubToolNewItem,
            SubToolPath,
            SubToolDocSave,
            SubToolPaperMethod,
            SubToolChangeMode
        },
        data: function () {
            return {}
        },
        props: {},
        computed: {},
        methods: {},
        record: {
            status: 'empty',
            description: ''
        }
    })
</script>

<style scoped>

</style>
