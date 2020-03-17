<template>
    <rect-container
        :container="container"
        expand
        @update-size="updateSize"
        :is-selected="isSelected">
        <template v-slot:content>
            <svg :width="rect.width" :height="rect.height">
                <polyline
                    v-if="label === 'polyline'"
                    :points="setting.Point"
                >

                </polyline>
                <polygon
                    v-else-if="label === 'polygon'"
                    :points="setting.Point">

                </polygon>
                <rect
                    v-else-if="label === 'rect'"
                    :x="setting.Border.width"
                    :y="setting.Border.width"
                    :width="inlineRect.width"
                    :height="inlineRect.height"
                    :style="activeStyle"
                >
                </rect>
                <ellipse
                    v-else-if="label === 'ellipse'"
                    rx=""
                    ry="">

                </ellipse>
                <foreignObject :x="borderWidth" :y="borderWidth" :height="inlineRect.height" :width="inlineRect.width">
                    <div :style="divStyle">
                        <field-text-render
                            :disabled="!isSelected"
                            render-as-markdown
                            :value="setting._text"
                            :rows="4"
                            :row-height="14"
                            @update-text="updateText"
                        >

                        </field-text-render>
                    </div>
                </foreignObject>
            </svg>
        </template>
    </rect-container>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {TextSettingPart} from "@/class/graphItem";
    import {RectByPoint} from "@/class/geometric";
    import RectContainer from "@/components/container/RectContainer.vue";
    import FieldTextRender from "@/components/field/FieldTextRender.vue";

    export default Vue.extend({
        name: "GraphText",
        components: {
            RectContainer,
            FieldTextRender
        },
        data: function () {
            return {}
        },
        props: {
            svg: {
                type: Object as () => TextSettingPart,
                required: true
            },
            scale: {
                type: Number as () => number,
                default: 1
            },
            container: {
                type: Object as () => RectByPoint,
                required: true
            }
        },
        computed: {
            setting: function (): TextSetting {
                return this.svg.Setting
            },

            originPoints: function (): PointObject[] {
                return this.setting._points
            },

            label: function (): TextLabel {
                return this.setting._label
            },

            rect: function (): AreaRect {
                return this.container.positiveRect()
            },

            borderWidth: function (): number {
                return this.setting.Border.width
            },

            inlineRect: function (): AreaRect {
                let {x, y, width, height} = this.rect;
                let borderWidth = this.borderWidth;
                return {
                    x: x + borderWidth,
                    y: y + borderWidth,
                    height: height - 2 * borderWidth,
                    width: width - 2 * borderWidth
                } as AreaRect
            },

            divStyle: function (): CSSProp {
                let borderWidth = this.borderWidth;
                return {
                    position: "absolute",
                    left: borderWidth + 'px',
                    top: borderWidth + 'px',
                    width: (this.inlineRect.width - borderWidth * 2) + 'px',
                    height: (this.inlineRect.height - borderWidth * 2) + 'px',
                    overflow: 'hidden'
                }
            },

            borderStyle: function (): CSSProp {
                let {width, opacity, dashArray, color} = this.setting.Border;
                let {showAll, showBorder} = this.setting.Show;
                return showAll && showBorder
                    ? {
                        strokeWidth: width + 'px',
                        strokeDasharray: dashArray,
                        strokeOpacity: opacity,
                        stroke: color
                    }
                    : {}
            },

            backGroundStyle: function (): CSSProp {
                let {color, opacity} = this.setting.Background;
                let {showAll, showBackground} = this.setting.Show;
                return showAll && showBackground
                    ? {
                        fill: color,
                        fillOpacity: opacity
                    } : {}
            },

            activeStyle: function (): CSSProp {
                return Object.assign(this.borderStyle, this.backGroundStyle)
            },

            isSelected: function (): boolean {
                return this.svg.isSelected
            }
        },
        methods: {
            updateSize(start: PointMixed, end: PointMixed) {
                this.$emit('update-size', start, end, this.setting)
            },

            updateText(propName: string, value: string) {
                this.setting._text = value
            }
        },
        record: {
            status: 'empty',
            description: ''
        }
    })
</script>

<style scoped>

</style>
