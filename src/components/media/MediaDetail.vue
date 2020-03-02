<template>
    <v-row justify="center">
        <v-dialog
            v-model="dialogDetail"
            scrollable
            fullscreen
            hide-overlay
            transition="dialog-bottom-transition"
            v-resize="onResize"
        >
            <v-card>
                <v-toolbar dark color="primary" height="50px">
                    <v-btn icon dark @click="toClose">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                    <v-toolbar-title>Media Detail</v-toolbar-title>
                    <v-spacer></v-spacer>
                </v-toolbar>

                <v-card>
                    <div v-if="media.PrimaryLabel === 'image'"
                         style="overflow-y:scroll;overflow-x:hidden;text-align:center">
                        <img :src=realSrc id="image" @click="bigPic" alt="图片描述">
                    </div>
                </v-card>

                <div v-if="media.PrimaryLabel === 'pdf'"
                     :style="{height:scrollHeight}"
                     style="overflow-y:scroll;overflow-x:hidden;text-align:center"
                >
                    <pdf :src="pdfSrc"
                         v-for="i in numPages"
                         :key="i"
                         :page="i"
                         class="pdf-set"
                    >
                    </pdf>
                </div>

                <div v-if="media.PrimaryLabel === 'markdown'"
                     :style="{height:scrollHeight}">
                    <mavon-editor
                        ref="md"
                        :style="{height:scrollHeight}"
                        :value="mdText"
                        :subfield="this.prop.subfield"
                        :defaultOpen="this.prop.defaultOpen"
                        :toolbarsFlag="this.prop.toolbarsFlag"
                        :editable="this.prop.editable"
                        :boxShadow="false"
                        :toolbars="toolbarsValue"
                    >
                    </mavon-editor>
                </div>

                <v-bottom-navigation :value="activeBtn" grow color="teal" height="40px">
                    <!-- <v-btn @click="scaleD">+</v-btn>
                     <v-btn @click="scaleX">-</v-btn>-->
                    <v-btn @click="changeMode">
                        {{ dialogEdit ? 'Preview' : 'Edit' }}
                    </v-btn>
                    <v-btn @click="handleSave">Save</v-btn>
                    <v-btn>Download</v-btn>
                </v-bottom-navigation>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script>
    import {getSrc} from '@/utils/utils'
    import 'viewerjs/dist/viewer.css'
    // import Viewer from 'v-viewer'
    import pdf from 'vue-pdf'
    import axios from 'axios'
    import {mavonEditor} from "mavon-editor";
    import "mavon-editor/dist/css/index.css";
    import Viewer from "viewerjs";

    export default {
        name: "mediaDetail",
        components: {
            pdf,
            mavonEditor,
        },
        data() {
            return {
                //dialog样式
                notifications: false,
                sound: true,
                widgets: false,
                activeBtn: 1,
                windowSize: {
                    x: 0,
                    y: 0,
                },
                //pdf阅读器样式
                numPages: "",
                scrollHeight: "",
                scrollWidth: "",
                scale: {
                    type: Number,
                    default: 60
                },
                mdText: "",
                defaultImage: "logo",
                //markdown编辑器样式
                toolbarsValue: {
                    bold: true, // 粗体
                    italic: true, // 斜体
                    header: true, // 标题
                    underline: true, // 下划线
                    strikethrough: true, // 中划线
                    mark: true, // 标记
                    superscript: true, // 上角标
                    subscript: true, // 下角标
                    quote: true, // 引用
                    ol: true, // 有序列表
                    ul: true, // 无序列表
                    link: true, // 链接
                    imagelink: true, // 图片链接
                    code: true, // code
                    table: true, // 表格
                    fullscreen: true, // 全屏编辑
                    readmodel: true, // 沉浸式阅读
                    help: true, // 帮助
                    /* 1.3.5 */
                    undo: true, // 上一步
                    redo: true, // 下一步
                    trash: true, // 清空
                    save: false, // 保存（触发events中的save事件）
                    /* 1.4.2 */
                    navigation: true, // 导航目录
                    /* 2.1.8 */
                    alignleft: true, // 左对齐
                    aligncenter: true, // 居中
                    alignright: true, // 右对齐
                    /* 2.2.1 */
                    subfield: true, // 单双栏模式
                    preview: true, // 预览
                },
                images: [],
                imgTitle: this.media.Info.Name
            }
        },
        props: {
            dialogDetail: {
                type: Boolean,
                default: false
            },
            dialogEdit: {
                type: Boolean,
                required: true
            },
            media: {
                type: Object,
                required: true
            },
        },
        mounted() {
            this.onResize();
            this.init();
        },
        computed: {
            realSrc() {
                return getSrc(this.media.Ctrl.FileName)
            },
            //markdown编辑器模式
            prop() {
                if (this.media._label === 'markdown') {
                    //阅读模式
                    if (this.dialogEdit === false) {
                        return {
                            subfield: false,
                            defaultOpen: 'preview',
                            editable: false,
                            toolbarsFlag: false,
                        }
                    } else {
                        //编辑模式
                        return {
                            subfield: true,
                            defaultOpen: '',
                            editable: true,
                            toolbarsFlag: true,
                        }
                    }
                } else {
                    return this.doNothing()
                }
            },
        },

        methods: {
            init() {
                let realSrc = getSrc(this.media.Ctrl.FileName);
                if (this.media._label === 'pdf') {
                    this.pdfSrc = pdf.createLoadingTask(realSrc);
                    this.pdfSrc.then(pdf => {
                        this.numPages = pdf.numPages
                    }).catch(() => {
                    })
                }
                if (this.media._label === 'markdown') {
                    axios.get(realSrc).then(response => {
                        this.mdText = response.data
                    })
                }
            },
            onResize() {
                this.windowSize = {x: window.innerWidth, y: window.innerHeight};
                this.scrollHeight = this.windowSize.y - 90 + 'px';
                this.scrollWidth = this.windowSize.x + 'px'
            },
            //引入pdf字体
            previewPDF() {
                let CMAP_URL = 'https://unpkg.com/pdfjs-dist@2.0.943/cmaps/'
            },
            //高度
            getWindowSize() {

            },
            //Dialog开关
            toClose() {
                this.$emit('close')
            },
            scaleD() {
                this.scale += 10
            },
            scaleX() {
                this.scale -= 10
            },
            getRatio() {
                return this.scale + "%"
            },
            changeMode() {
                this.dialogEdit = !this.dialogEdit
            },
            handleSave() {
                if (this.media._label === "markdown") {
                    let currentValue = this.$refs.md.d_value;
                    let updateValue = [];
                    updateValue.push(currentValue);
                    let newUrl = URL.createObjectURL(new Blob(updateValue, {type: "‘text/markdown,charset=UTF-8"}));
                    this.$set(this.media.Ctrl, 'FileName', newUrl)
                } else {
                    this.doNothing()
                }
            },
            bigPic() {
                let vm = this;
                let viewer = new Viewer(document.getElementById('image'), {
                    url: getSrc(vm.media.Ctrl.FileName),
                    navbar: false,
                    title: false,
                    toolbar: {
                        zoomIn: true,
                        zoomOut: true,
                        play: {
                            show: 0,
                        },
                        rotateLeft: true,
                        reset: true,
                        rotateRight: true,
                        flipHorizontal: true,
                        flipVertical: true,
                    }
                })
            },
            doNothing() {
            }
        },

        record: {
            status: "done",
        }
    }

</script>

<style scoped>
    .pdf-set {
        text-align: center;
        white-space: normal;
        width: 60%;
    }

</style>
