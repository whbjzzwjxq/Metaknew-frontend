<template>
    <div
        style="height: 100%; width: 100%; overflow-x: hidden"
        class="d-flex flex-column"
        @mousedown="mouseDown"
        @mousemove="mouseMove"
        @mouseup="mouseUp"
    >
        <div class="plugin-axis-y" :style="styleYAxis" @mousemove.stop="doNothing" v-show="!isMoving">
            <div class="plugin-axis-y-tab unselected" :style="styleTimeTab">
                <p class="subtitle text-no-wrap"> {{ outputTime(timeMouseOn)}}</p>
            </div>
        </div>
        <div class="pt-8 plugin-slider" :style="styleSlider">
            <v-range-slider
                :max="timeMax"
                :min="timeMin"
                :thumb-size="30"
                dense
                thumb-label="always"
                v-model="range">
                <template v-slot:thumb-label="{value}">
                    {{ getTimeCount(value) }}
                </template>
            </v-range-slider>
        </div>
        <div class="plugin-time-ticks d-flex flex-row" :style="styleTimeTickGroup">
            <v-col cols="1" v-for="n in timeTicks" :key="'timeTick' + n" class="pa-0">
                <div style="height: 12px; width: 2px; background-color: black; opacity: 0.2">
                </div>
                <p class="overline ma-0 unselected"> {{ timeLabel[n - 1] }}</p>
            </v-col>
        </div>
        <v-card
            class="plugin-card"
            :style="styleCard"
            v-if="nodeMouseOn"
            @mouseenter.stop="cancelNodeLeave"
            @mouseleave.stop="mouseLeaveNode(nodeMouseOn)"
        >
            <template>
                <card-node-simp
                    v-if="nodeMouseOn.Setting._type === 'node' || nodeMouseOn.Setting._type === 'document'"
                    :setting="nodeMouseOn.Setting"
                    :state="nodeMouseOn.State"
                    not-render-description
                    x-small>
                    <template v-slot:content>
                        <p class="subtitle-2 ma-0"> {{ nodeMouseOn._origin.key}}</p>
                        <p class="subtitle-2 ma-0"> {{ outputTime(nodeMouseOn._origin.time)}}</p>
                    </template>
                </card-node-simp>
                <card-media-simp
                    v-if="nodeMouseOn.Setting._type === 'media'"
                    :setting="nodeMouseOn.Setting"
                    :state="nodeMouseOn.State"
                    x-small>

                </card-media-simp>
            </template>
        </v-card>
        <div ref="viewBox"
             v-resize="onResize"
             @wheel="onScroll"
             class="flex-grow-1">
            <svg style="width: 100%; height: 100%">
                <graph-node
                    v-for="(node, index) in nodes"
                    v-show="showItems[index]"
                    :key="node._id"
                    :item-setting="node.Setting"
                    :state="node.State"
                    :position="nodePosition[index]"
                    @mouseenter.native.stop="mouseEnterNode(node, nodePosition[index])"
                    @mouseleave.native.stop="mouseLeaveNode(node)"
                >

                </graph-node>
            </svg>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {DocumentSelfPart, MediaSettingPart, NodeSettingPart} from "@/class/settingBase";
    import {FakeNodeSettingPart, Rate, Time, TimelineItem} from "@/interface/interfaceTimeline";
    import moment from "moment";
    import {getPoint, Point, RectByPoint} from "@/class/geometric";
    import {nodeStateTemplate} from "@/utils/template";
    import GraphNode from "@/components/graphComponents/GraphNode.vue";
    import CardNodeSimp from "@/components/card/standard/CardNodeSimp.vue";
    import CardMediaSimp from "@/components/card/standard/CardMediaSimp.vue";
    import {MediaInfoPart, NodeInfoPart} from "@/class/info";
    import {sortByTime} from "@/utils/utils";

    enum TimeLevel {
        Second = "S",
        Minute = "M",
        Hour = "H",
        Day = "D",
        Month = "Mo",
        Year = "Y",
        Century = "C"
    }

    const TimeLevelRange = {
        [TimeLevel.Second]: 1000,
        [TimeLevel.Minute]: 60,
        [TimeLevel.Hour]: 60,
        [TimeLevel.Day]: 24,
        [TimeLevel.Month]: 30,
        [TimeLevel.Year]: 12,
        [TimeLevel.Century]: 100
    }

    export default Vue.extend({
        name: "GraphTimeline",
        components: {
            GraphNode,
            CardNodeSimp,
            CardMediaSimp
        },
        data: function () {
            return {
                scale: 100,
                //两个标签占据时间轴位置的时间戳表示
                range: [0, 1000] as [Time, Time],
                //视觉Box
                viewBox: new RectByPoint({x: 404, y: 102}, {x: 960, y: 540}),
                //视觉中心 代表0位置和当前屏幕中心的差值
                viewPoint: new Point(500, 500),
                //每100值显示20个tick
                ticks: 20,
                // 一个Info只显示一个内容
                oneInfoOneItem: false,
                // 不选择的属性
                unSelectKeys: [] as string[],
                mousePosition: new Point(0, 0),
                timelineTop: 64,
                timeTabTop: 108,
                leftPadding: 0,
                timeTicks: 13,

                //moving
                isMoving: false,

                nodeWidth: 16,
                nodeHeight: 16,
                nodeMouseOn: null as FakeNodeSettingPart<TimelineItem> | null,
                nodeMouseOnPosition: {x: 0, y: 0, width: 16, height: 16} as AreaRect,
                nodeLeaveTimer: 0
            }
        },
        props: {},
        computed: {
            dataManager: function (): DataManagerState {
                return this.$store.state.dataManager
            },
            document: function (): DocumentSelfPart {
                return this.dataManager.currentDocument
            },
            //所有节点
            originNodes: function (): NodeSettingPart[] {
                return this.document.nodesAllSubDoc
            },
            //所有媒体
            originMedias: function (): MediaSettingPart[] {
                return this.document.medias
            },
            originNodeInfo: function (): NodeInfoPart[] {
                return this.originNodes.map(node => this.dataManager.nodeManager[node._id])
            },
            originMediaInfo: function (): MediaInfoPart[] {
                return this.originMedias.map(media => this.dataManager.mediaManager[media._id])
            },
            infoList: function (): (NodeInfoPart | MediaInfoPart)[] {
                let result = [];
                result.push(...this.originNodeInfo);
                result.push(...this.originMediaInfo);
                result.sort(sortByTime)
                return result
            },
            infoIdList: function (): id[] {
                return this.infoList.map(info => info._id)
            },
            allTimeItems: function (): Record<id, TimelineItem[]> {
                let result: Record<id, TimelineItem[]> = {};
                this.infoList.map(info => {
                    result[info._id] = this.infoToTimeItem(info)
                });
                return result
            },
            // 所有可用项目
            availableTimeItems: function (): TimelineItem[] {
                let result: TimelineItem[] = [];
                Object.values(this.allTimeItems).map((items) => {
                    // 屏蔽同一id 和 值不为-Infinity
                    let availableItems = items.filter(item => item.time !== -Infinity);
                    this.oneInfoOneItem && availableItems[0]
                        ? result.push(availableItems[0])
                        : result.push(...availableItems)
                });
                result.sort((a, b) => a.time - b.time);
                return result
            },
            showItems: function (): boolean[] {
                return this.availableTimeItems.map((item) => {
                    let result = [
                        // 排除key
                        !this.unSelectKeys.includes(item.key),
                        // 排除范围外的内容
                        this.checkInRange(item.time)
                    ];
                    return !result.includes(false)
                });
            },
            nodes: function (): FakeNodeSettingPart<TimelineItem>[] {
                return this.availableTimeItems.map(item => {
                    let _image = item.info.image;
                    // let _name = item.info._name;
                    let _name = `${item.info._name} ${item.key} ${this.getTimeCount(item.time)}`;
                    let _isMain = false;
                    let {_id, _label} = item.info;
                    let node = {
                        State: nodeStateTemplate(),
                        Setting: NodeSettingPart.nodeSettingDefault({
                            _id,
                            _type: 'node',
                            _label,
                            _name,
                            _image,
                            _isMain,
                        }),
                        _origin: item
                    }
                    node.Setting.InGraph.Base = {
                        ...node.Setting.InGraph.Base,
                        size: this.nodeHeight,
                        scaleX: 1
                    }
                    node.Setting.InGraph.Text = {
                        ...node.Setting.InGraph.Text,
                        textBreak: true
                    }
                    return node
                })
            },
            nodePosition: function (): AreaRect[] {
                return this.availableTimeItems.map(item => {
                    let x = this.countTimeToRate(item.time) * this.viewBox.width; // 屏幕上的 0 - 1
                    let indexY = this.infoIdList.indexOf(item.info._id) //屏幕上的y位置

                    //相同位置的同样时间属性的节点
                    let samePositionInfoItem = this.availableTimeItems.filter(subItem => subItem.info._id === item.info._id).filter(subItem => {
                        let widthA = this.countTimeToRate(subItem.time) * this.viewBox.width
                        return Math.abs(widthA - x) <= this.nodeWidth
                    })
                    let indexDelta = samePositionInfoItem.indexOf(item)
                    indexDelta < 0 && (indexDelta = 0)
                    indexY += indexDelta
                    let y = indexY * (this.nodeHeight * 2 + 24) + (this.viewBox.midPoint().y - this.viewPoint.y)
                    return {
                        x,
                        y,
                        width: this.nodeWidth,
                        height: this.nodeHeight
                    }
                })
            },

            realScale: function (): number {
                return this.scale / 100
            },
            // 时间最小值
            timeMin: function (): Time {
                let min = this.timeItemMin;
                return min
                    ? min - Math.abs(min * 0.2) //min再小一些 防止边界情况
                    : 0
            },
            // 时间最大值
            timeMax: function (): Time {
                let max = this.timeItemMax;
                return max && max !== this.timeMin
                    ? max + Math.abs(max * 0.2) // max 再大一些 防止边界情况
                    : 1000 * 60 * 30 * 365 // 一年
            },

            //所有项目的最小值
            timeItemMin: function (): Time {
                return this.availableTimeItems[0]
                    ? this.availableTimeItems[0].time
                    : 0
            },

            //所有项目的最大值
            timeItemMax: function (): Time {
                let max = this.availableTimeItems[this.availableTimeItems.length - 1]
                return max
                    ? max.time
                    : 19600
            },

            //时间跨度 以毫秒计
            timeDelta: function (): number {
                return this.timeMax - this.timeMin <= 0
                    ? 1000
                    : this.timeMax - this.timeMin
            },

            //标签
            timeLabel: function (): number[] {
                let result: number[] = Array(this.timeTicks)
                result.fill(this.rateCurrentMin, 0, this.timeTicks)
                let step = (this.rateCurrentMax - this.rateCurrentMin) / (this.timeTicks - 1)
                result.map((time, index) => {
                    result[index] = time + index * step
                })
                return result.map(time => this.getTimeCount(this.countTotalTime(time)))
            },

            //时间的级别
            timeLevel: function (): TimeLevel {
                let delta = this.timeDelta * this.realScale
                let count = 1
                let result = TimeLevel.Century
                Object.keys(TimeLevelRange).map(key => {
                    let time = key as TimeLevel
                    //累乘
                    count *= TimeLevelRange[time]
                    delta / count < 10 && (result = time)
                })
                return result
            },

            timeMouseOn: function (): number {
                return this.countTotalTime(this.rateMouseOn)
            },

            //统计现有属性
            props: function (): string[] {
                let result: string[] = [];
                this.availableTimeItems.map(item => {
                    let prop = item.key;
                    !result.includes(prop) && (result.push(prop))
                });
                return result.sort()
            },

            //当前屏幕中央在全部时间轴比重
            rateCurrentMiddle: function (): Rate {
                //从视点到起点的距离
                return this.viewPoint.x / (this.viewBox.width * this.realScale)
            },

            //当前屏幕左边在全部时间轴的比重
            rateCurrentMin: function (): Rate {
                return this.rateCurrentMiddle - (1 / this.realScale) * (1 / 2)
            },

            //当前屏幕右边在全部时间轴的比重
            rateCurrentMax: function (): Rate {
                return this.rateCurrentMiddle + (1 / this.realScale) * (1 / 2)
            },

            //当前鼠标位置的比重
            rateMouseOn: function (): Rate {
                let padding = this.leftPadding;
                let x = (this.mousePosition.x - this.viewBox.start.x - padding) / (this.viewBox.width - padding * 2)
                return this.countCurrentRate(x)
            },

            //slider的样式
            styleSlider: function (): CSSProp {
                let addition: CSSProp;
                this.scale >= 100
                    ? addition = {
                        position: 'relative',
                        left: -(this.viewPoint.x - this.viewBox.width / 2) + 'px'
                    }
                    : addition = {
                        alignSelf: 'center'
                    };
                return {
                    ...addition,
                    height: this.timelineTop + 'px',
                    width: this.scale + '%',
                    zIndex: 2
                }
            },

            styleYAxis: function (): CSSProp {
                return {
                    position: "absolute",
                    left: (this.mousePosition.x - 4) + 'px',
                    height: this.viewBox.height + 36 + 'px',
                    top: this.viewBox.start.y - 36 + 'px',
                    width: '2px',
                    backgroundColor: "grey",
                    zIndex: 15,
                    opacity: 0.5
                }
            },

            styleTimeTab: function (): CSSProp {
                return {
                    position: 'relative',
                    top: '16px',
                }
            },

            styleTimeTickGroup: function (): CSSProp {
                return {
                    position: 'relative',
                    top: '-18px',
                    width: this.viewBox.width - 4 + 'px'
                }
            },

            styleCard: function (): CSSProp {
                let position: AreaRect = this.nodeMouseOnPosition
                let deltaY = position.y > this.viewBox.height * 0.5
                    ? -160
                    : 0
                return {
                    position: 'absolute',
                    left: this.viewBox.start.x + position.x + position.width / 2 + 'px',
                    top: this.viewBox.start.y + position.y + position.height / 2 + deltaY + 'px',
                    zIndex: 16
                }
            }
        },
        methods: {
            mouseMove($event: MouseEvent) {
                window.requestAnimationFrame(() => {
                    this.mousePosition = getPoint($event)
                })
                if ($event.ctrlKey && this.isMoving) {
                    window.requestAnimationFrame(() => {
                        let {movementX, movementY} = $event
                        let x = this.viewPoint.x - movementX
                        let y = this.viewPoint.y - movementY
                        this.viewPoint = getPoint(this.checkViewPoint({x, y}))
                    })
                }
            },
            mouseDown() {
                this.isMoving = true
            },
            mouseUp() {
                this.isMoving = false
            },
            checkViewPoint(point: PointObject) {
                let {x, y} = point
                let xMin = 0;
                let xMax = this.realScale * this.viewBox.width;
                x < xMin && (x = xMin)
                x > xMax && (x = xMax)
                return {x, y}
            },
            onScroll($event: WheelEvent) {
                let oldScale = this.realScale;
                let [min, max] = [100, 1000];
                let scrollDelta = $event.deltaY < 0
                    ? 20
                    : -20;
                this.scale += scrollDelta;
                this.scale < min && (this.scale = min);
                this.scale > max && (this.scale = max);
                let delta = this.viewBox.midPoint().copy().decrease(this.mousePosition)
                let newX = (this.viewPoint.x * this.realScale - delta.x * (this.realScale - oldScale)) / oldScale
                let newY = this.viewPoint.y
                this.viewPoint = getPoint(this.checkViewPoint({x: newX, y: newY}))
            },
            infoToTimeItem(info: NodeInfoPart | MediaInfoPart) {
                let result: TimelineItem[] = [];
                let props = info.allProps;
                Object.entries(props).map(([key, prop]) => {
                    if (prop.resolve === 'time') {
                        let item = {
                            info,
                            key,
                            time: this.resolveTime(prop.value),
                        } as TimelineItem;
                        result.push(item)
                    } else {
                        // doNothing
                    }
                });
                return result
            },

            resolveTime(value: string) {
                let time = moment(value);
                if (time.isValid()) {
                    // 以秒为单位
                    return time.unix()
                } else {
                    return -Infinity
                }
            },

            //获取基本单位的时间
            getTimeCount(value: number): number {
                let time = moment.unix(value).utc()
                switch (this.timeLevel) {
                    case TimeLevel.Second:
                        return time.second()
                    case TimeLevel.Minute:
                        return time.minutes()
                    case TimeLevel.Hour:
                        return time.hours()
                    case TimeLevel.Day:
                        return time.day()
                    case TimeLevel.Month:
                        return time.month()
                    case TimeLevel.Year:
                        return time.year()
                    case TimeLevel.Century:
                        return time.year()
                }
            },

            outputTime(value: number) {
                return moment.unix(value).format("DD, MMM, YYYY")
            },

            //根据比例计算min max之间的值
            rangeCount(max: number, min: number, v: Rate): number {
                return (max - min) * v + min
            },

            //计算某个rate的时间
            countTotalTime(v: Rate): Time {
                return this.rangeCount(this.timeMax, this.timeMin, v)
            },

            //计算某个rate对应的现在的rate
            countCurrentRate(v: Rate): Rate {
                return this.rangeCount(this.rateCurrentMax, this.rateCurrentMin, v)
            },

            //计算屏幕内比例
            countTimeToRate(v: Time) {
                let min = this.countTotalTime(this.rateCurrentMin);
                let max = this.countTotalTime(this.rateCurrentMax);
                let delta = max - min;
                return (v - min) / (delta) as Rate;
            },

            onResize() {
                //@ts-ignore
                let viewBox: HTMLElement = this.$refs.viewBox;
                let rect = viewBox.getBoundingClientRect();
                this.viewBox.updateFromArea(rect);
            },
            checkInRange(value: number) {
                return value >= this.range[0] && this.range[1] >= value
            },
            doNothing() {

            },

            mouseEnterNode(node: FakeNodeSettingPart<TimelineItem>, position?: AreaRect) {
                this.nodeMouseOn = node
                position && (this.nodeMouseOnPosition = position)
            },

            cancelNodeLeave() {
                clearTimeout(this.nodeLeaveTimer)
            },

            mouseLeaveNode(node: FakeNodeSettingPart<TimelineItem>) {
                if (this.nodeMouseOn) {
                    if (node.Setting._id === this.nodeMouseOn.Setting._id && node._origin.key === this.nodeMouseOn._origin.key) {
                        this.nodeLeaveTimer = setTimeout(() => {
                            this.nodeMouseOn = null
                        }, 1500)
                    }
                }
            }
        },
        record: {
            status: 'editing',
            description: ''
        },
        mounted(): void {
            this.onResize();
            this.viewPoint = this.viewBox.midPoint().decrease(this.viewBox.start);
            window.requestAnimationFrame(() => {
                this.range[0] = this.timeItemMin;
                this.range[1] = this.timeItemMax;
            })
        }
    })
</script>

<style scoped>

</style>
