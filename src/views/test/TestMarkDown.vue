<template>
    <div class="pa-4">
        <markdown-render :text="mdText">

        </markdown-render>
        <markdown-toolbar>

        </markdown-toolbar>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import MarkdownRender from "@/components/markdown/MarkdownRender.vue";
    import MarkdownToolbar from "@/components/markdown/MarkdownToolbar.vue";
    export default Vue.extend({
        name: "TestMarkDown",
        components: {
            MarkdownRender,
            MarkdownToolbar
        },
        data: function () {
            return {
                mdText: '# this is the default slot'
            }
        },
        props: {},
        computed: {},
        methods: {},
        created(): void {},
        record: {
            status: 'empty',
            description: ''
        }
    })
</script>

<style scoped>

</style>
