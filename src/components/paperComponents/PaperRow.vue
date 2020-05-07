<template>
    <div class="d-flex flex-row cardItem" :style="{height: height + 'px', overflowX: isOverflowX}">
        <div v-if="editMode" class="ml-n1 pr-1 d-flex flex-row">
            <icon-group
                :icon-list="rowIconList"
                vertical
                small
                @arrow-double-up="_arrowDoubleUp(section, row)"
                @arrow-double-down="_arrowDoubleDown(section, row)"
                @arrow-up="_arrowUp(section, row)"
                @arrow-down="_arrowDown(section, row)"
                @delete="_deleteRow(section, row)"
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
            v-for="(subItem, index) in row.Items">
        </card-paper-all>
        <div @dragenter="dragEnterCard(arguments[0], undefined)"
             @dragover.prevent
             @drop.prevent="dropCard(arguments[0], undefined)"
             class="pa-0 flex-grow-1"
             v-if="editMode">
            <paper-empty-card>

            </paper-empty-card>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import PaperEmptyCard from "@/components/paperComponents/PaperEmptyCard.vue";
    import CardPaperAll from "@/components/card/paper/CardPaperAll.vue";
    import IconGroup from "@/components/IconGroup.vue";
    import {getIcon} from "@/utils/icon";
    import {ItemSettingPart} from "@/class/settingBase";
    import {DragEventWithTarget} from "@/interface/interfaceInComponent";

    export default Vue.extend({
        name: "PaperRow",
        components: {
            PaperEmptyCard,
            CardPaperAll,
            IconGroup
        },
        data: function () {
            return {
                minHeight: 240,
                maxHeight: 1080
            }
        },
        props: {
            editMode: {
                type: Boolean,
                default: false
            },
            row: {
                type: Object as () => PaperRowSetting,
                required: true
            },
            section: {
                type: Object as () => PaperSectionSettingPart,
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
                        _isTrigger: true,
                        _eventName: 'arrow-up',
                        toolTip: '向上移动一行'
                    },
                    {
                        name: getIcon('i-arrow', 'down'),
                        _isTrigger: true,
                        _eventName: 'arrow-down',
                        toolTip: '向下移动一行'
                    },
                    {
                        name: getIcon('i-arrow-double', 'down'),
                        _isTrigger: true,
                        _eventName: 'arrow-double-down',
                        toolTip: '向下移动到低端'
                    },
                    {
                        name: getIcon('i-edit', 'delete'),
                        _isTrigger: true,
                        _eventName: 'delete',
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
                    return this.row.isOverflowX
                },
                set: function (value: boolean): void {
                    this.row.isOverflowX = value
                }
            },
            len: function (): number {
                return this.section.Setting.Rows.length
            }
        },
        methods: {
            _arrowDoubleUp: function () {
                this.exchangeRow(0)
            },

            _arrowDoubleDown: function () {
                let len = this.section.Setting.Rows.length;
                this.exchangeRow(len - 1)
            },

            _arrowUp: function () {
                let {order} = this.row
                this.exchangeRow(order - 1)
            },

            _arrowDown: function () {
                let {order} = this.row
                this.exchangeRow(order + 1)
            },

            _deleteRow: function (section: PaperSectionSettingPart, row: PaperRowSetting) {
                let index = section.Setting.Rows.indexOf(row)
                let len = section.Setting.Rows.length;
                if (index >= 0 && index <= len - 1) {
                    row.Items.map(item => {
                        item.State.isInRow = false
                    })
                    section.Setting.Rows.splice(index, 1)
                    section.Setting.Rows.map(subRow => {
                        subRow.order > row.order && (row.order -= 1)
                    })
                }
            },

            _deleteItem: function (item: ItemSettingPart) {
                let index = this.row.Items.indexOf(item)
                index > -1 && this.row.Items.splice(index, 1)
                item.State.isInRow = false
            },

            exchangeRow: function (target: number) {
                if (this.len > target && target > 0) {
                    let targetRow = this.section.Setting.Rows.filter(row => row.order === target)[0]
                    if (targetRow) {
                        targetRow.order = this.row.order
                        this.row.order = target
                    }
                }
            },
            _emit: function (name: string, $event: DragEvent, item?: ItemSettingPart) {
                this.$emit(name, {
                    event: $event,
                    item,
                    row: this.row,
                    section: this.section
                })
            },
            dragCard: function ($event: DragEvent, item: ItemSettingPart) {
                this._emit('drag-card', $event, item)
            },
            dragEndCard: function ($event: DragEvent, item: ItemSettingPart) {
                this._emit('drag-end-card', $event, item)
            },
            dragStartCard: function ($event: DragEvent, item: ItemSettingPart) {
                this._emit('drag-start-card', $event, item)
            },
            dragEnterCard: function ($event: DragEvent, item?: ItemSettingPart) {
                let event = $event as DragEventWithTarget
                //@ts-ignore
                event.mouseOnTarget = item !== undefined
                    ? document.getElementById(this.getId(item))
                    : $event.target
                this._emit('drag-enter-card', event, item)
            },
            dropCard: function ($event: DragEvent, item: ItemSettingPart) {
                this._emit('drop-card', $event, item)
            },
            checkAvailable: function (delta: number) {
                return this.height + delta >= this.minHeight && this.height + delta <= this.maxHeight
            },
            changeHeight: function (delta: number) {
                this.checkAvailable(delta) && (this.height += delta)
            },
            getId: function (item: ItemSettingPart) {
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
