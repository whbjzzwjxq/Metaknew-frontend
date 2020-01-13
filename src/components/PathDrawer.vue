<template>
    <div class="unselected d-flex flex-column">
        <v-col cols></v-col>
    </div>
</template>

<script>
    import Vue from 'vue'

    export default Vue.extend({
        name: 'PathDrawer',
        components: {},
        data: function () {
            return {
                // 最大行数
                maxRow: 6,

            }
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
    @import "src/style/css/unselected.css";
</style>
