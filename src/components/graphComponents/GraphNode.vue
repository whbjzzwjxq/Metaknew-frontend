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
    import { commitNewLabel } from '@/store/modules/_mutations'
    import { getSrc } from '@/utils/utils'
    import Vue from 'vue'
    export default Vue.extend({
        name: 'GraphNode',
        components: {},
        data () {
            return {}
        },
        props: {
            //基础数据
            node: {
                type: Object,
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
            transform: vm => 'translate(' + vm.point.x + ' ' + vm.point.y + ')',

            setting: vm => vm.node.Setting,
            state: vm => vm.node.State,

            isSelected: vm => vm.state.isSelected,

            getId: vm => 'normalNode' + vm.setting._id,

            //注意是实际二分之一的高度
            height: vm => vm.setting.Base.size !== 0
                ? vm.setting.Base.size * vm.scale
                : vm.size * vm.scale,

            //注意是实际二分之一的宽度
            width: vm => vm.height * vm.setting.Base.scaleX,

            colorStyle: function() {
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
            circleColor () {
                if (this.setting.Base.color !== '') {
                    return this.setting.Base.color
                } else {
                    this.$store.state.styleLabelColor[this.setting._type] ||
                    commitNewLabel([this.setting._type])
                    return this.$store.state.styleLabelColor[this.setting._type]
                }
            },
            //边框颜色
            borderColor () {
                if (this.setting.Border.color !== '') {
                    return this.setting.Border.color
                } else {
                    this.$store.state.styleLabelColor[this.setting._label] ||
                    commitNewLabel([this.setting._label])
                    return this.$store.state.styleLabelColor[this.setting._label]
                }
            },

            borderWidth: vm => vm.isSelected
                ? vm.setting.Border.width
                : vm.setting.Border.width,

            borderDash: vm => vm.setting.Border.isDash
                ? '9, 2'
                : '',

            borderOpacity: vm => !vm.showBorder
                ? 0
                : vm.isSelected
                    ? 1
                    : vm.setting.Show.isMain
                        ? 0.7
                        : 0.5,

            //是否显示文字
            showText: vm => vm.setting.Show.showAll && vm.setting.Show.showName && !vm.state.isMouseOn,

            //是否显示内部文字
            showInlineText: vm => vm.setting.Show.showAll && vm.setting.Show.showInlineText,

            //是否显示图片
            showPicture: vm =>
                vm.setting._image &&
                vm.setting.Show.showAll &&
                vm.setting.Show.showPic &&
                vm.height >= 16,

            //是否显示颜色图案
            showColor: vm =>
                vm.setting.Show.showAll &&
                vm.setting.Show.showColor,

            //是否显示边
            showBorder: vm => vm.setting.Show.showAll && vm.setting.Show.showBorder,

            hoverStyle () {
                return {
                    'fill': this.hoverColor,
                    'opacity': this.hoverOpacity,
                    'stroke': 'white',
                    'stroke-width': 10,
                    'stroke-opacity': 0
                }
            },
            hoverColor: vm => vm.setting.Show.isMain
                ? '#FFCA28'
                : vm.circleColor,
            hoverOpacity: vm => vm.setting.Show.showAll
                ? vm.isSelected
                    ? 0.2
                    : vm.state.isMouseOn
                        ? 0.2
                        : 0
                : 0,
            hoverHeight: vm => vm.height + vm.borderWidth + 5,
            hoverWidth: vm => vm.width + vm.borderWidth + 5,

            textStyle () {
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
            textXOffset: vm => -vm.textWidth * 0.5,

            textYOffset: vm => vm.height + vm.borderWidth + 5,

            textWidth: vm => vm.setting.Text.twoLine
                ? vm.setting._name.length * 12
                : vm.setting._name.length * 24,

            textHeight: vm => vm.setting.Text.twoLine
                ? (vm.textSize + 5) * 2
                : (vm.textSize + 5),

            textSize: vm => vm.setting.Text.textSize * vm.scale >= 10
                ? vm.setting.Text.textSize * vm.scale
                : 10,

            inlineTextWidth: vm => vm.setting.Text.inlineTwoline
                ? vm.setting.Text.inlineText.length * 12
                : vm.setting.Text.inlineText.length * 24,

            inlineTextHeight: vm => vm.setting.Text.inlineTwoline
                ? (vm.setting.Text.inlineTextSize + 5) * 2
                : (vm.setting.Text.inlineTextSize + 5),

            inlineTextXOffset: vm => -vm.inlineTextWidth * 0.5,
            inlineTextYOffset: vm => -vm.inlineTextHeight * 0.5,

            //todo 先将就着
            inlineTextStyle () {
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

            imageStyle () {
                return {
                    'clip-path': 'url(#' + this.getClipId + ')',
                }
            },

            //使用vuex 主要是节约请求数
            getMainPic: function () {
                return getSrc(this.setting._image)
            },
            getClipId: vm => 'clipPath_' + vm.setting._id,
            rhombusPath: vm => {
                let loc = [-vm.width + ',0', '0,' + -vm.height, vm.width + ',0', '0,' + vm.height]
                return loc.join(' ')
            },
            rhombusHoverPath: vm => {
                let loc = [-vm.hoverWidth + ',0', '0,' + -vm.hoverHeight, vm.hoverWidth + ',0', '0,' + vm.hoverHeight]
                return loc.join(' ')
            },
            geometryType: vm => vm.setting.Base.type,

            boundGraph: vm => vm.$store.state.dataManager.graphManager[vm.node.Setting._id],

        },
        methods: {
            explode () {
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
