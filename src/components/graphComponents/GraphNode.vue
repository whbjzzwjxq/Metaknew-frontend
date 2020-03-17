<template>
    <g :id="getId" :transform=transform>
        <template v-if="geometryType === 'ellipse'">
            <defs>
                <clipPath :id="getClipId">
                    <ellipse :rx="width" :ry="height">

                    </ellipse>
                </clipPath>
            </defs>
            <ellipse :rx="width" :ry="height" :style="colorStyle" v-show="showFill">

            </ellipse>
            <image :height="height * 2" :href="getMainPic" :style="imageStyle" :width="width * 2" :x="-width"
                   :y="-height" v-if="showPicture">

            </image>
            <ellipse :rx="hoverWidth" :ry="hoverHeight" :style="hoverStyle">

            </ellipse>
        </template>

        <template v-else-if="geometryType === 'rectangle'">
            <defs>
                <clipPath :id="getClipId">
                    <rect :height="height * 2" :width="width * 2" :x="-width" :y="-height">

                    </rect>
                </clipPath>
            </defs>
            <rect :style="colorStyle" :height="height * 2" :width="width * 2" :x="-width" :y="-height"
                  v-show="showFill">

            </rect>
            <image :height="height * 2" :href="getMainPic" :style="imageStyle" :width="width * 2" :x="-width"
                   :y="-height" v-if="showPicture">

            </image>
            <rect :width="hoverWidth * 2" :height="hoverHeight * 2" :x="-hoverWidth" :y="-hoverHeight"
                  :style="hoverStyle">

            </rect>
        </template>

        <template v-else-if="geometryType === 'rhombus'">
            <defs>
                <clipPath :id="getClipId">
                    <polygon :points="rhombusPath">

                    </polygon>
                </clipPath>
            </defs>
            <polygon :style="colorStyle" :points="rhombusPath" v-show="showFill">

            </polygon>
            <image :height="height * 2" :href="getMainPic" :style="imageStyle" :width="width * 2" :x="-width"
                   :y="-height" v-if="showPicture">

            </image>
            <polygon :style="hoverStyle" :points="rhombusHoverPath">

            </polygon>
        </template>

        <foreignObject
            v-show="showText"
            :x="textSetting.offsetX"
            :y="textSetting.offsetY"
            :width="textSetting.width"
            :height="textSetting.height">
            <p :style="textStyle">{{ setting._name }}</p>
        </foreignObject>

        <foreignObject
            v-show="showInlineText"
            :x="inlineTextSetting.offsetX"
            :y="inlineTextSetting.offsetY"
            :width="inlineTextSetting.width"
            :height="inlineTextSetting.height">
            <p :style="inlineTextStyle">{{ setting.Text.inlineText }}</p>
        </foreignObject>

    </g>
</template>

<script lang="ts">
    import {commitNewLabel} from '@/store/modules/_mutations'
    import {getSrc} from '@/utils/utils'
    import Vue from 'vue'
    import {GraphSelfPart, NodeSettingPart} from "@/class/graphItem";

    export default Vue.extend({
        name: 'GraphNode',
        components: {},
        data: function () {
            return {}
        },
        props: {

            node: {
                type: Object as () => NodeSettingPart,
                required: true
            },

            // 默认半径
            size: {
                type: Number as () => number,
                default: 12
            },

            //缩放情况
            scale: {
                type: Number as () => number,
                default: 1
            },

            // 所处位置
            point: {
                type: Object as () => PointMixed,
                required: true
            },

            // 模式
            mode: {
                type: String as () => string,
                default: 'normal'
            },
        },
        computed: {
            transform: function (): string {
                return 'translate(' + this.point.x + ' ' + this.point.y + ')'
            },

            setting: function (): NodeSetting {
                return this.node.Setting
            },

            state: function (): NodeState {
                return this.node.State
            },

            isSelected: function (): boolean {
                return this.state.isSelected
            },

            getId: function (): string {
                return 'normalNode' + this.setting._id
            },

            //注意是实际二分之一的高度
            width: function (): number {
                return this.setting.Base.size !== 0
                    ? this.setting.Base.size * this.scale
                    : this.size * this.scale
            },

            //注意是实际二分之一的宽度
            height: function (): number {
                return this.width * this.setting.Base.scaleX
            },

            colorStyle: function (): CSSProp {
                return {
                    'fill': this.fillColor,
                    'fillOpacity': !this.showPicture ? this.setting.View.opacity : 0,
                    'stroke': this.borderSetting.color,
                    'strokeWidth': this.borderSetting.width,
                    'strokeOpacity': this.borderSetting.opacity,
                    'strokeDasharray': this.borderSetting.dash,
                }
            },

            //填充的颜色
            fillColor: function (): string {
                if (this.setting.View.color !== '') {
                    return this.setting.View.color
                } else {
                    this.$store.state.styleLabelColor[this.node._type] ||
                    commitNewLabel([this.node._type]);
                    return this.$store.state.styleLabelColor[this.node._type]
                }
            },

            //border的形式
            borderSetting: function (): Record<string, any> {
                let color;
                if (this.setting.Border.color !== '') {
                    color = this.setting.Border.color
                } else {
                    this.$store.state.styleLabelColor[this.node._label] ||
                    commitNewLabel([this.node._label]);
                    color = this.$store.state.styleLabelColor[this.node._label]
                }
                return {
                    color,
                    width: this.isSelected
                        ? this.setting.Border.width
                        : this.setting.Border.width,
                    dash: this.setting.Border.isDash
                        ? '9, 2'
                        : '',
                    opacity: !this.showBorder
                        ? 0
                        : this.isSelected
                            ? 1
                            : this.setting.View.isMain
                                ? 0.7
                                : 0.5
                }
            },

            showText: function (): boolean {
                return this.setting.Show.showAll && this.setting.Show.showName && !this.state.isMouseOn
            },
            showInlineText: function (): boolean {
                return this.setting.Show.showAll && this.setting.Show.showInlineText
            },
            showPicture: function (): boolean {
                return this.setting._image !== '' &&
                    this.setting.Show.showAll &&
                    this.setting.Show.showImage &&
                    this.height >= 12
            },
            showFill: function (): boolean {
                return this.setting.Show.showAll &&
                    this.setting.Show.showBackground
            },

            //是否显示边
            showBorder: function (): boolean {
                return this.setting.Show.showAll && this.setting.Show.showBorder
            },

            hoverStyle: function (): CSSProp {
                return {
                    'fill': this.hoverColor,
                    'opacity': this.hoverOpacity,
                    'stroke': 'white',
                    'strokeWidth': '10px',
                    'strokeOpacity': 0
                }
            },
            hoverColor: function (): string {
                return this.setting.View.isMain
                    ? '#FFCA28'
                    : this.fillColor
            },
            hoverOpacity: function (): number {
                return this.setting.Show.showAll
                    ? this.isSelected
                        ? 0.2
                        : this.state.isMouseOn
                            ? 0.2
                            : 0
                    : 0
            },

            hoverHeight: function (): number {
                return this.height + this.borderSetting.width + 5
            },

            hoverWidth: function (): number {
                return this.width + this.borderSetting.width + 5
            },

            textStyle: function (): CSSProp {
                return {
                    'MozUserSelect': 'none',
                    'userSelect': 'none',
                    'fill': 'opposite',
                    'fontSize': this.textSetting.size + 'px',
                    'textAlign': 'center',
                    'wordBreak': 'break-all',
                    'color': this.setting.Text.textColor
                }
            },
            textSetting: function (): Record<string, any> {
                let size = this.setting.Text.textSize * this.scale >= 10
                    ? this.setting.Text.textSize * this.scale
                    : 10;
                let width = this.setting.Text.textBreak
                    ? this.setting._name.length * 18 * this.scale
                    : this.setting._name.length * 36 * this.scale;
                let height = this.setting.Text.textBreak
                    ? (size + 5) * 2
                    : (size + 5);
                return {
                    offsetX: -width * 0.5,
                    offsetY: this.height + (this.borderSetting.width + 5) * this.scale,
                    width,
                    height,
                    size
                }
            },

            inlineTextStyle: function (): CSSProp {
                return {
                    'MozUserSelect': 'none',
                    'userSelect': 'none',
                    'fill': 'opposite',
                    'fontSize': this.setting.Text.inlineTextSize + 'px',
                    'textAlign': 'center',
                    'wordBreak': 'break-all',
                    'color': this.setting.Text.inlineTextColor,
                }
            },

            inlineTextSetting: function (): Record<string, any> {
                let width = this.setting.Text.inlineTextBreak
                    ? this.setting.Text.inlineText.length * 12
                    : this.setting.Text.inlineText.length * 24;
                let height = this.setting.Text.inlineTextBreak
                    ? (this.setting.Text.inlineTextSize + 5) * 2
                    : (this.setting.Text.inlineTextSize + 5);
                return {
                    width,
                    height,
                    offsetX: -width * 0.5,
                    offsetY: -height * 0.5
                }
            },

            imageStyle: function (): CSSProp {
                return {
                    'clipPath': 'url(#' + this.getClipId + ')',
                }
            },

            getMainPic: function (): string {
                return getSrc(this.setting._image)
            },
            getClipId: function (): string {
                return 'clipPath_' + this.node._id
            },
            rhombusPath: function (): string {
                let loc = [-this.width + ',0', '0,' + -this.height, this.width + ',0', '0,' + this.height];
                return loc.join(' ')
            },
            rhombusHoverPath: function (): string {
                let loc = [-this.hoverWidth + ',0', '0,' + -this.hoverHeight, this.hoverWidth + ',0', '0,' + this.hoverHeight];
                return loc.join(' ')
            },
            geometryType: function (): NodeViewType {
                return this.setting.View.viewType
            },

            boundGraph: function (): GraphSelfPart {
                return this.$store.state.dataManager.graphManager[this.node._id]
            }
        },
        methods: {},
        watch: {},
        record: {
            status: 'done',
            description: 'Node组件'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/6
* Updated by [whb on 2020年1月9日02:14:30]
*/
