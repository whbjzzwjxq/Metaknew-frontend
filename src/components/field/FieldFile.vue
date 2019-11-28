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
              {{file.Info.id}}
            </td>
            <td>
              {{ file.Info.Name }}
            </td>
            <td>
              {{file.Info.PrimaryLabel}}
            </td>
            <td>
              <v-chip :color="statusColor[file.status]" outlined tile small label>{{ file.status}}</v-chip>
            </td>
            <td>
              <v-edit-dialog>
                <v-icon small>mdi-pencil</v-icon>
                <template v-slot:input>
                  <card-root-media :file="file" edit-base>

                  </card-root-media>
                </template>
              </v-edit-dialog>
              <v-icon small @click="removeCurrentFile(index)">mdi-delete</v-icon>
            </td>
          </tr>
          <tr>
            <td colspan="12">
              <div style="height: 64px; text-align: right; font-size: 12px">
                <p class="right-subheader ma-0" style="font-size: 16px">Current Files: {{currentFiles.length}} files</p>
                <p class="right-subheader ma-0" style="font-size: 12px">更换媒体文件会使得所有引用都变成新文件 慎重使用</p>
              </div>
            </td>
          </tr>
        </template>

        <template v-if="uploadAble">
          <tr v-if="newFiles.length === 0">
            <td colspan="12"></td>
          </tr>
          <tr v-for="(file, index) in newFiles" :key="file.Info.id">
            <td>
              {{file.Info.id}}
            </td>
            <td>
              {{ file.Info.Name }}
            </td>
            <td>
              {{file.Info.PrimaryLabel}}
            </td>
            <td>
              <v-chip :color="statusColor[file.status]" outlined tile small label>{{ file.status}}</v-chip>
            </td>
            <td>
              <v-edit-dialog>
                <v-icon small>mdi-pencil</v-icon>
                <template v-slot:input>
                  <card-page-media-info
                    :file="file"
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
                <p class="right-subheader ma-0" style="font-size: 16px">New Files: {{newFiles.length}} files</p>
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
    import CardPageMediaInfo from '../card/page/cardPageMediaInfo.vue';
    import MediaResolver from '../MediaResolver.vue';
    import {FileToken} from '@/api/user'
    import {id, MediaInfoPart} from '@/utils/graphClass'
    import {commitInfoAdd} from '@/store/modules/_mutations'

    const mime = require('mime/lite');

    export default Vue.extend({
        name: 'FieldFile',
        components: {CardPageMediaInfo, MediaResolver},
        data() {
            return {
                newFiles: [] as Array<MediaInfoPart>,
                currentFiles: this.baseFiles as Array<id>,
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
            baseFiles: Array as () => id[],
            propName: String as () => '',
            width: Number as () => 600,
            rules: Array as () => (() => {})[],
            showCurrent: Boolean as () => false,
            uploadAble: Boolean as () => false
        },
        computed: {
            fileToken: (vm): FileToken => vm.$store.state.userInfo.fileToken,
            status() {
                let statusList = this.newFiles.map(file => file.status);
                let result: string;
                statusList.indexOf('uploading') > -1
                    ? result = 'uploading'
                    : statusList.indexOf('error') > -1
                    ? result = 'error'
                    : result = 'default';
                return result
            },
            currentRealFiles() {
                return this.baseFiles.map((id: id) => this.$store.state.dataManager.nodeManager[id])
            },
        },
        methods: {
            saveMedia() {
                this.$emit('update-value', this.propName, this.currentFiles, this.status);
            },

            removeFile(index: number) {
                this.newFiles.splice(index, 1)
            },

            removeCurrentFile(index: number) {
                this.currentFiles.splice(index, 1);
                this.saveMedia()
            },

            // 如果从收藏里获取内容 那么就不需要上传了
            addFile(files: Array<MediaInfoPart>, isExist: boolean) {
                isExist
                    ? this.currentFiles = this.currentFiles.concat(files.map(file => {
                        let id = file.Info.id;
                        commitInfoAdd({item: file});
                        return id
                    }))
                    : this.newFiles = this.newFiles.concat(files)
            },

            uploadFile(index: number) {
                let file = this.newFiles[index];
                let storeName = 'userFileCache/' + this.guid() + '.' + file.Ctrl.Format;
                this.$store.dispatch('fileUpload', {
                    file,
                    storeName,
                    uploadType: 'normal',
                    realFile: file.file
                }).then(res => {
                    let id = res.data;
                    file.changeId(id);
                    file.changeSource(storeName);
                    file.changeStatus('success');
                    commitInfoAdd({item: file});
                    this.currentFiles.push(id);
                    this.newFiles.splice(index, 1);
                    this.saveMedia()
                }).catch(() => {
                    file.changeStatus('error')
                })
            }

        },
        watch: {},
        record: {
            status: 'done'
        }
    })
</script>

<style scoped>
  .right-subheader {
    color: #999999;
    opacity: 0.7;
  }

</style>
