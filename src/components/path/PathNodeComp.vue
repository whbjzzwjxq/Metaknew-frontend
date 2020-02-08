<template>
    <g :transform=transform @mouseenter="mouseEnter" @mouseleave="mouseLeave" @click="click">
        <ellipse :rx="baseSize" :ry="baseSize" :style="colorStyle">

        </ellipse>
        <ellipse :rx="hoverSize" :ry="hoverSize" :style="hoverStyle">

        </ellipse>
    </g>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {IndexDouble} from "@/class/path";

    export default Vue.extend({
        name: "PathNodeComp",
        components: {},
        data: function () {
            return {
                isMouseOn: false
            }
        },
        props: {
            small: {
                type: Boolean,
                default: false
            },
            xSmall: {
                type: Boolean,
                default: false
            },
            large: {
                type: Boolean,
                default: false
            },
            xLarge: {
                type: Boolean,
                default: false
            },
            index: {
                type: Object as () => IndexDouble,
                required: true
            },
            point: {
                type: Object as () => PointObject,
                required: true
            }
        },
        computed: {
            transform: function (): string {
                return 'translate(' + this.point.x + ' ' + this.point.y + ')'
            },
            baseSize: function (): number {
                return this.xSmall
                    ? 8
                    : this.small
                        ? 12
                        : this.large
                            ? 24
                            : this.xLarge
                                ? 32
                                : 16
            },
            hoverSize: function (): number {
                return this.baseSize + 8
            },
            colorStyle: function (): CSSProp {
                return {
                    'fill': 'grey',
                    'fillOpacity': 0.6,
                    'stroke': 'grey',
                    'strokeWidth': '2px',
                    'strokeOpacity': 0.4,
                }
            },

            hoverStyle: function (): CSSProp {
                return {
                    'fill': 'grey',
                    'opacity': this.isMouseOn ? 0.2 : 0,
                    'stroke': 'grey',
                    'strokeWidth': '4px',
                    'strokeOpacity': this.isMouseOn ? 0.2 : 0
                }
            },

        },
        methods: {
            mouseEnter() {
                this.isMouseOn = true
            },
            mouseLeave() {
                this.isMouseOn = false
            },
            click() {
                this.$emit('click', this.index)
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
