<template>
    <v-card class="empty-avatar" flat tile>
        <v-img
            :src="realSrc"
            width="120px"
            height="120px"
            contain>
            <template v-if="!sourceUrl">
                <div style="height: 40px"></div>
                <p>upload main image</p>
            </template>
            <v-btn @click="clearMainPic" icon absolute x-small style="bottom: 10px; right: 22px;">
                <v-icon>
                    {{ deleteIcon }}
                </v-icon>
            </v-btn>
            <v-edit-dialog>
                <v-btn icon absolute x-small style="bottom: 10px; right: 6px;">
                    <v-icon>
                        {{ uploadIcon }}
                    </v-icon>
                </v-btn>
                <template v-slot:input>
                    <v-card flat tile width="400px">
                        <card-sub-row text="New Image">
                            <template v-slot:content>
                                <file-resolver
                                    :props="fileResolverProps"
                                    @upload-file="newFile">

                                </file-resolver>
                            </template>
                        </card-sub-row>
                        <card-sub-row text="Select Image">
                            <template v-slot:content>
                                <media-grids
                                    :file-list="imageList"
                                    @upload-select="newResolvedFile"
                                    single-choose>

                                </media-grids>
                            </template>
                        </card-sub-row>
                        <card-sub-row text="cropper" :collapse="false">
                            <template v-slot:content>
                                <div style="width: 400px;height: 300px">
                                    <vue-cropper
                                        ref="cropper"
                                        :img="currentImage"
                                        :max-img-size="4000"
                                        :enlarge="4"
                                        auto-crop-width="120"
                                        auto-crop-height="120"
                                        auto-crop
                                        fixed-box
                                    >

                                    </vue-cropper>
                                </div>
                            </template>
                        </card-sub-row>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn text @click="close">
                                Cancel
                            </v-btn>
                            <v-btn text @click="save">
                                Save
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </template>
            </v-edit-dialog>
        </v-img>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import VueCropper from '../../node_modules/vue-cropper/src/vue-cropper.vue'
    import FileResolver from "@/components/media/MediaResolver.vue";
    import CardSubRow from "@/components/card/subComp/CardSubRow.vue";
    import MediaGrids from "@/components/media/MediaGrids.vue";
    import {getSrc, guid} from "@/utils/utils";
    import {MediaInfoPart} from '@/class/graphItem'
    import {dispatchUploadFile} from "@/store/modules/_dispatch";
    import {getIcon} from "@/utils/icon";

    export default Vue.extend({
        name: "NodeAvatar",
        components: {
            FileResolver, CardSubRow, MediaGrids, VueCropper
        },
        data() {
            return {
                currentFile: null as MediaInfoPart | null,
                fileResolverProps: {
                    chips: false,
                    placeholder: "Click to Upload Image",
                    prependIcon: getIcon('i-media-type', 'image'),
                },
                guid: guid,
                deleteIcon: getIcon('i-edit', 'delete'),
                uploadIcon: getIcon('i-add-media-method', 'upload')
            }
        },
        props: {
            sourceUrl: {
                type: String as () => string,
                required: true
            },
            imageList: {
                type: Array as () => string[],
                required: true
            }
        },
        computed: {
            fileToken: function (): FileToken {
                return this.$store.state.userModule.fileToken
            },
            realSrc: function (): string {
                return getSrc(this.sourceUrl)
            },
            currentImage: function (): string {
                return this.currentFile
                    ? this.currentFile.Ctrl.FileName
                    : this.realSrc
            }
        },
        methods: {
            save() {
                // @ts-ignore $ref不能通过中间变量引用
                this.$refs.cropper.getCropBlob((data: Blob) => {
                    this.uploadFile(data);
                })
            },
            close() {

            },
            uploadFile(file: Blob) {
                let storeName = 'userFileCache/' + this.guid() + "." + file.type.split("/")[1];
                dispatchUploadFile({
                    storeName,
                    uploadType: 'mainImage',
                    realFile: file
                }).then(() => {
                    alert('Upload Image Success!');
                    this.$set(file, "status", "success");
                    this.$emit('new-main-image', URL.createObjectURL(file))
                }).catch(() => {
                        alert('Something Success!');
                        this.$set(file, "status", "error");
                    }
                );
            },
            newFile(fileList: MediaInfoPart[]) {
                this.currentFile = fileList[0]
            },
            newResolvedFile(fileList: MediaInfoPart[]) {
                this.$emit('new-main-image', fileList[0].Ctrl.FileName)
            },
            clearMainPic() {
                this.currentFile = null;
                this.$emit('clear-main-image')
            }
        },
        watch: {},
        record: {
            status: 'done',
            description: '节点MainImage的编辑器 '
        },
    })
</script>

<style scoped>
    .empty-avatar {
        background-color: #EDEDED;
        opacity: 0.9;
        text-align: center;
        vertical-align: center;
        font-size: 16px;
        border-radius: 1px;
        border-width: 2px;
        border-style: dashed;
        border-color: lightslategrey;
        height: 124px;
        width: 124px;
    }
</style>

/**
* Created by whb on 2019/11/25
* Updated by []
*/
