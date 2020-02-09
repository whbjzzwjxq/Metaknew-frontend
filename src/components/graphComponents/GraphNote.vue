<template>
    <div class="noteDiv" :style="divStyle">
        <v-container fluid class="pa-0 ma-0 d-flex flex-row">
            <v-container fluid class="d-flex flex-column pa-0 ma-0">
                <div :style="toolBarStyle">
                    <v-toolbar
                            @mousedown.stop="dragStart"
                            @mousemove.stop="drag"
                            @mouseup.stop="dragEnd"
                            @mouseleave.stop="mouseLeave"
                            @mouseenter.stop="mouseEnter"
                            height="18px"
                            flat
                            :dark="!isDark"
                            color="#EEEEEE"
                            tile>
                        <v-toolbar-title></v-toolbar-title>
                        <div class="flex-grow-1"></div>
                        <icon-group
                                x-small
                                :icon-list="iconList">

                        </icon-group>
                    </v-toolbar>
                </div>
                <div v-show="isCollapsed" :style="fieldStyle">
                    <v-container fluid class="d-flex pa-2">
                        <v-textarea
                                v-model="content"
                                :disabled="!isEditing"
                                :placeholder="'tips: '+ currentTip"
                                :dark="isDark"
                                row-height="16px"
                                class="pa-0 ma-0 unselected"
                                auto-grow>

                        </v-textarea>
                    </v-container>
                </div>
            </v-container>
            <div :style="sliderStyle"
                 @mousedown="enlargeStart"
                 @mousemove="enlarge"
                 @mouseup="enlargeEnd"
                 @mouseenter="mouseEnterSlider"
                 @mouseleave="mouseLeaveSlider"
            >

            </div>
        </v-container>
    </div>
</template>

<script lang="ts">
    import {commitSnackbarOn} from '@/store/modules/_mutations'
    import Vue from 'vue'
    import {getDivCSS, RectByPoint} from "@/class/geometric";
    import {getIcon} from "@/utils/icon";
    import {randomIntegerInRange} from "@/utils/utils";
    import IconGroup from "@/components/IconGroup.vue";
    import {NoteSettingPart} from "@/class/graphItem";

    export default Vue.extend({
        name: 'GraphNote',
        components: {
            IconGroup
        },
        data() {
            return {
                isCollapsed: true,
                //drag起始位置
                dragStartLoc: {
                    x: 0,
                    y: 0,
                    enLargeX: 0,
                },
                //正在drag
                isDragging: false,
                //正在拖动右边栏
                isSliderDragging: false,
                showSlider: false,
                //提示词
                tips: [
                    '拖动右侧边栏可以拉长便签',
                    '拖动上方边栏可以移动便签',
                    '便签的高度是自动调节的',
                    '锁定的时候不能拖动或修改'
                ],

                currentTip: ''
            }
        },
        props: {
            note: {
                type: Object as () => NoteSettingPart,
                required: true
            },
            container: {
                type: Object as () => RectByPoint,
                required: true
            }
        },

        computed: {
            setting: function (): NoteSetting {
                return this.note.Setting
            },
            containerRect: function (): AreaRect {
                return this.container.positiveRect()
            },
            isEditing: function (): boolean {
                return this.note.State.isEditing
            },
            sizeSetting: function (): AreaRect {
                return {
                    x: this.setting.Base.x * this.containerRect.width,
                    y: this.setting.Base.y * this.containerRect.height,
                    width: this.setting.Base.size,
                    height: this.setting.Base.size * this.setting.Base.scaleX
                } as AreaRect
            },
            content: {
                get: function (): string {
                    return this.setting._content
                },
                set: function (value: string) {
                    this.setting._content = value
                }
            },
            isDark: function (): boolean {
                return this.note.State.isDark
            },
            divStyle: function (): CSSProp {
                return getDivCSS(this.sizeSetting, {height: "auto"})
            },
            fieldStyle: function (): CSSProp {
                return {
                    width: '100%',
                    height: '100%',
                    background: this.isDark ? 'grey' : 'white',
                    opacity: 0.8,
                }
            },
            toolBarStyle: function (): CSSProp {
                return {
                    'width': '100%',
                    'height': '18px',
                    'opacity': 0.7
                }
            },

            sliderStyle: function (): CSSProp {
                return {
                    'width': '18px',
                    'opacity': (this.isSliderDragging || this.showSlider) ? 0.5 : 0,
                    'background': 'black'
                }
            },

            iconList: function (): IconItem[] {
                let vm = this;
                return [
                    {
                        name: getIcon('i-edit-able', !vm.isLock),
                        _func: vm.edit,
                        color: vm.isEditing ? 'success' : undefined
                    },
                    {
                        name: getIcon('i-is-locked', !vm.isLock),
                        _func: vm.lock,
                        color: vm.isLock ? 'red darken-1' : undefined
                    },
                    {name: getIcon('i-delete-able', true), _func: vm.deleteNote},
                    {name: getIcon('i-is-dark', vm.isDark), _func: vm.dark},
                    {name: getIcon('i-collapse', vm.isCollapsed), _func: vm.collapse}
                ]
            },
            isLock: function (): boolean {
                return this.note.State.isLock
            }
        },

        methods: {
            collapse() {
                this.isCollapsed = !this.isCollapsed
            },

            dark() {
                this.note.updateState('isDark')
            },

            lock() {
                this.note.updateState('isLock');
                this.isDragging = false
            },

            edit() {
                this.note.updateState('isEditing')
            },

            reloadTip() {
                let index = randomIntegerInRange(0, this.tips.length - 1);
                this.currentTip = this.tips[index]
            },

            dragStart($event: MouseEvent) {
                this.isLock ||
                this.$set(this.dragStartLoc, 'x', $event.x);
                this.$set(this.dragStartLoc, 'y', $event.y);
                this.isDragging = true
            },

            drag($event: MouseEvent) {
                if (!this.isLock && this.isDragging) {
                    let deltaX = ($event.x - this.dragStartLoc.x) / this.containerRect.width;
                    let deltaY = ($event.y - this.dragStartLoc.y) / this.containerRect.height;
                    this.dragStart($event);
                    this.$set(this.setting.Base, 'x', this.setting.Base.x + deltaX);
                    this.$set(this.setting.Base, 'y', this.setting.Base.y + deltaY)
                }
            },

            dragEnd($event: MouseEvent) {
                (!this.isLock && this.isDragging) &&
                this.drag($event);
                this.isDragging = false
            },

            //防止拖动问题
            mouseLeave() {
                this.isDragging = false;
                this.isSliderDragging = false
            },

            mouseEnter() {

            },

            //右侧边栏拖动
            enlargeStart($event: MouseEvent) {
                this.isLock ||
                this.$set(this.dragStartLoc, 'enLargeX', $event.x);
                this.isSliderDragging = true
            },

            enlarge($event: MouseEvent) {
                if (!this.isLock && this.isSliderDragging) {
                    let deltaX = ($event.x - this.dragStartLoc.enLargeX);
                    this.enlargeStart($event);
                    this.$set(this.setting.Base, 'size', this.setting.Base.size + deltaX);
                    if (this.sizeSetting.width < 120) {
                        let payload = {
                            'content': '便签宽度不能小于100像素',
                            'color': 'warning',
                            'actionName': 'noteTooNarrow',
                            'once': false
                        };
                        commitSnackbarOn(payload);
                        this.isSliderDragging = false;
                        this.$set(this.setting.Base, 'size', this.setting.Base.size + 5);
                    }
                }
            },

            enlargeEnd($event: MouseEvent) {
                (!this.isLock && this.isSliderDragging) &&
                this.enlarge($event);
                this.isSliderDragging = false
            },

            mouseEnterSlider() {
                this.showSlider = true
            },

            mouseLeaveSlider() {
                this.showSlider = false;
                this.isSliderDragging = false
            },

            //删除Note
            deleteNote() {
                this.$set(this.note.State, 'isDeleted', true);
                let payload = {
                    'timeout': 5000,
                    'color': 'error',
                    'content': '删除了便签',
                    'buttonText': '撤销',
                    'action': this.rollBackDelete,
                    'actionObject': this.note,
                    'actionName': 'rollBackNote',
                    'once': false
                } as SnackBarStatePayload;
                commitSnackbarOn(payload)
            },

            //恢复Note
            rollBackDelete(target: NoteSettingPart) {
                target.updateState('isDeleted', false)
            },

        },

        watch: {
            text() {
                this.content === '' && this.reloadTip()
            }
        },

        mounted: function (): void {
            this.reloadTip()
        },

        record: {
            status: 'editing',
            description: 'Note组件'
        },
    })
</script>

<style scoped>

</style>
