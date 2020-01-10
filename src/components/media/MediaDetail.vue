<template>
    <v-row justify="center">
        <v-dialog v-model="dialogDetail" scrollable fullscreen hide-overlay transition="dialog-bottom-transition">
            <v-card>
                <v-toolbar dark color="primary" height="50px">
                    <v-btn icon dark @click="toClose">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                    <v-toolbar-title>Media Detail</v-toolbar-title>
                    <v-spacer></v-spacer>
                </v-toolbar>

                <div v-if="media.Info.PrimaryLabel === 'image'">
                    <viewer :images="realSrc">
                        <img v-for="src in images"
                             :src="src"
                             :key="src"
                         alt="">
                    </viewer>
                    <!--<v-img :src="realSrc" :width="width" :max-height="height">
                    </v-img>-->
                </div>

                <div v-if="media.Info.PrimaryLabel === 'pdf'"
                     :style="{height:scrollHeight}"
                     style="overflow-y:scroll;overflow-x:hidden;text-align:center"
                >
                    <pdf :src="realSrc"
                         v-for="i in numPages"
                         :key="i"
                         :page="i"
                         class="pdf-set"
                    >
                    </pdf>
                </div>

                <div v-if="media.Info.PrimaryLabel === 'text'"
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
                    <v-btn @click="scaleD">+</v-btn>
                    <v-btn @click="scaleX">-</v-btn>
                    <v-btn @click="changeMode">
                        {{ dialogMode ? 'Preview' : 'Edit' }}
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
    import Viewer from 'v-viewer'
    import pdf from 'vue-pdf'
    import axios from 'axios'
    import {mavonEditor} from "mavon-editor";
    import "mavon-editor/dist/css/index.css";
    import logo from "../../assets/logo.png"

    export default {
        name: "mediaDetail",
        components: {
            Viewer,
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

                //pdf阅读器样式
                numPages: "",
                scrollHeight: "",
                scrollWidth: "",
                file: {
                    type: Object,
                    required: true
                },
                scale: 80 + "%",
                mdText: "",
                defaultImage: "logo",
                images: [getSrc(this.media.Ctrl.FileName)],
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
            }
            }
        },
        props: {
            dialogDetail: {
                type: Boolean,
                default: false
            },
            dialogMode: {
                type: Boolean,
                required: true
            },
            media: {
                type: Object,
                required: true
            },
        },
        mounted() {
            this.init()
        },

        computed: {
            realSrc: function () {
                return getSrc(this.media.Ctrl.FileName)
            },
            //markdown编辑器模式
            prop() {
                if (this.dialogMode === false) {
                    return {
                        subfield: false, // 单双栏模式
                        defaultOpen: 'preview', //edit： 默认展示编辑区域 ， preview： 默认展示预览区域
                        editable: false,
                        toolbarsFlag: false,
                    }
                } else {
                    return {
                        subfield: true,
                        defaultOpen: '',
                        editable: true,
                        toolbarsFlag: true,
                    }
                }
            },
            /*getImages: function() {
                return this.images.push(realSrc)
            }*/
        },

        methods: {
            init() {
                let realSrc = getSrc(this.media.Ctrl.FileName);
                if (this.media.Info.PrimaryLabel === 'pdf') {
                    this.realSrc = pdf.createLoadingTask(realSrc);
                    this.realSrc.then(pdf => {
                        this.numPages = pdf.numPages
                    }).catch(() => {
                    })
                }
                if (this.media.Info.PrimaryLabel === 'text') {
                    axios.get(realSrc).then(response => {
                        this.mdText = response.data
                    })
                }
            },
            //引入pdf字体
            previewPDF() {
                let CMAP_URL = 'https://unpkg.com/pdfjs-dist@2.0.943/cmaps/'
            },
            //高度
            getWindowSize() {
                this.scrollHeight = window.innerHeight - 90 + 'px';
                this.scrollWidth = window.innerWidth + 'px'
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
                this.dialogMode = !this.dialogMode
                },
            handleSave() {
                let currentValue = this.$refs.md.d_value;
                let updateValue = [];
                updateValue.push(currentValue);
                let newUrl = URL.createObjectURL(new Blob(updateValue, {type: "‘text/csv,charset=UTF-8"}));
                this.$set(this.media.Ctrl, 'FileName', newUrl)
                }
            },
        created() {
            window.addEventListener('resize', this.getWindowSize);
            this.getWindowSize();
        },
        destroyed() {
            window.removeEventListener('resize', this.getWindowSize)
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
