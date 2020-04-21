<template>
    <toolbar-bottom></toolbar-bottom>
</template>

<script lang="ts">
    import Vue from 'vue'
    import ToolbarBottom from "@/components/toolbar/ToolbarBottom.vue";
    export default Vue.extend({
        name: "ToolBarBottomPaperNormal",
        components: {
            ToolbarBottom
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
