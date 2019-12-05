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
                :x="locationX[index]"
                :y="locationY[index]"
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
        BaseType,
        GraphSelfPart,
        GraphSettingPart,
        GraphState, id,
        LinkSettingPart,
        MediaSettingPart, NodeInfoPart,
        NodeSettingPart, Notes, VisualNodeSettingPart
    } from '@/utils/graphClass'
    import {maxN, minN} from "@/utils/utils"

    type GraphMode = 'normal' | 'geo' | 'timeline' | 'imp'
    export default Vue.extend({
        name: "GraphViewBox",
        components: {},
        data() {
            return {
                dragAble: true,
                //drag起始位置
                dragStartLoc: {
                    x: 0,
                    y: 0
                },
                //正在drag
                isDragging: false,
                //正在select
                isSelecting: false,
                selectLoc: {
                    startX: 0,
                    startY: 0,
                    endX: 0,
                    endY: 0
                },
                viewX: (this.container.lowX + this.container.width / 2),
                viewY: (this.container.lowY + this.container.height / 2),
                lastEventX: (this.container.lowX + this.container.width / 2),
                lastEventY: (this.container.lowY + this.container.height / 2),

                // ------card-------
                showCardId: "",
                closeCardId: "",
                mouseOnCard: false,
                //card属性
                card: {
                    width: 240,
                    height: 300
                },
                //card的位置
                cardLocList: [],
                //控制可视的标签
                labelViewDict: {
                    "node": {},
                    "media": {},
                    "link": {}
                } as Record<BaseType, Record<string, boolean>>,

                //缩放比例
                scale: 100,

                //新增关系
                startNode: {},
                endX: 0,
                endY: 0,
                isLinking: false,

                //拖动画布
                isMoving: false,
                moveStartX: 0,
                moveStartY: 0,
            }
        },
        props: {
            document: {
                type: Object as () => GraphSelfPart,
                required: true
            },
            //容器尺寸
            container: {
                type: Object,
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
            nodeLabels() {
                let result = [];
                for (let i of this.nodeInfoList) {
                    result.indexOf(i.Info.PrimaryLabel) === -1 &&
                    result.push(i.Info.PrimaryLabel)
                }
                return result
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

            realScale: vm => vm.scale / 100,

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

            mediaWidth() {
                return this.medias.map((media: MediaSettingPart) =>
                    media.Setting.Base.size * this.realScale >= 50
                        ? media.Setting.Base.size * this.realScale
                        : 50
                )
            },

            mediaHeight() {
                return this.medias.map(media =>
                    media.Setting.Base.size * this.realScale >= 50
                        ? media.Setting.Base.size * this.realScale * media.Setting.Base.scaleX
                        : 50 * media.Setting.Base.scaleX
                )
            },

            //节点locationX
            locationX() {
                let result;
                switch (this.mode) {
                    case 'normal':
                        result = this.nodes.map(node => {
                                return this.lastEventX - (this.viewX - node.Setting.Base.x * this.container.width) * this.realScale
                            }
                        );
                        break;

                    case 'geo':
                        result = [];
                        break;

                    case 'timeline':
                        result = [];
                        break;
                    case 'imp':

                        result = [];
                        break;
                }
                return result
            },

            //节点locationY
            locationY() {
                let result;
                switch (this.mode) {
                    case 'normal':
                        result = this.nodes.map(node =>
                            this.lastEventY - (this.viewY - node.Setting.Base.y * this.container.height) * this.realScale
                        );
                        break;

                    case 'geo':
                        result = this.nodes.map(node =>
                            this.lastEventY - (this.viewY - node.Setting.Base.y * this.container.height) * this.realScale
                        );
                        break;

                    case 'timeline':
                        result = this.nodes.map(node =>
                            this.lastEventY - (this.viewY - node.Setting.Base.y * this.container.height) * this.realScale
                        );
                        break;
                    case 'imp':

                        result = this.nodes.map(node =>
                            this.lastEventY - (this.viewY - node.Setting.Base.y * this.container.height) * this.realScale
                        );
                        break;
                    default:
                        result = this.nodes.map(node =>
                            this.lastEventY - (this.viewY - node.Setting.Base.y * this.container.height) * this.realScale
                        );
                        break;
                }
                return result
            },

            //媒体locationX
            mediaLocationX() {
                return this.medias.map(media => {
                    return this.lastEventX - (this.viewX - media.Setting.Base.x * this.container.width) * this.realScale
                })
            },

            //媒体locationY
            mediaLocationY() {
                return this.medias.map(media => {
                    return this.lastEventY - (this.viewY - media.Setting.Base.y * this.container.height) * this.realScale
                })
            },

            //关系midX
            midLocation() {
                let vm = this;
                return vm.links.map(link => {
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
            nodeSettingList() {
                return this.nodes.map((node, index) => {
                    let size;
                    node.Setting.Base.size !== 0
                        ? size = node.Setting.Base.size * this.realScale
                        : size = this.impScaleRadius[index] * this.realScale;
                    return {
                        "height": size,
                        "width": size * node.Setting.Base.scaleX,
                        "x": this.locationX[index],
                        "y": this.locationY[index],
                        "show": this.showNode[index],
                        "isSelected": node.State.isSelected,
                        "isDeleted": node.State.isDeleted
                    }
                });
            },

            //显示节点
            showNode() {
                return this.nodes.map(node =>
                    this.labelViewDict.node[node.Setting._label] &&
                    !node.State.isDeleted && node.Setting.Show.showAll)
            },

            //显示边
            showLink() {
                return this.links.map(link =>
                    this.labelViewDict.link[link.Setting._label] &&
                    !link.State.isDeleted &&
                    this.getTargetInfo(link.Setting._start).show &&
                    this.getTargetInfo(link.Setting._end).show
                )
            },

            showMedia() {
                return this.medias.map(media =>
                    this.labelViewDict.media[media.Setting._label] &&
                    !media.State.isDeleted &&
                    media.Setting.Show.showAll
                )
            },

            //选择框的相关设置
            selectorStyle: vm => {
                return {
                    "fill": "#000000",
                    "fill-opacity": (1 & vm.isSelecting) * 0.3,
                    "stroke-opacity": (1 & vm.isSelecting) * 0.7,
                    "stroke": "#000000",
                    "stroke-width": 1,
                    "display": vm.isSelecting ? "inline" : "none"
                }
            },
            selectorWidth: vm => Math.abs(vm.selectLoc.startX - vm.selectLoc.endX),
            selectorHeight: vm => Math.abs(vm.selectLoc.startY - vm.selectLoc.endY),
            selectorX: vm => vm.selectLoc.startX >= vm.selectLoc.endX
                ? vm.selectLoc.endX
                : vm.selectLoc.startX,
            selectorY: vm => vm.selectLoc.startY >= vm.selectLoc.endY
                ? vm.selectLoc.endY
                : vm.selectLoc.startY,

            viewBoxToolStyle: vm => ({
                position: 'absolute',
                left: vm.container.width * 0.9 + 'px',
                top: vm.container.height * 0.8 + 'px',
            })

        },
        methods: {

            dragStart(event) {
                if (this.dragAble) {
                    this.$set(this.dragStartLoc, "x", event.x);
                    this.$set(this.dragStartLoc, "y", event.y);
                    this.isDragging = true;
                }
            },

            //注意坐标运算使用小数
            drag(target, event) {
                if (this.isDragging && this.dragAble) {
                    let deltaX = (event.x - this.dragStartLoc.x) / this.container.width / this.realScale;
                    let deltaY = (event.y - this.dragStartLoc.y) / this.container.height / this.realScale;
                    this.dragStart(event);
                    if (this.selectedNodes.length > 0) {
                        for (let i in this.selectedNodes) {
                            let node = this.selectedNodes[i];
                            this.$set(node.Setting.Base, 'x', node.Setting.Base.x + deltaX);
                            this.$set(node.Setting.Base, 'y', node.Setting.Base.y + deltaY);
                        }
                    } else {
                        let node = target;
                        this.$set(node.Setting.Base, 'x', node.Setting.Base.x + deltaX);
                        this.$set(node.Setting.Base, 'y', node.Setting.Base.y + deltaY);
                    }
                    this.checkOutside(event);
                    clearTimeout(this.showCardId);
                }
            },

            dragEnd(target, event) {
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
            clearSelected(items) {
                let vm = this;
                if (items === 'all') {
                    this.nodes.map(node => vm.$set(node.State, 'isSelected', false));
                    this.links.map(link => vm.$set(link.State, 'isSelected', false));
                    vm.$set(this.state, 'isSelected', false)
                } else {
                    items.map(item => vm.$set(item.State, 'isSelected', false));
                }
                this.isDragging = false;
            },

            //检查鼠标是否在svg外部
            checkOutside(event) {
                let result = false;
                let border = this.container.border;
                event.x <= this.container.lowX + border && (result = true);
                event.x >= this.container.width - border && (result = true);
                event.y <= this.container.lowY + border && (result = true);
                event.y >= this.container.height - border && (result = true);
                result && console.log('outside')
            },

            //x方向限定区域
            kickBackX(node, X) {
                if (this.isDragging) {
                    this.$set(node.Setting.Base, 'x', X / this.container.width);
                    node.isSelected = false;
                    this.isDragging = false;
                }
            },

            //y方向限定区域
            kickBackY(node, Y) {
                if (this.isDragging) {
                    this.$set(node.Setting.Base, 'y', Y / this.container.height);
                    node.isSelected = false;
                    this.isDragging = false;
                }
            },

            //node的原生事件
            mouseEnter(node) {
                this.$set(node.State, "isMouseOn", true);
                this.$set(node.State, "showCard", true);
                this.showCardId = setTimeout(() => {
                    this.$set(node.State, "showCard", true);
                }, 1000)

            },

            //node的原生事件
            mouseLeave(node) {
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

            mouseLeaveCard(node) {
                this.mouseOnCard = false;
                this.closeCardId = setTimeout(() => {
                    this.$set(node.State, "showCard", false);
                }, 1000)
            },

            //自适应位置 取得卡片数据 不需要计算属性 显示的时候重新计算位置就好
            locationCard(node, index) {
                let x, y;
                node.Setting.Base.x >= 0.5
                    ? x = this.locationX[index] - this.card.width
                    : x = this.locationX[index];
                node.Setting.Base.y >= 0.5
                    ? y = this.locationY[index] - this.card.height + this.container.lowY
                    : y = this.locationY[index] + this.container.lowY;
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
                let vm = this;
                result = this.nodes.map((node, index) => vm.locationCard(node, index));
                this.cardLocList = result
            },

            clickNode(node) {
                this.selectItem([node]);

                if (this.isLinking && node) {
                    let id = "$_" + this.$store.state.dataManager.globalIndex;
                    this.$store.commit("newId");
                    let payload = {
                        _id: id,
                        _type: 'link',
                        _label: "default",
                        _start: this.startNode,
                        _end: node,
                        isSelf: true,
                        changed: true
                    };
                    this.$store.commit('dataAddEmptyLinkInfo', payload);
                    this.$store.commit('dataAddEmptyLinkSetting', payload);
                    this.isLinking = false;
                }
            },
            //框选
            selectItem(itemList) {
                //选择
                let vm = this;
                itemList.map(item => vm.$set(item.State, 'isSelected', true));
                if (itemList.length === 1) {
                    let item = itemList[0];
                    let info;
                    item._type === 'link'
                        ? info = this.dataManager.linkManager[item.Setting._id]
                        : info = this.dataManager.nodeManager[item.Setting._id];
                    info &&
                    this.$store.commit('changeCurrentItem', info);
                }
            },

            selectLabel(label) {
                let result = this.nodes.filter(node => node.Setting._label === label);
                this.selectItem(result)
            },

            startSelect($event) {
                if ($event.ctrlKey) {
                    this.isMoving = true;
                    this.moveStartX = $event.x;
                    this.moveStartY = $event.y;
                } else {
                    if (this.renderSelector) {
                        this.$set(this, 'isSelecting', true);
                        let startX = $event.x;
                        let startY = $event.y - this.container.lowY;
                        this.$set(this.selectLoc, 'startX', startX);
                        this.$set(this.selectLoc, 'startY', startY);
                        this.$set(this.selectLoc, 'endX', startX);
                        this.$set(this.selectLoc, 'endY', startY);
                    }
                }
            },

            selecting($event) {
                //选择集
                if ($event.ctrlKey && this.isMoving) {
                    this.lastEventX += $event.x - this.moveStartX;
                    this.lastEventY += $event.y - this.moveStartY;
                    this.moveStartX = $event.x;
                    this.moveStartY = $event.y;
                } else {
                    if (this.isSelecting && this.renderSelector) {
                        let endX = $event.x;
                        let endY = $event.y - this.container.lowY;
                        this.$set(this.selectLoc, 'endX', endX);
                        this.$set(this.selectLoc, 'endY', endY);
                    }
                    //移动
                    if (this.isLinking) {
                        this.endX = $event.x;
                        this.endY = $event.y
                    }
                }
            },

            endSelect($event) {
                this.isMoving = false;
                this.selecting($event);
                this.$set(this, 'isSelecting', false);
                let vm = this;
                let result1 = this.nodes.filter((node, index) =>
                    vm.selectorX <= vm.locationX[index] &&
                    vm.locationX[index] <= (vm.selectorX + vm.selectorWidth) &&
                    vm.selectorY <= vm.locationY[index] &&
                    vm.locationY[index] <= (vm.selectorY + vm.selectorHeight)
                );
                let result2 = this.links.filter((link, index) =>
                    vm.selectorX <= vm.midLocation[index].x &&
                    vm.locationX[index] <= (vm.selectorX + vm.selectorWidth) &&
                    vm.selectorY <= vm.midLocation[index].y &&
                    vm.locationY[index] <= (vm.selectorY + vm.selectorHeight)
                );
                let result = result1.concat(result2);
                this.clearSelected("all");
                this.selectItem(result)
            },

            getLabelViewDict() {
                this.nodeLabels.map(label => {
                    this.labelViewDict[label] === undefined &&
                    this.$set(this.labelViewDict, label, true)
                })
            },

            //取得link所用数据
            getTargetInfo(item: VisualNodeSettingPart) {
                //注意这里index肯定不能是-1
                let index = this.nodes.indexOf(item);
                let result;
                index >= 0
                    ? result = this.nodeSettingList[index]
                    : result = {x: 0, y: 0};
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

                this.viewX += ($event.clientX - this.lastEventX) / oldScale;
                this.viewY += ($event.clientY - this.lastEventY) / oldScale;
                this.lastEventX = $event.clientX;
                this.lastEventY = $event.clientY;
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
