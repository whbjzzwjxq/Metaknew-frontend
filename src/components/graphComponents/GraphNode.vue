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
            :x="textXOffset"
            :y="textYOffset"
            :width="textWidth"
            :height="textHeight">
            <p :style="textStyle">{{ setting._name }}</p>
        </foreignObject>

        <foreignObject
            v-show="showInlineText"
            :x="inlineTextXOffset"
            :y="inlineTextYOffset"
            :width="inlineTextWidth"
            :height="inlineTextHeight">
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

            //容器的尺寸信息
            container: {
                type: Object,
                required: true
            },

            //半径
            size: {
                type: Number,
                required: true
            },
            //缩放情况
            scale: {
                type: Number,
                required: true
            },

            point: {
                type: Object,
                required: true
            },

            mode: {
                type: String,
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
                    'fill': this.circleColor,
                    'fill-opacity': this.setting.Base.opacity & !this.showPic,
                    'stroke': this.borderColor,
                    'stroke-width': this.borderWidth,
                    'stroke-opacity': this.borderOpacity,
                    'stroke-dasharray': this.borderDash,
                }
            },

            //圆的颜色
            circleColor: function () {
                if (this.setting.Base.color !== '') {
                    return this.setting.Base.color
                } else {
                    this.$store.state.styleLabelColor[this.setting._type] ||
                    commitNewLabel([this.setting._type])
                    return this.$store.state.styleLabelColor[this.setting._type]
                }
            },
            //边框颜色
            borderColor: function () {
                if (this.setting.Border.color !== '') {
                    return this.setting.Border.color
                } else {
                    this.$store.state.styleLabelColor[this.setting._label] ||
                    commitNewLabel([this.setting._label])
                    return this.$store.state.styleLabelColor[this.setting._label]
                }
            },

            borderWidth: function () {
                return this.isSelected
                    ? this.setting.Border.width
                    : this.setting.Border.width
            },

            borderDash: function () {
                return this.setting.Border.isDash
                    ? '9, 2'
                    : ''
            },

            borderOpacity: function () {
                return !this.showBorder
                    ? 0
                    : this.isSelected
                        ? 1
                        : this.setting.Show.isMain
                            ? 0.7
                            : 0.5
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

            //     //
            //     // hoverStyle() {
            //     //     return {
            //     //         'fill': this.hoverColor,
            //     //         'opacity': this.hoverOpacity,
            //     //         'stroke': 'white',
            //     //         'stroke-width': 10,
            //     //         'stroke-opacity': 0
            //     //     }
            //     // },
            //     // hoverColor: this => this.setting.Show.isMain
            //     //     ? '#FFCA28'
            //     //     : this.circleColor,
            //     // hoverOpacity: this => this.setting.Show.showAll
            //     //     ? this.isSelected
            //     //         ? 0.2
            //     //         : this.state.isMouseOn
            //     //             ? 0.2
            //     //             : 0
            //     //     : 0,
            //     // hoverHeight: this => this.height + this.borderWidth + 5,
            //     // hoverWidth: this => this.width + this.borderWidth + 5,
            //     //
            //     // textStyle() {
            //     //     return {
            //     //         '-moz-user-select': 'none',
            //     //         'user-select': 'none',
            //     //         'fill': 'opposite',
            //     //         'font-size': this.textSize + 'px',
            //     //         'text-align': 'center',
            //     //         'word-break': 'break-all',
            //     //         'color': this.setting.Text.textColor
            //     //     }
            //     // },
            //     // textXOffset: this => -this.textWidth * 0.5,
            //     //
            //     // textYOffset: this => this.height + this.borderWidth + 5,
            //     //
            //     // textWidth: this => this.setting.Text.twoLine
            //     //     ? this.setting._name.length * 12
            //     //     : this.setting._name.length * 24,
            //     //
            //     // textHeight: this => this.setting.Text.twoLine
            //     //     ? (this.textSize + 5) * 2
            //     //     : (this.textSize + 5),
            //     //
            //     // textSize: this => this.setting.Text.textSize * this.scale >= 10
            //     //     ? this.setting.Text.textSize * this.scale
            //     //     : 10,
            //     //
            //     // inlineTextWidth: this => this.setting.Text.inlineTwoline
            //     //     ? this.setting.Text.inlineText.length * 12
            //     //     : this.setting.Text.inlineText.length * 24,
            //     //
            //     // inlineTextHeight: this => this.setting.Text.inlineTwoline
            //     //     ? (this.setting.Text.inlineTextSize + 5) * 2
            //     //     : (this.setting.Text.inlineTextSize + 5),
            //     //
            //     // inlineTextXOffset: this => -this.inlineTextWidth * 0.5,
            //     // inlineTextYOffset: this => -this.inlineTextHeight * 0.5,
            //     //
            //     // //todo 先将就着
            //     // inlineTextStyle() {
            //     //     return {
            //     //         '-moz-user-select': 'none',
            //     //         'user-select': 'none',
            //     //         'fill': 'opposite',
            //     //         'font-size': this.setting.Text.inlineTextSize + 'px',
            //     //         'text-align': 'center',
            //     //         'word-break': 'break-all',
            //     //         'color': this.setting.Text.inlineTextColor
            //     //     }
            //     // },
            //     //
            //     // imageStyle() {
            //     //     return {
            //     //         'clip-path': 'url(#' + this.getClipId + ')',
            //     //     }
            //     // },
            //     //
            //     // //使用vuex 主要是节约请求数
            //     // getMainPic: function () {
            //     //     return getSrc(this.setting._image)
            //     // },
            //     // getClipId: this => 'clipPath_' + this.setting._id,
            //     // rhombusPath: this => {
            //     //     let loc = [-this.width + ',0', '0,' + -this.height, this.width + ',0', '0,' + this.height]
            //     //     return loc.join(' ')
            //     // },
            //     // rhombusHoverPath: this => {
            //     //     let loc = [-this.hoverWidth + ',0', '0,' + -this.hoverHeight, this.hoverWidth + ',0', '0,' + this.hoverHeight]
            //     //     return loc.join(' ')
            //     // },
            //     // geometryType: this => this.setting.Base.type,
            //     //
            //     // boundGraph: this => this.$store.state.dataManager.graphManager[this.node.Setting._id],
            //
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
