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
            :dark="isDark"
            tile>
            <v-toolbar-title></v-toolbar-title>
            <div class="flex-grow-1"></div>
            <v-btn x-small text :dark="isDark" @click="changeDark">
              dark: {{isDark ? "yes" : "no"}}
            </v-btn>
            <v-btn x-small icon
                   :disabled="!note.isSelf"
                   :color="lockColor"
                   @click="lock">
              <v-icon>{{lockIcon}}</v-icon>
            </v-btn>
            <v-btn x-small icon
                   :color="editColor"
                   :disabled="!editable"
                   @click="isEditing = !isEditing">
              <v-icon>{{editIcon}}</v-icon>
            </v-btn>
            <v-btn x-small icon>
              <v-icon
                :disabled="!editable"
                @click="deleteNote">mdi-delete
              </v-icon>
            </v-btn>
            <v-btn x-small icon>
              <v-icon @click="collapse">{{collapsedIcon}}</v-icon>
            </v-btn>
          </v-toolbar>
        </div>
        <div v-show="isCollapsed" :style="fieldStyle">
          <v-container fluid class="d-flex pa-2">
            <v-textarea
              v-model="content"
              :disabled="!editing"
              :placeholder="'tips: '+ currentTip"
              :style="textStyle"
              :dark="isDark"
              row-height="16px"
              class="pa-0 ma-0"
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

<script lang="js">
    import {randomIntegerInRange} from "30-seconds-of-code";
    import { commitSnackbarOn } from '@/store/modules/_mutations'

    export default {
        name: "GraphNote",
        data() {
            return {
                conf: this.note.Setting.Conf,
                content: this.note.Content,
                isCollapsed: true,
                isLock: false,
                isEditing: false,
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
                    "拖动右侧边栏可以拉长便签",
                    "拖动上方边栏可以移动便签",
                    "便签的高度是自动调节的",
                    "锁定的时候不能拖动或修改"
                ],

                currentTip: ""
            }
        },
        props: {
            note: {
                type: Object,
                required: true
            },
            container: {
                type: Object,
                required: true
            }
        },

        computed: {
            divStyle() {
                return {
                    "width": this.width,
                    "position": "absolute",
                    "left": this.left,
                    "top": this.top,
                    "z-index": 2
                }
            },
            fieldStyle() {
                return {
                    width: "100%",
                    height: "100%",
                    background: this.isDark ? "grey" : "white",
                    opacity: 0.8,
                }
            },
            toolBarStyle() {
                return {
                    "width": "100%",
                    "height": "18px",
                    "opacity": 0.7
                }
            },

            sliderStyle() {
                return {
                    "width": "18px",
                    "opacity": 0.5 * (this.isSliderDragging || this.showSlider),
                    "background": "black"
                }
            },
            textStyle() {
                return {
                    "-moz-user-select": "none",
                    "user-select": "none",
                }
            },
            left: vm => vm.conf.x * vm.container.width + "px",
            top: vm => vm.conf.y * vm.container.height + "px",
            width: vm => vm.conf.width + "px",
            height: vm => vm.conf.height + "px",
            editable: vm => vm.note.isSelf && !vm.isLock,
            editing: vm => vm.isEditing && !vm.isLock,
            collapsedIcon: vm => !vm.isCollapsed
                ? 'mdi-plus-box-outline'
                : 'mdi-minus-box-outline',

            lockIcon: vm => vm.isLock
                ? 'mdi-lock-outline'
                : 'mdi-lock-open',

            editIcon: vm => vm.editable
                ? 'mdi-pencil-outline'
                : 'mdi-pencil-off',

            editColor: vm => vm.isEditing
                ? 'success'
                : 'default',

            lockColor: vm => vm.isLock
                ? 'red darken-1'
                : 'default',

            isDark: vm => vm.conf.dark
        },

        methods: {
            collapse() {
                this.isCollapsed = !this.isCollapsed
            },

            dragStart($event) {
                this.isLock ||
                this.$set(this.dragStartLoc, "x", $event.x);
                this.$set(this.dragStartLoc, "y", $event.y);
                this.isDragging = true;
            },

            drag(event) {
                if (!this.isLock && this.isDragging) {
                    let deltaX = (event.x - this.dragStartLoc.x) / this.container.width;
                    let deltaY = (event.y - this.dragStartLoc.y) / this.container.height;
                    this.dragStart(event);
                    this.$set(this.conf, 'x', this.conf.x + deltaX);
                    this.$set(this.conf, 'y', this.conf.y + deltaY);
                }
            },

            dragEnd(event) {
                (!this.isLock && this.isDragging) &&
                this.drag(event);
                this.isDragging = false;
            },

            //防止拖动问题
            mouseLeave() {
                this.isDragging = false;
                this.isSliderDragging = false;
            },

            mouseEnter() {

            },

            //右侧边栏拖动
            enlargeStart(event) {
                this.isLock ||
                this.$set(this.dragStartLoc, "enLargeX", event.x);
                this.isSliderDragging = true;
            },

            enlarge(event) {
                if (!this.isLock && this.isSliderDragging) {
                    let note = this.note;
                    if (note.isSelf) {
                        let deltaX = (event.x - this.dragStartLoc.enLargeX);
                        this.enlargeStart(event);
                        this.$set(this.conf, 'width', this.conf.width + deltaX);
                        if (this.conf.width < 120) {
                            let payload = {
                                "content": "便签宽度不能小于100像素",
                                "color": "warning",
                                "actionName": "noteTooNarrow",
                                "once": false
                            };
                            commitSnackbarOn(payload);
                            this.isSliderDragging = false;
                            this.$set(this.conf, 'width', this.conf.width + 5);
                        }
                    } else {
                        let payload = {
                            "content": "不可以改变作者发布的便签",
                            "color": "warning",
                            "actionName": "moveUnSelfObj",
                            "once": true
                        };
                        commitSnackbarOn(payload);
                        this.isSliderDragging = false
                    }
                }
            },

            enlargeEnd(event) {
                (!this.isLock && this.isSliderDragging) &&
                this.enlarge(event);
                this.isSliderDragging = false;
            },

            mouseEnterSlider() {
                this.showSlider = true;
            },

            mouseLeaveSlider() {
                this.showSlider = false;
                this.isSliderDragging = false;
            },

            //删除Note
            deleteNote() {
                this.$set(this.note, "isDeleted", true);
                let payload = {
                    "timeout": 5000,
                    "color": "error",
                    "content": "删除了便签",
                    "buttonText": "撤销",
                    "action": this.rollBackDelete,
                    "actionObject": this.note,
                    "actionName": "rollBackNote",
                    "once": false
                };
                commitSnackbarOn(payload)
            },

            //恢复Note
            rollBackDelete(target) {
                this.$set(target, "isDeleted", false)
            },

            lock() {
                this.isLock = !this.isLock;
                this.isDragging = false;
            },

            reloadTip() {
                let index = randomIntegerInRange(0, this.tips.length - 1);
                this.currentTip = this.tips[index]
            },

            changeDark() {
                this.$set(this.conf, "dark", !this.isDark)
            }

        },

        watch: {
            text() {
                this.Content === "" && this.reloadTip();
            }
        },

        mounted() {
            this.reloadTip();
        }
    }
</script>

<style scoped>

</style>
