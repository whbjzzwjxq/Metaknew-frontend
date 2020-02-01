<template>
    <v-card
        :width="width"
        class="d-flex flex-column"
        flat
        tile>
        <div v-if="media.Info.PrimaryLabel === 'image'">
            <img :src="realSrc" :width="width" :max-height="height" id="image">

            <slot name="button-group">

            </slot>
        </div>
        <div v-else-if="media.Info.PrimaryLabel === 'pdf'">
            <pdf :src="realSrc" contain>
            </pdf>
            <slot name="button-group">

            </slot>
        </div>
        <div v-else-if="media.Info.PrimaryLabel === 'markdown'">
            <v-card scroll :height="height" :width="width" class="cardItem">
                <mavon-editor style="z-index: 0"
                              :value="mdText"
                              :subfield="false"
                              :defaultOpen="'preview'"
                              :toolbarsFlag="false"
                              :boxShadow="false"
                ></mavon-editor>
                <slot name="button-group">

                </slot>
            </v-card>
        </div>
    </v-card>
</template>

<script>
    import pdf from 'vue-pdf'
    import {getSrc} from '@/utils/utils'
    import axios from 'axios'
    import {mavonEditor} from "mavon-editor";
    import "mavon-editor/dist/css/index.css";
    import {MediaInfoPart} from '@/utils/graphClass'
    import Viewer from 'viewerjs'

    export default {
        name: 'mediaViewer',
        components: {
            pdf,
            mavonEditor
        },
        data() {
            return {
                mdText: ""
            }
        },

        props: {
            media: {
                type: Object, // MediaInfoPart,
                required: true
            },
            width: {
                type: Number,
                default: 360
            },
            height: {
                type: Number,
                default: 2880
            },
        },
        mounted() {
            this.init()
        },

        computed: {
            realSrc: function () {
                return getSrc(this.media.Ctrl.FileName)
            },
        },
        methods: {
            init() {
                let realSrc = getSrc(this.media.Ctrl.FileName);
                if (this.media.PrimaryLabel === 'markdown') {
                    axios.get(realSrc).then(response => {
                        this.mdText = response.data
                    })
                }
            },
            bigPic() {
                let vm = this;
                let viewer = new Viewer(document.getElementById('image'), {
                    url: getSrc(vm.media.Ctrl.FileName),
                    title: false,
                    navbar: false,
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
        },
        watch: {
            realSrc(newUrl, oldUrl) {
                this.init()
            }
        },
        record: {
            status: 'editing',
            description: '解析Media图像的工具'
        }
    }
</script>

<style scoped>
    @import '../../style/css/unselected.css';
    @import '../../style/css/card.css';
</style>

/**
* Created by whb on 2019/11/25
* Updated by []
*/
