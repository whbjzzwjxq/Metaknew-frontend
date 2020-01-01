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
            @mousemove.stop="scaling(arguments[0], name)"
            @mouseup.stop="endScale(arguments[0], name)">

        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {AreaRect, getDivCSS, transformBorderToRect} from "@/utils/geoMetric";
    import * as CSS from 'csstype'

    export default Vue.extend({
        name: "RectContainer",
        components: {},
        data() {
            return {
                isLock: false,
                isScaling: false
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

            //是否渲染锁定Icon
            renderIcon: {
                type: Boolean as () => boolean,
                default: false
            },

            //拖动事件监听的宽度
            listenBorder: {
                type: Number as () => number,
                default: 4
            }
        },
        computed: {
            rectStyle: function (): CSS.Properties {
                return getDivCSS(this.container, {
                    top: this.listenBorder + 'px',
                    left: this.listenBorder + 'px',
                    backgroundColor: "#000000"
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
                    result[name] = getDivCSS(border, {backgroundColor: '#BBBBBB'});
                    if (name === 'proportion') {
                        result[name] = getDivCSS(border, {backgroundColor: '#AAAAAA'})
                    }
                });
                return result
            }
        },
        methods: {
            startScale: function ($event: MouseEvent, name: string) {
                this.isScaling = true;
            },

            scaling: function ($event: MouseEvent, name: string) {
                if (this.isScaling) {
                    //
                }
            },

            endScale: function ($event: MouseEvent, name: string) {
                this.scaling($event, name);
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
