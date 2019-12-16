<template>
    <div></div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {commitScreenResize} from "@/store/modules/_mutations";

    export default Vue.extend({
        name: "Register",
        components: {},
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
