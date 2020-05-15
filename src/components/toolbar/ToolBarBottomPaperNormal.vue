<template>
    <toolbar-bottom>
        <template v-slot:subTool>
            <v-col cols="2" class="pa-0 ma-0">
                <sub-tool-change-mode></sub-tool-change-mode>
            </v-col>
        </template>
    </toolbar-bottom>
</template>

<script lang="ts">
    import Vue from 'vue'
    import ToolbarBottom from "@/components/toolbar/ToolbarBottom.vue";
    import SubToolChangeMode from "@/components/toolbar/SubToolChangeMode.vue";
    export default Vue.extend({
        name: "ToolBarBottomPaperNormal",
        components: {
            ToolbarBottom,
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
