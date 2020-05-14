<template>
    <div
        ref="viewBox"
        class="viewBox"
        v-resize="onResize"
    >
        <v-card :width="cardSize.width" :height="cardSize.height">
            <card-document-simp :document="document" small>

            </card-document-simp>
        </v-card>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {getCardSize} from "@/interface/interfaceInComponent";
    import {RectByPoint} from "@/class/geometric";
    import {DocumentSelfPart} from "@/class/settingBase";

    export default Vue.extend({
        name: "PathRender",
        components: {},
        data: function () {
            return {
                cardSize: getCardSize({small: true}),
                viewBox: new RectByPoint({x: 0, y: 0}, {x: 960, y: 960}),
                viewPoint: {}
            }
        },
        props: {},
        computed: {
            document: function (): DocumentSelfPart {
                return this.$store.state.dataManager.currentDocument
            }
        },
        methods: {
            onResize: function () {
                //@ts-ignore
                //todo 把组件改成一个基础组件 已经列入文档
                let viewBox: HTMLElement = this.$refs.viewBox;
                let rect = viewBox.getBoundingClientRect();
                this.viewBox.updateFromArea(rect);
            },
            __mouseMove: function () {

            }
        },
        created() {
            this.document.addEmptyNode('node', 'BaseNode')
            this.document.addEmptyLink(this.document.nodes[0], this.document.nodes[1])
        },
        record: {
            status: 'empty',
            description: ''
        }
    })
</script>

<style scoped>
    @import "../../style/css/viewBox.css";
</style>
