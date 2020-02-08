<template>
    <div></div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {SvgSettingPart} from "@/class/graphItem";

    export default Vue.extend({
        name: "GraphSvg",
        components: {},
        data: function () {
            return {
                svg: {
                    type: Object as () => SvgSettingPart,
                    required: true
                },
                scale: {
                    type: Object as () => number,
                    default: 1
                }
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

</style>
