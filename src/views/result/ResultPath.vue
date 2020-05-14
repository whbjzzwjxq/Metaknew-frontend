<template>
    <div class="pa-0 d-flex flex-column">
        <div class="flex-grow-1">
            <router-view name="content" :document="document"></router-view>
        </div>
        <router-view name="toolbarBottom" :document="document">

        </router-view>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import CardDocumentSimp from "@/components/card/standard/CardDocumentSimp.vue";
    import {DocumentSelfPart} from "@/class/settingBase";
    import {getCardSize} from "@/interface/interfaceInComponent";
    import {RectByPoint} from "@/class/geometric";

    export default Vue.extend({
        name: "ResultPath",
        components: {
            CardDocumentSimp
        },
        data: function () {
            return {

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
        record: {
            status: 'empty',
            description: ''
        },
        created() {
            this.document.addEmptyNode('node', 'BaseNode')
            this.document.addEmptyLink(this.document.nodes[0], this.document.nodes[1])
        }
    })
</script>

<style scoped>
    @import "../../style/css/viewBox.css";
</style>
