<template>
    <v-card
        @mouseenter.stop="showTool = true"
        @mouseleave.stop="showTool = false"
        flat
        tile
        outlined
        class="unselected"
        :width="width"
        :height="height"
    >
        <v-card-title class="ma-0 pa-0">
            <media-viewer :max-height="height" :media="media" :show-float="showTool" :width="width" ref="mediaViewer">
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
        </v-card-title>
        <v-card-text v-show="detailOn" class="ma-0 pa-0">
            <card-sub-row :width="rowWidth" text="Title">
                <template v-slot:content>
                    <field-title
                        :edit-mode="editMode"
                        :text="media.Info.Name"
                        @update-text="updateName"
                        v-show="showText"
                    ></field-title>
                    <item-sharer :base-data="media">

                    </item-sharer>
                </template>
            </card-sub-row>
            <card-sub-row :width="rowWidth" text="Labels">
                <template v-slot:content>
                    <card-sub-label-group
                        :editable="group.editable"
                        :key="index"
                        :label-items="labelItems"
                        :label-list="group.labels"
                        :name="group.name"
                        @add-label="addItem(arguments[0], group.prop)"
                        @remove-label="removeItem"
                        small
                        v-for="(group, index) in labelGroup">

                    </card-sub-label-group>
                </template>
            </card-sub-row>
            <card-sub-row :width="rowWidth" text="Description">
                <template v-slot:content>
                    <field-text
                        prop-name="Description"
                        :base-text="info.Description"
                        :editable="editMode"
                        :rows="10"
                        @update-value="updateValue"
                    ></field-text>
                </template>
            </card-sub-row>
        </v-card-text>
        <v-card-actions v-show="detailOn">
            <v-btn text>Learn More+</v-btn>
            <v-spacer></v-spacer>
            <v-btn text @click="saveMedia" :disabled="!media.isSelf">Save</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script lang="ts">
    import Vue from "vue";
    import MediaViewer from "../../media/MediaViewer.vue";
    import FieldText from "@/components/field/FieldText.vue";
    import FieldTitle from "@/components/field/FieldTitle.vue";
    import CardSubLabelGroup from '@/components/card/subComp/CardSubLabelGroup.vue';
    import CardSubRow from "@/components/card/subComp/CardSubRow.vue";
    import {MediaInfoPart} from "@/class/graphItem";
    import {LabelGroup} from "@/interface/interfaceInComponent";
    import {labelItems} from "@/utils/fieldResolve";
    import {getIcon, iconMap} from "@/utils/icon";
    import IconGroup from "@/components/IconGroup.vue";
    import MediaDetail from "../../media/MediaDetail.vue"
    import ItemSharer from "@/components/ItemSharer.vue";
    import {getSrc} from '@/utils/utils'
    import 'viewerjs/dist/viewer.css'
    import {mediaUpdate} from "@/api/subgraph/media";

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
                rowWidth: 340
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
            },

            iconColor: {
                type: String as () => string,
                default: 'grey'
            }
        },
        computed: {
            realSrc: function () {
                return getSrc(this.media.Ctrl.FileName)
            },
            info: function () {
                return this.media.Info;
            },
            ctrl: function () {
                return this.media.Ctrl;
            },

            dataManager: function () {
                return this.$store.state.dataManager;
            },

            userDataManager: function (): UserDataManagerState {
                return this.$store.state.userDataManager
            },

            userConcern: function (): UserConcern {
                return this.userDataManager.userConcernDict['media'][this.media._id]
            },
            isSelf: function () {
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
            showText: function () {
                return this.height >= 100
            },
            //能够删除 在画布中删除是从画布中删除 在节点中删除是从节点删除

            showDeleteIcon: function (): boolean {
                return this.inViewBox
                    ? this.nodeIsSelf
                    : this.dataManager.currentGraph.Conf.State.isSelf;
            },

            //能够变成media节点:不在画布里而且画布是isSelf的
            showExportIcon: function (): boolean {
                return !this.inViewBox && this.dataManager.currentGraph.Conf.State.isSelf
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
                    {name: getIcon('i-item', 'link'), _func: vm.addLink, render: vm.inViewBox},
                    {name: "", _func: vm.doNothing},
                    {name: "mdi-magnify", _func: vm.dialogDetailWatch},
                    {name: getIcon("i-arrow-double", vm.detailOn), _func: vm.changeDetail},
                    {name: getIcon('i-edit-able', vm.isSelf), _func: vm.dialogDetailEdit, disabled: !vm.isSelf},
                    {name: getIcon('i-delete-able', deleteAble), _func: vm.deleteMedia, disabled: !deleteAble},
                    {name: "mdi-arrow-right-bold-circle-outline", _func: vm.addMediaToGraph, render: vm.showExportIcon}
                ];
            },

            viewer(): Vue & { validate: () => boolean } {
                return this.$refs.viewer as Vue
                    & { validate: () => boolean }
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
                        res.status === 200
                            ? alert("保存成功")
                            : alert("保存失败 请重试");
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
                    : this.$set(this.userConcern, 'Labels', value)
            },

        },
        watch: {},
        record: {
            status: "editing",
            description: "媒体信息卡片",
            //todo 编辑 比例 收藏 分享
        }
    });
</script>

<style scoped>

</style>
/**
* Created by whb on 2019/11/29
* Updated by [whb on 2020年1月8日19:16:09 第一次定稿]
*/
