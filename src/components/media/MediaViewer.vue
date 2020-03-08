<template>
    <v-card
        :width="width"
        :max-height="maxHeight"
        :min-height="minHeight"
        flat
        tile
        style="overflow-y: hidden"
        class="test">
        <div :style="floatStyle" v-show="showFloat">
            <slot name="float">

            </slot>
        </div>
        <v-img
            :src="realSrc"
            contain
            v-if="media._label === 'image'">

        </v-img>
        <pdf
            :src="realSrc"
            contain
            v-else-if="media._label === 'pdf'">

        </pdf>
        <mavon-editor
            :value="mdText"
            :subfield="false"
            :defaultOpen="'preview'"
            :toolbarsFlag="false"
            :boxShadow="false"
            v-else-if="media._label === 'markdown'"
        ></mavon-editor>
        <div v-else>
            Unknown Media
        </div>
    </v-card>
</template>

<script>
    import pdf from 'vue-pdf'
    import {getSrc} from '@/utils/utils'
    import axios from 'axios'
    import {mavonEditor} from "mavon-editor";
    import "mavon-editor/dist/css/index.css";

    export default {
        name: 'MediaViewer',
        components: {
            pdf,
            mavonEditor
        },
        data() {
            return {
                mdText: "",
                minHeight: 240
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
            maxHeight: {
                type: Number,
                default: 2880
            },
            showFloat: {
                type: Boolean,
                default: false
            }
        },

        computed: {
            realSrc: function () {
                return getSrc(this.media.Ctrl.FileName)
            },
            floatStyle: function () {
                return {
                    position: 'absolute',
                    'background-color': 'white',
                    width: '32px',
                    zIndex: 1,
                    opacity: '50%',
                    right: 0,
                    height: this.minHeight + 'px'
                }
            }
        },
        methods: {
            init() {
                let realSrc = this.realSrc;
                if (this.media._label === 'markdown') {
                    axios.get(realSrc).then(response => {
                        this.mdText = response.data
                    })
                }
            }
        },
        watch: {
            realSrc() {
                this.init()
            }
        },
        record: {
            status: 'editing',
            description: '解析Media图像的工具'
        },
        mounted() {
            this.init()
        },
    }
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/11/25
* Updated by []
*/
