<template>
    <v-card
        :width="width"
        class="d-flex flex-column"
        flat
        tile>
        <div v-if="media.Info.PrimaryLabel === 'image'">
            <v-img :src="realSrc" :width="width" :max-height="height">
            </v-img>
            <slot name="button-group">

            </slot>
        </div>
        <div v-else-if="media.Info.PrimaryLabel === 'pdf'">
            <pdf :src="realSrc" contain>
            </pdf>
            <slot name="button-group">

            </slot>
        </div>
    </v-card>
</template>

<script>
    import pdf from 'vue-pdf'
    import { getSrc } from '@/utils/utils'

    export default {
        name: 'mediaViewer',
        components: {
            pdf
        },
        data () {
            return {
                showTool: false,
            }
        },
        props: {
            media: {
                type: Object,
                required: true
            },
            width: {
                type: Number,
                default: 360
            },
            height: {
                type: Number,
                default: 2880
            }
        },
        computed: {
            realSrc: function () {
                return getSrc(this.media.Ctrl.FileName)
            },
        },
        methods: {},
        record: {
            status: 'done'
        }
    }
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/11/25
* Updated by []
*/
