<template>
    <div :style="startPointStyle">
        <div :style="contentStyle" v-if="!renderAsBorder">
            <slot name="content">

            </slot>
        </div>
        <div
            v-for="(border, name) in borderStyleDict"
            :key="name"
            :style="border"
            @mousedown.stop="startScale(arguments[0], name)"
            @mousemove.stop="scaling"
            @mouseup.stop="endScale"
            @mouseleave.stop="endScale"
            class="border">

        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {transformBorderToRect, Point, getPoint, RectByPoint, BorderType} from "@/utils/geoMetric";

    export default Vue.extend({
        name: "RectContainer",
        components: {},
        data() {
            return {
                isLock: false,
                isScaling: false,
                resizeStartPoint: new Point(0, 0),
                borderType: 'n' as string
            }
        },
        props: {
            // 容器
            container: {
                type: Object as () => RectByPoint,
                required: true
            },

            // 是否可以改变尺寸
            expandAble: {
                type: Boolean as () => boolean,
                default: false
            },

            //拖动事件监听的外延
            listenBorder: {
                type: Number as () => number,
                default: 12
            },

            //拖动事件监听的内展
            listenInner: {
                type: Number as () => number,
                default: 12
            },

            //是否被选中
            isSelected: {
                type: Boolean as () => boolean,
                default: false
            },

            //是否只渲染Border
            renderAsBorder: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            containerRect: function () {
                return this.container.positiveRect()
            },
            startPointStyle: function (): CSSProp {
                // 注意没有长宽 只有起始点坐标
                return this.container.getDivCSS({width: 0, height: 0})
            },
            contentStyle: function (): CSSProp {
                // 注意是相对于父亲来说的
                return this.container.getDivCSS({left: 0, top: 0})
            },

            // Border矩形的构成
            borderList: function () {
                // 这里要把开始点置为0,0
                let reGroupRect = new RectByPoint({x: 0, y: 0},
                    this.container.end.copy().decrease(this.container.start), 0);
                return transformBorderToRect(reGroupRect, this.listenBorder, this.listenInner)
            },

            borderStyleDict: function () {
                let result: Record<string, CSSProp> = {};
                Object.entries(this.borderList).map(([name, border]) => {
                    result[name] = border.getDivCSS({
                        backgroundColor: 'grey',
                        borderWidth: 0,
                        opacity: this.isSelected ? 0.3 : 0.3,
                        cursor: name + '-resize'
                    })
                });
                return result as Record<BorderType, CSSProp>
            }
        },
        methods: {
            startScale: function ($event: MouseEvent, name: string) {
                if (this.expandAble) {
                    this.isScaling = true;
                    this.borderType = name;
                    this.resizeStartPoint.update($event)
                }
            },

            scaling: function ($event: MouseEvent) {
                if (this.isScaling) {
                    let delta = getPoint($event).decrease(this.resizeStartPoint);
                    this.resizeStartPoint.update($event);
                    if (['n', 's'].includes(this.borderType)) {
                        delta.x = 0
                    }
                    if (['w', 'e'].includes(this.borderType)) {
                        delta.y = 0
                    }
                    this.$emit('update-size', delta, this.borderType);
                }
            },

            endScale: function ($event: MouseEvent) {
                this.scaling($event);
                this.isScaling = false
            },

        },
        watch: {},
        record: {
            status: 'editing',
            description: '矩形窗口',
            // todo 尺寸限定在rect里 不要越界
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/17
* Updated by []
*/
