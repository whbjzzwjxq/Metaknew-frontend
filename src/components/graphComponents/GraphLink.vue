<template>
    <g>
        <defs>
            <marker :id="getArrowId"
                    refX="0"
                    :refY="arrowRefY"
                    :markerWidth="this.arrowLength"
                    :markerHeight="this.arrowLength"
                    orient="auto"
                    markerUnits="userSpaceOnUse"
                    :viewBox="arrowViewBox">
                <path :d="arrowPathD"
                      :fill="this.setting.Base.color"
                      :fill-opacity="0.8"
                ></path>
            </marker>
        </defs>
        <template v-if="type === 'linear'">
            <line :x1=draw.x1 :x2=draw.x2 :y1=draw.y1 :y2=draw.y2 :style=hoverStyle>

            </line>
            <line :x1=draw.x1 :x2=draw.x2 :y1=draw.y1 :y2=draw.y2 :style=drawStyle>

            </line>
        </template>
        <template v-if="type === 'curve'">
            <path :d="curvePath" :style=hoverStyle></path>
            <path :d="curvePath" :style=drawStyle></path>
        </template>

        <template v-if="type === 'polyline'">
            <path :d="polylinePath" :style=hoverStyle></path>
            <path :d="polylinePath" :style=drawStyle></path>
        </template>

        <foreignObject :x="midLocation.x" :y="midLocation.y"
                       :width="textWidth" :height="textHeight">
            <p :style="textStyle">{{ setting._label }}</p>
        </foreignObject>
    </g>
</template>

<script lang="js">
    export default {
        name: 'GraphLink',
        data () {
            return {
                setting: this.link.Setting,
            }
        },
        props: {
            link: {
                type: Object,
                required: true
            },
            source: {
                type: Object,
                required: true
            },
            target: {
                type: Object,
                required: true
            },

            scale: {
                type: Number,
                required: true
            },

            midLocation: {
                type: Object,
                required: true
            }

        },
        computed: {
            draw () {
                let source = this.source
                let target = this.target
                let x1 = source.x
                let y1 = source.y
                let x2 = target.x
                let y2 = target.y
                let distance = (Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)))
                let sourceR = (Math.sqrt(Math.pow(source.width, 2) + Math.pow(source.height, 2)))
                let targetR = (Math.sqrt(Math.pow(target.width, 2) + Math.pow(target.height, 2)))
                let xSourceDelta = sourceR / distance * Math.abs(x1 - x2)
                let ySourceDelta = sourceR / distance * Math.abs(y1 - y2)
                let xTargetDelta = targetR / distance * Math.abs(x1 - x2)
                let yTargetDelta = targetR / distance * Math.abs(y1 - y2)
                let result = {
                    'x1': 0, 'y1': 0, 'x2': 0, 'y2': 0
                }
                switch (this.setting.Base.startLoc) {
                    case 'top':
                        result.x1 = source.x
                        result.y1 = source.y - source.height
                        break
                    case 'bottom':
                        result.x1 = source.x
                        result.y1 = source.y + source.height
                        break
                    case 'left':
                        result.x1 = source.x - source.width
                        result.y1 = source.y
                        break
                    case 'right':
                        result.x1 = source.x + source.width
                        result.y1 = source.y
                        break
                    case 'center':
                        result.x1 = x1 < x2 ? x1 + xSourceDelta : x1 - xSourceDelta
                        result.y1 = y1 < y2 ? y1 + ySourceDelta : y1 - ySourceDelta
                }
                switch (this.setting.Base.endLoc) {
                    case 'top':
                        result.x2 = target.x
                        result.y2 = target.y - target.height
                        break
                    case 'bottom':
                        result.x2 = target.x
                        result.y2 = target.y + target.height
                        break
                    case 'left':
                        result.x2 = target.x - target.width
                        result.y2 = target.y
                        break
                    case 'right':
                        result.x2 = target.x + target.width
                        result.y2 = target.y
                        break
                    case 'center':
                        result.x2 = x1 < x2 ? x2 - xTargetDelta : x2 + xTargetDelta
                        result.y2 = y1 < y2 ? y2 - yTargetDelta : y2 + yTargetDelta
                }
                return result
            },

            isSelected: vm => vm.link.isSelected,

            drawStyle () {
                return {
                    'stroke': this.setting.Base.color,
                    'stroke-width': this.setting.Base.width,
                    'stroke-dasharray': this.strokeDash,
                    'marker-end': this.showArrow,
                    'fill': 'none',
                    'opacity': 0.3,
                }
            },
            hoverStyle () {
                return {
                    'stroke': this.drawStyle.stroke,
                    'stroke-width': this.setting.Base.width + 12,
                    'fill': 'none',
                    'stroke-opacity': 0.05 * (1 & this.isSelected)
                }
            },

            strokeDash: vm => vm.setting.Base.isDash
                ? '9, 2'
                : '',

            controlX: vm => vm.setting.Base.direct === 'top'
                ? vm.draw.x1
                : vm.draw.x2,

            controlY: vm => vm.setting.Base.direct === 'top'
                ? vm.draw.y2
                : vm.draw.y1,

            //是否显示箭头
            showArrow: vm => vm.setting.Arrow.showArrow
                ? 'url(#' + vm.getArrowId + ')'
                : '',

            getArrowId: vm => 'arrow_' + vm.setting._id,

            arrowLength: vm => vm.setting.Arrow.arrowLength * vm.scale,

            arrowRefY: vm => vm.setting.Arrow.arrowLength * 0.2,

            arrowViewBox: vm => '0 0 ' + vm.arrowLength + ' ' + vm.arrowLength,

            arrowPathD () {
                let L1 = 'L0,' + 0.4 * this.arrowLength + ' '
                let L2 = 'L' + 0.7 * this.arrowLength + ',' + this.arrowRefY + ' '
                return 'M0,0 ' + L1 + L2 + 'z'
            },
            curvePath: vm => [
                'M', vm.draw.x1, vm.draw.y1,
                'Q', vm.controlX, vm.controlY, vm.draw.x2, vm.draw.y2
            ].join(' '),

            polylinePath: vm => [
                'M', vm.draw.x1, vm.draw.y1,
                'L', vm.controlX, vm.controlY,
                'L', vm.draw.x2, vm.draw.y2
            ].join(' '),

            textStyle () {
                return {
                    '-moz-user-select': 'none',
                    'user-select': 'none',
                    'fill': 'opposite',
                    'font-size': '12px',
                    'text-align': 'center',
                    'color': this.setting.Text.textColor
                }
            },

            textWidth: vm => vm.setting._label.length * 12,
            textHeight: () => 20,

            type: vm => vm.link.Setting.Base.type,

        },
        methods: {}
    }
</script>

<style scoped>

</style>
