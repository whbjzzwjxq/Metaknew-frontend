<template>
    <div :style="containerStyle" class="pa-2">
        <svg
            width="100%"
            height="100%"
            @dblclick="clickSvg"
            @mousedown.self="startSelect"
            @mousemove="selecting"
            @mouseup="endSelect"
            @wheel="onScroll"
        >

            <graph-link
                v-for="(link, index) in links"
                v-show="showLink[index]"
                :key="link.Setting._id"
                :link="link"
                :scale="realScale"
                :source="getTargetInfo(link.Setting._start)"
                :target="getTargetInfo(link.Setting._end)"
                :mid-location="midLocation[index]"
            ></graph-link>

            <graph-node
                v-for="(node, index) in nodes"
                v-show="showNode[index]"
                :key="node.Setting._id"
                :node="node"
                :container="container"
                :size="impScaleRadius[index]"
                :scale="realScale"
                :point="nodeLocation[index]"
                :index="index"
                @mouseenter.native="mouseEnter(node)"
                @mouseleave.native="mouseLeave(node)"
                @mousedown.native="dragStart"
                @mousemove.native="drag(node, $event)"
                @mouseup.native="dragEnd(node, $event)"
                @dblclick.native.stop="dbClickNode(node)">

            </graph-node>

            <rect
                v-if="renderSelector"
                :style="selectorStyle"
                :x="selector.x"
                :y="selector.y"
                :width="selector.width"
                :height="selector.height">

            </rect>

        </svg>
        <graph-media
            v-for="(node, index) in medias"
            :key="node.Setting._id"
            :setting="node"
            :container="container"
            :location="mediaLocation[index]"
            :scale="realScale"
            :view-box="baseRect"
            :index="index"
            @mouseenter.native="mouseEnter(node)"
            @mouseleave.native="mouseLeave(node)"
            @mousedown.native="dragStart"
            @mousemove.native="drag(node, $event)"
            @mouseup.native="dragEnd(node, $event)"
            @dblclick.native.stop="dbClickNode(node)"
        >

        </graph-media>

    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {
        AllItemSettingPart,
        GraphSelfPart, GraphSettingPart, GraphState,
        LinkSettingPart,
        MediaSettingPart, NodeInfoPart,
        NodeSettingPart,
        SettingPart, VisualNodeSettingPart
    } from "@/utils/graphClass";
    import {AreaRect, PointObject, RectByPoint, getPoint, Point} from "@/utils/geoMetric";
    import {DataManagerState} from "@/store/modules/dataManager";
    import * as CSS from "csstype";
    import {LabelViewDict, VisualNodeSetting} from "@/utils/interfaceInComponent";
    import {isMediaSetting} from "@/utils/typeCheck";
    import {commitItemChange} from "@/store/modules/_mutations";
    import {getInfoPart, maxN, minN} from "@/utils/utils";
    import GraphLink from "@/components/graphComponents/GraphLink.vue";
    import GraphNode from "@/components/graphComponents/GraphNode.vue";
    import GraphMedia from "@/components/graphComponents/GraphMedia.vue";
    import {StyleManagerState} from "@/store/modules/styleComponentSize";

    export default Vue.extend({
        name: "GraphRender",
        components: {
            GraphLink,
            GraphNode,
            GraphMedia
        },
        data() {
            return {
                // ------ style ------
                width: 600,
                height: 400,
                baseContainer: RectByPoint.emptyRect(),
                // ------ select ------
                //正在select
                isSelecting: false as boolean,
                selectRect: new RectByPoint({x: 0, y: 0}, {x: 0, y: 0}),

                // ------ drag ------
                isDragging: false,
                dragAble: true,
                dragStartPoint: new Point(0, 0),

                // ------ link ------
                isLinking: false,
                startNode: null as null | VisualNodeSettingPart,
                newLinkEndPoint: new Point(0, 0),

                isMoving: false
            }
        },
        props: {
            document: {
                type: Object as () => GraphSelfPart,
                required: true
            },

            // 在根图中的节点
            baseNode: {
                type: Object as () => NodeSettingPart,
                required: true
            },

            // 在根图中的矩形
            baseRect: {
                type: Object as () => AreaRect,
                required: true
            },

            labelViewDict: {
                type: Object as () => LabelViewDict,
                required: true
            },

            realScale: {
                type: Number as () => number,
                default: 1
            },

            renderSelector: {
                type: Boolean as () => boolean,
                default: false
            },

            renderMedia: {
                type: Boolean as () => boolean,
                default: false
            },
        },
        computed: {
            state(): GraphState {
                return this.document.Conf.State
            },
            setting(): GraphSettingPart {
                return this.document.Conf
            },
            isSelf(): boolean {
                return this.state.isSelf
            },
            nodes(): NodeSettingPart[] {
                return this.document.Graph.nodes
            },
            links(): LinkSettingPart[] {
                let result;
                this.renderMedia
                    ? result = this.document.Graph.links
                    : result = this.document.Graph.links.filter(link => link.Setting._start.Setting._type !== 'media' &&
                    link.Setting._end.Setting._type !== 'media');
                return result
            },
            medias(): MediaSettingPart[] {
                let result: MediaSettingPart[];
                this.renderMedia
                    ? result = this.document.Graph.medias
                    : result = [];
                return result
            },
            dataManager(): DataManagerState {
                return this.$store.state.dataManager
            },

            allComponentsStyle(): StyleManagerState {
                return this.$store.state.styleComponentSize
            },

            viewBox(): RectByPoint {
                return this.allComponentsStyle.viewBox
            },

            container(): RectByPoint {
                return this.baseContainer.updateFromArea(this.baseRect)
            },

            containerStyle(): CSS.Properties {
                return this.container.getDivCSS({left: 0, top: 0, borderColor: '#105060'})
            },

            //显示节点
            showNode(): boolean[] {
                return this.nodes.map(node =>
                    // this.labelViewDict.node[node.Setting._label] &&
                    !node.State.isDeleted && node.Setting.Show.showAll)
            },

            //显示媒体
            showMedia(): boolean[] {
                return this.medias.map(media =>
                    this.labelViewDict.media[media.Setting._label] &&
                    !media.State.isDeleted &&
                    media.Setting.Show.showAll
                )
            },

            //显示边
            showLink(): boolean[] {
                return this.links.map(link =>
                    this.labelViewDict.link[link.Setting._label] &&
                    !link.State.isDeleted &&
                    this.getTargetInfo(link.Setting._start).show &&
                    this.getTargetInfo(link.Setting._end).show
                )
            },

            //节点location
            nodeLocation(): AreaRect[] {
                return this.nodes.map((node, index) => {
                    let width = node.Setting.Base.size !== 0
                        ? node.Setting.Base.size * this.realScale
                        : this.impScaleRadius[index] * this.realScale;
                    let baseX = node.Setting.Base.x * this.baseRect.width;
                    let baseY = node.Setting.Base.y * this.baseRect.height;
                    return {
                        x: baseX,
                        y: baseY,
                        width,
                        height: width * node.Setting.Base.scaleX
                    } as AreaRect
                })
            },

            mediaLocation(): AreaRect[] {
                return this.medias.map(media => {
                    let baseX = media.Setting.Base.x * this.baseRect.width;
                    let baseY = media.Setting.Base.y * this.baseRect.height;
                    return {
                        x: baseX * this.realScale,
                        y: baseY * this.realScale,
                        width: media.Setting.Base.size * this.realScale >= 50
                            ? media.Setting.Base.size * this.realScale * media.Setting.Base.scaleX
                            : 50 * media.Setting.Base.scaleX,
                        height: media.Setting.Base.size * this.realScale >= 50
                            ? media.Setting.Base.size * this.realScale * media.Setting.Base.scaleX
                            : 50 * media.Setting.Base.scaleX
                    } as AreaRect
                })
            },

            //关系midX
            midLocation(): PointObject[] {
                return this.links.map(link => {
                    let result;
                    let x1 = this.getTargetInfo(link.Setting._start).x;
                    let y1 = this.getTargetInfo(link.Setting._start).y;
                    let x2 = this.getTargetInfo(link.Setting._end).x;
                    let y2 = this.getTargetInfo(link.Setting._end).y;
                    switch (link.Setting.Base.type) {
                        case "curve":
                            link.Setting.Base.direct === 'top'
                                ? result = {"x": (x1 + x2) / 2, "y": y2}
                                : result = {"x": (x1 + x2) / 2, "y": y1};
                            break;
                        case "polyline":
                            link.Setting.Base.direct === 'top'
                                ? result = {"x": (x1 + x2) / 2, "y": y2}
                                : result = {"x": (x1 + x2) / 2, "y": y1};
                            break;
                        case 'linear':
                            result = {"x": (x1 + x2) / 2, "y": (y1 + y2) / 2};
                            break;
                        default:
                            result = {"x": (x1 + x2) / 2, "y": (y1 + y2) / 2};
                            break;
                    }
                    return result
                })
            },

            nodeInfoList(): NodeInfoPart[] {
                return this.nodes.map(node => this.dataManager.nodeManager[node.Setting._id])
            },

            selectedNodes(): NodeSettingPart[] {
                return this.nodes.filter(item => item.State.isSelected)
            },

            //压缩版本的nodeSetting
            nodeSettingList(): VisualNodeSetting[] {
                return this.nodes.map((node, index) => {
                    let {x, y, width, height} = this.nodeLocation[index];
                    return {
                        height,
                        width,
                        x,
                        y,
                        show: this.showNode[index],
                        isSelected: node.State.isSelected,
                        isDeleted: node.State.isDeleted
                    }
                });
            },

            //这里特殊处理过
            mediaSettingList(): VisualNodeSetting[] {
                return this.medias.map((media, index) => {
                    let {x, y, width, height} = this.mediaLocation[index];
                    return {
                        height,
                        width,
                        x,
                        y,
                        show: this.showMedia[index],
                        isSelected: media.State.isSelected,
                        isDeleted: media.State.isDeleted
                    }
                })
            },

            impList(): number[] {
                return this.nodeInfoList.map(info => info.Ctrl.Imp)
            },

            impMax(): number {
                return maxN(this.impList)[0]
            },
            impMin(): number {
                return minN(this.impList)[0]
            },

            impScaleRadius(): number[] {
                if (this.impMax !== this.impMin) {
                    const minRadius = 16;
                    const maxRadius = 24;
                    let k = (maxRadius - minRadius) / (this.impMax - this.impMin);
                    return this.impList.map(imp => {
                        let radius = ((imp - this.impMin) * k + minRadius) * this.realScale;
                        radius < 12 && (radius = 12);
                        return radius
                    });
                } else {
                    return this.impList.map(() => 16)
                }
            },

            selector(): AreaRect {
                return this.selectRect.positiveRect()
            },

            //选择框的相关设置
            selectorStyle(): CSS.Properties {
                return {
                    "position": "absolute",
                    "fill": "#000000",
                    "fillOpacity": this.isSelecting ? 0.3 : 0,
                    "strokeOpacity": this.isSelecting ? 0.7 : 0,
                    "stroke": "#000000",
                    "strokeWidth": "1px",
                    "display": this.isSelecting ? "inline" : "none"
                }
            },

        },
        methods: {
            dragStart($event: MouseEvent) {
                if (this.dragAble) {
                    this.dragStartPoint.update($event);
                    this.isDragging = true;
                }
            },

            //注意坐标运算使用小数
            drag(target: VisualNodeSettingPart, $event: MouseEvent) {
                if (this.isDragging && this.dragAble) {
                    let deltaX = ($event.x - this.dragStartPoint.x) / this.baseRect.width;
                    let deltaY = ($event.y - this.dragStartPoint.y) / this.baseRect.height;
                    this.dragStart($event);
                    if (this.selectedNodes.length > 0) {
                        this.selectedNodes.map(node => {
                            this.$set(node.Setting.Base, 'x', node.Setting.Base.x + deltaX);
                            this.$set(node.Setting.Base, 'y', node.Setting.Base.y + deltaY);
                        });
                    } else {
                        let node = target;
                        this.$set(node.Setting.Base, 'x', node.Setting.Base.x + deltaX);
                        this.$set(node.Setting.Base, 'y', node.Setting.Base.y + deltaY);
                    }
                    this.container.checkInRect($event);
                }
            },

            dragEnd(target: VisualNodeSettingPart, $event: MouseEvent) {
                if (this.isDragging && this.dragAble) {
                    this.drag(target, $event);
                    this.isDragging = false;
                }
            },

            clickSvg() {
                this.clearSelected('all')
            },
            clearSelected(items: 'all' | SettingPart[]) {
                if (items === 'all') {
                    this.nodes.map(node => this.$set(node.State, 'isSelected', false));
                    this.links.map(link => this.$set(link.State, 'isSelected', false));
                    this.$set(this.state, 'isSelected', false)
                } else {
                    items.map(item => this.$set(item.State, 'isSelected', false));
                }
                this.isDragging = false;
            },
            startSelect($event: MouseEvent) {
                if ($event.ctrlKey) {
                    this.isMoving = true;
                    this.$emit('move-start', $event)
                } else if (this.renderSelector) {
                    this.$set(this, 'isSelecting', true);
                    let start = getPoint($event).decreaseMulti(this.baseRect, this.viewBox.start);
                    this.selectRect.start.update(start);
                    this.selectRect.end.update(start);
                }
            },

            selecting($event: MouseEvent) {
                let end = getPoint($event).decreaseMulti(this.baseRect, this.viewBox.start);
                //选择集
                if ($event.ctrlKey && this.isMoving) {
                    this.$emit('moving', $event)
                } else if (this.isSelecting && this.renderSelector) {
                    this.selectRect.end.update(end);
                }
            },

            endSelect($event: MouseEvent) {
                this.isMoving = false;
                this.$emit('move-end', $event);
                this.selecting($event);
                this.$set(this, 'isSelecting', false);
                let nodes: (AllItemSettingPart)[] = this.nodes.filter((node, index) =>
                    this.selectRect.checkInRect(this.nodeLocation[index])
                );
                let links = this.links.filter((link, index) =>
                    this.selectRect.checkInRect(this.midLocation[index])
                );
                let result = nodes.concat(links);
                this.clearSelected("all");
                this.selectItem(result)
            },

            selectItem(itemList: AllItemSettingPart[]) {
                //选择
                itemList.map(item => this.$set(item.State, 'isSelected', true));
                //如果是单选就切换内容
                if (itemList.length === 1) {
                    let item = itemList[0];
                    let info = getInfoPart(item.Setting._id, item.Setting._type, this.dataManager);
                    info && commitItemChange(info);
                }
            },

            onScroll($event: WheelEvent) {
                this.$emit('onScroll', $event);
            },

            //取得link所用数据
            getTargetInfo(item: VisualNodeSettingPart | null) {
                //注意这里index肯定不能是-1
                let result;
                item
                    ? isMediaSetting(item)
                    ? result = this.mediaSettingList[this.medias.indexOf(item)]
                    : result = this.nodeSettingList[this.nodes.indexOf(item)]
                    : result = {x: 0, y: 0, show: true};
                return result
            },

            //node的原生事件
            mouseEnter(node: VisualNodeSettingPart) {
                this.$set(node.State, "isMouseOn", true);
            },

            //node的原生事件
            mouseLeave(node: VisualNodeSettingPart) {
                this.$set(node.State, "isMouseOn", false);
                this.isDragging = false;
            },
            dbClickNode(node: VisualNodeSettingPart) {
                this.selectItem([node]);
            },

            explode(node: NodeSettingPart) {
                let _id = node.Setting._id;
                let graph = this.dataManager.graphManager[_id];
                if (graph === undefined) {
                    this.$store.dispatch('graphQuery', {
                        _id,
                        parent: this.document.id,
                    }).then(() => {
                        let graph = this.dataManager.graphManager[_id];
                        this.$set(graph.Conf.State, 'isExplode', true)
                    });
                } else {
                    let value = graph.Conf.State.isExplode;
                    let nodes = graph.Graph.nodes;
                    if (value) {
                        nodes.splice(0, 0, graph.baseNode);
                        this.$set(graph.Conf.State, 'isExplode', false)
                    } else {
                        let index = 0;
                        nodes.map(item => {
                            if (item.Setting._id === graph.id) {
                                index = nodes.indexOf(item)
                            }
                        });
                        nodes.splice(index, 1);
                        this.$set(graph.Conf.State, 'isExplode', true)
                    }
                }
            },

            addLink() {

            }
        },
        watch: {},
        record: {
            status: 'empty'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/11
* Updated by []
*/
