<template>
    <svg :width="container.width" :height="container.height">
        <node-default
            v-for="(node, index) in nodes"
            :key="node._id"
            :position="nodePosition[index]"
        >

        </node-default>
        <link-default
            v-for="(link, index) in links"
            :key="link._id"
            :source="getNode(link._start)"
            :target="getNode(link._end)"
            :index="index"
        >

        </link-default>
    </svg>
</template>

<script lang="ts">
    import Vue from 'vue'
    import NodeDefault from "@/components/pathComponents/NodeDefault.vue";
    import LinkDefault from "@/components/pathComponents/LinkDefault.vue";
    import {DocumentSelfPart, LinkSettingPart} from "@/class/settingBase";
    import {getPoint} from "@/class/geometric";

    export default Vue.extend({
        name: "GraphRenderSingle",
        components: {
            NodeDefault,
            LinkDefault
        },
        data: function () {
            return {}
        },
        props: {
            document: {
                type: Object as () => DocumentSelfPart,
                required: true
            },
            nodeSize: {
                type: Object as () => RectObject,
                default: () => ({
                    width: 12,
                    height: 12
                })
            },
            container: {
                type: Object as () => RectObject,
                required: true
            },
            renderMedia: {
                type: Boolean,
                default: false
            },
            noRenderImage: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            //节点和媒体
            nodes: function (): VisNodeSettingPart[] {
                return this.renderMedia
                    ? this.document.nodesVisual
                    : this.document.nodes
            },
            links: function (): LinkSettingPart[] {
                return this.renderMedia
                    ? this.document.links
                    : this.document.links.filter(link => link.isPureNodeLink)
            },
            nodePosition: function (): AreaRect[] {
                return this.nodes.map(node => {
                    let point = getPoint(node.StyleInGraph.Base)
                    point.multiRect(this.container)
                    return {
                        ...this.nodeSize,
                        x: point.x,
                        y: point.y
                    }
                })
            },
        },
        methods: {
            getNode: function(node: VisNodeSettingPart): AreaRect {
                let index = this.nodes.indexOf(node)
                return this.nodePosition[index]
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
