<template>
    <v-card
        :width="width"
        class="d-flex flex-column"
        flat
        tile>
        <div v-if="file.Info.PrimaryLabel === 'image'">
            <v-img :src="realSrc" contain>
            </v-img>
            <slot name="button-group">

            </slot>
        </div>
        <div v-else-if="file.Info.PrimaryLabel === 'pdf'">
            <pdf :src="realSrc" contain>
            </pdf>
            <slot name="button-group">

            </slot>
        </div>
    </v-card>
</template>

<script>
    import pdf from 'vue-pdf'

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
            file: {
                type: Object,
                required: true
            },
            width: {
                type: Number,
                default: 360
            }
        },
        computed: {
            realSrc: vm => vm.file.Ctrl.FileName
                ? 'https://metaknew.oss-cn-beijing.aliyuncs.com/' + vm.file.Ctrl.FileName
                : '',
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
