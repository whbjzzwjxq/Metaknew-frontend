<template>
    <v-card
        :width="width"
        :max-height="maxHeight"
        flat
        tile
        style="overflow: hidden"
        class="test">
        <div :style="floatStyle" v-show="showFloat">
            <slot name="float">

            </slot>
        </div>
        <slot name="content">

        </slot>
        <v-img
            :src="realSrc"
            contain
            v-if="label === 'image'">

        </v-img>
        <pdf
            :src="realSrc"
            contain
            v-else-if="label === 'pdf'">

        </pdf>
        <div v-else>
            Unknown Media
        </div>
    </v-card>
</template>

<script>
    import pdf from 'vue-pdf'
    import {getSrc} from '@/utils/utils'
    import axios from 'axios'

    export default {
        name: 'MediaViewer',
        components: {
            pdf
        },
        data() {
            return {
                mdText: "",
            }
        },

        props: {
            src: {
                type: String, // MediaInfoPart,
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
            },
            label: {
                type: String,
                default: 'unknown'
            }
        },

        computed: {
            realSrc: function () {
                return getSrc(this.src)
            },
            floatStyle: function () {
                return {
                    position: 'absolute',
                    'background-color': 'white',
                    width: '32px',
                    zIndex: 1,
                    opacity: '50%',
                    right: 0,
                    height: '100%'
                }
            }
        },
        methods: {
            init() {
                let realSrc = this.realSrc;
                if (this.label === 'markdown') {
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
