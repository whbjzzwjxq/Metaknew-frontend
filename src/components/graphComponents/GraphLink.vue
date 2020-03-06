<template>
    <g>
        <defs>
            <marker :id="arrowSetting._id"
                    refX="0"
                    :refY="arrowSetting.refY"
                    :markerWidth="arrowSetting.length"
                    :markerHeight="arrowSetting.length"
                    orient="auto"
                    markerUnits="userSpaceOnUse"
                    :viewBox="arrowSetting.container">
                <path :d="arrowSetting.pathD"
                      :fill="setting.View.color"
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

        <foreignObject :x="midLocation.x - textSetting.width / 2" :y="midLocation.y"
                       :width="textSetting.width" :height="textSetting.height">
            <p :style="textStyle">{{ setting._label }}</p>
        </foreignObject>
    </g>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {LinkSettingPart} from "@/class/graphItem";
    import {getPoint, getPointDistance, rectDiagonalDistance} from "@/class/geometric";

    export default Vue.extend({
        name: 'GraphLink',
        data() {
            return {}
        },
        props: {
            link: {
                type: Object as () => LinkSettingPart,
                required: true
            },
            source: {
                type: Object as () => VisualNodeSetting,
                required: true
            },
            target: {
                type: Object as () => VisualNodeSetting,
                required: true
            },

            scale: {
                type: Number as () => number,
                default: 1
            },

            midLocation: {
                type: Object as () => PointObject,
                required: true
            }
        },
        computed: {
            setting: function (): LinkSetting {
                return this.link.Setting
            },

            // 说的是线型 不是'link'
            type: function (): string {
                return this.setting.View.viewType
            },

            draw: function (): Record<string, number> {
                let source = this.source;
                let target = this.target;
                let distance = getPointDistance(source, target);
                // 算出起点位置和终点位置的半径
                let sourceR = rectDiagonalDistance(source) / 2;
                let targetR = rectDiagonalDistance(target) / 2;

                // 算出起点位置和终点位置的变化量
                let startDelta = getPoint(source).decrease(target)
                    .multi(sourceR).divide(distance);
                // 终点是减小 所以有个负号
                let endDelta = startDelta.copy().multi(-targetR / sourceR);

                //关系实际的起点终点位置
                const locationDelta = function (
                    pointLoc: 'top' | 'bottom' | 'left' | 'right' | 'center',
                    rect: AreaRect, delta: PointMixed) {
                    let result = getPoint(rect);
                    switch (pointLoc) {
                        case 'top':
                            result.decrease({x: 0, y: rect.height / 2});
                            break;
                        case 'bottom':
                            result.add({x: 0, y: rect.height / 2});
                            break;
                        case 'left':
                            result.decrease({x: rect.width / 2, y: 0});
                            break;
                        case 'right':
                            result.add({x: rect.width / 2, y: 0});
                            break;
                        case 'center':
                            result.decrease(delta);
                    }
                    return result
                };

                let start = locationDelta(this.setting.View.startLoc, source, startDelta);
                let end = locationDelta(this.setting.View.endLoc, target, endDelta);

                return {
                    'x1': start.x, 'y1': start.y, 'x2': end.x, 'y2': end.y
                }
            },

            isSelected: function (): boolean {
                return this.link.isSelected
            },

            drawStyle: function (): CSSProp {
                return {
                    'stroke': this.setting.View.color,
                    'strokeWidth': this.setting.View.width + 'px',
                    'strokeDasharray': this.strokeDash,
                    'markerEnd': this.arrowSetting.show,
                    'fill': 'none',
                    'opacity': 0.3,
                }
            },

            hoverStyle: function (): CSSProp {
                return {
                    'stroke': this.drawStyle.stroke,
                    'strokeWidth': this.setting.View.width + 12 + 'px',
                    'fill': 'none',
                    'strokeOpacity': this.isSelected ? 0.05 : 0
                }
            },

            textStyle: function (): CSSProp {
                return {
                    'msUserSelect': 'none',
                    'userSelect': 'none',
                    'fill': 'opposite',
                    'fontSize': '12px',
                    'textAlign': 'center',
                    'color': this.setting.Text.textColor
                }
            },

            strokeDash: function (): string {
                return this.setting.View.dashArray
            },

            controlPoint: function (): PointMixed {
                return this.setting.View.direct === 'top'
                    ? {x: this.draw.x1, y: this.draw.y2}
                    : {x: this.draw.x2, y: this.draw.y1}
            },

            curvePath: function (): string {
                return [
                    'M', this.draw.x1, this.draw.y1,
                    'Q', this.controlPoint.x, this.controlPoint.y, this.draw.x2, this.draw.y2
                ].join(' ')
            },

            polylinePath: function (): string {
                return [
                    'M', this.draw.x1, this.draw.y1,
                    'L', this.controlPoint.x, this.controlPoint.y,
                    'L', this.draw.x2, this.draw.y2
                ].join(' ')
            },

            arrowSetting: function (): Record<string, any> {
                let setting = this.setting.Arrow;
                let length = setting.arrowLength;
                let refY = length * 0.2; // y方向上的变化量
                let L1 = 'L0,' + 0.4 * length + ' ';
                let L2 = 'L' + 0.7 * length + ',' + refY + ' ';
                let _id = 'arrow_' + this.link._id;
                return {
                    _id,
                    length: length * this.scale,
                    container: '0 0 ' + length + ' ' + length,
                    pathD: 'M0,0 ' + L1 + L2 + 'z',
                    show: setting.arrowShow ? 'url(#' + _id + ')' : '',
                    refY
                }
            },

            textSetting: function (): Record<string, any> {
                return {
                    width: this.link._label.length * 12,
                    height: 20
                }
            },

        },
        methods: {},
        record: {
            status: 'done',
            description: '关系显示',
            //todo 关系按钮和简要卡片
        }
    })
</script>

<style scoped>

</style>
/**
* Created by whb on 2019/12/31
* Updated by []
*/
