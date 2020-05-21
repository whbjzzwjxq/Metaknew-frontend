<template>
    <div :class="flexClass" :style="contentStyle">
        <div>
            <icon-group
                :vertical="!vertical"
                :icon-list="iconListLeft"
                :container-style="{height: '100%'}"
                class-token="align-content-end">

            </icon-group>
        </div>
        <div
            v-for="item in activeItems"
            :key="getIndex(item)"
            class="py-0 px-1 pt-2"
            :draggable="draggable"
            @dragstart="dragStart(arguments[0], item)"
            @drag="drag(arguments[0], item)"
            @dragend="dragEnd(arguments[0], item)"
            @dragover.prevent="dragOver(arguments[0], item)"
            @drop.prevent="drop(arguments[0], item)"
        >
            <slot name="content" :item="item">

            </slot>
        </div>
        <v-spacer></v-spacer>
        <div>
            <icon-group
                :vertical="!vertical"
                :icon-list="iconListRight"
                :container-style="{height: '100%'}"
                class-token="align-content-end">

            </icon-group>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import IconGroup from "@/components/IconGroup.vue";
    import {getIcon} from "@/utils/icon";

    export default Vue.extend({
        name: "Queue",
        components: {
            IconGroup
        },
        data: function () {
            return {
                min: 0 as number,
                max: this.maxNum as number, //不超过1024个item
                buttonStyle: {
                    position: "absolute",
                    left: "12px",
                    right: "12px",
                    top: "50%"
                } as CSSProp,
                iconGroupStyle: {
                    position: 'relative',
                    top: '-22px' //large -> 44px的一半
                }
            }
        },
        props: {
            items: {
                type: Array as () => any[],
                required: true
            },
            vertical: {
                type: Boolean,
                default: false
            },
            maxNum: {
                type: Number,
                default: 6,
                validator(value: number): boolean {
                    return [12, 6, 4, 3, 2, 1].includes(value)
                }
            },
            draggable: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            flexClass: function (): string {
                return this.vertical
                    ? 'd-flex flex-column'
                    : 'd-flex flex-row'
            },
            activeItems: function (): any[] {
                return this.items.slice(this.min, this.max)
            },
            contentStyle: function (): CSSProp {
                return {
                    position: 'relative',
                    height: '100%',
                    width: '100%'
                }
            },
            iconListLeft: function (): IconItem[] {
                return [
                    {
                        name: getIcon('i-arrow', 'left'),
                        _func: this.moveBack,
                        toolTip: '向前一个内容'
                    }
                ]
            },
            iconListRight: function (): IconItem[] {
                return [
                    {
                        name: getIcon('i-arrow', 'right'),
                        _func: this.moveForward,
                        toolTip: '向后一个内容'
                    }
                ]
            },
            cols: function (): number {
                return Math.round(12 / this.maxNum)
            },
            len: function (): number {
                return this.items.length
            }
        },
        methods: {
            moveBack: function () {
                this.slide(-1)
            },
            moveForward: function () {
                this.slide(1)
            },
            slide: function (num: number) {
                if (this.min + num >= 0 && this.max + num <= this.len) {
                    this.min += num
                    this.max += num
                }
            },
            getIndex: function (item: any) {
                return this.items.indexOf(item)
            },
            dragStart: function ($event: DragEvent, item: any) {
                this.draggable && this.$emit('drag-start', $event, this.items, item)
            },
            dragEnd: function ($event: DragEvent, item: any) {
                this.draggable && this.$emit('drag-end', $event, this.items, item)
            },
            drag: function ($event: DragEvent, item: any) {
                this.draggable && this.$emit('drag-subitem', $event, this.items, item)
            },
            dragOver: function ($event: DragEvent, item: any) {
                this.draggable && this.$emit('drag-over', $event, this.items, item)
            },
            drop: function ($event: DragEvent, item: any) {
                this.draggable && this.$emit('drop', $event, this.items, item)
            },

        },
        watch: {
            len: function (): void {
                this.max = this.min + this.maxNum
                while (this.activeItems[this.max - 1] === undefined && this.min > 0) {
                    this.moveBack()
                }
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
