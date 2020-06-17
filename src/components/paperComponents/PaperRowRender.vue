<template>
    <div class="d-flex flex-row cardItem" :style="{height: height + 'px', overflowX: isOverflowX}">
        <div v-if="editMode" class="ml-n1 pr-1 d-flex flex-row">
            <icon-group
                :icon-list="rowIconList"
                vertical
                small
            >

            </icon-group>
            <icon-group
                :icon-list="rowSizeIconList"
                vertical
                small>

            </icon-group>
        </div>
        <card-paper-all
            :draggable="editMode"
            :row="row"
            :setting="subItem.Setting"
            :state="subItem.State"
            :edit-mode="editMode"
            @drag-start-card="dragStartCard(arguments[0], subItem)"
            @drag-card="dragCard(arguments[0], subItem)"
            @drag-end-card="dragEndCard(arguments[0], subItem)"
            @drag-enter-card="dragEnterCard(arguments[0], subItem)"
            @drop-card="dropCard(arguments[0], subItem)"
            @delete-item="_deleteItem(subItem)"
            :id="getId(subItem)"
            :key="index"
            v-for="(subItem, index) in row.children">
        </card-paper-all>
        <div @dragenter="dragEnterCard(arguments[0], undefined)"
             @dragover.prevent
             @drop.prevent="dropCard(arguments[0], undefined)"
             class="pa-0 flex-grow-1 order-last"
             v-if="editMode">
            <paper-empty-card>

            </paper-empty-card>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import PaperEmptyCard from "@/components/paperComponents/PaperEmptyCard.vue";
    import CardPaperAll from "@/components/paperComponents/CardPaperAll.vue";
    import IconGroup from "@/components/IconGroup.vue";
    import {getIcon} from "@/utils/icon";
    import {DocumentItemSettingPart} from "@/class/settingBase";
    import {DragEventWithTarget} from "@/interface/interfaceInComponent";
    import {PaperRow} from "@/class/settingPaper";

    export default Vue.extend({
        name: "PaperRowRender",
        components: {
            PaperEmptyCard,
            CardPaperAll,
            IconGroup
        },
        data: function () {
            return {
                minHeight: PaperRow.minHeight,
                maxHeight: PaperRow.maxHeight
            }
        },
        props: {
            editMode: {
                type: Boolean,
                default: false
            },
            row: {
                type: Object as () => PaperRow,
                required: true
            }
        },
        computed: {
            rowIconList: function (): IconItem[] {
                return [
                    {
                        name: getIcon('i-arrow-double', 'up'),
                        _func: this._arrowDoubleUp,
                        toolTip: '向上移动到顶端'
                    },
                    {
                        name: getIcon('i-arrow', 'up'),
                        _func: this._arrowUp,
                        toolTip: '向上移动一行'
                    },
                    {
                        name: getIcon('i-arrow', 'down'),
                        _func: this._arrowDown,
                        toolTip: '向下移动一行'
                    },
                    {
                        name: getIcon('i-arrow-double', 'down'),
                        _func: this._arrowDoubleDown,
                        toolTip: '向下移动到低端'
                    },
                    {
                        name: getIcon('i-edit', 'plus'),
                        _func: this._insertRow,
                        toolTip: '在之后插入一行'
                    },
                    {
                        name: getIcon('i-edit', 'decrease'),
                        _func: this._deleteRow,
                        toolTip: '删除该行'
                    },
                ]
            },
            rowSizeIconList: function (): IconItem[] {
                return [
                    {
                        name: getIcon('i-resize', 'plus'),
                        _func: this.changeHeight,
                        payload: 120,
                        toolTip: '增高120像素',
                        disabled: !this.checkAvailable(120)
                    },
                    {
                        name: getIcon('i-resize', 'minus'),
                        _func: this.changeHeight,
                        payload: -120,
                        toolTip: '减少120像素',
                        disabled: !this.checkAvailable(-120)
                    },
                    {
                        name: getIcon('i-resize', 'double'),
                        _func: this.changeHeight,
                        payload: this.height,
                        toolTip: '高度设为200%',
                        disabled: !this.checkAvailable(this.height)
                    },
                    {
                        name: getIcon('i-resize', 'two'),
                        _func: this.changeHeight,
                        payload: -0.5 * this.height,
                        toolTip: '高度设为50%',
                        disabled: !this.checkAvailable(-0.5 * this.height)
                    }
                ]
            },
            height: {
                get: function (): number {
                    return this.row.height
                },
                set: function (value: number): void {
                    this.row.height = value
                }
            },
            isOverflowX: {
                get: function (): boolean {
                    return this.row.Setting.isOverflowX
                },
                set: function (value: boolean): void {
                    this.row.Setting.isOverflowX = value
                }
            }
        },
        methods: {
            _arrowDoubleUp: function () {
                this.row.exchangeRowSoft(0)
            },

            _arrowDoubleDown: function () {
                let len = this.row.parent.len;
                this.row.exchangeRowSoft(len - 1)
            },

            _arrowUp: function () {
                let {order} = this.row
                this.row.exchangeRowSoft(order - 1)
            },

            _arrowDown: function () {
                let {order} = this.row
                this.row.exchangeRowSoft(order + 1)
            },

            _insertRow: function () {
                this.row.addRowNext()
            },

            _deleteRow: function () {
                this.row.deleteSelf()
            },

            _deleteItem: function (item: DocumentItemSettingPart) {
                this.row.deleteItem(item)
            },

            _emit: function (name: string, $event: DragEvent, item?: DocumentItemSettingPart) {
                this.$emit(name, {
                    event: $event,
                    item,
                    row: this.row,
                })
            },
            dragCard: function ($event: DragEvent, item: DocumentItemSettingPart) {
                this._emit('drag-card', $event, item)
            },
            dragEndCard: function ($event: DragEvent, item: DocumentItemSettingPart) {
                this._emit('drag-end-card', $event, item)
            },
            dragStartCard: function ($event: DragEvent, item: DocumentItemSettingPart) {
                this._emit('drag-start-card', $event, item)
            },
            dragEnterCard: function ($event: DragEvent, item?: DocumentItemSettingPart) {
                let event = $event as DragEventWithTarget
                //@ts-ignore
                event.mouseOnTarget = item !== undefined
                    ? document.getElementById(this.getId(item))
                    : $event.target
                this._emit('drag-enter-card', event, item)
            },
            dropCard: function ($event: DragEvent, item: DocumentItemSettingPart) {
                this._emit('drop-card', $event, item)
            },
            checkAvailable: function (delta: number) {
                return this.height + delta >= this.minHeight && this.height + delta <= this.maxHeight
            },
            changeHeight: function (delta: number) {
                this.checkAvailable(delta) && (this.height += delta)
            },
            getId: function (item: DocumentItemSettingPart) {
                return 'cardPaperAll' + item._uniqueId
            }

        },
        record: {
            status: 'empty',
            description: ''
        }
    })
</script>

<style scoped>
    .drag-on {
        background-color: rgba(140, 150, 170, 0.4) !important;
    }
</style>
