<template>
    <v-file-input
        :multiple="multiple"
        :value="files"
        @change="fileChange"
        v-bind="props"
    >
    </v-file-input>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {MediaInfoPart} from "@/class/graphItem"
    import {getIndex} from "@/utils/utils";

    export default Vue.extend({
        name: "MediaResolver",
        components: {},
        data() {
            return {
                files: [] as File[]
            }
        },
        props: {
            multiple: {
                type: Boolean,
                default: false
            },
            props: {
                type: Object,
                default() {
                    return {}
                }
            }
        },
        computed: {},
        methods: {
            resolveFile(file: File) {
                let _id = getIndex();
                 // todo thumb缩略图
                return MediaInfoPart.emptyMediaInfo(_id, file)
            },

            fileChange(files: Array<File>) {
                this.$emit('upload-file', files.map(file => this.resolveFile(file)));
                this.files = files
            },
        },
        watch: {},
        record: {
            status: "done",
            description: 'Media解析的工具栏'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/11/25
* Updated by []
*/
