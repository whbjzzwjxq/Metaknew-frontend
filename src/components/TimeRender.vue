<template>
    <div></div>
</template>

<script lang="ts">
    import Vue from 'vue'

    export default Vue.extend({
        name: "TimeRender",
        components: {},
        data: function () {
            return {}
        },
        props: {
            time: {
                type: Number as () => number,
                required: true
            },
            divCss: {
                type: Object as () => CSSProp,
                default: () => {}
            },
            renderMicroSecond: {
                type: Boolean as () => boolean,
                default: false
            },
            renderSecond: {
                type: Boolean as () => boolean,
                default: false
            },
            renderHour: {
                type: Boolean as () => boolean,
                default: false
            }
        },
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
