<template>
    <v-card :width="width" tile flat class="pa-2">
        <v-card-title>
            <media-resolver
                multiple
                :rules="rules"
                :props="fileResolverProps"
                @upload-file="addFile(arguments[0], false)"
            >
            </media-resolver>
        </v-card-title>
        <v-card-text>
            <v-simple-table>
                <thead>
                <tr>
                    <th class="text-left">id</th>
                    <th class="text-left">Name</th>
                    <th class="text-left">Format</th>
                    <th class="text-left">Status</th>
                    <th class="text-left">Action</th>
                </tr>
                </thead>
                <tbody>
                <template v-if="showCurrent">
                    <tr v-if="currentFiles.length === 0">
                        <td colspan="12"></td>
                    </tr>
                    <tr v-for="(file, index) in currentRealFiles" :key="index">
                        <td>
                            {{file._id}}
                        </td>
                        <td>
                            {{ file.Info.Name }}
                        </td>
                        <td>
                            {{file.PrimaryLabel}}
                        </td>
                        <td>
                            <v-chip :color="statusColor[file.status]" outlined tile small label>{{ file.status}}
                            </v-chip>
                        </td>
                        <td>
                            <v-edit-dialog>
                                <v-icon small>mdi-pencil</v-icon>
                                <template v-slot:input>
                                    <card-page-media-info :media="file" edit-base>

                                    </card-page-media-info>
                                </template>
                            </v-edit-dialog>
                            <v-icon small @click="removeCurrentFile(index)">mdi-delete</v-icon>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="12">
                            <div style="height: 64px; text-align: right; font-size: 12px">
                                <p class="right-subheader ma-0" style="font-size: 16px">Current Files:
                                    {{currentFiles.length}} files</p>
                                <p class="right-subheader ma-0" style="font-size: 12px">更换媒体文件会使得所有引用都变成新文件 慎重使用</p>
                            </div>
                        </td>
                    </tr>
                </template>

                <template v-if="uploadMode">
                    <tr v-if="newFiles.length === 0">
                        <td colspan="12"></td>
                    </tr>
                    <tr v-for="(file, index) in newFiles" :key="file._id">
                        <td>
                            {{file._id}}
                        </td>
                        <td>
                            {{ file.Info.Name }}
                        </td>
                        <td>
                            {{file._label}}
                        </td>
                        <td>
                            <v-chip :color="statusColor[file.status]" outlined tile small label>{{ file.status}}
                            </v-chip>
                        </td>
                        <td>
                            <v-edit-dialog>
                                <v-icon small>mdi-pencil</v-icon>
                                <template v-slot:input>
                                    <card-page-media-info
                                        :media="file"
                                        edit-base>

                                    </card-page-media-info>
                                </template>
                            </v-edit-dialog>
                            <v-icon small @click="removeFile(index)">mdi-delete</v-icon>
                            <v-icon small @click="uploadFile(index)">mdi-publish</v-icon>
                        </td>
                    </tr>
                    <tr>
                    <tr>
                        <td colspan="12">
                            <div style="height: 48px; text-align: right;">
                                <p class="right-subheader ma-0" style="font-size: 16px">New Files: {{newFiles.length}}
                                    files</p>
                                <p class="right-subheader ma-0" style="font-size: 12px">在编辑完所有内容(标题，标签等等)后再点击上传图标</p>
                            </div>
                        </td>
                    </tr>
                </template>
                </tbody>
            </v-simple-table>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {guid} from '@/utils/utils'
    import CardPageMediaInfo from '../card/page/CardPageMediaInfo.vue';
    import MediaResolver from '../media/MediaResolver.vue';
    import {MediaInfoPart} from '@/class/graphItem'
    import {commitInfoAdd, commitInfoChangeId} from '@/store/modules/_mutations'
    import {dispatchUploadFile} from "@/store/modules/_dispatch";

    export default Vue.extend({
        name: 'FieldFile',
        components: {CardPageMediaInfo, MediaResolver},
        data() {
            return {
                newFiles: [] as MediaInfoPart[],
                currentFiles: this.baseFiles as id[],
                fileInput: [],
                statusIcon: {},
                statusColor: {
                    'new': 'todo',
                    'success': 'success',
                    'error': 'error',
                    'uploading': 'accent',
                    'pause': 'todo',
                    'remote': 'primary'
                },
                guid: guid,
                fileResolverProps: {
                    chips: true,
                    label: 'File input',
                    placeholder: 'Upload medias',
                    'prepend-icon': 'mdi-paperclip'
                }
            }
        },
        props: {
            baseFiles: {
                type: Array as () => id[],
                required: true
            },
            propName: {
                type: String as () => string,
                required: true
            },
            width: {
                type: Number as () => number,
                default: 400
            },
            // 规则组
            rules: {
                type: Array as () => (() => {})[],
                default: () => []
            },
            showCurrent: {
                type: Boolean,
                default: false
            },
            uploadMode: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            fileToken: function (): FileToken {
                return this.$store.state.userInfo.fileToken
            },
            // 整个状态
            status: function (): string {
                let statusList = this.newFiles.map(file => file.status);
                let result: string;
                statusList.includes('uploading')
                    ? result = 'uploading'
                    : statusList.includes('error')
                    ? result = 'error'
                    : result = 'default';
                return result
            },
            // 现有的真的MediaInfoPart
            currentRealFiles: function (): MediaInfoPart[] {
                return this.baseFiles.map((_id: id) => this.$store.state.dataManager.mediaManager[_id])
            },
        },
        methods: {
            saveMedia: function () {
                this.$emit('update-value', this.propName, this.currentFiles, this.status);
            },

            removeFile: function (index: number) {
                this.newFiles.splice(index, 1)
            },

            removeCurrentFile: function (index: number) {
                this.currentFiles.splice(index, 1);
                this.saveMedia()
            },

            // 如果从收藏里获取内容 那么就不需要上传了
            addFile: function (files: MediaInfoPart[], isExist: boolean) {
                isExist
                    ? this.currentFiles = this.currentFiles.concat(files.map(file => file._id))
                    : this.newFiles = this.newFiles.concat(files)
            },

            uploadFile: function (index: number) {
                let file = this.newFiles[index];
                let storeName = 'userFileCache/' + this.guid() + '.' + file.Ctrl.Format;
                file.file &&
                dispatchUploadFile({
                    item: file,
                    storeName,
                    uploadType: 'normal',
                    realFile: file.file
                }).then(res => {
                    let idMap = res.data;
                    file.changeStatus('success');
                    commitInfoChangeId({_type: 'media', idMap});
                    this.currentFiles.push(file._id);
                    this.newFiles.splice(index, 1);
                    file.Ctrl.FileName = `userResource/${file._id}.${file.Ctrl.Format}`;
                    this.saveMedia()
                }).catch((res) => {
                    file.changeStatus('error')
                })
            }

        },
        watch: {},
        record: {
            status: 'done',
            description: "文件上传编辑器",
            //todo 从收藏获取File
        }
    })
</script>

<style scoped>
    .right-subheader {
        color: #999999;
        opacity: 0.7;
    }

</style>
/**
* Created by whb on 2019/12/4
* Updated by [whb on 2020年1月8日19:58:44]
*/
