<template functional>
    <div class="empty-avatar d-flex align-center justify-center" style="height: 100%">
        <p style="font-size: 32px; color: grey">Drop Card Here</p>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'

    export default Vue.extend({
        name: "PaperEmptyCard",
        components: {},
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
    .empty-avatar {
        background-color: #EDEDED;
        opacity: 0.9;
        text-align: center;
        vertical-align: center;
        font-size: 16px;
        border-radius: 1px;
        border-width: 2px;
        border-style: dashed;
        border-color: lightslategrey;
    }
</style>
