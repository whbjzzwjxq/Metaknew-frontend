<template>
    <g>
        <defs>
            <marker :id="arrowSetting._id"
                    :markerWidth="arrowLength * 2"
                    :markerHeight="arrowLength * 2"
                    orient="auto"
                    markerUnits="userSpaceOnUse">
                <path :d="arrowSetting.pathD"
                      fill="#222222"
                      fill-opacity="0.8"
                ></path>
            </marker>
        </defs>
        <line :x1=draw.x1 :x2=draw.x2 :y1=draw.y1 :y2=draw.y2 stroke="#222222">

        </line>
    </g>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {getPoint, getPointDistance, rectDiagonalDistance} from "@/class/geometric";

    export default Vue.extend({
        name: "LinkDefault",
        components: {},
        data: function () {
            return {}
        },
        props: {
            source: {
                type: Object as () => AreaRect,
                required: true
            },
            target: {
                type: Object as () => AreaRect,
                required: true
            },
            index: {
                type: Number,
                required: true
            },
            arrowLength: {
                type: Number,
                default: 4
            }
        },
        computed: {
            draw: function (): Record<string, number> {
                let source = this.source;
                let target = this.target;
                let distance = getPointDistance(source, target);
                // 算出起点位置和终点位置的大致半径
                let sourceR = rectDiagonalDistance(source) / 2;
                let targetR = rectDiagonalDistance(target) / 2;
                // delta的Point形式
                let deltaToPoint = getPoint(source).decrease(target).divide(distance);
                // 算出起点位置和终点位置的变化量
                const extraDelta = 1.4; // 变化量稍微放大
                let startDelta = deltaToPoint.copy().multi(sourceR).multi(extraDelta);
                // 终点是减小 所以有个负号
                let endDelta = startDelta.copy().multi(-targetR / sourceR).multi(extraDelta);

                let start = getPoint(source).decrease(startDelta);
                let end = getPoint(target).decrease(endDelta);

                return {
                    'x1': start.x, 'y1': start.y, 'x2': end.x, 'y2': end.y
                }
            },
            arrowSetting: function (): Record<string, any> {
                let length = this.arrowLength;
                let refX = length;
                let refY = length * 0.3;
                let L1 = `L${-refX}, ${-refY} `;
                let L2 = `L${-refX}, ${refY} `;
                let _id = 'arrowDefault_' + this.index;
                return {
                    _id,
                    length: length,
                    container: `${-length} ${-length} ${length * 2} ${length * 2}`,
                    pathD: 'M0,0 ' + L1 + L2 + 'z',
                }
            },
        },
        methods: {

        },
        record: {
            status: 'empty',
            description: ''
        }
    })
</script>

<style scoped>

</style>
