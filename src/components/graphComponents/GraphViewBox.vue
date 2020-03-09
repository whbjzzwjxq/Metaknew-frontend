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

            <graph-link
                v-for="(link, index) in links"
                v-show="showLink[index]"
                :key="link._id"
                :link="link"
                :scale="realScale"
                :source="getTargetInfo(link.Setting._start)"
                :target="getTargetInfo(link.Setting._end)"
                :mid-location="midLocation[index]"
            ></graph-link>

            <graph-node
                v-for="(node, index) in nodes"
                v-show="showNode[index]"
                :key="node._id"
                :node="node"
                :size="impScaleRadius[index]"
                :scale="realScale"
                :point="nodeLocation[index].positiveRect()"
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
                :x="selectorRect.x"
                :y="selectorRect.y"
                :width="selectorRect.width"
                :height="selectorRect.height"
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

        <rect-container
            @update-size="updateGraphSize(arguments[0], arguments[1], index)"
            :container="getSubGraphByRect(metaData.rect)"
            :key="metaData.self._id"
            always-show-border
            render-as-border
            expand
            v-for="(metaData, index) in activeGraphRectList"
            v-show="metaData.self.isExplode">

        </rect-container>

        <graph-node-button
            v-for="(node, index) in nodes"
            :key="index"
            :node-setting="getTargetInfo(node)"
            :node="node"
            :hide="!(node.State.isMouseOn && showNode[index])"
            @mouseenter.native="mouseEnter(node)"
            @mouseleave.native="mouseLeave(node)"
            @add-link="addLink(node)"
            @explode="explode"
        >

        </graph-node-button>

        <graph-media
            v-for="(media, index) in medias"
            :key="media._id"
            :setting="media"
            :container="mediaLocation[index]"
            :scale="realScale"
            :index="index"
            :view-box="containerRect"
            @mouseenter.native="mouseEnter(media)"
            @mouseleave.native="mouseLeave(media)"
            @mousedown.native="dragStart"
            @mousemove.native="drag(media, $event)"
            @mouseup.native="dragEnd(media, $event)"
            @dblclick.native.stop="dbClickNode(media)"
            @add-link="addLink(media)"
            @update-size="updateSize"
        >

        </graph-media>

        <graph-text
            v-for="(svg, index) in texts"
            :key="svg._id"
            :svg="svg"
            :container="svgLocation[index]"
            @mouseenter.native="mouseEnter(svg)"
            @mouseleave.native="mouseLeave(svg)"
            @mousedown.native="dragStart"
            @mousemove.native="drag(svg, $event)"
            @mouseup.native="dragEnd(svg, $event)"
            @dblclick.native.stop="dbClickNode(svg)"
            @update-size="updateSize">

        </graph-text>

        <graph-note
            v-for="note in notes"
            :note="note"
            :container="viewBox"
            :key="note._id"
        >

        </graph-note>

        <div :style="topNavigationStyle" class="unselected">
            <v-breadcrumbs
                :items="navigationList"
                :divider="'->'">
                <template v-slot:item="{item}">
                    <v-breadcrumbs-item
                        :disabled="item.disabled"
                        :style="{'color': item.color}"
                        @click="gotoDocument(item.document)"
                        large>
                        {{ item.text }}
                    </v-breadcrumbs-item>
                </template>
            </v-breadcrumbs>
        </div>
        <div :style="viewBoxToolStyle" class="d-flex flex-row">
            <graph-label-selector
                v-if="renderLabelSelector"
                :label-view-dict="labelViewDict"
                @select-label="selectLabel"
                @reset-label="resetLabel"
                @set-label="setLabel"
                class="justify-end">
            </graph-label-selector>
            <div>
                <v-slider
                    class="pl-3 pt-2"
                    v-model="scale"
                    :min="20"
                    :max="500"
                    color="grey"
                    thumb-size="small"
                    background-color="black"
                    track-color="black"
                    vertical>

                </v-slider>

            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {
        DocumentSelfPart,
        GraphConf,
        GraphItemSettingPart,
        GraphSelfPart,
        LinkSettingPart,
        MediaSettingPart,
        NodeInfoPart,
        NodeSettingPart,
        NoteSettingPart,
        TextSettingPart
    } from '@/class/graphItem'
    import {maxN, minN} from "@/utils/utils"
    import {getPoint, Point, RectByPoint} from '@/class/geometric'
    import GraphNode from './GraphNode.vue';
    import GraphLink from './GraphLink.vue';
    import GraphMedia from './GraphMedia.vue';
    import GraphNodeButton from '@/components/graphComponents/GraphNodeButton.vue';
    import GraphLabelSelector from '@/components/graphComponents/GraphLabelSelector.vue';
    import GraphNote from "@/components/graphComponents/GraphNote.vue";
    import GraphText from "@/components/graphComponents/GraphText.vue";
    import {GraphMetaData, LabelViewDict} from '@/interface/interfaceInComponent'
    import {isLinkSetting, isMediaSetting, isNodeSetting, isVisNodeSetting} from "@/utils/typeCheck";
    import {
        commitChangeSubTab,
        commitGraphChange,
        commitItemChange,
        commitSnackbarOn
    } from "@/store/modules/_mutations";
    import {dispatchNodeExplode} from "@/store/modules/_dispatch";
    import RectContainer from "@/components/container/RectContainer.vue";

    type GraphMode = 'normal' | 'geo' | 'timeline' | 'imp';

    interface NavigationItem {
        disabled: boolean;
        document: DocumentSelfPart;
        text: string;
        color: string
    }

    export default Vue.extend({
        name: "GraphViewBox",
        components: {
            GraphNode,
            GraphLink,
            GraphMedia,
            GraphNodeButton,
            GraphLabelSelector,
            RectContainer,
            GraphNote,
            GraphText
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
                    "document": {},
                } as LabelViewDict,

                //缩放比例
                scale: 100,

                //新增关系
                startNode: null as null | VisNodeSettingPart,
                newLinkEndPoint: new Point(0, 0),
                isLinking: false,
            }
        },
        props: {
            graph: {
                type: Object as () => GraphSelfPart,
                required: true
            },

            viewBox: {
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
            userDataManager: function (): UserDataManagerState {
                return this.$store.state.userDataManager
            },
            state: function (): GraphState {
                return this.graph.Conf.State
            },
            setting: function (): GraphConf {
                return this.graph.Conf
            },
            containerRect: function (): AreaRect {
                // containerRect形式
                return this.viewBox.positiveRect()
            },
            containerStyle: function (): CSSProp {
                return this.viewBox.getDivCSS(
                    {borderWidth: 0, overflow: "hidden"}
                )
            },
            // 所有的孩子Document
            childDocumentList: function (): GraphSelfPart[] {
                let docList = this.$store.getters.documentList as GraphSelfPart[];
                return docList.filter(doc => doc.root && doc.root._id === this.graph._id)
            },
            navigationList: function (): NavigationItem[] {
                let result: DocumentSelfPart[] = (this.graph.rootList).concat([this.graph]);
                return result.map(doc => ({
                    disabled: doc._id === this.graph._id,
                    document: doc,
                    text: this.dataManager.nodeManager[doc._id].Info.Name,
                    color: doc._id === this.graph._id ? 'grey' : 'royalblue'
                }) as NavigationItem)
            },
            // 未被删除的Graph
            activeGraphList: function (): GraphSelfPart[] {
                return [this.graph].concat(this.childDocumentList.filter(graph => graph &&
                    !graph.Conf.State.isDeleted))
            },

            activeGraphIdList: function (): id[] {
                return this.activeGraphList.map(graph => graph._id)
            },

            //graph的元数据List 就是计算各个SubGraph的绝对坐标
            activeGraphMetaDataList: function (): GraphMetaData[] {
                let vm = this;
                let baseContainer = new RectByPoint({x: 0, y: 0}, {
                    x: this.containerRect.width,
                    y: this.containerRect.height
                }, 0); // 起始坐标置为(0,0)

                let basePoint = getPoint(this.graph.baseNode.Setting.Base).multiRect(this.containerRect);
                // 基础点就是Graph.baseNode点
                let root: GraphMetaData = {
                    parent: null,
                    self: this.graph,
                    rect: baseContainer,
                    absolute: basePoint
                }; // root的MetaData

                // 从父亲Graph算出点的绝对位置
                const getAbsPointFromParent = (node: VisNodeSettingPart, parentMetaData: GraphMetaData) => {
                    // 加上父亲GraphBaseNode的绝对位置
                    return getPoint(node.Setting.Base) // 自己的位置比例
                        .decrease(node.parent.baseNode.Setting.Base) // 父亲GraphBaseNode的位置比例
                        .multiRect(parentMetaData.rect.positiveRect()) // 乘以父亲Graph的宽高
                        .add(parentMetaData.absolute)
                };

                // 从父亲Graph里的节点位置推出自身的矩形的绝对位置
                const getRectFromAbsPoint = (document: GraphSelfPart, parentPoint: Point) => {
                    let {width, height} = document.rect;
                    // 自身baseNode在自己矩形的位置
                    let delta = getPoint(document.baseNode.Setting.Base).multiRect({width, height});
                    // 起点与parentNode的位置差为delta，可以算出起点(左上角)
                    let start = delta.multi(-1).add(parentPoint);
                    // 终点就是起点加长宽
                    let end = start.copy().addRect({width, height});
                    return new RectByPoint(start, end)
                };

                let result = [root];
                let searchGraph = function (graphMeta: GraphMetaData) {
                    let graph = graphMeta.self.Content;
                    graph.nodes.map(node => {
                        let {_type, _id} = node.Setting;
                        let index = vm.activeGraphIdList.indexOf(_id);
                        if (_type === 'document' && index > -1 && _id !== graphMeta.self._id) {
                            // 如果这个Graph被激活了，就计算元数据
                            let doc = vm.activeGraphList[index];
                            let absPoint = getAbsPointFromParent(node, graphMeta);
                            let childRect = getRectFromAbsPoint(doc, absPoint);
                            let childGraphMeta: GraphMetaData = {
                                parent: graphMeta,
                                self: doc,
                                rect: childRect,
                                absolute: absPoint
                            };
                            result.push(childGraphMeta);
                            // 搜索子图
                            searchGraph(childGraphMeta)
                        }
                    })
                };
                // 搜索根图
                searchGraph(root);
                return result
            },

            // 除了Root以外的Rect
            activeGraphRectList: function (): GraphMetaData[] {
                return this.activeGraphMetaDataList.filter(meta => meta.self._id !== this.graph._id)
            },

            // 包含所有的Nodes
            nodes: function (): NodeSettingPart[] {
                let result = this.graph.Content.nodes
                    .filter(node => node._id === this.graph._id) as NodeSettingPart[];
                // root Graph的节点显示
                this.activeGraphList.map(graph => {
                    result = result.concat(graph.Content.nodes.filter(node => node._id !== graph._id))
                    // Graph底下的节点由父亲Graph中的Nodes代替
                });
                return result
            },

            // nodesIdList
            nodeIdList: function (): id[] {
                let result = this.nodes.map(node => node._id);
                return result.concat(this.medias.map(media => media._id));
            },

            nodeInfoList: function (): NodeInfoPart[] {
                return this.nodes.map(node => this.dataManager.nodeManager[node._id])
            },

            links: function (): LinkSettingPart[] {
                let result: LinkSettingPart[] = [];
                this.activeGraphList.map(graph => {
                    result = result.concat(graph.Content.links.filter(link => {
                        return this.nodeIdList.includes(link.Setting._start._id) &&
                            this.nodeIdList.includes(link.Setting._end._id) && !link.State.isDeleted
                    }))
                });
                return result
            },

            // 只有自身的medias
            medias: function (): MediaSettingPart[] {
                return this.graph.Content.medias.filter(item => !item.State.isDeleted)
            },

            mediaIdList: function (): id[] {
                return this.medias.map(media => media._id)
            },

            notes: function (): NoteSettingPart[] {
                return this.userDataManager.userNoteInDoc.filter(item => !item.isDeleted && item.Setting._parent === this.graph._id)
            },

            texts: function (): TextSettingPart[] {
                return this.graph.Content.texts
            },

            labelDict: function (): Record<GraphItemType, string[]> {
                let getLabels = (list: AllSettingPart[]) => {
                    let result: string[] = [];
                    list.map((item: AllSettingPart) => {
                        result.indexOf(item._label) === -1 &&
                        result.push(item._label)
                    });
                    return result
                };
                let docLabel = ['DocGraph', 'DocPaper'];
                let normalNodes = this.nodes.filter(item => !docLabel.includes(item._label));
                return {
                    'node': getLabels(normalNodes),
                    'link': getLabels(this.links),
                    'media': getLabels(this.medias),
                    'document': docLabel
                } as Record<GraphItemType, string[]>
            },

            selectedItems: function (): GraphItemSettingPart[] {
                return this.nodes.filter(item => item.State.isSelected)
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
            nodeLocation: function (): RectByPoint[] {
                return this.nodes.map((node, index) => {
                    let width = node.Setting.Base.size !== 0
                        ? node.Setting.Base.size * this.realScale
                        : this.impScaleRadius[index] * this.realScale;
                    let height = width * node.Setting.Base.scaleX;
                    return this.getRectByPoint(width, height, node)
                })
            },

            mediaLocation: function (): RectByPoint[] {
                return this.medias.map(media => {
                    let width = media.Setting.Base.size * this.realScale >= 50
                        ? media.Setting.Base.size * this.realScale
                        : 50;
                    let height = width * media.Setting.Base.scaleX;
                    return this.getRectByPoint(width, height, media)
                })
            },

            svgLocation: function (): RectByPoint[] {
                return this.texts.map(svg => {
                    let width = svg.Setting.Base.size * this.realScale;
                    let height = width * svg.Setting.Base.scaleX;
                    return this.getRectByPoint(width, height, svg)
                })
            },

            //关系midX
            midLocation: function (): PointObject[] {
                return this.links.map(link => {
                    let result;
                    let x1 = this.getTargetInfo(link.Setting._start).x;
                    let y1 = this.getTargetInfo(link.Setting._start).y;
                    let x2 = this.getTargetInfo(link.Setting._end).x;
                    let y2 = this.getTargetInfo(link.Setting._end).y;
                    switch (link.Setting.View.viewType) {
                        case "curve":
                            link.Setting.View.direct === 'top'
                                ? result = {"x": (x1 + x2) / 2, "y": y2}
                                : result = {"x": (x1 + x2) / 2, "y": y1};
                            break;
                        case "polyline":
                            link.Setting.View.direct === 'top'
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
            nodeSettingList: function (): VisualNodeSetting[] {
                return this.nodes.map((node, index) => {
                    let {x, y, width, height} = this.nodeLocation[index].positiveRect();
                    return {
                        height,
                        width,
                        x,
                        y,
                        show: this.showNode[index],
                        isSelected: node.State.isSelected,
                        isDeleted: node.isDeleted
                    }
                });
            },

            mediaSettingList: function (): VisualNodeSetting[] {
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
            showNode: function (): boolean[] {
                return this.nodes.map(node =>
                    // 父组件要炸开
                    (node.isFatherExplode && this.labelViewDict[node._type][node._label] && !node.isDeleted) ||
                    node._id === this.graph._id
                )
            },

            //显示边
            showLink: function (): boolean[] {
                return this.links.map(link =>
                    link.isFatherExplode && // 父组件要炸开
                    this.labelViewDict.link[link._label] &&
                    !link.isDeleted &&
                    this.getTargetInfo(link.Setting._start).show &&
                    this.getTargetInfo(link.Setting._end).show
                )
            },

            showMedia: function (): boolean[] {
                return this.medias.map(media =>
                    this.labelViewDict.media[media._label] &&
                    !media.isDeleted &&
                    media.Setting.Show.showAll
                )
            },

            showSvg: function (): boolean[] {
                return this.texts.map(svg => !svg.isDeleted && svg.Setting.Show.showAll)
            },

            //选择框的相关设置
            selectorStyle: function (): CSSProp {
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

            viewBoxToolStyle: function (): CSSProp {
                return {
                    position: 'absolute',
                    left: this.containerRect.width * 0.85 + 'px',
                    top: this.containerRect.height * 0.7 + 'px',
                }
            },

            topNavigationStyle: function (): CSSProp {
                return {
                    position: 'absolute',
                    left: '0px',
                    top: '0px',
                    width: '100%',
                    height: '60px'
                }
            },

            selectorRect: function (): AreaRect {
                return this.selectRect.positiveRect()
            },

        },
        methods: {
            getRectByPoint(width: number, height: number, setting: VisAreaSettingPart) {
                // 将绝对的坐标点转化为矩形
                //width,height: 从源点引申的尺寸，源点在左上角
                let graphMeta = this.getGraphMetaData(setting.parent._id);
                const getAbsPointFromParent = (node: VisAreaSettingPart, parentMetaData: GraphMetaData) => {
                    let delta = getPoint(node.Setting.Base)
                        .decrease(node.parent.baseNode.Setting.Base) // 计算小数差 e.g. 0.3- 0.5 = -0.2
                        .multiRect(parentMetaData.rect.positiveRect()); // 乘以矩形 e.g. -0.2 * 1000 = -200
                    delta.add(parentMetaData.absolute); // 加上绝对坐标 e.g. -100 + 320 = 220
                    return delta
                };
                let startPoint = this.pointMoveComputed(getAbsPointFromParent(setting, graphMeta));
                let endPoint = startPoint.copy().addRect({width, height});
                return new RectByPoint(startPoint, endPoint)
            },

            getSubGraphByRect(absRect: RectByPoint) {
                // 转化Rect
                let start = this.pointMoveComputed(absRect.start);
                let end = this.pointMoveComputed(absRect.end);
                return new RectByPoint(start, end)
            },

            pointMoveComputed(point: Point) {
                // 根据View和scale计算实际坐标
                return this.lastViewPoint.copy().decrease(this.viewPoint.copy().decrease(point).multi(this.realScale));
            },

            dragStart($event: MouseEvent) {
                if (this.dragAble) {
                    this.dragStartPoint.update($event);
                    this.isDragging = true;
                }
            },

            drag(target: VisAreaSettingPart, $event: MouseEvent) {
                if (this.isDragging && this.dragAble) {
                    let delta = getPoint($event);
                    let rect;
                    target.parent._id === this.graph._id
                        ? (rect = this.containerRect) // 如果是根节点就用containerRect 因为this.graph.rect !== containerRect 而是整个ViewBox
                        : (rect = target.parent.rect); // 否则用父亲Rect
                    delta.decrease(this.dragStartPoint).divideRect(rect).divide(this.realScale);
                    this.dragStart($event);
                    let moveFunc = (node: VisAreaSettingPart) => {
                        this.$set(node.Setting.Base, 'x', node.Setting.Base.x + delta.x);
                        this.$set(node.Setting.Base, 'y', node.Setting.Base.y + delta.y);
                    };
                    if (this.selectedItems.length > 0) {
                        this.selectedItems.filter(item => {
                            isNodeSetting(item);
                        });
                    } else {
                        moveFunc(target)
                    }
                }
            },

            dragEnd(target: VisAreaSettingPart, $event: MouseEvent) {
                if (this.isDragging && this.dragAble) {
                    this.drag(target, $event);
                    this.isDragging = false;
                }
            },

            //node的原生事件
            mouseEnter(node: VisAreaSettingPart) {
                this.$set(node.State, "isMouseOn", true);
            },

            //node的原生事件
            mouseLeave(node: VisAreaSettingPart) {
                this.$set(node.State, "isMouseOn", false);
                this.isDragging = false;
            },

            dbClickNode(node: VisAreaSettingPart) {
                this.selectItem([node]);
                if (this.isLinking && isVisNodeSetting(node) && this.startNode) {
                    commitChangeSubTab('info');
                    if (node.parent._id === this.startNode.parent._id) {
                        // 如果是同一张图里的
                        let document = node.parent;
                        document.addEmptyLink(this.startNode, node);
                        this.isLinking = false;
                    } else {
                        let payload = {
                            "timeout": 2000,
                            "content": "对不起, 暂时不支持跨专题建立关系",
                            "color": "warn",
                            "actionName": "addLinkViaTwoDocument",
                            "once": false,
                        } as SnackBarStatePayload;
                        commitSnackbarOn(payload);
                    }
                } else {
                    //
                }
            },
            //框选
            selectItem(itemList: GraphSubItemSettingPart[]) {
                //选择
                itemList.map(item => item.updateState("isSelected", true));
                //如果是单选就切换内容
                if (itemList.length === 1) {
                    let item = itemList[0];
                    let info;
                    isLinkSetting(item)
                        ? info = this.dataManager.linkManager[item._id]
                        : isNodeSetting(item)
                        ? info = this.dataManager.nodeManager[item._id]
                        : info = undefined;
                    if (info) {
                        commitItemChange(info);
                    } else {
                        // todo 这里全屏媒体资源
                    }
                }
            },

            startSelect($event: MouseEvent) {
                if ($event.ctrlKey) {
                    this.isMoving = true;
                    this.moveStartPoint.update($event);
                } else {
                    if (this.renderSelector) {
                        this.$set(this, 'isSelecting', true);
                        let start = getPoint($event).decrease(this.containerRect);
                        this.selectRect.start.update(start);
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
                if (this.isSelecting) {
                    this.selecting($event);
                    this.isMoving = false;
                    this.isSelecting = false;
                    // 单击也会触发 没办法
                    this.clearSelected("all");
                    // 基础的selection
                    let nodes = this.nodes.filter((node, index) =>
                        this.selectRect.checkInRect(this.nodeLocation[index].midPoint()) && this.showNode[index]
                    );

                    let links = this.links.filter((link, index) =>
                        this.selectRect.checkInRect(this.midLocation[index]) && this.showLink[index]
                    );
                    let medias = this.medias.filter((media, index) =>
                        this.selectRect.checkInRect(this.mediaLocation[index].midPoint()) && this.showMedia[index]
                    );
                    let texts = this.texts.filter((svg, index) =>
                        this.selectRect.checkInRect(this.svgLocation[index].midPoint()) && this.showSvg[index]
                    );
                    nodes.map(node => {
                            //如果选中了Document 对应的Node
                            let index = this.activeGraphIdList.indexOf(node._id);
                            if (node._type === 'document' && index > -1) {
                                this.activeGraphList[index].selectAll('isSelected', true)
                            }
                        }
                    );
                    let result = [nodes, medias, links, texts].flat(1) as GraphSubItemSettingPart[];
                    this.selectItem(result)
                }
            },

            clickSvg($event: MouseEvent) {
                this.isLinking = false;
                this.clearSelected('all')
            },

            clearSelected(items: 'all' | GraphItemSettingPart[]) {
                if (items === 'all') {
                    Object.values(this.dataManager.graphManager).map(document => document.selectAll('isSelected', false));
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
                Object.entries(this.labelDict).map(([_type, labels]) => {
                    //@ts-ignore
                    let type: GraphItemType = _type;
                    labels.map(label => {
                        if (this.labelViewDict[type][label] === undefined) {
                            this.$set(this.labelViewDict[type], label, true)
                        }
                    })
                })
            },

            //取得link所用数据
            getTargetInfo(item: VisNodeSettingPart | null) {
                //注意这里index肯定不能是-1
                let result;
                item
                    ? isMediaSetting(item)
                    ? result = this.mediaSettingList[this.mediaIdList.indexOf(item._id)]
                    : result = this.nodeSettingList[this.nodeIdList.indexOf(item._id)]
                    : result = {x: 0, y: 0, show: true};
                return result
            },

            addLink(node: VisNodeSettingPart) {
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
                // 真正的addLink在dbclick
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
                let event = getPoint($event).decrease(this.containerRect);
                let eventCopy = event.copy();
                // 先后顺序很重要
                event.decrease(this.lastViewPoint).divide(oldScale);
                this.viewPoint.add(event);
                this.lastViewPoint.update(eventCopy);
            },

            explode(node: NodeSettingPart) {
                dispatchNodeExplode({node, document: this.graph})
            },

            getGraphMetaData: function (_id: id) {
                return this.activeGraphMetaDataList.filter(meta => meta.self._id === _id)[0]
            },

            updateGraphSize: function (start: PointMixed, end: PointMixed, index: number) {
                let graph = this.activeGraphRectList[index].self;
                // 视觉上的更新尺寸start, end
                let setting = graph.baseNode.Setting;
                let scale = this.realScale;
                // 更新起始点
                setting.Base.x += start.x / (this.containerRect.width * scale);
                setting.Base.y += start.y / (this.containerRect.height * scale);
                //更新长宽
                let delta = getPoint(end).decrease(start).divide(this.realScale);
                graph.rect.width += delta.x;
                graph.rect.height += delta.y;
            },

            updateSize: function (start: PointMixed, end: PointMixed, setting: Setting) {
                // 视觉上的更新尺寸start, end
                let scale = this.realScale;
                // 更新起始点
                setting.Base.x += start.x / (this.containerRect.width * scale);
                setting.Base.y += start.y / (this.containerRect.height * scale);
                //更新长宽
                let width = setting.Base.size;
                let height = setting.Base.scaleX * width;
                let delta = getPoint(end).decrease(start).divide(scale);
                width += delta.x;
                height += delta.y;
                setting.Base.scaleX = height / width;
                setting.Base.size = width;
            },

            getItemList(_type: GraphItemType) {
                return _type === 'link'
                    ? this.links
                    : _type === 'media'
                        ? this.medias
                        : _type === 'text'
                            ? this.texts
                            : this.nodes
            },

            gotoDocument(graph: GraphSelfPart) {
                commitGraphChange({graph})
            },

            setLabel(_type: GraphItemType, _label: string) {
                let value = this.labelViewDict[_type][_label];
                this.$set(this.labelViewDict[_type], _label, !value)
            },

            resetLabel() {
                this.labelViewDict = {
                    "node": {},
                    "media": {},
                    "link": {},
                    "document": {},
                } as LabelViewDict;
                this.getLabelViewDict()
            },

            selectLabel(_type: GraphItemType, _label: string) {
                let list: GraphItemSettingPart[] = this.getItemList(_type);
                list.filter(item => item._label === _label).map(item => item.updateState('isSelected'))
            },
        },

        watch: {
            labelDict: function (): void {
                this.getLabelViewDict()
            }
        },
        created: function (): void {
            this.getLabelViewDict()
        },
        mounted: function (): void {
            this.getLabelViewDict()
        },
        record: {
            status: 'editing'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/5
* Updated by []
*/
