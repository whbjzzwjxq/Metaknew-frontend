<template>
  <v-file-input
    :multiple="multiple"
    v-bind="props"
    :value="files"
    @change="fileChange"
  >
  </v-file-input>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {globalIndex, MediaInfoPart} from "@/utils/graphClass"
    import {commitInfoAdd} from '@/store/modules/_mutations'

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
                let id = '$_' + globalIndex;
                let fileObj = MediaInfoPart.emptyMediaInfo(id, file); // todo thumb缩略图
                commitInfoAdd({item: fileObj});
                return fileObj
            },

            fileChange(files: Array<File>) {
                this.$emit('upload-file', files.map(file => this.resolveFile(file)));
                this.files = files
            },
        },
        watch: {},
        record: {
            status: "done"
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/11/25
* Updated by []
*/
