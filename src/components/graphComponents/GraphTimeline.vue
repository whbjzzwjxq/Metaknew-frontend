<template>
    <div
        style="height: 100%; width: 100%; overflow-x: hidden"
        class="d-flex flex-column"
        ref="viewBox"
        v-resize="onResize"
        @wheel="onScroll"
    >
        <div :style="sliderStyle" class="pt-8 slider">
            <v-range-slider
                :max="max"
                :min="min"
                :thumb-size="30"
                tick-size="6"
                ticks="always"
                :step="step"
                dense
                thumb-label="always"
                v-model="range">
                <template v-slot:thumb-label="{value}">
                    {{ getTimeString(value) }}
                </template>
            </v-range-slider>
        </div>
        <svg style="width: 100%; height: 100%">
            <graph-node
                v-for="(node, index) in nodes"
                v-show="showItems[index] && position[index].x >= 0"
                :key="index"
                :setting="node.Setting"
                :state="node.State"
                :position="position[index]"
            >

            </graph-node>
        </svg>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {
        GraphNodeSettingPart,
        GraphSelfPart,
        MediaInfoPart,
        MediaSettingPart,
        NodeInfoPart
    } from "@/class/graphItem";
    import {FakeNodeSettingPart, Rate, Time, TimelineItem} from "@/interface/interfaceTimeline";
    import moment from "moment";
    import {getPoint, RectByPoint} from "@/class/geometric";
    import {isNodeInfoPart} from "@/utils/typeCheck";
    import {nodeSettingTemplate, nodeStateTemplate} from "@/utils/template";
    import GraphNode from "@/components/graphComponents/GraphNode.vue";

    const divide = 5; // 分成10部分
    const getLocationDict = (divide: number) => {
        let result: Record<number, any[]> = {};
        for (let i = 0; i < divide; i++) {
            result[i] = []
        }
        return result
    };
    export default Vue.extend({
        name: "GraphTimeline",
        components: {
            GraphNode
        },
        data: function () {
            return {
                scale: 100,
                //两个标签占据百分之多少的时间轴
                range: [0, 1000] as [Time, Time],
                //视觉Box
                viewBox: new RectByPoint({x: 404, y: 102}, {x: 960, y: 540}),
                // 允许重复
                duplicate: true,
                //每100值显示20个tick
                ticks: 20,
                // 一个Info只显示一个内容
                oneInfoOneItem: false,
                // 不选择的属性
                unSelectKeys: [] as string[],
                // 占据比例
                currentMin: 0 as Rate,
                currentMax: 1 as Rate,
            }
        },
        props: {},
        computed: {
            dataManager: function (): DataManagerState {
                return this.$store.state.dataManager
            },
            document: function (): GraphSelfPart {
                return this.dataManager.currentGraph
            },

            originNodes: function (): GraphNodeSettingPart[] {
                return this.document.Content.nodes.filter(item => !item.isDeleted)
            },
            originMedias: function (): MediaSettingPart[] {
                return this.document.Content.medias.filter(item => !item.isDeleted)
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
                return result
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
            nodes: function (): FakeNodeSettingPart[] {
                return this.availableTimeItems.map(item => {
                    let image = isNodeInfoPart(item.info.Info)
                        ? item.info.Info.MainPic
                        : item.info.Ctrl.Thumb;
                    let name = item.info.Info.Name;
                    let {_id, _type, _label} = item.info;
                    return {
                        State: nodeStateTemplate(),
                        Setting: nodeSettingTemplate(_id, _type, _label, name, image)
                    }
                })
            },
            position: function (): PointObject[] {
                let locationDict = getLocationDict(divide);
                return this.availableTimeItems.map((item, index) => {
                    let x = this.currentRateCount(item.time); // 屏幕上的 0 - 1
                    let location = Math.floor(x * divide); // 位置区间
                    location === divide && (location = divide - 1); // 处理边界情况
                    // 屏幕外和本就不渲染的内容不渲染
                    if (x < 0 || x > 1 || !this.showItems[index]) {
                        return {x: -100, y: -100}
                    } else {
                        locationDict[location].push(item);
                        let index = locationDict[location].length;
                        if (this.scale > 100) {
                            // 时间轴是满的
                            return {x: x * this.viewBox.width, y: index * 54 + 24}
                        } else {
                            // 时间轴没有铺满屏幕
                            return {
                                x: (1 / 2 + (x - 1 / 2) * (this.scale / 100)) * this.viewBox.width,
                                y: index * 54 + 24
                            }
                        }
                    }
                })
            },
            // 所有项目的最小值
            min: function (): Time {
                let min = this.availableTimeItems[0];
                return min
                    ? min.time - Math.abs(min.time * 0.2) //min再小一些 防止边界情况
                    : 0
            },
            // 所有项目的最大值
            max: function (): Time {
                let max = this.availableTimeItems[this.availableTimeItems.length - 1];
                return max && max.time !== this.min
                    ? max.time + Math.abs(max.time * 0.2) // max 再大一些 防止边界情况
                    : 1000 * 60 * 30 * 365 // 一年
            },

            sliderStyle: function (): CSSProp {
                let addition: CSSProp;
                this.scale > 100
                    ? addition = {
                        position: 'relative',
                        left: -this.currentMin * this.scale + '%'
                    }
                    : addition = {
                        alignSelf: 'center'
                    };
                return {
                    height: '64px',
                    width: this.scale + '%',
                    ...addition
                }
            },
            delta: function (): number {
                return this.max - this.min <= 0
                    ? 1000
                    : this.max - this.min
            },

            step: function (): number {
                return (this.delta) / this.ticks
            }
        },
        methods: {
            onScroll($event: WheelEvent) {
                let oldScale = this.scale;
                let delta;
                let [min, max] = [60, 1000];
                $event.deltaY < 0
                    ? delta = 20
                    : delta = -20;
                this.scale += delta;
                this.scale < min && (this.scale = min);
                this.scale > max && (this.scale = max);
                let point = getPoint($event).decrease(this.viewBox.start);
                // 横向坐标的比例
                let x = point.x / this.viewBox.width;
                // 计算坐标代表的现在的值
                let currentValue = this.currentRangeCount(x);
                let newMin = currentValue - (currentValue - this.currentMin) / this.scale * oldScale;
                let newMax = currentValue + (this.currentMax - currentValue) / this.scale * oldScale;
                // 边界处理
                (newMin < 0 || this.scale <= 100) && (newMin = 0);
                (newMax > 1 || this.scale <= 100) && (newMax = 1);
                this.currentMin = newMin;
                this.currentMax = newMax;
            },
            infoToTimeItem(info: NodeInfoPart | MediaInfoPart) {
                let result: TimelineItem[] = [];
                let props = Object.assign({}, info.Info.StandardProps, info.Info.ExtraProps);
                Object.entries(props).map(([key, prop]) => {
                    if (prop.resolve === 'time') {
                        let item = {
                            info: info,
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

            getTimeString(value: number) {
                return moment.unix(value).utc().year()
            },

            //根据比例计算min max之间的值
            rangeCount(a: Time, b: Time, v: Rate): Time {
                return (a - b) * v + b
            },

            //总的计算
            totalRangeCount(v: Rate) {
                return this.rangeCount(this.max, this.min, v)
            },

            //现有的计算
            currentRangeCount(v: Rate) {
                return this.rangeCount(this.currentMax, this.currentMin, v)
            },

            //计算全局比例
            totalRateCount(v: Time) {
                return (v - this.min) / (this.delta) as Rate;
            },

            //计算屏幕内比例
            currentRateCount(v: Time) {
                let min = this.totalRangeCount(this.currentMin);
                let max = this.totalRangeCount(this.currentMax);
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
            }
        },
        record: {
            status: 'editing',
            description: ''
            //todo 1. 碰撞检测系统 2. 重写画图组件 timeline和graph可以用同一组件 3. 更多条件 4. 时间显示更细致
        },
        created(): void {
            this.range[0] = this.min;
            this.range[1] = this.max;
        },
        mounted(): void {
            this.onResize();
        }
    })
</script>

<style scoped>

</style>
