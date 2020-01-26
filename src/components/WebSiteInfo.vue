<template>
    <div style="height: 48px; background-color: whitesmoke; position: fixed; bottom: 0; left: 0; width: 400px">
        <p style="font-size: medium" class="ma-0">
            备案号: 京ICP备 19053781 号-1
        </p>
        <p>
            2020 @metaKnew
        </p>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'

    export default Vue.extend({
        name: "WebSiteInfo",
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

</style>
