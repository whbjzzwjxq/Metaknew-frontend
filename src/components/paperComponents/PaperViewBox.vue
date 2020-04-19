<template>
    <div class="d-flex cardItem" style="width: 100%; height: 100%; position: relative" v-resize="onResize">

    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {DocumentSelfPart} from "@/class/settingBase";
    import {RectByPoint} from "@/class/geometric";

    export default Vue.extend({
        name: "PaperViewBox",
        components: {},
        data: function () {
            return {
                viewBox: RectByPoint.emptyRect()
            }
        },
        props: {
            paper: {
                type: Object as () => DocumentSelfPart,
                required: true
            }
        },
        computed: {},
        methods: {
            onResize: function () {
                //@ts-ignore
                let viewBox: HTMLElement = this.$refs.viewBox;
                let rect = viewBox.getBoundingClientRect();
                this.viewBox.updateFromArea(rect);
            }
        },
        record: {
            status: 'empty',
            description: ''
        }
    })
</script>

<style scoped>

</style>
