<template>
    <v-card
        @mouseenter.stop="showTool = true"
        @mouseleave.stop="showTool = false"
        :width="width"
        :height="height"
        flat
        tile
        outlined
    >
        <media-viewer :media="media" :width="width">
            <template v-slot:button-group>
                <icon-group
                    v-if="height >= 150"
                    :icon-list="iconList"
                    :container-style="buttonGroupStyle"
                    small
                    vertical
                >

                </icon-group>
            </template>
        </media-viewer>

        <title-text-field
            :edit-mode="editMode"
            :text="media.Info.Name"
            @update-text="updateName"
            v-show="showText"
        ></title-text-field>

        <v-card-text :width="width" v-show="detailOn" class="mt-n8">
            <card-sub-label-group
                @remove-item="removeItem"
                @add-item="addItem"
                :label-group="labelGroup"
                :label-items="labelItems"
                small
            ></card-sub-label-group>
            <field-text
                prop-name="Text"
                :base-text="info.Text"
                :editable="editMode"
                @update-value="updateValue"
            ></field-text>
        </v-card-text>
        <v-card-actions v-show="detailOn">
            <v-btn text>Learn More+</v-btn>
            <v-spacer></v-spacer>
            <v-btn
                text
                @click="editMode = !editMode"
                :disabled="!media.isSelf"
            >{{ editMode ? 'Edit Off' : 'Edit On' }}
            </v-btn
            >
            <v-btn text @click="saveMedia" :disabled="!media.isSelf">Save</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script lang="ts">
    import Vue from "vue";
    import MediaViewer from "../../MediaViewer.vue";
    import FieldText from "@/components/field/FieldText.vue";
    import TitleTextField from "@/components/TitleTextField.vue";
    import CardSubLabelGroup from '@/components/card/subComp/CardSubLabelGroup.vue';
    import {BaseMediaCtrl, BaseMediaInfo, getIsSelf, MediaInfoPart, UserConcern} from "@/utils/graphClass";
    import {DataManagerState} from "@/store/modules/dataManager";
    import {LabelGroup, IconItem} from "@/utils/interfaceInComponent";
    import {labelItems} from "@/utils/labelField";
    import {updateMedia} from '@/api/commonSource';
    import * as CSS from 'csstype';
    import {getIcon} from "@/utils/icon";
    import IconGroup from "@/components/iconGroup/IconGroup.vue";

    export default Vue.extend({
        name: "CardPageMediaInfo",
        components: {
            TitleTextField,
            MediaViewer,
            FieldText,
            CardSubLabelGroup,
            IconGroup
        },
        data() {
            return {
                labelItems: labelItems,
                detailOn: false,
                editMode: this.editBase,
                showTool: false
            };
        },
        props: {
            media: {
                type: Object as () => MediaInfoPart,
                required: true
            },
            //是在viewBox还是在卡片里
            inViewBox: {
                type: Boolean,
                default: false
            },

            width: {
                type: [String, Number],
                default: 300
            },

            height: {
                type: [String, Number],
                default: 400
            },

            showLabels: {
                type: Boolean,
                default: true
            },

            //这张图片本身的索引
            index: {
                type: Number,
                default: -1
            },

            //节点是不是自己的
            nodeIsSelf: {
                type: Boolean,
                default: false
            },

            //一开始是否可编辑
            editBase: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            info: function() {
                return this.media.Info;
            },
            ctrl: function() {
                return this.media.Ctrl;
            },
            userConcern: function() {
                return this.media.UserConcern;
            },
            dataManager: function() {
                return this.$store.state.dataManager;
            },
            isSelf: function() {
                return getIsSelf(this.media.Ctrl);
            },
            labelGroup: function(): LabelGroup[] {
                return this.editBase
                    ? [
                        {
                            name: "作者的标注",
                            labels: this.info.Labels,
                            closeable: true,
                            editable: true,
                            prop: "Info"
                        }
                    ]
                    : [
                        {
                            name: "作者的标注",
                            labels: this.info.Labels,
                            closeable: false,
                            editable: false,
                            prop: "Info"
                        },
                        {
                            name: "用户的标注",
                            labels: this.ctrl.Labels,
                            closeable: false,
                            editable: false,
                            prop: "Ctrl"
                        },
                        {
                            name: "你的标注",
                            labels: this.userConcern.Labels,
                            closeable: true,
                            editable: true,
                            prop: "UserConcern"
                        }
                    ];
            },

            title: function() {
                return this.info.PrimaryLabel + " --> " + this.info.Name;
            },
            buttonGroupStyle: function(): CSS.Properties {
                return {
                    opacity: this.showTool ? '50%' : '0%',
                    position: "absolute",
                    right: 0,
                    top: 0
                }
            },
            showText: function() {
                return this.height >= 120
            },
            //能够删除 在画布中删除是从画布中删除 在节点中删除是从节点删除

            showDeleteIcon: function() {
                return this.inViewBox
                    ? this.nodeIsSelf
                    : this.dataManager.currentGraph.Conf.State.isSelf;
            },

            //能够变成media节点:不在画布里而且画布是isSelf的
            showExportIcon: function() {
                return !this.inViewBox &&
                    this.dataManager.currentGraph.Conf.State.isSelf
            },

            iconList: function(): IconItem[] {
                let vm = this;
                return [
                    {name: "mdi-magnify", _func: vm.dialogWatch},
                    {name: getIcon("Chevron", vm.detailOn), _func: vm.changeDetail},
                    {name: "", _func: vm.doNothing},
                    {name: "mdi-pencil", _func: vm.editSrc, render: vm.isSelf},
                    {name: "mdi-delete", _func: vm.deleteMedia, render: vm.isSelf || vm.showDeleteIcon},
                    {name: "mdi-arrow-right-bold-circle-outline", _func: vm.addMediaToGraph, render: vm.showExportIcon}
                ];
            },
        },
        methods: {
            updateValue(prop: string, value: any) {
                this.media.updateValue(prop, value);
            },
            updateName(value: string) {
                this.media.changeName(value)
            },
            removeItem(removedLabel: string, prop: string) {
                this.media.updateValue("Labels", [], true);
            },
            addItem(value: string[], prop: string) {
                prop === "Info"
                    ? this.media.updateValue("Labels", value)
                    : this.media.updateUserConcern("Labels", value);
            },

            changeDetail() {
                this.detailOn = !this.detailOn;
            },

            deleteMedia() {
                this.$emit("delete-media");
            },

            addMediaToGraph() {
                this.$emit("add-media-to-graph", this.media);
            },
            dialogWatch() {
            },
            editSrc() {
            },
            saveMedia() {
                let status = this.media.status;
                if (status === "success" || status === "remote") {
                    updateMedia(this.media).then(res => {
                        res.status === 200
                            ? alert("保存成功")
                            : alert("保存失败 请重试");
                    });
                }
            },
            doNothing() {

            }
        },
        watch: {},
        record: {
            status: "done-old",
            description: "媒体信息卡片"
        }
    });
</script>

<style scoped></style>
