<template>
    <div
        style="width: 100%; height: 100%;">
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
                v-for="(node, index) in typeNodes"
                v-show="showNode[index]"
                :key="node.Setting._id"
                :node="node"
                :container="container"
                :size="impScaleRadius[index]"
                :scale="realScale"
                :x="nodeLocation[index].x"
                :y="nodeLocation[index].y"
                :index="index"
                @kick-back-x="kickBackX"
                @kick-back-y="kickBackY"
                @mouseenter.native="mouseEnter(node)"
                @mouseleave.native="mouseLeave(node)"
                @mousedown.native="dragStart"
                @mousemove.native="drag(node, $event)"
                @mouseup.native="dragEnd(node, $event)"
                @dblclick.native.stop="clickNode(node)">

            </graph-node>

            <rect
                v-if="renderSelector"
                :style="selectorStyle"
                :x="selectorX"
                :y="selectorY"
                :width="selectorWidth"
                :height="selectorHeight">

            </rect>

            <line
                v-if="isLinking"
                :x1="getTargetInfo(startNode).x"
                :y1="getTargetInfo(startNode).y"
                :x2="endX"
                :y2="endY"
                stroke="grey">

            </line>

        </svg>

        <graph-media
            v-for="(node, index) in typeMedias"
            :key="node.Setting._id"
            :media="node"
            :container="container"
            :width="mediaWidth[index]"
            :height="mediaHeight[index]"
            :scale="realScale"
            :x="locationX[index + typeNodeLength]"
            :y="locationY[index + typeNodeLength]"
            :index="index"
            @mouseenter.native="mouseEnter(node)"
            @mouseleave.native="mouseLeave(node)"
            @mousedown.native="dragStart"
            @mousemove.native="drag(node, $event)"
            @mouseup.native="dragEnd(node, $event)"
            @dblclick.native.stop="clickNode(node)"
        >

        </graph-media>

        <graph-note
            v-show="renderNotes"
            v-for="note in activeNotes"
            :key="note.Setting._id"
            :note="note"
            :container="container"
        >
        </graph-note>

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

        <card-doc-node-simplify
            v-for="(node, index) in renderCardList"
            :key="node.Setting._id"
            :base-data="nodeInfoList[index]"
            :container="container"
            :is-hard-hidden="isDragging"
            :is-hidden="!node.State.showCard"
            :position="cardLocList[index]"
            @mouseenter.native.stop="mouseEnterCard"
            @mouseleave.native.stop="mouseLeaveCard(node)">

        </card-doc-node-simplify>

        <div :style="viewBoxToolStyle" class="d-flex flex-row">
            <graph-label-selector
                v-if="renderLabelSelector"
                :base-label-dict="labelViewDict"
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

    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {DataManagerState} from '@/store/modules/dataManager'
    import {
        AllItemSettingPart,
        BaseType,
        getIndex,
        GraphSelfPart,
        GraphSettingPart,
        GraphState,
        id,
        isLinkSetting,
        isMediaSetting,
        LinkInfoPart,
        LinkSettingPart,
        MediaSettingPart,
        NodeInfoPart,
        NodeSettingPart,
        Notes,
        SettingPart,
        VisualNodeSettingPart
    } from '@/utils/graphClass'
    import {maxN, minN} from "@/utils/utils"
    import {AreaRect, Point, RectByPoint, updatePoint} from '@/utils/geoMetric'
    import * as CSS from 'csstype'

    type GraphMode = 'normal' | 'geo' | 'timeline' | 'imp'

    interface VisualNodeSetting {
        height: number,
        width: number,
        x: number,
        y: number,
        show: boolean,
        isSelected: boolean,
        isDeleted: boolean
    }

    export default Vue.extend({
        name: "GraphViewBox",
        components: {},
        data() {
            return {

                // ------ drag ------
                dragAble: true,
                //drag起始位置
                dragStartPoint: {
                    x: 0,
                    y: 0
                } as Point,
                //正在drag
                isDragging: false,

                // ------ move ------
                // view起始Point
                viewPoint: this.container.getMidPoint(),

                // 上一个view起始Point
                lastViewPoint: this.container.getMidPoint(),

                moveStartPoint: {
                    x: 0,
                    y: 0
                } as Point,
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
                    "link": {}
                } as Record<BaseType, Record<string, boolean>>,

                //缩放比例
                scale: 100,

                //新增关系
                startNode: null as null | VisualNodeSettingPart,
                newLinkEndPoint: {
                    x: 0,
                    y: 0
                },
                isLinking: false,

            }
        },
        props: {
            document: {
                type: Object as () => GraphSelfPart,
                required: true
            },
            //容器尺寸
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
                default: true
            },

            //是否渲染rect - selector
            renderSelector: {
                type: Boolean,
                default: false
            },

            // 是否渲染rect - graph
            renderGraphRect: {
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
            dataManager(): DataManagerState {
                return this.$store.state.dataManager
            },
            state(): GraphState {
                return this.document.Conf.State
            },
            setting(): GraphSettingPart {
                return this.document.Conf
            },
            containerRect(): AreaRect {
                return this.container.getPositiveRect()
            },
            // 不包含本身的graph
            activeGraphList(): GraphSelfPart[] {
                return GraphSelfPart.list.filter(graph => (graph.getRoot().id === this.document.id &&
                    !graph.Conf.State.isDeleted &&
                    graph.Conf.State.isExplode)
                )
            },

            //不包含本身的node
            allNodes(): NodeSettingPart[] {
                let result: NodeSettingPart[] = [];
                this.activeGraphList.map(graph => {
                    result.concat(graph.Graph.nodes)
                });
                return result
            },

            allNodesIdList(): id[] {
                return this.allNodes.map(item => item.Setting._id)
            },

            allLinkIdList(): id[] {
                return this.allLinks.map(item => item.Setting._id)
            },

            allMediasIdList(): id[] {
                return this.allMedias.map(item => item.Setting._id)
            },

            allLinks(): LinkSettingPart[] {
                let result: LinkSettingPart[] = [];
                this.activeGraphList.map(graph => {
                    result.concat(graph.Graph.links)
                });
                return result
            },

            allMedias(): MediaSettingPart[] {
                let result: MediaSettingPart[] = [];
                this.activeGraphList.map(graph => {
                    result.concat(graph.Graph.medias)
                });
                return result
            },

            notes(): Notes[] {
                return this.document.Graph.notes
            },

            //merge 之后的node
            nodes(): NodeSettingPart[] {
                let baseNodes = this.document.Graph.nodes;
                let idList = baseNodes.map(item => item.Setting._id);
                this.allNodes.map(node => {
                    if (idList.indexOf(node.Setting._id) >= 0) {
                        //
                    } else {
                        baseNodes.push(node);
                        idList.push(node.Setting._id)
                    }
                });
                return baseNodes
            },

            selectedNodes(): NodeSettingPart[] {
                return this.nodes.filter(item => item.State.isSelected)
            },

            nodeInfoList(): NodeInfoPart[] {
                return this.nodes.map(node => this.dataManager.nodeManager[node.Setting._id]).filter(info => info && info)
            },

            //Node包含的label
            nodeLabels(): string[] {
                let result = [];
                for (let i of this.nodeInfoList) {
                    result.indexOf(i.Info.PrimaryLabel) === -1 &&
                    result.push(i.Info.PrimaryLabel)
                }
                return result
            },

            mediaLabels(): string[] {
                let result = [];
                return []
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

            links(): LinkSettingPart[] {
                let baseLinks = this.document.Graph.links;
                let idList = baseLinks.map(item => item.Setting._id);
                this.allLinks.map(link => {
                    if (idList.indexOf(link.Setting._id) >= 0) {
                        //
                    } else {
                        baseLinks.push(link);
                        idList.push(link.Setting._id)
                    }
                });
                return baseLinks
            },

            medias(): MediaSettingPart[] {
                let baseMedias = this.document.Graph.medias;
                let idList = baseMedias.map(item => item.Setting._id);
                this.allMedias.map(media => {
                    if (idList.indexOf(media.Setting._id) >= 0) {
                        //
                    } else {
                        baseMedias.push(media);
                        idList.push(media.Setting._id)
                    }
                });
                return baseMedias
            },

            //节点locationX
            nodeLocation(): AreaRect[] {
                return this.nodes.map((node, index) => {
                    let width = node.Setting.Base.size !== 0
                        ? node.Setting.Base.size * this.realScale
                        : this.impScaleRadius[index] * this.realScale;

                    return {
                        x: this.lastViewPoint.x - (this.viewPoint.x - node.Setting.Base.x * this.containerRect.width) * this.realScale,
                        y: this.lastViewPoint.y - (this.viewPoint.y - node.Setting.Base.y * this.containerRect.height) * this.realScale,
                        width,
                        height: width * node.Setting.Base.scaleX
                    } as AreaRect
                })
            },

            mediaLocation(): AreaRect[] {
                return this.medias.map(media => {
                    return {
                        x: this.lastViewPoint.x - (this.viewPoint.x - media.Setting.Base.x * this.containerRect.width) * this.realScale,
                        y: this.lastViewPoint.y - (this.viewPoint.y - media.Setting.Base.y * this.containerRect.height) * this.realScale,
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
            midLocation(): Point[] {
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

            //显示节点
            showNode(): boolean[] {
                return this.nodes.map(node =>
                    this.labelViewDict.node[node.Setting._label] &&
                    !node.State.isDeleted && node.Setting.Show.showAll)
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
                    "fill": "#000000",
                    "fillOpacity": this.isSelecting ? 0.3 : 0,
                    "strokeOpacity": this.isSelecting ? 0.7 : 0,
                    "stroke": "#000000",
                    "strokeWidth": "1px",
                    "display": this.isSelecting ? "inline" : "none"
                }
            },

            viewBoxToolStyle(): CSS.Properties {
                return {
                    position: 'absolute',
                    left: this.containerRect.width * 0.9 + 'px',
                    top: this.containerRect.height * 0.8 + 'px',
                }
            },

            selector(): AreaRect {
                return this.selectRect.getPositiveRect()
            },

        },
        methods: {

            dragStart($event: MouseEvent) {
                if (this.dragAble) {
                    updatePoint(this.dragStartPoint, $event);
                    this.isDragging = true;
                }
            },

            //注意坐标运算使用小数
            drag(target: VisualNodeSettingPart, event: MouseEvent) {
                if (this.isDragging && this.dragAble) {
                    let deltaX = (event.x - this.dragStartPoint.x) / this.containerRect.width / this.realScale;
                    let deltaY = (event.y - this.dragStartPoint.y) / this.containerRect.height / this.realScale;
                    this.dragStart(event);
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
                    this.checkOutside(event);
                    clearTimeout(this.showCardId);
                }
            },

            dragEnd(target: VisualNodeSettingPart, event: MouseEvent) {
                if (this.isDragging && this.dragAble) {
                    this.drag(target, event);
                    this.isDragging = false;
                    this.updateCardLoc()
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
                    this.$set(this.state, 'isSelected', false)
                } else {
                    items.map(item => this.$set(item.State, 'isSelected', false));
                }
                this.isDragging = false;
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
            mouseEnter(node: NodeSettingPart) {
                this.$set(node.State, "isMouseOn", true);
                this.$set(node.State, "showCard", true);
                this.showCardId = setTimeout(() => {
                    this.$set(node.State, "showCard", true);
                }, 1000)
            },

            //node的原生事件
            mouseLeave(node: NodeSettingPart) {
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
                let x, y;
                let index = this.nodes.indexOf(node);
                node.Setting.Base.x >= 0.5
                    ? x = this.nodeLocation[index].x - this.card.width + this.containerRect.x
                    : x = this.nodeLocation[index].x + this.containerRect.x;
                node.Setting.Base.y >= 0.5
                    ? y = this.nodeLocation[index].y - this.card.height + this.containerRect.y
                    : y = this.nodeLocation[index].y + this.containerRect.y;
                return {
                    "posLeft": x,
                    "posTop": y,
                    "width": this.card.width,
                    "height": this.card.height,
                    "isFlex": false,
                }
            },

            updateCardLoc() {
                let result;
                result = this.nodes.map(node => this.locationCard(node));
                this.cardLocList = result
            },

            clickNode(node: VisualNodeSettingPart) {
                this.selectItem([node]);
                if (this.isLinking && node && this.startNode) {
                    let id = getIndex();
                    let linkSetting = LinkSettingPart.emptyLinkSetting(id, "default", this.startNode, node, this.document);
                    let linkInfo = LinkInfoPart.emptyLinkInfo(id, "default", this.startNode, node);
                    let linkList = [linkSetting];
                    this.document.addLinks(linkList);
                    this.$store.commit('infoAdd', {item: linkInfo, strict: true});
                    this.isLinking = false;
                } else {
                    //
                }
            },
            //框选
            selectItem(itemList: (LinkSettingPart | VisualNodeSettingPart)[]) {
                //选择
                itemList.map(item => this.$set(item.State, 'isSelected', true));
                //如果是单选就切换内容
                if (itemList.length === 1) {
                    let item = itemList[0];
                    let info;
                    isLinkSetting(item)
                        ? info = this.dataManager.linkManager[item.Setting._id]
                        : isMediaSetting(item)
                        ? info = this.dataManager.mediaManager[item.Setting._id]
                        : info = this.dataManager.nodeManager[item.Setting._id];
                    info &&
                    this.$store.commit('currentItemChange', info);
                }
            },

            selectLabel(_type: BaseType, _label: string) {
                let result = this.nodes.filter(node => node.Setting._label === _label);
                this.selectItem(result)
            },

            startSelect($event: MouseEvent) {
                if ($event.ctrlKey) {
                    this.isMoving = true;
                    updatePoint(this.moveStartPoint, $event)
                } else {
                    if (this.renderSelector) {
                        this.$set(this, 'isSelecting', true);
                        let x = $event.x - this.containerRect.x;
                        let y = $event.y - this.containerRect.y;
                        updatePoint(this.selectRect.start, {x, y});
                        updatePoint(this.selectRect.end, {x, y});
                    }
                }
            },

            selecting($event: MouseEvent) {
                //选择集
                if ($event.ctrlKey && this.isMoving) {
                    let x = this.lastViewPoint.x + $event.x - this.moveStartPoint.x;
                    let y = this.lastViewPoint.y + $event.y - this.moveStartPoint.y;
                    updatePoint(this.lastViewPoint, {x, y});
                    updatePoint(this.moveStartPoint, $event)
                } else {
                    if (this.isSelecting && this.renderSelector) {
                        let endX = $event.x + this.containerRect.x;
                        let endY = $event.y - this.containerRect.y;
                        updatePoint(this.selectRect.end, {x: endX, y: endY})
                    }
                    //移动
                    if (this.isLinking) {
                        updatePoint(this.newLinkEndPoint, $event)
                    }
                }
            },

            endSelect($event: MouseEvent) {
                this.isMoving = false;
                this.selecting($event);
                this.$set(this, 'isSelecting', false);
                let nodes: (AllItemSettingPart)[] = this.nodes.filter((node, index) =>
                    this.selectRect.checkInRect(this.nodeLocation[index])
                );
                let links = this.links.filter((link, index) =>
                    this.selectRect.checkInRect(this.midLocation[index])
                );
                let medias = this.medias.filter((media, index) =>
                    this.selectRect.checkInRect(this.mediaLocation[index])
                );
                let result = nodes.concat(links).concat(medias);
                this.clearSelected("all");
                this.selectItem(result)
            },

            getLabelViewDict() {
                this.nodeLabels.map(label => {
                    this.labelViewDict.node[label] === undefined &&
                    this.$set(this.labelViewDict, label, true)
                }) // todo
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
                    "name": "addLink",
                    "once": false
                };
                this.$store.commit('snackBarOn', payload);
                this.isLinking = true;
                this.startNode = node;
            },

            onScroll($event: WheelEvent) {
                let oldScale = this.realScale;
                let delta;
                $event.deltaY > 0
                    ? delta = 10
                    : delta = -10;
                this.scale += delta;
                this.scale < 25 && (this.scale = 25);
                this.scale > 300 && (this.scale = 300);
                let x = this.viewPoint.x + ($event.clientX - this.lastViewPoint.x) / oldScale;
                let y = this.viewPoint.y + ($event.clientY - this.lastViewPoint.y) / oldScale;
                updatePoint(this.viewPoint, {x, y});
                updatePoint(this.lastViewPoint, $event);
            },

            explode(node: NodeSettingPart) {
                let _id = node.Setting._id;
                let graph = this.dataManager.graphManager[_id];
                if (graph === undefined) {
                    this.$store.dispatch('dataQueryGraph', {
                        _id,
                        parent: this.document.id,
                        currentNodes: this.nodes
                    }).then(() => {
                        let graph = this.dataManager.graphManager[_id];
                        this.$set(graph.Conf.State, 'isExplode', true)
                    });
                } else {
                    let value = graph.Conf.State.isExplode;
                    this.$set(graph.Conf.State, 'isExplode', !value)
                }
            }

        },

        watch: {
            nodeLabels() {
                this.getLabelViewDict()
            },

            nodeLength() {
                this.updateCardLoc();
            },
        },
        created() {
            this.updateCardLoc();
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
