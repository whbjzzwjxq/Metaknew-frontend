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
        <media-viewer :file="file" :width="width">
            <template v-slot:button-group>
                <div
                    :style="{ opacity: toolOpacity }"
                    class="d-flex flex-column button-group pl-1"
                    v-show="showTool"
                >
                    <v-btn
                        :disabled="item.icon === ''"
                        :key="item.icon"
                        @click="item._func"
                        color="white"
                        icon
                        small
                        v-for="item in iconList"
                    >
                        <v-icon>{{ item.icon }}</v-icon>
                    </v-btn>
                </div>
            </template>
        </media-viewer>

        <title-text-field
            :edit-mode="editMode"
            :text="file.Info.Name"
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
                :disabled="!file.isSelf"
            >{{ editText }}
            </v-btn
            >
            <v-btn text @click="saveMedia" :disabled="!file.isSelf">Save</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script lang="ts">
    import Vue from "vue";
    import MediaViewer from "../../MediaViewer.vue";
    import FieldText from "@/components/field/FieldText.vue";
    import TitleTextField from "@/components/TitleTextField.vue";
    import CardSubLabelGroup from '@/components/card/subComp/CardSubLabelGroup.vue';
    import {getIsSelf, MediaInfoPart} from "@/utils/graphClass";
    import {DataManagerState} from "@/store/modules/dataManager";
    import {LabelGroup, iconItem} from "@/utils/interfaceInComponent";
    import {labelItems} from "@/utils/labelField";
    import {updateMediaNode} from '@/api/commonSource'

    export default Vue.extend({
        name: "CardPageMediaInfo",
        components: {
            TitleTextField,
            MediaViewer,
            FieldText,
            CardSubLabelGroup
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
            file: {
                type: Object as () => MediaInfoPart,
                required: true
            },
            //是在viewBox还是在卡片里
            inViewBox: {
                type: Boolean,
                required: false
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
            info: function () {
                return this.file.Info;
            },
            ctrl() {
                return this.file.Ctrl;
            },
            userConcern: function () {
                return this.file.UserConcern;
            },
            dataManager: function () {
                return this.$store.state.dataManager as DataManagerState;
            },
            isSelf: function (): boolean {
                return getIsSelf(this.file.Ctrl);
            },
            labelGroup: function (): LabelGroup[] {
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

            title: function () {
                return this.info.PrimaryLabel + " --> " + this.info.Name;
            },

            toolOpacity: vm => (vm.showTool ? "50%" : "0%"),
            arrowIcon: vm =>
                vm.detailOn ? "mdi-chevron-double-up" : "mdi-chevron-double-down",
            editText: vm => (vm.editMode ? "Edit Off" : "Edit On"),
            showText: vm => vm.height >= 120,
            //能够删除 在画布中删除是从画布中删除 在节点中删除是从节点删除

            showDeleteIcon: function () {
                return this.inViewBox
                    ? this.nodeIsSelf
                    : getIsSelf(this.$store.getters.currentGraphInfo.Ctrl);
            },

            //能够变成media节点:不在画布里而且画布是isSelf的
            showExportIcon: vm =>
                !vm.inViewBox &&
                vm.$store.state.dataManager.currentGraph.State.isSelf,

            normalIconList(): iconItem[] {
                let vm = this;
                return [
                    {icon: "mdi-magnify", _func: vm.dialogWatch, render: true},
                    {icon: vm.arrowIcon, _func: vm.changeDetail, render: true},
                    {icon: "", _func: null, render: true},
                    {icon: "mdi-pencil", _func: vm.editSrc, render: vm.isSelf},
                    {
                        icon: "mdi-delete",
                        _func: vm.deleteMediaFromNode,
                        render: vm.isSelf || vm.showDeleteIcon
                    },
                    {
                        icon: "mdi-arrow-left-bold-circle-outline",
                        _func: vm.addMediaToGraph,
                        render: vm.showExportIcon
                    }
                ];
            },

            iconList: vm => vm.normalIconList.filter((item: iconItem) => item.render)
        },
        methods: {
            updateValue(prop: string, value: any) {
                this.file.updateValue(prop, value);
            },
            updateName(value: string) {
                this.file.changeName(value)
            },
            removeItem(removedLabel: string, prop: string) {
                this.file.updateValue("Labels", [], true);
            },
            addItem(value: string[], prop: string) {
                prop === "Info"
                    ? this.file.updateValue("Labels", value)
                    : this.file.updateUserConcern("Labels", value);
            },

            changeDetail() {
                this.detailOn = !this.detailOn;
            },

            deleteMediaFromNode() {
                this.$emit("delete-item");
            },

            addMediaToGraph() {
                this.$emit("add-media-to-graph", this.file);
            },
            dialogWatch() {
            },
            editSrc() {
            },
            saveMedia() {
                let status = this.file.status;
                if (status === "success" || status === "remote") {
                    updateMediaNode(this.file).then(res => {
                        res.status === 200
                            ? alert("保存成功")
                            : alert("保存失败 请重试");
                    });
                }
            }
        },
        watch: {},
        record: {
            status: "done-old"
        }
    });
</script>

<style scoped></style>
