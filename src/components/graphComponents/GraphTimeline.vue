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
    import {TimelineItem} from "@/interface/interfaceTimeline";
    import moment from "moment";
    import {getPoint, RectByPoint} from "@/class/geometric";

    export default Vue.extend({
        name: "GraphTimeline",
        components: {},
        data: function () {
            return {
                scale: 100,
                //两个标签占据百分之多少的时间轴
                rangeBase: [0, 0.5],
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
                currentMin: 0,
                currentMax: 1
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
            allTimeItems: function (): Record<id, TimelineItem[]> {
                let result: Record<id, TimelineItem[]> = {};
                this.originNodeInfo.map(info => {
                    result[info._id] = this.infoToTimeItem(info)
                });
                return result
            },
            // 所有可用项目
            availableTimeItems: function (): TimelineItem[] {
                let result: TimelineItem[] = [];
                Object.entries(this.allTimeItems).map(([id, items]) => {
                    // 屏蔽key 和 值不为-Infinity
                    let availableItems = items.filter(item => item.time !== -Infinity);
                    result.push(...availableItems)
                });
                result.sort((a, b) => a.time - b.time);
                return result
            },
            // 所有项目的最小值
            min: function (): number {
                return this.availableTimeItems[0]
                    ? this.availableTimeItems[0].time
                    : 0
            },
            // 所有项目的最大值
            max: function (): number {
                let m = this.availableTimeItems[this.availableTimeItems.length - 1];
                return m
                    ? m.time
                    : 1000 * 60 * 30 * 365 // 一秒
            },

            range: {
                get(): [number, number] {
                    let [a, b] = this.rangeBase;
                    return [this.totalRangeCount(a), this.totalRangeCount(b)]
                },
                set(value: [number, number]): void {
                    const backCount = (v: number) => (v - this.min) / (this.delta);
                    let [a, b] = value;
                    this.rangeBase = [backCount(a), backCount(b)]
                }
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
            delta: function(): number {
                return this.max - this.min <= 0
                    ? 1000
                    : this.max - this.min
            },
            showDelta: function(): number {
                return (this.currentMax - this.currentMin) * this.delta
            },
            step: function (): number {
                return (this.delta) / this.ticks
            }
        },
        methods: {
            onScroll($event: WheelEvent) {
                let oldScale = this.scale;
                let delta;
                let [min, max] = [80, 1000];
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
                (newMin < 0 || this.scale < 100) && (newMin = 0);
                (newMax > 1 || this.scale < 100) && (newMax = 1);
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
            rangeCount(a: number, b: number, v: number) {
                return (a - b) * v + b
            },

            //总的计算
            totalRangeCount(v: number) {
                  return this.rangeCount(this.max, this.min, v)
            },

            //现有的计算
            currentRangeCount(v: number) {
                return this.rangeCount(this.currentMax, this.currentMin, v)
            },

            onResize() {
                //@ts-ignore
                let viewBox: HTMLElement = this.$refs.viewBox;
                let rect = viewBox.getBoundingClientRect();
                this.viewBox.updateFromArea(rect);
            }
        },
        record: {
            status: 'empty',
            description: ''
        },
        mounted(): void {
            this.onResize()
        }
    })
</script>

<style scoped>

</style>
