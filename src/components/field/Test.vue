<template>

</template>

<script lang="ts">
    import Vue from 'vue'

    export default Vue.extend({
        name: "Test",
        components: {},
        data() {
            return {
                aaa: 1
            }
        },
        props: {},
        computed: {
            test(): string {
                return this.aaa.toString()
            }
        },
        methods: {},
        watch: {}
    })
</script>

<style scoped>

</style>
