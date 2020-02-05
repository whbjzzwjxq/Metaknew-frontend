<template>
    <svg style="display: inline-block" :width="container.width" :height="container.height">
        <graph-node
            v-for="node in activeNodeList"
            :key="node.node._id"
            :state="node.node.State"
            :setting="node.node.Setting"
            :size="12"
            :point="getLocation(node)">

        </graph-node>
        <graph-node
            v-for="(node, index) in emptyNodeList"
            :key="index"
            :state="defaultState"
            :setting="defaultSetting"
            :size="12"
            :point="getLocation(node)">

        </graph-node>
    </svg>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {PathNode, PathNodeEmpty, PathNodeExist, PathSelfPart} from "@/utils/pathClass";
    import GraphNode from "@/components/graphComponents/GraphNode.vue";
    import GraphLink from "@/components/graphComponents/GraphLink.vue";
    import {isPathNodeExist} from "@/utils/typeCheck";
    import {nodeStateTemplate} from "@/utils/template";
    import {nodeTemplateTheme} from "@/utils/templateStandard";

    export default Vue.extend({
        name: 'PathDrawer',
        components: {
            GraphNode,
            GraphLink
        },
        data: function () {
            return {
                defaultState: nodeStateTemplate(),
                defaultSetting: Object.assign({_id: '$_-2', _type: 'node', _label: 'pathNode', _name: '', _image: ''}, nodeTemplateTheme.inPath()) as NodeSetting
            }
        },
        props: {
            path: {
                type: Object as () => PathSelfPart,
                required: true
            },
            container: {
                type: Object as () => AreaRect,
                required: true
            }
        },
        computed: {
            // 设置
            conf: function (): PathConf {
                return this.path.Conf
            },

            nodeList: function (): PathNode[] {
                let nodeList = [] as PathNode[];
                for (let i = 0; i < this.path.breadth; i++) {
                    for (let j = 0; j < this.path.depth; j++) {
                        let node: PathNode = this.path.array[i][j]
                            ? {breadth: i, depth: j, node: this.path.array[i][j]}
                            : {breadth: i, depth: j, node: null};
                        nodeList.push(node)
                    }
                }
                return nodeList
            },

            activeNodeList: function (): PathNodeExist[] {
                //@ts-ignore
                return this.nodeList.filter(item => isPathNodeExist(item))
            },

            emptyNodeList: function (): PathNodeEmpty[] {
                //@ts-ignore
                return this.nodeList.filter(item => item.node === null)
            }

        },
        methods: {
            getLocation: function (node: PathNode): PointObject {
                return {
                    x: node.depth * 48 + 24,
                    y: node.breadth * 48 + 24
                }
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
