<template>
    <rect-container :container="container" expand @update-size="updateSize">
        <svg :width="rect.width" :height="rect.height">
            <polyline
                v-if="label === 'polyline'"
                :points="setting.Point"
            >

            </polyline>
            <polygon
                v-else-if="label === 'polyGon'"
                :points="setting.Point">

            </polygon>
            <rect
                v-else-if="label === 'rect'"
                width=""
                height=""
            >
            </rect>
            <ellipse
                v-else-if="label === 'ellipse'"
                rx=""
                ry="">

            </ellipse>
        </svg>
        <div>
            <field-text-render
                :editing="isSelected"
                render-as-markdown
                :value="setting.Text.inlineText"
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
                let {color, opacity} = this.setting.BackGround;
                let {showAll, showBackground} = this.setting.Show;
                return showAll && showBackground
                    ? {
                        fill: color,
                        fillOpacity: opacity
                    } : {}
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
