<template>
    <div></div>
</template>

<script lang="ts">
    import Vue from 'vue'

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
                this.$store.commit('resetScreen')
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
