<template>
  <v-card
    @mouseenter.stop="showTool = true"
    @mouseleave.stop="showTool = false"
    :width="width"
    :height="height"
    flat tile outlined>
    <media-viewer :file="file" :width="width">
      <template v-slot:button-group>
        <div
          :style="{opacity: toolOpacity}"
          class="d-flex flex-column button-group pl-1"
          v-show="showTool">
          <v-btn
            :disabled="item.icon === ''"
            :key="item.icon"
            @click="item._func"
            color="white"
            icon
            small
            v-for="item in iconList">
            <v-icon>{{ item.icon }}</v-icon>
          </v-btn>
        </div>
      </template>
    </media-viewer>

    <title-text-field
      :edit-mode="editMode"
      :text="file.Info.Name"
      @update-text="updateName"
      v-show="showText">

    </title-text-field>

    <v-card-text :width="width" v-show="detailOn" class="mt-n8">
      <card-sub-info-label-group
        @remove-item="removeItem"
        @add-item="addItem"
        :label-group="labelGroup"
        :label-items="labelItems"
        small>

      </card-sub-info-label-group>
      <field-text
        prop-name="Text"
        :base-text="info.Text"
        :editable="editMode"
        @update-value="updateValue">

      </field-text>
    </v-card-text>
    <v-card-actions v-show="detailOn">
      <v-btn text>
        Learn More+
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn text @click="editMode = !editMode" :disabled="!file.isSelf">
        {{ editText }}
      </v-btn>
      <v-btn text @click="saveMedia" :disabled="!file.isSelf">
        Save
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import MediaViewer from "../../MediaViewer.vue";
    import FieldText from "@/components/field/FieldText.vue";
    import TitleTextField from "@/components/TitleTextField.vue";
    import {labelItems} from "@/utils/labelField.ts";
    import {updateMediaNode} from "@/api/commonSource";

    export default Vue.extend({
        name: "CardPageMediaInfo",
        components: {
            TitleTextField,
            MediaViewer,
            FieldText
        },
        data() {
            return {}
        },
        props: {
            file: {
                type: Object,
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
            info: vm => vm.file.Info,
            ctrl: vm => vm.file.Ctrl,
            userConcern: vm => vm.file.UserConcern,
            labelGroup: vm =>
                vm.editMode
                    ? [
                        {"name": "作者的标注", "labels": vm.info.Labels, "closeable": false, "editable": true}
                    ]
                    : [
                        {"name": "作者的标注", "labels": vm.info.Labels, "closeable": false, "editable": false},
                        {"name": "用户的标注", "labels": vm.ctrl.Labels, "closeable": false, "editable": false},
                        {"name": "你的标注", "labels": vm.userConcern.Labels, "closeable": true, "editable": true}
                    ],

            title: vm => vm.info.PrimaryLabel + ' --> ' + vm.info.Name,

            toolOpacity: vm => vm.showTool
                ? '50%'
                : '0%',

            starIcon: vm => vm.userConcern.isStar
                ? 'mdi-star'
                : 'mdi-star-outline',
            goodIcon: vm => vm.userConcern.isGood
                ? 'mdi-thumb-up'
                : 'mdi-thumb-up-outline',
            badIcon: vm => vm.userConcern.isBad
                ? 'mdi-thumb-down'
                : 'mdi-thumb-down-outline',
            arrowIcon: vm => vm.detailOn
                ? 'mdi-chevron-double-up'
                : 'mdi-chevron-double-down',
            shareColor: vm => vm.userConcern.isShared
                ? 'yellow'
                : 'grey',

            editText: vm => vm.editMode
                ? 'Edit Off'
                : 'Edit On',

            showText: vm => vm.height >= 120,

            //能够删除 在画布中删除是从画布中删除 在节点中删除是从节点删除
            showDeleteIcon: vm => vm.inViewBox
                ? vm.nodeIsSelf
                : vm.$store.state.dataManager.currentGraph.isSelf,

            //能够变成media节点:不在画布里而且画布是isSelf的
            showExportIcon: vm => !vm.inViewBox && vm.$store.state.dataManager.currentGraph.State.isSelf,

            normalIconList: vm => [
                {icon: 'mdi-magnify', _func: vm.dialogWatch, render: true},
                {icon: vm.starIcon, _func: vm.starItem, render: true},
                {icon: vm.goodIcon, _func: vm.goodItem, render: true},
                {icon: vm.badIcon, _func: vm.badItem, render: true},
                {icon: 'mdi-share-variant', _func: vm.shareItem, color: vm.shareColor, render: true},
                {icon: vm.arrowIcon, _func: vm.changeDetail, render: true},
                {icon: '', _func: '', render: true},
                {icon: 'mdi-pencil', _func: vm.editSrc, render: vm.file.isSelf},
                {icon: 'mdi-delete', _func: vm.deleteItem, render: vm.file.isSelf || vm.showDeleteIcon},
                {icon: 'mdi-arrow-left-bold-circle-outline', _func: vm.addMediaToGraph, render: vm.showExportIcon},
            ],

            iconList: vm => vm.normalIconList.filter(item => item.render),
        },
        methods: {},
        watch: {},
        record: {
            status: 'edit'
        }
    })
</script>

<style scoped>

</style>
