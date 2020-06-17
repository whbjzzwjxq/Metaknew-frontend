<template>
    <g
        :transform=transform
        @mouseenter="mouseEnter"
        @mouseleave="mouseLeave"
        @click="click"
        @drop.prevent="drop"
    >
        <ellipse :rx="position.width" :ry="position.height" :style="colorStyle">

        </ellipse>
        <ellipse :rx="hoverSize.width" :ry="hoverSize.height" :style="hoverStyle">

        </ellipse>
    </g>
</template>

<script lang="ts">
    import Vue from 'vue'

    export default Vue.extend({
        name: "NodeDefault",
        components: {},
        data: function () {
            return {
                isMouseOn: false
            }
        },
        props: {
            position: {
                type: Object as () => AreaRect,
                required: true
            }
        },
        computed: {
            transform: function (): string {
                return 'translate(' + this.position.x + ' ' + this.position.y + ')'
            },
            hoverSize: function (): RectObject {
                return {
                    width: this.position.width + 8,
                    height: this.position.height + 8
                }
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
                this.$emit('click')
            },
            drop() {
                this.$emit('drop')
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
