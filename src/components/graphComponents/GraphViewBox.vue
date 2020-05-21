<template>
    <div @wheel.native="onScroll"
         style="width: 100%; height: 100%; position: relative; overflow: hidden"
         v-resize="onResize"
         ref="viewBox">
        <svg
            width="100%"
            height="100%"
            @dblclick="clickSvg"
            @mousedown="startSelect"
            @mousemove="selecting"
            @mouseup="endSelect">

            <graph-link
                v-for="(link, index) in links"
                v-show="showLink[index]"
                :key="link._uniqueId"
                :item-setting="linkRewriteSettingList[index]"
                :state="link.State"
                :source="getTargetInfo(link._start)"
                :target="getTargetInfo(link._end)"
                :mid-location="midLocation[index]"
                @mouseenter.native.stop="mouseEnter(link)"
                @mouseleave.native.stop="mouseLeave(link)"
            ></graph-link>

            <graph-node
                v-for="(node, index) in nodes"
                v-show="showNode[index]"
                :key="node._uniqueId"
                :position="nodeLocation[index].positiveRect()"
                :item-setting="nodeRewriteSettingList[index]"
                :state="node.State"
                @mouseenter.native.stop="mouseEnter(node, index)"
                @mouseleave.native.stop="mouseLeave(node)"
                @mousedown.passive.native.stop="dragStart"
                @mousemove.passive.native.stop="drag(node, $event)"
                @mouseup.passive.native.stop="dragEnd(node, $event)"
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
            :border-width="graphContainerWidth"
            always-show-border
            render-as-border
            expand
            v-for="(metaData, index) in activeGraphRectList"
            v-show="metaData.self.isExplode">
            <template v-slot:content>
                <p class="text--secondary unselected" :style="graphContainerFontsize"> {{metaData.self._name}}</p>
            </template>
        </rect-container>

        <graph-node-button
            v-for="(node, index) in renderNodeButtons"
            :key="index"
            :node-setting="getTargetInfo(node)"
            :node="node"
            :hide="!(node.State.isMouseOn && showNode[index] && realScale >= 0.4)"
            :edit-mode="editMode"
            @mouseenter.native="mouseEnter(node, index)"
            @mouseleave.native="mouseLeave(node)"
            @add-link="addLink(node)"
            @explode="explode(node)"
        >

        </graph-node-button>

        <graph-media
            v-for="(media, index) in medias"
            :key="media._id"
            :setting="mediaRewriteSettingList[index]"
            :state="media.State"
            :position="mediaLocation[index]"
            @mouseenter.native="mouseEnter(media)"
            @mouseleave.native="mouseLeave(media)"
            @mousedown.native="dragStart"
            @mousemove.native="drag(media, $event)"
            @mouseup.native="dragEnd(media, $event)"
            @dblclick.native.stop="dbClickNode(media)"
            @add-link="addLink(media)"
            @update-size="updateSize(arguments[0], arguments[1], media.Setting)"
        >

        </graph-media>

        <graph-media-button
            v-for="(media, index) in renderMediaButtons"
            :key="'media-button' + index"
            :media-setting="getTargetInfo(media)"
            :media="media"
            :hide="!(media.State.isMouseOn && showMedia[index] && realScale >= 0.4)"
            @mouseenter.native="mouseEnter(media, index)"
            @mouseleave.native="mouseLeave(media)"
            @add-link="addLink(media)"
            @update-size="updateSize(arguments[0], arguments[1], media.Setting)"
        >

        </graph-media-button>

        <graph-text
            v-for="(text, index) in texts"
            :key="text._id"
            :state="text.State"
            :item-setting="text.Setting"
            :container="textLocation[index]"
            @mouseenter.native="mouseEnter(text)"
            @mouseleave.native="mouseLeave(text)"
            @mousedown.native="dragStart"
            @mousemove.native="drag(text, $event)"
            @mouseup.native="dragEnd(text, $event)"
            @dblclick.native.stop="dbClickNode(text)"
            @update-size="updateSize">

        </graph-text>

        <graph-note
            v-for="note in notes"
            :note="note"
            :container="viewBox"
            :key="note._id"
        >

        </graph-note>

        <div class="d-flex flex-row" style="position: absolute; left: 80%; top: 55%">
            <div class="d-flex flex-column align-end">
                <div class="py-2">
                    <graph-label-selector
                        v-if="renderLabelSelector"
                        :label-view-dict="labelViewDict"
                        @select-label="selectLabel"
                        @reset-label="resetLabel"
                        @set-label="setLabel">
                    </graph-label-selector>
                </div>
                <div class="py-2">
                    <v-chip @click="importanceOn = !importanceOn" class="unselected">
                        {{importanceChipText}}
                    </v-chip>
                </div>
                <div class="py-2">
                    <v-chip @click="initViewPoint" class="unselected">
                        视角重置
                    </v-chip>
                </div>
                <div class="py-2">
                    <v-chip @click="changeShowLink" class="unselected">
                        {{ showNoLinkText }}
                    </v-chip>
                </div>
            </div>
            <div class="pl-4" style="width: 36px">
                <v-slider
                    height="100%"
                    v-model="scale"
                    :min="20"
                    :max="500"
                    color="grey"
                    thumb-size="small"
                    track-color="black"
                    vertical>

                </v-slider>
                <p class="ma-0 align-center"> {{ scale + '%'}}</p>
            </div>
        </div>

        <v-card :style="styleFloatBar" class="plugin float" v-show="graphLayerListOn" color="grey lighten-4">
            <queue
                :items="graphLayerList"
                :max-num="4"
            >
                <template v-slot:content="{item}">
                    <graph-layer-card :layer="item" :edit-mode="editMode"></graph-layer-card>
                </template>
            </queue>
        </v-card>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import GraphNode from './GraphNode.vue';
    import GraphLink from './GraphLink.vue';
    import GraphMedia from './GraphMedia.vue';
    import GraphNodeButton from '@/components/graphComponents/GraphNodeButton.vue';
    import GraphLabelSelector from '@/components/graphComponents/GraphLabelSelector.vue';
    import GraphNote from "@/components/graphComponents/GraphNote.vue";
    import GraphText from "@/components/graphComponents/GraphText.vue";
    import GraphMediaButton from "@/components/graphComponents/GraphMediaButton.vue";
    import Queue from "@/components/Queue.vue";
    import RectContainer from "@/components/container/RectContainer.vue";
    import GraphLayerCard from "@/components/graphComponents/GraphLayerCard.vue";
    import {
        DocumentSelfPart,
        DocumentItemSettingPart,
        LinkSettingPart,
        MediaSettingPart,
        NodeSettingPart,
        NoteSettingPart,
        TextSettingPart
    } from '@/class/settingBase'
    import {maxN, minN} from "@/utils/utils"
    import {getPoint, Point, RectByPoint} from '@/class/geometric'
    import {GraphMetaData, LabelViewDict} from '@/interface/interfaceInComponent'
    import {
        isLinkSettingPart,
        isMediaSettingPart,
        isNodeSettingPart,
        isVisAreaSettingPart,
        isVisNodeSettingPart
    } from "@/utils/typeCheck";
    import {commitItemChange, commitSnackbarOn, commitSubTabChange} from "@/store/modules/_mutations";
    import {dispatchNodeExplode} from "@/store/modules/_dispatch";
    import {NodeInfoPart} from "@/class/info";
    import {documentLabel} from "@/utils/fieldResolve";
    import {GraphLayer} from "@/class/settingGraph";

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
            GraphText,
            GraphMediaButton,
            Queue,
            GraphLayerCard
        },
        data() {
            return {
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

                // 各种选项设置
                // importance 模式
                importanceOn: true,
                // 标签颜色 模式
                labelColorOn: false,
                // 显示隐藏模式
                showHide: false,

                //视窗
                viewBox: new RectByPoint({x: 404, y: 102}, {x: 960, y: 540}),

                //卡片左上角的位置
                cardPosition: {x: 0, y: 0},
                //鼠标在什么东西上面
                isMouseOn: false,

                //是否显示关系
                showNoLink: false,
                //是否使用图层设置
                showNoLayer: false
            }
        },
        props: {
            graph: {
                type: Object as () => DocumentSelfPart,
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

            //是否是编辑模式
            editMode: {
                type: Boolean,
                default: false
            },

            //可以拖动
            dragAble: {
                type: Boolean,
                default: false
            }

        },
        computed: {
            dataManager: function (): DataManagerState {
                return this.$store.state.dataManager
            },
            userDataManager: function (): UserDataManagerState {
                return this.$store.state.userDataManager
            },
            containerRect: function (): AreaRect {
                // containerRect形式
                return this.viewBox.positiveRect()
            },

            // 未被删除的孩子Graph
            activeGraphList: function (): DocumentSelfPart[] {
                let result = this.graph.docsChildren.filter(item => !item.isDeleted)
                result.push(this.graph)
                return result
            },

            activeGraphIdList: function (): id[] {
                return this.activeGraphList.map(graph => graph._id)
            },

            lang: function (): string {
                return this.$store.state.userBaseModule.lang
            },

            //graph的元数据List 就是计算各个SubGraph的绝对坐标
            activeGraphMetaDataList: function (): GraphMetaData[] {
                let vm = this;
                let baseContainer = new RectByPoint({x: 0, y: 0}, {
                    x: this.containerRect.width,
                    y: this.containerRect.height
                }); // 起始坐标置为(0,0)

                let basePoint = getPoint(this.graph.selfSettingInGraph.Base).multiRect(this.containerRect);
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
                    return getPoint(node.StyleInGraph.Base) // 自己的位置比例
                        .decrease(node.parent.selfSettingInGraph.Base) // 父亲GraphBaseNode的位置比例
                        .multiRect(parentMetaData.rect.positiveRect()) // 乘以父亲Graph的宽高
                        .add(parentMetaData.absolute)
                };

                // 从父亲Graph里的节点位置推出自身的矩形的绝对位置
                const getRectFromAbsPoint = (document: DocumentSelfPart, parentPoint: Point) => {
                    let {width, height} = document.rect;
                    // 自身baseNode在自己矩形的位置
                    let delta = getPoint(document.selfSettingInGraph.Base).multiRect({width, height});
                    // 起点与parentNode的位置差为delta，可以算出起点(左上角)
                    let start = delta.multi(-1).add(parentPoint);
                    // 终点就是起点加长宽
                    let end = start.copy().addRect({width, height});
                    return new RectByPoint(start, end)
                };

                let result = [root];
                let searchGraph = function (graphMeta: GraphMetaData) {
                    let graph = graphMeta.self;
                    graph.nodesAll.map(node => {
                        let {_id} = node.Setting;
                        let index = vm.activeGraphIdList.indexOf(_id);
                        let doc = index > -1
                            ? vm.activeGraphList[index]
                            : undefined
                        // doc存在 而且不是本身 而且不是根节点
                        if (doc !== undefined && _id !== graphMeta.self._id && !doc.isRoot) {
                            // 如果这个Graph被激活了，就计算元数据
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
                // root Graph自己的节点显示
                return this.graph.nodesAllSubDoc
            },

            //渲染按钮
            renderNodeButtons: function (): NodeSettingPart[] {
                return this.nodes
            },

            renderMediaButtons: function (): MediaSettingPart[] {
                return this.editMode
                    ? this.medias
                    : []
            },

            // nodesIdList
            nodeIdList: function (): id[] {
                let result = this.nodes.map(node => node._id);
                return result.concat(this.medias.map(media => media._id));
            },

            nodeInfoList: function (): NodeInfoPart[] {
                return this.nodes.map(node => this.dataManager.nodeManager[node._id])
            },

            nodeRewriteSettingList: function (): NodeSetting[] {
                return this.nodes.map((node, index) => {
                    let {_name, InGraph} = node.Setting;
                    //翻译注入
                    let trans = this.nodeInfoList[index].Info.Translate[this.lang];
                    trans && (_name = trans);
                    //
                    let size = (this.importanceOn ? this.impScaleRadius[index] : InGraph.Base.size) * this.realScale;
                    size <= 8 && (size = 8);
                    // 根据重要度比例重写尺度
                    let Base = {
                        ...InGraph.Base,
                        size
                    } as BaseSizeInGraph;

                    // 根据标签种类重写颜色
                    let View = {
                        ...InGraph.View,
                        color: this.labelColorOn ? '#000000' : InGraph.View.color
                    };
                    //重写字体大小
                    let textSize = InGraph.Text.textSize * this.realScale;
                    textSize < 10 && (textSize = 10);
                    let Text = {
                        ...InGraph.Text,
                        textSize
                    };
                    let showName = this.realScale >= 0.6
                        ? InGraph.Show.showName
                        : false
                    let Show = {
                        ...InGraph.Show,
                        showName
                    }
                    return {
                        ...node.Setting,
                        _name,
                        InGraph: {
                            ...InGraph,
                            Base,
                            View,
                            Text,
                            Show
                        }
                    } as NodeSetting
                })
            },

            mediaRewriteSettingList: function (): MediaSetting[] {
                return this.medias.map((media) => {
                    let {InGraph} = media.Setting;
                    let size = (InGraph.Base.size) * this.realScale;
                    size <= 50 && (size = 50);
                    let Base = {
                        ...InGraph.Base,
                        size
                    } as BaseSizeInGraph;
                    return {
                        ...media.Setting,
                        InGraph: {
                            ...InGraph,
                            Base
                        }
                    } as MediaSetting
                })
            },

            textRewriteSettingList: function (): TextSetting[] {
                return this.texts.map((text) => {
                    return text.Setting
                })
            },

            linkRewriteSettingList: function (): LinkSetting[] {
                return this.links.map((link) => {
                    let style = link.StyleInGraph
                    let Arrow = {
                        ...style.Arrow,
                        arrowLength: style.Arrow.arrowLength * (0.5 * this.realScale + 0.5)
                    }
                    return {
                        ...link.Setting,
                        InGraph: {
                            ...style,
                            Arrow
                        }
                    }
                })
            },

            links: function (): LinkSettingPart[] {
                return this.graph.linksAllSubDoc
            },

            // 只有自身的medias
            medias: function (): MediaSettingPart[] {
                return this.graph.medias
            },

            notes: function (): NoteSettingPart[] {
                return this.userDataManager.userNoteInDoc.filter(item => !item.isDeleted && item.parent._id === this.graph._id)
            },

            texts: function (): TextSettingPart[] {
                return this.graph.texts
            },

            labelDict: function (): Record<DocumentItemType, string[]> {
                let getLabels = (list: AllSettingPart[]) => {
                    let result: string[] = [];
                    list.map((item: AllSettingPart) => {
                        result.indexOf(item._label) === -1 &&
                        result.push(item._label)
                    });
                    return result
                };
                let docLabel = documentLabel;
                let normalNodes = this.nodes.filter(item => !docLabel.includes(item._label));
                return {
                    'node': getLabels(normalNodes),
                    'link': getLabels(this.links),
                    'media': getLabels(this.medias),
                    'document': docLabel
                } as Record<DocumentItemType, string[]>
            },

            allItems: function (): DocumentItemSettingPart[] {
                return this.graph.itemsAllSubDoc
            },

            selectedItems: function (): DocumentItemSettingPart[] {
                return this.allItems.filter(item => item.State.isSelected)
            },

            //重要度尺寸比例
            impScaleRadius(): number[] {
                const minRadius = 12;
                const maxRadius = 36;
                let impList = this.nodeInfoList.map(info => info ? info.Ctrl.Imp : 0);
                let [max, min] = [maxN(impList)[0], minN(impList)[0]];
                if (min !== max) {
                    let k = (maxRadius - minRadius) / (max - min);
                    return impList.map(imp => {
                        return ((imp - min) * k + min)
                    });
                } else {
                    return impList.map(() => minRadius)
                }
            },

            realScale(): number {
                return this.scale / 100
            },

            nodeLocation: function (): RectByPoint[] {
                return this.nodes.map((node, index) => this.getRectByPoint(this.nodeRewriteSettingList[index].InGraph.Base, node.parent));
            },

            mediaLocation: function (): RectByPoint[] {
                return this.medias.map((media, index) => this.getRectByPoint(this.mediaRewriteSettingList[index].InGraph.Base, media.parent))
            },

            textLocation: function (): RectByPoint[] {
                return this.texts.map((text, index) => this.getRectByPoint(this.textRewriteSettingList[index].InGraph.Base, text.parent))
            },

            //关系middleLocation
            midLocation: function (): PointObject[] {
                return this.links.map(link => {
                    let result;
                    let x1 = this.getTargetInfo(link._start).x;
                    let y1 = this.getTargetInfo(link._start).y;
                    let x2 = this.getTargetInfo(link._end).x;
                    let y2 = this.getTargetInfo(link._end).y;
                    switch (link.StyleInGraph.View.viewType) {
                        case "curve":
                            link.StyleInGraph.View.direct === 'top'
                                ? result = {"x": (x1 + x2) / 2, "y": y2}
                                : result = {"x": (x1 + x2) / 2, "y": y1};
                            break;
                        case "polyline":
                            link.StyleInGraph.View.direct === 'top'
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
            nodeSettingList: function (): NodeSettingSimply[] {
                return this.nodes.map((node, index) => {
                    let {x, y, width, height} = this.nodeLocation[index].positiveRect();
                    let id = node._id;
                    let parentId = node.parent._id;
                    return {
                        id,
                        parentId,
                        height,
                        width,
                        x,
                        y,
                        show: this.showNode[index] && node.StyleInGraph.Show.showAll,
                        isSelected: node.State.isSelected,
                        isDeleted: node.isDeleted,
                    }
                });
            },

            mediaSettingList: function (): NodeSettingSimply[] {
                return this.medias.map((media, index) => {
                    let id = media._id;
                    let parentId = media.parent._id;
                    let {x, y, width, height} = this.mediaLocation[index].positiveRect();
                    let realX = x + width / 2;
                    let realY = y + height / 2;
                    return {
                        id,
                        parentId,
                        height,
                        width,
                        x: realX,
                        y: realY,
                        show: this.showMedia[index],
                        isSelected: media.State.isSelected,
                        isDeleted: media.isDeleted,
                    }
                })
            },

            //显示节点
            showNode: function (): boolean[] {
                return this.nodes.map((node) => (
                    node.isFatherExplode &&
                    this.labelViewDict[node._type][node._label]) ||
                    (node._id === this.graph._id &&
                        node.parent._id === this.graph._id)
                )
            },

            //显示边
            showLink: function (): boolean[] {
                return this.links.map(link =>
                    !this.showNoLink &&
                    link.isFatherExplode && // 父组件要炸开
                    this.labelViewDict.link[link._label] &&
                    this.getTargetInfo(link.Setting._start).show &&
                    this.getTargetInfo(link.Setting._end).show
                )
            },

            showMedia: function (): boolean[] {
                return this.medias.map((media) => this.labelViewDict.media[media._label])
            },

            showText: function (): boolean[] {
                return this.texts.map(() => true)
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

            selectorRect: function (): AreaRect {
                return this.selectRect.positiveRect()
            },

            importanceChipText: function (): string {
                return this.importanceOn ? '重要度模式: 开' : '重要度模式: 关'
            },

            showNoLinkText: function (): string {
                return this.showNoLink ? "纯节点模式：开" : '纯节点模式：关'
            },

            graphContainerWidth: function (): number {
                return this.realScale < 0.4
                    ? 1
                    : this.realScale > 4
                        ? 4
                        : 2
            },

            graphContainerFontsize: function (): CSSProp {
                return {
                    fontSize: 16 * this.realScale + 'px'
                }
            },

            graphLayerListOn: function (): boolean {
                return this.$store.state.componentState.graphLayerListOn
            },

            graphLayerList: function(): GraphLayer[] {
                return this.graph.CompInGraph.Group.Layer
            },

            bottomBarHeight: function (): number {
                return this.$store.state.styleComponentSize.bottomBar.height
            },

            styleFloatBar: function (): CSSProp {
                return {
                    position: "fixed",
                    bottom: this.bottomBarHeight + 12 + 'px',
                    width: this.viewBox.width - 96 + 'px',
                    height: '216px',
                    right: '12px',
                    zIndex: 4
                }
            },

        },
        methods: {
            getRectByPoint(base: BaseSizeInGraph, parent: DocumentSelfPart) {
                // 将绝对的坐标点转化为矩形
                //width,height: 从源点引申的尺寸，源点在左上角
                let [width, height] = [base.size, base.size * base.scaleX];
                let graphMeta = this.getGraphMetaData(parent._id);
                let point = getPoint(base)
                    .decrease(parent.selfSettingInGraph.Base) // 计算小数差 e.g. 0.3- 0.5 = -0.2
                    .multiRect(graphMeta.rect.positiveRect()); // 乘以矩形 e.g. -0.2 * 1000 = -200
                point.add(graphMeta.absolute); // 加上绝对坐标 e.g. -100 + 320 = 220
                let startPoint = this.pointMoveComputed(point);
                let endPoint = startPoint.copy().addRect({width, height});
                return new RectByPoint(startPoint, endPoint);
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
                        node.StyleInGraph.Base.x += delta.x;
                        node.StyleInGraph.Base.y += delta.y;
                    };
                    if (this.selectedItems.length >= 1) {
                        this.selectedItems.map(item => isVisAreaSettingPart(item) && moveFunc(item))
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
            mouseEnter(node: SubItemSettingPart, index?: number) {
                node.mouseOn(true);
                if (index) {
                    let {x, y} = this.nodeLocation[index].end;
                    this.cardPosition.x = x + 12;
                    this.cardPosition.y = y + 12;
                }
            },

            //node的原生事件
            mouseLeave(node: SubItemSettingPart) {
                node.mouseOn(false);
                this.isDragging = false;
            },

            dbClickNode(node: VisAreaSettingPart) {
                this.selectItem([node]);
                !this.isLinking && commitSubTabChange('info');
                if (this.isLinking && isVisNodeSettingPart(node) && this.startNode) {
                    if (node.parent._id === this.startNode.parent._id) {
                        // 如果是同一张图里的
                        let document = this.startNode.parent as DocumentSelfPart;
                        document.addEmptyLink(this.startNode, node);
                    } else {
                        let document = this.startNode.parent as DocumentSelfPart;
                        let newNode = node.deepCloneSelf();
                        document.addItems([newNode])
                        document.addEmptyLink(this.startNode, newNode)
                    }
                    this.isLinking = false;
                } else {
                    //
                }
            },
            //框选
            selectItem(itemList: SubItemSettingPart[]) {
                //选择
                itemList.map(item => item.updateState("isSelected", true));
                //如果是单选就切换内容
                if (itemList.length === 1) {
                    let item = itemList[0];
                    let info;
                    isLinkSettingPart(item)
                        ? info = this.dataManager.linkManager[item._id]
                        : isNodeSettingPart(item)
                        ? info = this.dataManager.nodeManager[item._id]
                        : info = undefined;
                    if (info) {
                        commitItemChange(info);
                    } else {
                        // todo 这里全屏媒体资源 已经列入文档
                    }
                }
            },

            startSelect($event: MouseEvent) {
                if ($event.ctrlKey) {
                    this.isMoving = true;
                    this.moveStartPoint.update($event);
                } else {
                    if (this.renderSelector) {
                        this.isSelecting = true;
                        let start = this.getPointInBox($event);
                        this.selectRect.start.update(start);
                        this.selectRect.end.update(start)
                    }
                }
            },

            selecting($event: MouseEvent) {
                let end = this.getPointInBox($event);
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
                        this.selectRect.checkInRect(this.textLocation[index].midPoint()) && this.showText[index]
                    );
                    let result = [nodes, medias, links, texts].flat(1) as SubItemSettingPart[];
                    this.selectItem(result)
                }
            },

            clickSvg() {
                this.isLinking = false;
                this.clearSelected('all')
            },

            clearSelected(items: 'all' | DocumentItemSettingPart[]) {
                if (items === 'all') {
                    Object.values(this.dataManager.documentManager).map(document => {
                        document.itemsAll.map(item => item.updateState('isSelected', false))
                    });
                } else {
                    items.map(item => item.updateState('isSelected', false));
                }
                this.isDragging = false;
            },

            getLabelViewDict: function () {
                Object.entries(this.labelDict).map(([_type, labels]) => {
                    //@ts-ignore
                    let type: DocumentItemType = _type;
                    labels.map(label => {
                        if (this.labelViewDict[type][label] === undefined) {
                            //Vue.set检查过
                            Vue.set(this.labelViewDict[type], label, true)
                        }
                    })
                })
            },

            //取得link所用数据
            getTargetInfo(node: VisNodeSettingPart | null) {
                //注意这里index肯定不能是-1
                let result;
                const equal = (nodePart: VisNodeSettingPart, nodeSetting: NodeSettingSimply) =>
                    (nodePart._id === nodeSetting.id) && (nodePart.parent._id === nodeSetting.parentId);
                // 不仅id相同 必须是同一个专题下 或者node本身就是专题节点
                node
                    ? isMediaSettingPart(node)
                    ? result = this.mediaSettingList.filter(item => equal(node, item))[0]
                    : result = this.nodeSettingList.filter(item => equal(node, item))[0]
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
                let event = this.getPointInBox($event);
                let eventCopy = event.copy();
                // 先后顺序很重要
                event.decrease(this.lastViewPoint).divide(oldScale);
                this.viewPoint.add(event);
                this.lastViewPoint.update(eventCopy);
            },

            getPointInBox($event: MouseEvent | WheelEvent) {
                return getPoint($event).decrease(this.viewBox.start)
            },

            explode(node: NodeSettingPart) {
                dispatchNodeExplode({node, document: this.graph})
            },

            getGraphMetaData: function (_id: id) {
                return this.activeGraphMetaDataList.filter(meta => meta.self._id === _id)[0]
            },

            updateGraphSize: function (start: PointMixed, end: PointMixed, index: number) {
                // 视觉上的更新尺寸start, end 右下为正 左上为负
                let graph = this.activeGraphRectList[index].self;
                //现有的矩阵长宽
                let {width, height} = graph.rect;
                let setting = graph.selfSettingInGraph;
                let scale = this.realScale;
                //更新矩形长宽
                let deltaRect = getPoint(end).decrease(start).divide(scale);
                graph.rect.width += deltaRect.x;
                graph.rect.height += deltaRect.y;
                // 更新起始点相当于是更新起点
                let {x, y} = setting.Base;
                setting.Base.x = (width * x - start.x / scale) / (graph.rect.width);
                setting.Base.y = (height * y - start.y / scale) / (graph.rect.height);
            },

            updateSize: function (start: PointMixed, end: PointMixed, setting: NodeSetting | MediaSetting) {
                // 视觉上的更新尺寸start, end
                let scale = this.realScale;
                // 更新起始点
                let x = setting.InGraph.Base.x + start.x / (this.containerRect.width * scale);
                let y = setting.InGraph.Base.y + start.y / (this.containerRect.height * scale);
                //更新长宽
                let width = setting.InGraph.Base.size;
                let height = setting.InGraph.Base.scaleX * width;
                let delta = getPoint(end).decrease(start).divide(scale);
                width += delta.x;
                height += delta.y;
                let scaleX = height / width;
                let size = width;
                setting.InGraph.Base = {
                    x,
                    y,
                    scaleX,
                    size
                }
            },

            getItemList(_type: DocumentItemType) {
                return _type === 'link'
                    ? this.links
                    : _type === 'media'
                        ? this.medias
                        : _type === 'text'
                            ? this.texts
                            : this.nodes
            },

            setLabel(_type: DocumentItemType, _label: string) {
                let value = this.labelViewDict[_type][_label];
                //Vue.set检查过
                Vue.set(this.labelViewDict[_type], _label, !value)
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

            selectLabel(_type: DocumentItemType, _label: string) {
                let list: DocumentItemSettingPart[] = this.getItemList(_type);
                list.filter(item => item._label === _label).map(item => item.updateState('isSelected'))
            },

            onResize() {
                //@ts-ignore
                //todo 把组件改成一个基础组件 已经列入文档
                let viewBox: HTMLElement = this.$refs.viewBox;
                let rect = viewBox.getBoundingClientRect();
                this.viewBox.updateFromArea(rect);
            },

            initViewPoint() {
                let point = this.nodeLocation[0].midPoint();
                point || (point = this.viewBox.midPoint());
                this.viewPoint.update(point);
                this.lastViewPoint.update(point)
            },

            changeShowLink() {
                this.showNoLink = !this.showNoLink
            }
        },

        watch: {
            labelDict: function (): void {
                this.getLabelViewDict()
            }
        },
        created: function (): void {
            this.getLabelViewDict();
        },
        mounted: function (): void {
            this.getLabelViewDict();
            this.onResize();
            this.initViewPoint();
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
