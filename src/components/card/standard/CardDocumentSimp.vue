<template>
    <v-card :width="cardSize.width" :height="cardSize.height" flat>
        <v-card-title class="pa-2" :style="{height: topHeight+'px'}">
            {{ name }}
        </v-card-title>
        <v-card-text class="px-2 py-0">
            <graph-render-single :document="document" :node-size="nodeSize" :container="graphContainer">

            </graph-render-single>
        </v-card-text>
        <v-card-actions :style="{height: bottomHeight+'px'}">
            <slot name="content">

            </slot>
        </v-card-actions>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {DocumentSelfPart} from "@/class/settingBase";
    import {CardSize, getCardSize, getNodeSize} from "@/interface/interfaceInComponent";
    import GraphRenderSingle from "@/components/graphComponents/GraphRenderSingle.vue";

    export default Vue.extend({
        name: "CardDocumentSimp",
        components: {
            GraphRenderSingle
        },
        data: function () {
            return {
                topHeight: 48,
                bottomHeight: 48,
            }
        },
        props: {
            document: {
                type: Object as () => DocumentSelfPart,
                required: true
            },
            large: {
                type: Boolean,
                default: false
            },
            xLarge: {
                type: Boolean,
                default: false
            },
            small: {
                type: Boolean,
                default: false
            },
            xSmall: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            cardSize: function (): CardSize {
                return getCardSize(this.$props)
            },
            nodeSize: function (): RectObject {
                return getNodeSize(this.$props)
            },
            graphContainer: function (): RectObject {
                //绘制区域
                return {
                    width: this.cardSize.width - 4 * 4,
                    height: this.cardSize.height - this.bottomHeight - this.topHeight
                }
            },
            name: function (): string {
                return this.document.nodeSelf._name
            }
        },
        methods: {

        },
        record: {
            status: 'empty',
            description: ''
        }
    })
</script>

<style scoped>

</style>
