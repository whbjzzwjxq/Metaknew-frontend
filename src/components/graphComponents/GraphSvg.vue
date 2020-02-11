<template>
    <rect-container :container="container" expand @update-size="updateSize" :is-selected="isSelected">
        <template v-slot:content>
        <svg :width="inlineRect.width" :height="inlineRect.height">
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
        </svg>
        </template>
        <div>
            <field-text-render
                :editing="isSelected"
                render-as-markdown
                :value="'12345'"
                @update-text="updateText"
            >

            </field-text-render>
        </div>
    </rect-container>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {SvgSettingPart} from "@/class/graphItem";
    import {RectByPoint} from "@/class/geometric";
    import RectContainer from "@/components/container/RectContainer.vue";
    import FieldTextRender from "@/components/field/FieldTextRender.vue";
    export default Vue.extend({
        name: "SvgBase",
        components: {
            RectContainer,
            FieldTextRender
        },
        data: function () {
            return {}
        },
        props: {
            svg: {
                type: Object as () => SvgSettingPart,
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
            setting: function (): SvgSetting {
                return this.svg.Setting
            },

            originPoints: function (): PointObject[] {
                return this.setting._points
            },

            label: function (): SvgLabel {
                return this.setting._label
            },

            rect: function (): AreaRect {
                return this.container.positiveRect()
            },

            inlineRect: function (): AreaRect {
                let {x, y, width, height} = this.rect;
                let borderWidth = this.setting.Border.width;
                return {
                    x: x - borderWidth,
                    y: y - borderWidth,
                    height: height - 2 * borderWidth,
                    width: width - 2 * borderWidth
                } as AreaRect
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
                return this.svg.State.isSelected
            }
        },
        methods: {
            updateSize(start: PointMixed, end: PointMixed) {
                this.$emit('update-size', start, end, this.setting)
            },

            updateText(propName: string, value: string) {
                this.setting.Text.inlineText = value
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
