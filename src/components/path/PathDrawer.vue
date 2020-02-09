<template>
    <div>
        <v-card :style="pathLeftDivStyle" flat tile outlined>

        </v-card>
        <v-card :style="pathLeftDivStyle" flat tile outlined>

        </v-card>
        <v-card
            flat
            tile
            style="display: inline-block; vertical-align: top"
            :width="pathSvgRect.width"
            :height="pathSvgRect.height">
            <svg :width="pathSvgRect.width" :height="pathSvgRect.height">
                <graph-node
                    v-for="node in activeNodeList"
                    :key="node.node._id"
                    :state="node.node.State"
                    :setting="node.node.Setting"
                    :size="12"
                    :point="getLocation(node)">

                </graph-node>
                <path-node-comp
                    v-for="(node, index) in emptyNodeList"
                    :key="index"
                    :index="node"
                    :point="getLocation(node)">

                </path-node-comp>
            </svg>
            <v-btn
                :key="index"
                :style="icon.style"
                @click="icon._func"
                absolute
                color="grey"
                icon
                v-show="icon.render"
                v-for="(icon, index) in iconList"
                x-large>
                <v-icon> {{ icon.name }}</v-icon>
            </v-btn>
        </v-card>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {IndexDouble, PathNode, PathNodeEmpty, PathNodeExist, PathSelfPart} from "@/class/path";
    import GraphNode from "@/components/graphComponents/GraphNode.vue";
    import GraphLink from "@/components/graphComponents/GraphLink.vue";
    import {isPathNodeExist} from "@/utils/typeCheck";
    import {nodeStateTemplate} from "@/utils/template";
    import {nodeTemplateTheme} from "@/utils/templateStandard";
    import PathNodeComp from "@/components/path/PathNodeComp.vue";
    import {getIcon} from "@/utils/icon";

    export default Vue.extend({
        name: 'PathDrawer',
        components: {
            GraphNode,
            GraphLink,
            PathNodeComp
        },
        data: function () {
            return {
                defaultState: nodeStateTemplate(),
                defaultSetting: Object.assign({
                    _id: '$_-2',
                    _type: 'node',
                    _label: 'pathNode',
                    _name: '',
                    _image: ''
                }, nodeTemplateTheme.inPath()) as NodeSetting,
                pathLeftDivWidth: 240,
                currentIndex: {
                    depth: 0,
                    breadth: 0
                } as IndexDouble,
                nodeSize: 60,
                deltaXSize: 60,
                deltaYSize: 60,
                buttonDelta: '-6px'
            }
        },
        props: {
            path: {
                type: Object as () => PathSelfPart,
                required: true
            },
            container: {
                type: Object as () => RectObject,
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
                let {depth, breadth} = this.currentIndex;
                for (let i = breadth; i < this.viewIndex.breadth; i++) {
                    for (let j = depth; j < this.viewIndex.depth; j++) {
                        let node: PathNode = (this.path.array[i] && this.path.array[i][j])
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
            },

            pathLeftDivStyle: function (): CSSProp {
                return {
                    width: this.pathLeftDivWidth + 'px',
                    height: (this.container.height) + 'px',
                    display: 'inline-block',
                    verticalAlign: "top"
                }
            },

            pathSvgRect: function (): RectObject {
                return {
                    width: this.container.width - this.pathLeftDivWidth * 2,
                    height: this.container.height
                }
            },

            viewIndex: function (): IndexDouble {
                return {
                    depth: Math.floor((this.pathSvgRect.width - this.deltaXSize) / this.nodeSize),
                    breadth: Math.floor((this.pathSvgRect.height - this.deltaYSize) / this.nodeSize)
                }
            },

            nodeNum: function (): IndexDouble {
                return {
                    depth: this.viewIndex.depth - this.currentIndex.depth,
                    breadth: this.viewIndex.breadth - this.currentIndex.breadth
                }
            },

            iconList: function (): IconItem[] {
                return [
                    {
                        name: getIcon('i-arrow-double', 'up'),
                        _func: this.breathUp,
                        style: {left: (this.nodeNum.depth * this.nodeSize / 2 + 4) + 'px', top: this.buttonDelta} as CSSProp,
                        render: this.currentIndex.breadth > 0
                    },
                    {
                        name: getIcon('i-arrow-double', 'down'),
                        _func: this.breathDown,
                        style: {left: (this.nodeNum.depth * this.nodeSize / 2 + 4) + 'px', bottom: this.buttonDelta} as CSSProp,
                        render: this.currentIndex.breadth < this.path.breadth
                    },
                    {
                        name: getIcon('i-arrow-double', 'left'),
                        _func: this.depthLeft,
                        style: {left: this.buttonDelta, top: (this.nodeNum.breadth * this.nodeSize / 2 + 4) + 'px'} as CSSProp,
                        render: this.currentIndex.depth > 0
                    },
                    {
                        name: getIcon('i-arrow-double', 'right'),
                        _func: this.depthRight,
                        style: {right: this.buttonDelta, top: (this.nodeNum.breadth * this.nodeSize / 2 + 4) + 'px'} as CSSProp,
                        render: this.currentIndex.breadth > this.path.breadth
                    },
                ]
            }

        },
        methods: {
            getLocation: function (node: PathNode): PointObject {
                return {
                    x: node.depth * this.nodeSize + this.deltaXSize,
                    y: node.breadth * this.nodeSize + this.deltaYSize
                }
            },
            depthLeft: function () {
                this.currentIndex.depth > 0 && (this.currentIndex.depth -= 1);
            },
            depthRight: function () {
                this.currentIndex.depth < this.path.depth && (this.currentIndex.depth += 1);
            },
            breathUp: function () {
                this.currentIndex.breadth > 0 && (this.currentIndex.breadth -= 1);
            },
            breathDown: function () {
                this.currentIndex.breadth < this.path.breadth && (this.currentIndex.breadth += 1);
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
