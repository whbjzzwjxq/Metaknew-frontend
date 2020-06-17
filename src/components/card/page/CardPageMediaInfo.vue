<template>
    <div
        @mouseenter.stop="showTool = true"
        @mouseleave.stop="showTool = false"
        class="unselected"
    >
        <media-viewer
            :max-height="height"
            :width="width"
            :src="media.fileName"
            :label="media._label"
            :show-float="showTool"
            ref="mediaViewer">
            <template v-slot:float>
                <icon-group
                    v-if="height >= 100"
                    :icon-list="iconList"
                    :container-style="buttonGroupStyle"
                    small
                    vertical
                    ref="img"
                >
                </icon-group>
            </template>
        </media-viewer>
        <field-title
            :edit-mode="editMode"
            :text="media._name"
            @update-text="updateName"
            v-show="showText"
            class="pa-4"
        ></field-title>
        <div v-show="detailOn">
            <card-sub-row text="Title" v-model="settingInPaper.showTitle" :close-able="editInPaper">
                <template v-slot:content>
                    <div class="pa-2">
                        <item-sharer :base-data="media" :user-concern="userConcern">

                        </item-sharer>
                    </div>
                </template>
            </card-sub-row>
            <card-sub-row text="Labels" v-model="settingInPaper.showLabels" :close-able="editInPaper">
                <template v-slot:content>
                    <div class="d-flex flex-column pa-2">
                        <div v-for="(group, index) in labelGroup" :key="index">
                            <card-sub-label-group
                                :editable="group.editable"
                                :label-items="labelItems"
                                :label-list="group.labels"
                                :name="group.name"
                                @add-label="addItem(arguments[0], group.prop)"
                                @remove-label="removeItem"
                                small>

                            </card-sub-label-group>
                        </div>
                    </div>
                </template>
            </card-sub-row>
            <card-sub-row text="Description" v-model="settingInPaper.showDescription" :close-able="editInPaper">
                <template v-slot:content>
                    <field-text
                        class="pa-2"
                        prop-name="Description"
                        :base-text="info.Description"
                        :editable="editMode"
                        :rows="10"
                        :width="'100%'"
                        @update-value="updateValue"
                    ></field-text>
                </template>
            </card-sub-row>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import MediaViewer from "../../media/MediaViewer.vue";
    import FieldText from "@/components/field/FieldText.vue";
    import FieldTitle from "@/components/field/FieldTitle.vue";
    import CardSubLabelGroup from '@/components/card/subComp/CardSubLabelGroup.vue';
    import CardSubRow from "@/components/card/subComp/CardSubRow.vue";
    import {LabelGroup} from "@/interface/interfaceInComponent";
    import {labelItems} from "@/utils/fieldResolve";
    import {getIcon, iconMap} from "@/utils/icon";
    import IconGroup from "@/components/IconGroup.vue";
    import MediaDetail from "../../media/MediaDetail.vue"
    import ItemSharer from "@/components/ItemSharer.vue";
    import 'viewerjs/dist/viewer.css'
    import {mediaUpdate} from "@/api/subgraph/media";
    import {userConcernTemplate} from "@/utils/template";
    import {dispatchUserConcernQuery} from "@/store/modules/_dispatch";
    import {MediaInfoPart} from "@/class/info";
    import {mediaShowInPaperTemplate} from '@/interface/style/templateStylePaper';
    import {commitSnackbarOn} from "@/store/modules/_mutations";

    export default Vue.extend({
        name: "CardPageMediaInfo",
        components: {
            FieldTitle,
            MediaViewer,
            FieldText,
            CardSubLabelGroup,
            IconGroup,
            MediaDetail,
            CardSubRow,
            ItemSharer
        },
        data() {
            return {
                labelItems: labelItems,
                detailOn: false,
                editMode: this.editBase,
                showTool: false,
                resizeBase: 100,
                dialogDetailVisible: false,
                dialogEdit: false,
                userConcern: userConcernTemplate()
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
                type: Number,
                default: 300
            },

            height: {
                type: Number,
                default: 400
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
            },

            settingInPaper: {
                type: Object as () => CardShowInPaper,
                default: () => mediaShowInPaperTemplate()
            },
            editInPaper: {
                type: Boolean,
                default: false
            },

        },
        computed: {
            info: function (): BaseMediaInfo {
                return this.media.Info;
            },
            ctrl: function (): BaseMediaCtrl {
                return this.media.Ctrl;
            },

            dataManager: function (): DataManagerState {
                return this.$store.state.dataManager;
            },

            userDataManager: function (): UserDataManagerState {
                return this.$store.state.userDataManager
            },

            isSelf: function (): boolean {
                return this.media.isSelf
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

            title: function (): string {
                return this.media._label + " --> " + this.info.Name;
            },
            buttonGroupStyle: function (): CSSProp {
                return {}
            },
            showText: function (): boolean {
                return this.height >= 100
            },
            //能够删除 在画布中删除是从画布中删除 在节点中删除是从节点删除
            showDeleteIcon: function (): boolean {
                return this.inViewBox
                    ? this.nodeIsSelf
                    : this.dataManager.currentDocument.isSelf;
            },

            //能够变成media节点:不在画布里而且画布是isSelf的
            showExportIcon: function (): boolean {
                return !this.inViewBox && this.dataManager.currentDocument.isSelf
            },

            iconList: function (): IconItem[] {
                let vm = this;
                let sizeIconGroup = iconMap["i-resize"];
                let deleteAble = vm.isSelf || vm.showDeleteIcon;
                return [
                    {name: sizeIconGroup.plus, _func: vm.enlarge, render: vm.inViewBox, toolTip: '增大尺寸'},
                    {name: sizeIconGroup.minus, _func: vm.narrow, render: vm.inViewBox, toolTip: '减小尺寸'},
                    {name: sizeIconGroup.five, _func: vm.twentyPercent, render: vm.inViewBox, toolTip: '缩放到五分之一'},
                    {name: sizeIconGroup.three, _func: vm.oneThird, render: vm.inViewBox, toolTip: '缩放到三分之一'},
                    {name: sizeIconGroup.two, _func: vm.half, render: vm.inViewBox, toolTip: '缩放到二分之一'},
                    {name: sizeIconGroup.double, _func: vm.double, render: vm.inViewBox, toolTip: '放大到两倍'},
                    {name: getIcon('i-item', 'link'), _func: vm.addLink, render: vm.inViewBox, toolTip: '添加关系'},
                    {name: "", _func: vm.doNothing},
                    {name: "mdi-magnify", _func: vm.dialogDetailWatch},
                    {name: getIcon("i-arrow-double", vm.detailOn), _func: vm.changeDetail},
                    {name: getIcon('i-edit-able', vm.isSelf), _func: vm.dialogDetailEdit, disabled: !vm.isSelf},
                    {name: getIcon('i-delete-able', deleteAble), _func: vm.deleteMedia, disabled: !deleteAble},
                    {name: "mdi-arrow-right-bold-circle-outline", _func: vm.addMediaToGraph, render: vm.showExportIcon}
                ];
            }
        },
        methods: {
            updateValue: function (prop: string, value: any) {
                this.media.updateValue(prop, value);
            },
            updateName: function (value: string) {
                this.media.changeName(value)
            },
            removeItem: function (removedLabel: string, prop: string) {
                this.media.updateValue("Labels", [], true);
            },

            changeDetail() {
                this.detailOn = !this.detailOn
            },

            deleteMedia: function () {
                this.$emit("delete-media");
            },

            addMediaToGraph: function () {
                this.$emit("add-media-to-graph", this.media);
            },
            dialogDetailWatch() {
                if (this.media._label === 'image') {
                    let el: any = this.$refs.mediaViewer;
                    el.bigPic()
                } else {
                    this.dialogDetailVisible = true;
                    this.dialogEdit = false
                }
            },
            closeDialog() {
                this.dialogDetailVisible = false
            },
            dialogDetailEdit() {
                this.dialogDetailVisible = true;
                this.dialogEdit = true;
                this.editMode = true;
            },
            saveMedia() {
                let status = this.media.status;
                if (status === "success" || this.media.isRemote) {
                    mediaUpdate(this.media).then(res => {
                        let payload = {
                            actionName: 'mediaUpload',
                            color: 'success',
                            content: '媒体文件保存成功'
                        } as SnackBarStatePayload
                        commitSnackbarOn(payload)
                    });
                }
            },
            doNothing() {

            },
            enlarge() {
                this.updateSizeByNumber(this.width + this.resizeBase)
            },
            narrow() {
                this.updateSizeByNumber(this.width - this.resizeBase)
            },
            twentyPercent() {
                this.updateSizeByNumber(this.width * 0.2)
            },
            oneThird() {
                this.updateSizeByNumber(this.width / 3)
            },
            half() {
                this.updateSizeByNumber(this.width * 0.5)
            },
            double() {
                this.updateSizeByNumber(this.width * 2)
            },

            updateSizeByNumber(newWidth: number) {
                this.$emit('media-resize', newWidth)
            },

            addLink() {
                this.$emit('add-link')
            },
            addItem(value: string[], prop: string) {
                prop === 'Info'
                    ? this.media.updateValue('Labels', value)
                    : this.userConcern.Labels = value
            },

        },
        watch: {},
        record: {
            status: "editing",
            description: "媒体信息卡片",
        },
        mounted(): void {
            if (this.media.isRemote) {
                dispatchUserConcernQuery([this.media._id]).then(() => {
                    let concern = this.userDataManager.userConcernDict[this.media._type][this.media._id];
                    if (concern) {
                        this.userConcern = concern
                    }
                })
            } else {
                //doNothing
            }
        }
    });
</script>

<style scoped>

</style>
/**
* Created by whb on 2019/11/29
* Updated by [whb on 2020年1月8日19:16:09 第一次定稿]
*/
