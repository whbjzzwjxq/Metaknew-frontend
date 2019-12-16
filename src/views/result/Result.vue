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
            status: 'empty'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/4
* Updated by []
*/
