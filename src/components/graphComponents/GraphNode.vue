<template>
    <g
        :id="getId"
        :transform=transform
    >
        <template v-if="geometryType === 'ellipse'">
            <defs>
                <clipPath :id="getClipId">
                    <ellipse :rx="width" :ry="height">

                    </ellipse>
                </clipPath>
            </defs>
            <ellipse :rx="width" :ry="height" :style="colorStyle" v-show="showColor">

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
                  v-show="showColor">

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
            <polygon :style="colorStyle" :points="rhombusPath" v-show="showColor">

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
    import {NodeSettingPart} from "@/utils/graphClass";

    export default Vue.extend({
        name: 'GraphNode',
        components: {},
        data() {
            return {}
        },
        props: {
            //基础数据
            node: {
                type: Object as () => NodeSettingPart,
                required: true,
            },

            //半径
            size: {
                type: Number as () => number,
                required: true
            },
            //缩放情况
            scale: {
                type: Number as () => number,
                required: true
            },

            point: {
                type: Object as () => PointMixed,
                required: true
            },

            mode: {
                type: String as () => string,
                default: 'normal'
            },
        },
        computed: {
            transform: function () {
                return 'translate(' + this.point.x + ' ' + this.point.y + ')'
            },

            setting: function () {
                return this.node.Setting
            },
            state: function () {
                return this.node.State
            },

            isSelected: function () {
                return this.state.isSelected
            },

            getId: function () {
                return 'normalNode' + this.setting._id
            },

            //注意是实际二分之一的高度
            height: function () {
                return this.setting.Base.size !== 0
                    ? this.setting.Base.size * this.scale
                    : this.size * this.scale
            },

            //注意是实际二分之一的宽度
            width: function () {
                return this.height * this.setting.Base.scaleX
            },

            colorStyle: function (): CSSProp {
                return {
                    'fill': this.fillColor,
                    'fill-opacity': this.setting.Base.opacity & !this.showPic,
                    'stroke': this.borderSetting.Color,
                    'stroke-width': this.borderSetting.width,
                    'stroke-opacity': this.borderSetting.opacity,
                    'stroke-dasharray': this.borderSetting.dash,
                }
            },

            //填充的颜色
            fillColor: function () {
                if (this.setting.Base.color !== '') {
                    return this.setting.Base.color
                } else {
                    this.$store.state.styleLabelColor[this.setting._type] ||
                    commitNewLabel([this.setting._type]);
                    return this.$store.state.styleLabelColor[this.setting._type]
                }
            },

            //border的形式
            borderSetting: function () {
                let color;
                if (this.setting.Border.color !== '') {
                    color = this.setting.Border.color
                } else {
                    this.$store.state.styleLabelColor[this.setting._label] ||
                    commitNewLabel([this.setting._label]);
                    color = this.$store.state.styleLabelColor[this.setting._label]
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
                            : this.setting.Show.isMain
                                ? 0.7
                                : 0.5
                }
            },

            showText: function () {
                return this.setting.Show.showAll && this.setting.Show.showName && !this.state.isMouseOn
            },
            showInlineText: function () {
                return this.setting.Show.showAll && this.setting.Show.showInlineText
            },
            showPicture: function () {
                return this.setting._image &&
                    this.setting.Show.showAll &&
                    this.setting.Show.showPic &&
                    this.height >= 16
            },
            showColor: function () {
                return this.setting.Show.showAll &&
                    this.setting.Show.showColor
            },

            //是否显示边
            showBorder: function () {
                return this.setting.Show.showAll && this.setting.Show.showBorder
            },

            hoverStyle: function () {
                return {
                    'fill': this.hoverColor,
                    'opacity': this.hoverOpacity,
                    'stroke': 'white',
                    'stroke-width': 10,
                    'stroke-opacity': 0
                }
            },
            hoverColor: function () {
                return this.setting.Show.isMain
                    ? '#FFCA28'
                    : this.fillColor
            },
            hoverOpacity: function () {
                return this.setting.Show.showAll
                    ? this.isSelected
                        ? 0.2
                        : this.state.isMouseOn
                            ? 0.2
                            : 0
                    : 0
            },

            hoverHeight: function () {
                return this.height + this.borderSetting.width + 5
            },

            hoverWidth: function () {
                return this.width + this.borderSetting.width + 5
            },

            textStyle: function (): CSSProp {
                return {
                    '-moz-user-select': 'none',
                    'user-select': 'none',
                    'fill': 'opposite',
                    'font-size': this.textSize + 'px',
                    'text-align': 'center',
                    'word-break': 'break-all',
                    'color': this.setting.Text.textColor
                }
            },
            textSetting: function () {
                let size = this.setting.Text.textSize * this.scale >= 10
                    ? this.setting.Text.textSize * this.scale
                    : 10;
                let width = this.setting.Text.twoLine
                    ? this.setting._name.length * 12
                    : this.setting._name.length * 24;
                let height = this.setting.Text.twoLine
                    ? (size + 5) * 2
                    : (size + 5);
                return {
                    offsetX: -this.width * 0.5,
                    offsetY: height + this.borderSetting.width + 5,
                    width,
                    height,
                    size
                }
            },

            //todo 先将就着
            inlineTextStyle: function (): CSSProp {
                return {
                    '-moz-user-select': 'none',
                    'user-select': 'none',
                    'fill': 'opposite',
                    'font-size': this.setting.Text.inlineTextSize + 'px',
                    'text-align': 'center',
                    'word-break': 'break-all',
                    'color': this.setting.Text.inlineTextColor
                }
            },

            inlineTextSetting: function () {
                let width = this.setting.Text.inlineTwoline
                    ? this.setting.Text.inlineText.length * 12
                    : this.setting.Text.inlineText.length * 24;
                let height = this.setting.Text.inlineTwoline
                    ? (this.setting.Text.inlineTextSize + 5) * 2
                    : (this.setting.Text.inlineTextSize + 5);
                return {
                    width,
                    height,
                    offsetX: -width * 0.5,
                    offsetY: -height * 0.5
                }
            },

            imageStyle: function () {
                return {
                    'clip-path': 'url(#' + this.getClipId + ')',
                }
            },

            getMainPic: function () {
                return getSrc(this.setting._image)
            },
            getClipId: function () {
                return 'clipPath_' + this.setting._id
            },
            rhombusPath: function () {
                let loc = [-this.width + ',0', '0,' + -this.height, this.width + ',0', '0,' + this.height];
                return loc.join(' ')
            },
            rhombusHoverPath: function () {
                let loc = [-this.hoverWidth + ',0', '0,' + -this.hoverHeight, this.hoverWidth + ',0', '0,' + this.hoverHeight];
                return loc.join(' ')
            },
            geometryType: function () {
                return this.setting.Base.type
            },

            boundGraph: function () {
                return this.$store.state.dataManager.graphManager[this.node.Setting._id]
            },

        },
        methods: {
            explode() {
                this.$emit('explode')
            }
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
* Created by whb on 2019/12/6
* Updated by []
*/
