<template>
    <div @wheel="onScroll" style="width: 100%; height: 100%; position: absolute">
        <!--        基础的Graph-->
        <svg
            width="100%"
            height="100%"
            @dblclick="clickSvg"
            @mousedown.self="startSelect"
            @mousemove="selecting"
            @mouseup="endSelect"
            @wheel="onScroll">

            <!--            <foreignObject-->
            <!--                v-for="(graph, index) in activeGraphList"-->
            <!--                :key="index"-->
            <!--                :x="activeGraphRectList[index + 1].x - 12"-->
            <!--                :y="activeGraphRectList[index + 1].y - 12"-->
            <!--                :width="activeGraphRectList[index + 1].width + 12"-->
            <!--                :height="activeGraphRectList[index + 1].height + 12"-->
            <!--                @mousedown.self="startSelect"-->
            <!--            >-->
            <!--                &lt;!&ndash;        展开的Graph&ndash;&gt;-->
            <!--                <graph-render-->
            <!--                    :document="graph"-->
            <!--                    :label-view-dict="labelViewDict"-->
            <!--                    :real-scale="realScale"-->
            <!--                    :graph-meta-data="activeGraphMetaDataList[index + 1]"-->
            <!--                    render-selector-->
            <!--                    @on-scroll="onScroll"-->
            <!--                    @move-start="startSelect"-->
            <!--                    @moving="selecting"-->
            <!--                    @move-end="subMoveEnd"-->
            <!--                >-->

            <!--                </graph-render>-->
            <!--            </foreignObject>-->

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
                :point="nodeLocation[index].positiveRect()"
                :index="index"
                @kick-back-x="kickBackX"
                @kick-back-y="kickBackY"
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
                :height="selector.height"
                class="selectRect">

            </rect>

            <line
                v-if="isLinking"
                :x1="getTargetInfo(startNode).x"
                :y1="getTargetInfo(startNode).y"
                :x2="newLinkEndPoint.x - 5"
                :y2="newLinkEndPoint.y - 5"
                stroke="grey">

            </line>
        </svg>

        <graph-media
            v-for="(node, index) in medias"
            :key="node.Setting._id"
            :setting="node"
            :container="mediaLocation[index]"
            :scale="realScale"
            :index="index"
            :view-box="containerRect"
            @mouseenter.native="mouseEnter(node)"
            @mouseleave.native="mouseLeave(node)"
            @mousedown.native="dragStart"
            @mousemove.native="drag(node, $event)"
            @mouseup.native="dragEnd(node, $event)"
            @dblclick.native.stop="dbClickNode(node)"
            @add-link="addLink(node)"
        >

        </graph-media>

        <!--        <graph-note-->
        <!--            v-show="renderNotes"-->
        <!--            v-for="(note, index) in activeNotes"-->
        <!--            :key="index"-->
        <!--            :note="note"-->
        <!--            :container="container"-->
        <!--        >-->
        <!--        </graph-note>-->

        <graph-node-button
            v-for="node in nodes"
            :key="node.Setting._id"
            :node-setting="getTargetInfo(node)"
            :node="node"
            @mouseenter.native="mouseEnter(node)"
            @mouseleave.native="mouseLeave(node)"
            @add-link="addLink(node)"
            @explode="explode">

        </graph-node-button>

        <!--        <card-doc-node-simplify-->
        <!--            v-for="(node, index) in renderCardList"-->
        <!--            :key="node.Setting._id"-->
        <!--            :base-data="nodeInfoList[index]"-->
        <!--            :container="container"-->
        <!--            :is-hard-hidden="isDragging"-->
        <!--            :is-hidden="!node.State.showCard"-->
        <!--            :position="cardLocList[index]"-->
        <!--            @mouseenter.native.stop="mouseEnterCard"-->
        <!--            @mouseleave.native.stop="mouseLeaveCard(node)">-->

        <!--        </card-doc-node-simplify>-->

        <div :style="viewBoxToolStyle" class="d-flex flex-row">
            <graph-label-selector
                v-if="renderLabelSelector"
                :label-view-dict="labelViewDict"
                @selectItem-label="selectLabel"
                class="justify-end">
            </graph-label-selector>
            <div>
                <v-slider
                    class="pl-3 pt-2"
                    v-model="scale"
                    :min="25"
                    :max="300"
                    color="grey"
                    thumb-size="small"
                    background-color="black"
                    track-color="black"
                    vertical>

                </v-slider>

            </div>
        </div>

        <rect>

        </rect>

    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {DataManagerState} from '@/store/modules/dataManager'
    import {
        AllSettingPart,
        BaseType,
        getIndex,
        GraphSelfPart,
        GraphSettingPart,
        GraphState,
        id,
        LinkInfoPart,
        LinkSettingPart,
        MediaInfoPart,
        MediaSetting,
        MediaSettingPart,
        NodeInfoPart,
        NodeSetting,
        NodeSettingPart,
        NoteSettingPart,
        SettingPart,
        VisualNodeSettingPart
    } from '@/utils/graphClass'
    import {maxN, minN} from "@/utils/utils"
    import {AreaRect, getPoint, Point, PointMixed, PointObject, RectByPoint} from '@/utils/geoMetric'
    import * as CSS from 'csstype'
    import GraphNode from './GraphNode.vue';
    import GraphLink from './GraphLink.vue';
    import GraphMedia from './GraphMedia.vue';
    import GraphNote from './GraphNote.vue';
    import GraphNodeButton from '@/components/graphComponents/GraphNodeButton.vue';
    import GraphLabelSelector from '@/components/graphComponents/GraphLabelSelector.vue';
    import GraphRender from "@/components/graphComponents/GraphRender.vue";
    import {GraphMetaData, LabelViewDict, VisualNodeSetting} from '@/utils/interfaceInComponent'
    import {isLinkSetting, isMediaSetting, isNodeSetting} from "@/utils/typeCheck";
    import {commitInfoAdd, commitItemChange, commitSnackbarOn} from "@/store/modules/_mutations";
    import {SnackBarStatePayload} from "@/store/modules/componentSnackBar";
    import {dispatchNodeExplode} from "@/store/modules/_dispatch";
    import retryTimes = jest.retryTimes;

    type GraphMode = 'normal' | 'geo' | 'timeline' | 'imp';

    export default Vue.extend({
        name: "GraphViewBox",
        components: {
            GraphNode,
            GraphLink,
            GraphMedia,
            GraphNodeButton,
            GraphLabelSelector,
            // GraphNote,
            // GraphRender,
        },
        data() {
            return {

                // ------ drag ------
                dragAble: true,
                //drag起始位置
                dragStartPoint: new Point(0, 0) as Point,
                //正在drag
                isDragging: false,

                // ------ move ------
                // view起始Point
                viewPoint: new Point(960, 480),

                // 上一个view起始Point
                lastViewPoint: new Point(960, 480),

                moveStartPoint: new Point(0, 0),
                //拖动画布
                isMoving: false,

                // ------ select ------
                //正在select
                isSelecting: false as boolean,
                selectRect: new RectByPoint({x: 0, y: 0}, {x: 0, y: 0}),

                // ------card-------
                showCardId: 0 as number,
                closeCardId: 0 as number,
                mouseOnCard: false,
                //card属性
                card: {
                    width: 240,
                    height: 300
                },
                //card的位置
                cardLocList: [] as any[],
                //控制可视的标签
                labelViewDict: {
                    "node": {},
                    "media": {},
                    "link": {},
                    "note": {},
                    "document": {},
                } as LabelViewDict,

                //缩放比例
                scale: 100,

                //新增关系
                startNode: null as null | VisualNodeSettingPart,
                newLinkEndPoint: new Point(0, 0),
                isLinking: false,

            }
        },
        props: {
            document: {
                type: Object as () => GraphSelfPart,
                required: true
            },

            container: {
                type: Object as () => RectByPoint,
                required: true
            },

            //是否显示便签
            renderNotes: {
                type: Boolean,
                default: false
            },

            //是否显示媒体
            renderMedia: {
                type: Boolean,
                default: false
            },

            //是否渲染card
            renderCard: {
                type: Boolean,
                default: false
            },

            //是否渲染label - selector
            renderLabelSelector: {
                type: Boolean,
                default: false
            },

            //是否渲染rect - selector
            renderSelector: {
                type: Boolean,
                default: false
            },

            //模式
            mode: {
                type: String as () => GraphMode,
                default: "normal",
            },

            //是否是编辑模式
            editMode: {
                type: Boolean,
                default: false
            },

        },
        computed: {
            dataManager: function (): DataManagerState {
                return this.$store.state.dataManager
            },
            state: function (): GraphState {
                return this.document.Conf.State
            },
            setting: function (): GraphSettingPart {
                return this.document.Conf
            },
            containerRect: function (): AreaRect {
                // containerRect形式
                return this.container.positiveRect()
            },
            containerStyle: function (): CSS.Properties {
                return this.container.getDivCSS(
                    {borderWidth: 0, overflow: "hidden"}
                )
            },
            // 所有的孩子Document
            childDocumentList: function () {
                return this.document.getChildDocument()
            },
            // 不包含本身的graph
            activeGraphList: function (): GraphSelfPart[] {
                return [this.document].concat(this.childDocumentList.filter(graph => graph &&
                    !graph.Conf.State.isDeleted && graph.Conf.State.isExplode))
            },

            activeGraphIdList: function (): id[] {
                return this.activeGraphList.map(graph => graph.id)
            },

            activeGraphMetaDataList: function (): GraphMetaData[] {
                let realScale = this.realScale;
                let vm = this;
                // 从父亲Graph里的节点位置推出自身的矩形位置
                const getRectFromParent = (document: GraphSelfPart, parentNodeLocation: PointMixed) => {
                    // 当前缩放下矩形的长宽
                    let width = document.rect.width * realScale;
                    let height = document.rect.height * realScale;
                    // baseNode在矩形的位置
                    let delta = getPoint(document.baseNode.Setting.Base).multiRect({width, height})
                    // 起点与parentNode的位置差为delta
                    let start = delta.copy().multi(-1).add(parentNodeLocation)
                    let end = start.copy().addRect({width, height})
                    return new RectByPoint(start, end, document.Conf.Setting.Base.border)
                }
                let root: GraphMetaData = {
                    parent: null,
                    self: this.document,
                    rect: this.container,
                };
                let result = [root]
                let searchGraph = function (graphMeta: GraphMetaData) {
                    let graph = graphMeta.self.Graph
                    let rect = graphMeta.rect
                    graph.nodes.map(node => {
                        let {_type, _id, Base} = node.Setting;
                        let index = vm.activeGraphIdList.indexOf(_id);
                        if (_type === 'document' && index > -1) {
                            // 这个Graph被激活了
                            let doc = vm.activeGraphList[index];
                            let parentNode = vm.getRectByPoint(0, 0, node.Setting, rect.positiveRect())
                            let childRect = getRectFromParent(doc, parentNode.start);
                            let childGraphMeta: GraphMetaData = {
                                parent: graphMeta,
                                self: doc,
                                rect: childRect
                            }
                            result.push(childGraphMeta)
                            searchGraph(childGraphMeta)
                        }
                    })
                }
                searchGraph(root)
                return result
            },

            // 求出所有的Rect
            activeGraphRectList: function (): AreaRect[] {
                return this.activeGraphMetaDataList.map(meta => meta.rect.positiveRect())
            },
            // 包含所有的Nodes Links
            nodes: function (): NodeSettingPart[] {
                let result: NodeSettingPart[] = [];
                this.activeGraphList.map(graph => {
                    result = result.concat(graph.Graph.nodes)
                });
                return result
            },

            nodeLength: function () {
                return this.nodes.length
            },

            links: function (): LinkSettingPart[] {
                let result: LinkSettingPart[] = [];
                this.activeGraphList.map(graph => {
                    result.concat(graph.Graph.links)
                });
                return result
            },

            // 只有自身的medias
            medias(): MediaSettingPart[] {
                return this.document.Graph.medias
            },

            notes(): NoteSettingPart[] {
                return this.document.Graph.notes
            },

            selectedNodes(): NodeSettingPart[] {
                return this.nodes.filter(item => item.State.isSelected)
            },

            nodeInfoList(): NodeInfoPart[] {
                return this.nodes.map(node => this.dataManager.nodeManager[node.Setting._id])
            },

            mediaInfoList(): MediaInfoPart[] {
                return this.medias.map(media => this.dataManager.mediaManager[media.Setting._id])
            },

            linkInfoList(): LinkInfoPart[] {
                return this.links.map(link => this.dataManager.linkManager[link.Setting._id])
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
            realScale(): number {
                return this.scale / 100
            },

            //节点locationX
            nodeLocation: function () {
                return this.nodes.map((node, index) => {
                    let width = node.Setting.Base.size !== 0
                        ? node.Setting.Base.size * this.realScale
                        : this.impScaleRadius[index] * this.realScale;
                    let height = width * node.Setting.Base.scaleX;
                    return this.getRectByPoint(width, height, node.Setting)
                })
            },

            mediaLocation: function () {
                return this.medias.map(media => {
                    let width = media.Setting.Base.size * this.realScale >= 50
                        ? media.Setting.Base.size * this.realScale
                        : 50
                    let height = width * media.Setting.Base.scaleX
                    return this.getRectByPoint(width, height, media.Setting)
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

            //压缩版本的nodeSetting
            nodeSettingList(): VisualNodeSetting[] {
                return this.nodes.map((node, index) => {
                    let {x, y, width, height} = this.nodeLocation[index].positiveRect();
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

            mediaSettingList(): VisualNodeSetting[] {
                return this.medias.map((media, index) => {
                    let {x, y, width, height} = this.mediaLocation[index].positiveRect();
                    let realX = x + width / 2;
                    let realY = y + height / 2;
                    return {
                        height,
                        width,
                        x: realX,
                        y: realY,
                        show: this.showMedia[index],
                        isSelected: media.State.isSelected,
                        isDeleted: media.State.isDeleted
                    }
                })
            },

            //显示节点
            showNode(): boolean[] {
                return this.nodes.map(node =>
                    this.labelViewDict[node.Setting._type][node.Setting._label] &&
                    !node.State.isDeleted &&
                    node.Setting.Show.showAll
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

            showMedia(): boolean[] {
                return this.medias.map(media =>
                    this.labelViewDict.media[media.Setting._label] &&
                    !media.State.isDeleted &&
                    media.Setting.Show.showAll
                )
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
                    "display": this.isSelecting ? "inline" : "none",
                }
            },

            viewBoxToolStyle(): CSS.Properties {
                return {
                    position: 'absolute',
                    left: this.containerRect.width * 0.85 + 'px',
                    top: this.containerRect.height * 0.65 + 'px',
                }
            },

            selector: function () {
                return this.selectRect.positiveRect()
            },

            isSelected: function () {
                return this.document.Conf.State.isSelected
            }

        },
        methods: {
            dragStart($event: MouseEvent) {
                if (this.dragAble) {
                    this.dragStartPoint.update($event);
                    this.isDragging = true;
                }
            },

            drag(target: VisualNodeSettingPart, $event: MouseEvent) {
                if (this.isDragging && this.dragAble) {
                    let {x, y} = $event;
                    let delta = new Point(x, y);
                    delta.decrease(this.dragStartPoint).divideRect(this.containerRect).divide(this.realScale)
                    this.dragStart($event);
                    let moveFunc = (node: VisualNodeSettingPart) => {
                        this.$set(node.Setting.Base, 'x', node.Setting.Base.x + delta.x);
                        this.$set(node.Setting.Base, 'y', node.Setting.Base.y + delta.y);
                    }
                    if (this.selectedNodes.length > 0) {
                        this.selectedNodes.map(node => {
                            moveFunc(node)
                        });
                    } else {
                        moveFunc(target)
                    }
                    // 检查是否越界
                    this.checkOutside($event);
                }
            },

            dragEnd(target: VisualNodeSettingPart, $event: MouseEvent) {
                if (this.isDragging && this.dragAble) {
                    this.drag(target, $event);
                    this.isDragging = false;
                    this.updateCardLoc()
                }
            },

            getRectByPoint(width: number, height: number, setting: NodeSetting | MediaSetting, rect?: AreaRect) {
                rect || (rect = this.containerRect);
                let basePoint = getPoint(setting.Base).multiRect(rect)
                let startPoint = this.lastViewPoint.copy()
                    .decrease(this.viewPoint.copy().decrease(basePoint).multi(this.realScale))
                let endPoint = startPoint.copy().addRect({width, height})
                return new RectByPoint(startPoint, endPoint)
            },

            //检查鼠标是否在svg外部
            checkOutside($event: MouseEvent) {
                return this.container.checkInRect($event)
            },

            //x方向限定区域
            kickBackX(node: VisualNodeSettingPart, X: number) {
                if (this.isDragging) {
                    this.$set(node.Setting.Base, 'x', X / this.containerRect.width);
                    node.State.isSelected = false;
                    this.isDragging = false;
                }
            },

            //y方向限定区域
            kickBackY(node: VisualNodeSettingPart, Y: number) {
                if (this.isDragging) {
                    this.$set(node.Setting.Base, 'y', Y / this.containerRect.height);
                    node.State.isSelected = false;
                    this.isDragging = false;
                }
            },

            //node的原生事件
            mouseEnter(node: VisualNodeSettingPart) {
                this.$set(node.State, "isMouseOn", true);
                this.$set(node.State, "showCard", true);
                this.showCardId = setTimeout(() => {
                    this.$set(node.State, "showCard", true);
                }, 1000)
            },

            //node的原生事件
            mouseLeave(node: VisualNodeSettingPart) {
                this.$set(node.State, "isMouseOn", false);
                this.isDragging = false;
                clearTimeout(this.showCardId);
                !this.mouseOnCard &&
                (this.closeCardId = setTimeout(() => {
                    this.$set(node.State, "showCard", false);
                }, 1000))
            },

            mouseEnterCard() {
                this.mouseOnCard = true;
                clearTimeout(this.closeCardId)
            },

            mouseLeaveCard(node: NodeSettingPart) {
                this.mouseOnCard = false;
                this.closeCardId = setTimeout(() => {
                    this.$set(node.State, "showCard", false);
                }, 1000)
            },

            //自适应位置 取得卡片数据 不需要计算属性 显示的时候重新计算位置就好
            locationCard(node: NodeSettingPart) {

            },

            updateCardLoc() {
                let result;
                result = this.nodes.map(node => this.locationCard(node));
                this.cardLocList = result
            },

            dbClickNode(node: VisualNodeSettingPart) {
                this.selectItem([node]);
                if (this.isLinking && node && this.startNode) {
                    let id = getIndex();
                    let setting = LinkSettingPart.emptyLinkSetting(id, "Default", this.startNode, node, this.document);
                    let info = LinkInfoPart.emptyLinkInfo(id, "Default", this.startNode, node);
                    this.document.addItems([setting]);
                    commitInfoAdd({item: info, strict: true});
                    this.isLinking = false;
                } else {
                    //
                }
            },
            //框选
            selectItem(itemList: AllSettingPart[]) {
                //选择
                itemList.map(item => this.$set(item.State, 'isSelected', true));
                //如果是单选就切换内容
                if (itemList.length === 1) {
                    let item = itemList[0];
                    let info;
                    isLinkSetting(item)
                        ? info = this.dataManager.linkManager[item.Setting._id]
                        : isNodeSetting(item)
                        ? info = this.dataManager.nodeManager[item.Setting._id]
                        : info = undefined
                    if (info) {
                        commitItemChange(info);
                    } else {
                        // todo 这里全屏媒体资源
                    }
                }
            },

            selectLabel(_type: BaseType, _label: string) {
                let result = this.nodes.filter(node => node.Setting._label === _label);
                this.selectItem(result)
            },

            startSelect($event: MouseEvent) {
                if ($event.ctrlKey) {
                    this.isMoving = true;
                    this.moveStartPoint.update($event);
                } else {
                    if (this.renderSelector) {
                        this.$set(this, 'isSelecting', true);
                        let start = getPoint($event).decrease(this.containerRect);
                        this.selectRect.start.update(start)
                        this.selectRect.end.update(start)
                    }
                }
            },

            selecting($event: MouseEvent) {
                let end = getPoint($event).decrease(this.containerRect);
                //选择集
                if ($event.ctrlKey && this.isMoving) {
                    this.lastViewPoint.add($event).decrease(this.moveStartPoint);
                    this.moveStartPoint.update($event);
                } else {
                    if (this.isSelecting && this.renderSelector) {
                        this.selectRect.end.update(end);
                    }
                    //移动
                    if (this.isLinking) {
                        this.newLinkEndPoint.update(end)
                    }
                }
            },

            endSelect($event: MouseEvent) {
                this.selecting($event);
                this.isMoving = false;
                this.isSelecting = false;
                this.clearSelected("all");
                let result: AllSettingPart[] = [];
                // 基础的selection
                let nodes = this.nodes.filter((node, index) =>
                    this.selectRect.checkInRect(this.nodeLocation[index].midPoint())
                );

                let links = this.links.filter((link, index) =>
                    this.selectRect.checkInRect(this.midLocation[index])
                );
                let medias = this.medias.filter((media, index) =>
                    this.selectRect.checkInRect(this.mediaLocation[index].midPoint())
                );
                let selectRoot = false;
                nodes.map(node => {
                        //是否选中Root节点
                        selectRoot = selectRoot || node.Setting._id === this.document.id

                        //如果选中了Document 对应的Node
                        let index = this.activeGraphIdList.indexOf(node.Setting._id);
                        if (node.Setting._type === 'document' && index > -1) {
                            this.activeGraphList[index].allStateChange(true, 'isSelected')
                        }
                    }
                )
                if (selectRoot) {
                    // 选中所有内容
                    this.document.allStateChange(true, 'isSelected')
                } else {
                    result = result.concat(nodes)
                    result = result.concat(links)
                    result = result.concat(medias);
                    this.selectItem(result)
                }
            },

            clickSvg() {
                this.isLinking = false;
                this.clearSelected('all')
            },

            clearSelected(items: 'all' | SettingPart[]) {
                if (items === 'all') {
                    this.nodes.map(node => this.$set(node.State, 'isSelected', false));
                    this.links.map(link => this.$set(link.State, 'isSelected', false));
                    this.medias.map(media => this.$set(media.State, 'isSelected', false));
                    this.childDocumentList.map(document =>
                        this.$set(document.Conf.State, 'isSelected', false)
                    )
                    this.$set(this.document.Conf.State, 'isSelected', false)
                } else {
                    items.map(item => this.$set(item.State, 'isSelected', false));
                }
                this.isDragging = false;
            },

            subMoveEnd($event: MouseEvent) {
                this.selecting($event);
                this.isMoving = false
            },

            getLabelViewDict: function () {
                let getLabels = (list: AllSettingPart[]) => {
                    let result: string[] = [];
                    list.map((item: AllSettingPart) => {
                        result.indexOf(item.Setting._label) === -1 &&
                        result.push(item.Setting._label)
                    })
                    return result
                }
                let typeDict = {
                    'node': getLabels(this.nodes),
                    'link': getLabels(this.links),
                    'media': getLabels(this.medias),
                    'note': getLabels(this.notes),
                    'document': ['DocGraph', 'DocPaper']
                }
                Object.entries(typeDict).map(([_type, labels]) => {
                    labels.map(label => {
                        if (this.labelViewDict[_type][label] === undefined) {
                            this.labelViewDict[_type][label] = true
                        }
                    })
                })
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

            addLink(node: NodeSettingPart) {
                let payload = {
                    "timeout": 2000,
                    "content": "再次双击节点生成关系， 双击画布取消生成",
                    "color": "success",
                    "actionName": "addLink",
                    "once": false,
                } as SnackBarStatePayload;
                commitSnackbarOn(payload);
                this.isLinking = true;
                this.startNode = node;
            },

            onScroll($event: WheelEvent) {
                let oldScale = this.realScale;
                let delta;
                $event.deltaY < 0
                    ? delta = 10
                    : delta = -10;
                this.scale += delta;
                this.scale < 20 && (this.scale = 20);
                this.scale > 500 && (this.scale = 500);
                let event = getPoint($event).decrease(this.containerRect)
                let eventCopy = event.copy();
                // 先后顺序很重要
                event.decrease(this.lastViewPoint).divide(oldScale)
                this.viewPoint.add(event);
                this.lastViewPoint.update(eventCopy);
            },

            explode(node: NodeSettingPart) {
                dispatchNodeExplode({node, document: this.document})
            },

        },

        watch: {
            nodeLength: function (): void {
                // this.updateCardLoc();
            },

            isSelected: function (): void {
                this.$set(this.document.baseNode.State, 'isSelected', this.isSelected)
            }
        },
        created: function (): void {
            this.getLabelViewDict()
        },
        mounted: function (): void {
            this.getLabelViewDict()
        },
        record: {
            status: 'empty'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/5
* Updated by []
*/
