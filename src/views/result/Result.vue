<template>
    <v-container
        fluid
        fill-height
        v-resize="onResize"
        class="d-flex flex-row ma-0 pa-0">
        <card-root></card-root>
        <router-view></router-view>
    </v-container>
</template>

<script lang="ts">
    import Vue from 'vue'
    import CardRoot from '@/components/card/CardRoot.vue';
    import {commitScreenResize} from "@/store/modules/_mutations";

    export default Vue.extend({
        name: "Result",
        components: {
            CardRoot
        },
        data() {
            return {}
        },
        props: {},
        computed: {},
        methods: {
            onResize() {
                commitScreenResize()
            }
        },
        watch: {},
        mounted() {
            this.onResize()
        },
        record: {
            status: 'done',
            description: '结果页整体框架'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/4
* Updated by [whb on 2020年1月9日03:12:11]
*/
