<template>
    <div>

    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {SvgSettingPart} from "@/class/graphItem";

    export default Vue.extend({
        name: "GraphSvg",
        components: {},
        data: function () {
            return {}
        },
        props: {
            svg: {
                type: Object as () => SvgSettingPart,
                required: true
            },
            scale: {
                type: Object as () => number,
                default: 1
            }
        },
        computed: {
            label: function (): string {
                return this.svg.Setting._label
            }
        },
        methods: {},
        record: {
            status: 'empty',
            description: ''
        }
    })
</script>

<style scoped>

</style>
