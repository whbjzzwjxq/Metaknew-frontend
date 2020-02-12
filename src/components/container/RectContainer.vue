<template>
    <div :style="startPointStyle" class="rect-start-point">
        <div :style="contentStyle" v-if="!renderAsBorder">
            <slot name="content">

            </slot>
        </div>
        <div
            v-for="(border, name) in borderDict"
            :key="name"
            :style="border.css"
            v-show="showBorder"
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
    import {getPoint, Point, RectByPoint, transformBorderToRect} from "@/class/geometric";

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
            expand: {
                type: Boolean,
                default: false
            },

            //拖动事件监听的外延
            listenBorder: {
                type: Number,
                default: 4
            },

            //拖动事件监听的内展
            listenInner: {
                type: Number,
                default: 4
            },

            borderWidth: {
                type: Number,
                default: 4
            },

            //是否被选中
            isSelected: {
                type: Boolean,
                default: false
            },

            //是否只渲染Border
            renderAsBorder: {
                type: Boolean,
                default: false
            },

            //是否一直显示Border
            alwaysShowBorder: {
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
                return this.container.getDivCSS({width: 0, height: 0, borderWidth: 0})
            },
            contentStyle: function (): CSSProp {
                // 注意是相对于父亲来说的
                return this.container.getDivCSS({left: 0, top: 0, borderWidth: 0})
            },

            showBorder: function (): boolean {
                // 是否一直显示
                return this.alwaysShowBorder || this.isSelected
            },

            // Border矩形的构成
            borderDict: function (): Record<string, { css: CSSProp }> {
                // 这里要把开始点置为0,0 重画一个矩形
                let reGroupRect = new RectByPoint({x: 0, y: 0},
                    this.container.end.copy().decrease(this.container.start), 0);
                return transformBorderToRect(
                    reGroupRect,
                    this.listenBorder,
                    this.listenInner,
                    this.borderWidth,
                    {opacity: this.showBorder ? 0.3 : 0, backgroundColor: 'grey'})
            },
        },
        methods: {
            startScale: function ($event: MouseEvent, name: string) {
                if (this.expand) {
                    this.isScaling = true;
                    this.borderType = name;
                    this.resizeStartPoint.update($event)
                }
            },

            scaling: function ($event: MouseEvent) {
                // 上传视觉的改变
                if (this.isScaling) {
                    let delta = getPoint($event).decrease(this.resizeStartPoint);
                    this.resizeStartPoint.update($event);
                    if (['n', 's'].includes(this.borderType)) {
                        delta.x = 0
                    }
                    if (['w', 'e'].includes(this.borderType)) {
                        delta.y = 0
                    }
                    if (['e', 'ne', 'se', 's'].includes(this.borderType)) {
                        this.$emit('update-size', {x: 0, y: 0}, delta);
                    } else {
                        this.$emit('update-size', delta, {x: 0, y: 0});
                    }
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
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/17
* Updated by []
*/
