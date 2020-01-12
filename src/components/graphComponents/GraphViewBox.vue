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

        <rect-container
            v-for="(metaData, index) in activeGraphRectList"
            :key="metaData.self.id"
            :container="metaData.rect"
            v-show="metaData.self.Conf.State.isExplode"
            render-as-border>

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
            @explode="explode">

        </graph-node-button>

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

        <graph-note
            v-for="(note, index) in notes"
            :note="note"
            :container="viewBox"
            :key="note.Setting._id"
        >

        </graph-note>

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
        getIndex,
        GraphSelfPart,
        GraphSettingPart,
        LinkInfoPart,
        LinkSettingPart,
        MediaSettingPart,
        NodeInfoPart,
        NodeSettingPart,
        NoteSettingPart,
        SettingPart,
    } from '@/utils/graphClass'
    import {maxN, minN} from "@/utils/utils"
    import {getPoint, Point, RectByPoint} from '@/utils/geoMetric'
    import GraphNode from './GraphNode.vue';
    import GraphLink from './GraphLink.vue';
    import GraphMedia from './GraphMedia.vue';
    import GraphNodeButton from '@/components/graphComponents/GraphNodeButton.vue';
    import GraphLabelSelector from '@/components/graphComponents/GraphLabelSelector.vue';
    import GraphNote from "@/components/graphComponents/GraphNote.vue";
    import {GraphMetaData, LabelViewDict} from '@/utils/interfaceInComponent'
    import {isLinkSetting, isMediaSetting, isNodeSetting} from "@/utils/typeCheck";
    import {commitInfoAdd, commitItemChange, commitSnackbarOn} from "@/store/modules/_mutations";
    import {dispatchNodeExplode} from "@/store/modules/_dispatch";
    import RectContainer from "@/components/container/RectContainer.vue";

    type GraphMode = 'normal' | 'geo' | 'timeline' | 'imp';

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
                startNode: null as null | VisNodeSettingPart,
                newLinkEndPoint: new Point(0, 0),
                isLinking: false,

            }
        },
        props: {
            document: {
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
            state: function (): GraphState {
                return this.document.Conf.State
            },
            setting: function (): GraphSettingPart {
                return this.document.Conf
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
            childDocumentList: function () {
                return this.document.getChildDocument()
            },
            // 未被删除的Graph
            activeGraphList: function (): GraphSelfPart[] {
                return [this.document].concat(this.childDocumentList.filter(graph => graph &&
                    !graph.Conf.State.isDeleted))
            },

            activeGraphIdList: function (): id[] {
                return this.activeGraphList.map(graph => graph.id)
            },

            activeGraphMetaDataList: function (): GraphMetaData[] {
                let realScale = this.realScale;
                let vm = this;
                let baseContainer = new RectByPoint({x: 0, y: 0}, {
                    x: this.containerRect.width,
                    y: this.containerRect.height // 不乘是因为container恒定是ViewBox
                }, 0);
                let basePoint = getPoint(this.document.baseNode.Setting.Base).multiRect(this.containerRect);
                let realPoint = this.lastViewPoint.copy().decrease(this.viewPoint.copy().decrease(basePoint).multi(realScale));
                let root: GraphMetaData = {
                    parent: null,
                    self: this.document,
                    rect: baseContainer,
                    absolute: realPoint
                };

                const getAbsPointFromParent = (node: VisNodeSettingPart, parentMetaData: GraphMetaData) => {
                    let delta = getPoint(node.Setting.Base)
                        .decrease(node.parent.baseNode.Setting.Base) // 计算小数差 e.g. 0.3- 0.5 = -0.2
                        .multiRect(parentMetaData.rect.positiveRect()) // 乘以矩形 e.g. -0.2 * 1000 = -200
                        .multi(realScale) // 乘以缩放比 e.g. -200 * 0.5 = -100
                        .add(parentMetaData.absolute) // 加上绝对坐标 e.g. -100 + 320 = 220
                    return delta
                }
                // 从父亲Graph里的节点位置推出自身的矩形位置
                const getRectFromAbsPoint = (document: GraphSelfPart, absPoint: Point) => {
                    // 当前缩放下矩形的长宽
                    let width = document.rect.width * realScale;
                    let height = document.rect.height * realScale;
                    // baseNode在矩形的位置
                    let delta = getPoint(document.baseNode.Setting.Base).multiRect({width, height});
                    // 起点与parentNode的位置差为delta
                    // 额外加上整个ViewBox的位置差
                    let start = delta.multi(-1).add(absPoint);
                    let end = start.copy().addRect({width, height})
                    return new RectByPoint(start, end)
                };

                let result = [root];
                let searchGraph = function (graphMeta: GraphMetaData) {
                    let graph = graphMeta.self.Graph;
                    graph.nodes.map(node => {
                        let {_type, _id, Base} = node.Setting;
                        let index = vm.activeGraphIdList.indexOf(_id);
                        if (_type === 'document' && index > -1 && _id !== graphMeta.self.id) {
                            // 这个Graph被激活了
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
                            searchGraph(childGraphMeta)
                        }
                    })
                };
                searchGraph(root);
                return result
            },

            // 除了Root以外的Rect
            activeGraphRectList: function (): GraphMetaData[] {
                return this.activeGraphMetaDataList.filter(meta => meta.self.id !== this.document.id)
            },

            // 包含所有的Nodes Links
            nodes: function (): NodeSettingPart[] {
                let result = this.document.Graph.nodes
                    .filter(node => node.Setting._id === this.document.id) as NodeSettingPart[];
                // root Graph的节点显示
                this.activeGraphList.map(graph => {
                    result = result.concat(graph.Graph.nodes.filter(node => node.Setting._id !== graph.id))
                    // Graph底下的节点由父亲Graph中的Nodes代替
                });
                return result
            },

            nodeIdList: function (): id[] {
                return this.nodes.map(node => node.Setting._id)
            },

            nodeLength: function (): number {
                return this.nodes.length
            },

            links: function (): LinkSettingPart[] {
                let result: LinkSettingPart[] = [];
                this.activeGraphList.map(graph => {
                    result = result.concat(graph.Graph.links)
                });
                return result
            },

            // 只有自身的medias
            medias: function (): MediaSettingPart[] {
                return this.document.Graph.medias
            },

            notes: function (): NoteSettingPart[] {
                return this.document.Graph.notes
            },

            labelDict: function () {
                let getLabels = (list: AllSettingPart[]) => {
                    let result: string[] = [];
                    list.map((item: AllSettingPart) => {
                        result.indexOf(item.Setting._label) === -1 &&
                        result.push(item.Setting._label)
                    });
                    return result
                };
                let labelDict = {
                    'node': getLabels(this.nodes),
                    'link': getLabels(this.links),
                    'media': getLabels(this.medias),
                    'note': getLabels(this.notes),
                    'document': ['DocGraph', 'DocPaper']
                } as Record<BaseType, string[]>;
                return labelDict
            },

            selectedNodes: function (): NodeSettingPart[] {
                return this.nodes.filter(item => item.State.isSelected)
            },

            nodeInfoList: function (): NodeInfoPart[] {
                return this.nodes.map(node => this.dataManager.nodeManager[node.Setting._id])
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
                    (node.parent.Conf.State.isExplode && // 父组件要炸开
                        this.labelViewDict[node.Setting._type][node.Setting._label] &&
                        !node.State.isDeleted &&
                        node.Setting.Show.showAll) ||
                    node.Setting._id === this.document.id
                )
            },

            //显示边
            showLink(): boolean[] {
                return this.links.map(link =>
                    link.parent.Conf.State.isExplode && // 父组件要炸开
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
            selectorStyle(): CSSProp {
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

            viewBoxToolStyle(): CSSProp {
                return {
                    position: 'absolute',
                    left: this.containerRect.width * 0.85 + 'px',
                    top: this.containerRect.height * 0.65 + 'px',
                }
            },

            selector: function (): AreaRect {
                return this.selectRect.positiveRect()
            },

        },
        methods: {
            dragStart($event: MouseEvent) {
                if (this.dragAble) {
                    this.dragStartPoint.update($event);
                    this.isDragging = true;
                }
            },

            drag(target: VisNodeSettingPart, $event: MouseEvent) {
                if (this.isDragging && this.dragAble) {
                    let {x, y} = $event;
                    let delta = getPoint($event);
                    let rect;
                    target.parent.id === this.document.id
                        ? (rect = this.containerRect) // 如果是根节点就用containerRect 因为this.document.rect !== containerRect
                        : (rect = target.parent.rect) // 否则用父亲Rect
                    delta.decrease(this.dragStartPoint).divideRect(rect).divide(this.realScale);
                    this.dragStart($event);
                    let moveFunc = (node: VisNodeSettingPart) => {
                        this.$set(node.Setting.Base, 'x', node.Setting.Base.x + delta.x);
                        this.$set(node.Setting.Base, 'y', node.Setting.Base.y + delta.y);
                    };
                    if (this.selectedNodes.length > 0) {
                        this.selectedNodes.map(node => {
                            moveFunc(node)
                        });
                    } else {
                        moveFunc(target)
                    }
                }
            },

            dragEnd(target: VisNodeSettingPart, $event: MouseEvent) {
                if (this.isDragging && this.dragAble) {
                    this.drag(target, $event);
                    this.isDragging = false;
                }
            },

            getRectByPoint(width: number, height: number, setting: VisNodeSettingPart) {
                let graphMeta = this.getGraphMetaData(setting.parent.id);
                const getAbsPointFromParent = (node: VisNodeSettingPart, parentMetaData: GraphMetaData) => {
                    let delta = getPoint(node.Setting.Base)
                        .decrease(node.parent.baseNode.Setting.Base) // 计算小数差 e.g. 0.3- 0.5 = -0.2
                        .multiRect(parentMetaData.rect.positiveRect()) // 乘以矩形 e.g. -0.2 * 1000 = -200
                    setting.parent.id === this.document.id && delta.multi(this.realScale)
                    // 如果是根节点 则乘以缩放比 e.g. -200 * 0.5 = -100 否则缩放比在GraphMeta求的时候已经乘了
                    delta.add(parentMetaData.absolute) // 加上绝对坐标 e.g. -100 + 320 = 220
                    return delta
                }
                let startPoint = getAbsPointFromParent(setting, graphMeta);
                let endPoint = startPoint.copy().addRect({width, height});
                return new RectByPoint(startPoint, endPoint)
            },

            //node的原生事件
            mouseEnter(node: VisNodeSettingPart) {
                this.$set(node.State, "isMouseOn", true);
            },

            //node的原生事件
            mouseLeave(node: VisNodeSettingPart) {
                this.$set(node.State, "isMouseOn", false);
                this.isDragging = false;
            },

            dbClickNode(node: VisNodeSettingPart) {
                this.selectItem([node]);
                if (this.isLinking && node && this.startNode) {
                    if (node.parent.id === this.startNode.parent.id) {
                        // 如果是同一张图里的
                        let document = node.parent;
                        document.addEmptyLink(this.startNode, node)
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
                        : info = undefined;
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
                    let result: AllSettingPart[] = [];
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
                    nodes.map(node => {
                            //如果选中了Document 对应的Node
                            let index = this.activeGraphIdList.indexOf(node.Setting._id);
                            if (node.Setting._type === 'document' && index > -1) {
                                this.activeGraphList[index].selectAll('isSelected', true)
                            }
                        }
                    );
                    result = result.concat(nodes);
                    result = result.concat(links);
                    result = result.concat(medias);
                    this.selectItem(result)
                }
            },

            clickSvg($event: MouseEvent) {
                this.isLinking = false;
                this.clearSelected('all')
            },

            clearSelected(items: 'all' | SettingPart[]) {
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
                    labels.map(label => {
                        if (this.labelViewDict[_type][label] === undefined) {
                            this.labelViewDict[_type][label] = true
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
                    ? result = this.mediaSettingList[this.medias.indexOf(item)]
                    : result = this.nodeSettingList[this.nodes.indexOf(item)]
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
                dispatchNodeExplode({node, document: this.document})
            },

            getGraphMetaData: function (_id: id) {
                return this.activeGraphMetaDataList.filter(meta => meta.self.id === _id)[0]
            }
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
