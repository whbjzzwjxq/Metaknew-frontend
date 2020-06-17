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
                <sub-tool-edit-document></sub-tool-edit-document>
            </v-col>
        </template>
    </toolbar-bottom>
</template>

<script lang="ts">
    import Vue from 'vue'
    import ToolbarBottom from "@/components/toolbar/ToolbarBottom.vue";
    import SubToolNewItem from "@/components/toolbar/SubToolAllNewItem.vue";
    import SubToolPath from "@/components/toolbar/SubToolPath.vue";
    import SubToolEditDocument from "@/components/toolbar/SubToolAllEditDocument.vue";
    import SubToolPaperMethod from "@/components/toolbar/SubToolPaperMethod.vue";
    import SubToolChangeMode from "@/components/toolbar/SubToolAllChangeMode.vue";

    export default Vue.extend({
        name: "ToolBarBottomPaperEdit",
        components: {
            ToolbarBottom,
            SubToolNewItem,
            SubToolPath,
            SubToolEditDocument,
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
