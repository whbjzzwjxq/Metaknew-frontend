<template>
    <div :style="containerStyle">
        <div :style="rectStyle">
            <slot name="content">

            </slot>
        </div>
        <div
            v-for="(border, name) in borderStyleList"
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
    import {
        AreaRect,
        getDivCSS,
        transformBorderToRect,
        Point,
        getPoint
    } from "@/utils/geoMetric";
    import * as CSS from 'csstype'

    export default Vue.extend({
        name: "RectContainer",
        components: {},
        data() {
            return {
                isLock: false,
                isScaling: false,
                resizeStartPoint: new Point(0, 0),
                scaleName: ''
            }
        },
        props: {
            // 容器
            container: {
                type: Object as () => AreaRect,
                required: true
            },

            // 是否可以改变尺寸
            expandAble: {
                type: Boolean as () => boolean,
                default: false
            },

            //拖动事件监听的宽度
            listenBorder: {
                type: Number as () => number,
                default: 8
            },

            isSelected: {
                type: Boolean as () => boolean,
                default: false
            }
        },
        computed: {
            rectStyle: function (): CSS.Properties {
                return getDivCSS(this.container, {
                    top: this.listenBorder + 'px',
                    left: this.listenBorder + 'px',
                })
            },

            containerStyle: function (): CSS.Properties {
                return {
                    width: (this.container.width + this.listenBorder * 2) + 'px',
                    height: (this.container.height + this.listenBorder * 2) + 'px',
                    left: (this.container.x - this.listenBorder) + 'px',
                    top: (this.container.y - this.listenBorder) + 'px',
                    position: "absolute",
                }
            },

            borderList: function () {
                return transformBorderToRect(this.container, this.listenBorder)
            },

            borderStyleList: function () {
                let result: Record<string, CSS.Properties> = {};
                Object.entries(this.borderList).map(([name, border]) => {
                    result[name] = getDivCSS(border, {
                        backgroundColor: 'grey',
                        opacity: this.isSelected ? 0.3 : 0
                    });
                    if (name === 'proportion') {
                        result[name] = getDivCSS(border, {
                            backgroundColor: '#cc717e', cursor: "nw-resize", opacity: '50%'
                        })
                    } else {
                        if (['left', 'right'].includes(name)) {
                            result[name].cursor = 'e-resize'
                        } else {
                            result[name].cursor = 'n-resize'
                        }
                    }
                });
                return result
            }
        },
        methods: {
            startScale: function ($event: MouseEvent, name: string) {
                if (this.expandAble) {
                    this.isScaling = true;
                    this.scaleName = name;
                    this.resizeStartPoint.update($event)
                }
            },

            scaling: function ($event: MouseEvent) {
                if (this.isScaling) {
                    let delta = getPoint($event).decrease(this.resizeStartPoint);
                    if (['left', 'right'].includes(this.scaleName)) {
                        delta.y = 0
                    } else if (['top', 'bottom'].includes(this.scaleName)) {
                        delta.x = 0
                    } else {
                        delta.y = this.container.height / this.container.width
                    }
                    this.$emit('update-size', delta, this.scaleName);
                    this.resizeStartPoint.update($event)
                }
            },

            endScale: function ($event: MouseEvent) {
                this.scaling($event);
                this.isScaling = false
            },

        },
        watch: {},
        record: {
            status: 'empty'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/17
* Updated by []
*/
