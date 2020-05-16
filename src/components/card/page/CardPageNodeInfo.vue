<template>
    <div class="unselected">
        <card-sub-row :text="nameTrans[type] + '标题'" :close-able="editInPaper" v-model="settingInPaper.showTitle">
            <template v-slot:content>
                <v-row no-gutters>
                <v-col class="pa-2" cols="5">
                    <node-avatar
                        :source-url="mainImage"
                        :imageList="imageList"
                        :edit-mode="editable"
                        :given-avatar-size="1440"
                        @new-main-image="mainImage = arguments[0]">

                    </node-avatar>
                </v-col>
                <v-col class="pa-2" cols="7">
                    <v-text-field
                        v-model="name"
                        class="pr-2 pt-2 font-weight-bold"
                        :style="simplifySetting.titleSize"
                        :disabled="!editable"
                        label="Name"
                        dense>

                    </v-text-field>
                    <p-label-selector
                        :label="info.PrimaryLabel"
                        @update-label="label = $event"
                        :disabled="!typeSelectable || !editMode"
                        class="mt-n2">

                    </p-label-selector>
                    <item-sharer :base-data="baseData" :user-concern="userConcern" class="mt-n2" :x-small="editInPaper">

                    </item-sharer>
                </v-col>
                </v-row>
            </template>
        </card-sub-row>

        <card-sub-row :text="'保存与记录'" v-if="isUserControl && !editInPaper">
            <template v-slot:content>
                <div class="d-flex flex-row">
                    <v-menu offset-y>
                        <template v-slot:activator="{ on }">
                            <v-btn text v-on="on" coor="primary">Save</v-btn>
                        </template>
                        <v-list>
                            <v-list-item @click="saveItem(false)">Save and Publish</v-list-item>
                            <v-list-item @click="saveItem(true)" :disabled="!baseData.isRemote">Save as Draft
                            </v-list-item>
                        </v-list>
                    </v-menu>
                    <icon-group :icon-list="editIcon" v-show="!editMode">

                    </icon-group>
                </div>
            </template>
        </card-sub-row>

        <card-sub-row
            :text="nameTrans[type] + '的别名与翻译'"
            :close-able="editInPaper"
            v-model="settingInPaper.showTranslate"
        >
            <template v-slot:content>
                <v-text-field
                    :disabled="!editable"
                    class="pa-2 font-weight-bold"
                    dense
                    label="Alias"
                    placeholder="使用;分割多个别名"
                    style="font-size: 16px;"
                    v-if="simplifySetting.renderAlias"
                    v-model="alias">

                </v-text-field>
            </template>
        </card-sub-row>

        <card-sub-row
            :text="nameTrans[type] + '相关话题'"
            :close-able="editInPaper"
            v-model="settingInPaper.showTopic"
        >
            <template v-slot:content>
                <v-chip-group column class="pa-2">
                    <global-chip
                        v-for="(label, index) in info.Topic"
                        :key="label"
                        :label="label"
                        :small="simplifySetting.chipSize === 'small'"
                        :x-small="simplifySetting.chipSize === 'xSmall'"
                        :index="index"
                        :closeable="isUserControl"
                        @close-chip="removeTopic">

                    </global-chip>

                    <v-edit-dialog>
                        <v-chip
                            v-if="editable"
                            :small="simplifySetting.chipSize === 'small'"
                            :x-small="simplifySetting.chipSize === 'xSmall'">
                            <v-icon small>mdi-pencil</v-icon>
                        </v-chip>
                        <template v-slot:input>
                            <field-array
                                :prop-name="'Topic'"
                                :base-array="info.Topic"
                                :available-tags="topicItems"
                                :width="300"
                                @update-value="updateValue">

                            </field-array>
                        </template>
                    </v-edit-dialog>
                </v-chip-group>
            </template>
        </card-sub-row>

        <card-sub-row
            :text="nameTrans[type] + '有关的标签'"
            :close-able="editInPaper"
            v-model="settingInPaper.showLabels"
        >
            <template v-slot:content>
                <card-sub-label-group
                    :editable="group.editable"
                    :key="index"
                    :label-items="labelItems"
                    :label-list="group.labels"
                    :name="group.name"
                    @add-label="addItem(arguments[0], group.prop)"
                    @remove-label="removeItem"
                    class="pa-2"
                    small
                    v-for="(group, index) in labelGroup">

                </card-sub-label-group>
            </template>
        </card-sub-row>

        <card-sub-row
            :text="'你的评分'"
            :close-able="editInPaper"
            v-model="settingInPaper.showRating"
        >
            <template v-slot:content>
                <v-col v-for="(level, index) in levelGroup"
                       :key="index"
                       class="pa-0 ma-0">
                    <card-sub-rating
                        :render-detail="false"
                        :rating="level"
                        :value="userConcern[level.name]"
                        @update-rating="updateRating">
                    </card-sub-rating>
                </v-col>
            </template>
        </card-sub-row>

        <card-sub-row
            :text="nameTrans[type] + '属性'"
            :close-able="editInPaper"
            v-model="settingInPaper.showProps"
        >
            <template v-slot:content>
                <field-json
                    :base-props="editProps"
                    :change-type="false"
                    :editable="editable"
                    :prop-name="'Info'"
                    :p-label="info.PrimaryLabel"
                    @update-value="editProps = arguments[1]">

                </field-json>
            </template>
        </card-sub-row>

        <card-sub-row
            :text="nameTrans[type] + '描述'"
            :close-able="editInPaper"
            v-model="settingInPaper.showDescription"
        >
            <template v-slot:content>
                <field-text
                    class="pa-2"
                    :base-text="info.Description"
                    :prop-name="'Description'"
                    :editable="editable"
                    @update-value="updateValue"
                >

                </field-text>
            </template>
        </card-sub-row>
        <slot name="footContent">

        </slot>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import FieldArray from "@/components/field/FieldArray.vue";
    import FieldJson from "@/components/field/FieldJson.vue";
    import FieldText from "@/components/field/FieldText.vue";
    import CardSubLabelGroup from "@/components/card/subComp/CardSubLabelGroup.vue";
    import CardSubRow from "@/components/card/subComp/CardSubRow.vue";
    import CardSubRating from "@/components/card/subComp/CardSubRating.vue";
    import NodeAvatar from "@/components/NodeAvatar.vue";
    import GlobalChip from "@/components/global/GlobalChip.vue";
    import ItemSharer from "@/components/ItemSharer.vue";
    import ItemMarker from "@/components/ItemMarker.vue";
    import PLabelSelector from "@/components/PLabelSelector.vue";
    import IconGroup from "@/components/IconGroup.vue";
    import {availableLabel, EditProps, FieldType, labelItems, ResolveType, topicItems} from "@/utils/fieldResolve";
    import {LabelGroup} from "@/interface/interfaceInComponent"
    import {deepClone} from "@/utils/utils";
    import {nodeBulkCreate, nodeBulkUpdate} from "@/api/subgraph/node";
    import {dispatchUserConcernQuery, dispatchUserLabelProps} from "@/store/modules/_dispatch";
    import {getIcon} from "@/utils/icon";
    import {userConcernTemplate} from "@/utils/template";
    import {MediaInfoPart, NodeInfoPart} from "@/class/info";
    import {nodeShowInPaperTemplate} from "@/interface/style/templateStylePaper";

    export default Vue.extend({
        name: "CardPageNodeInfo",
        components: {
            FieldArray,
            FieldJson,
            FieldText,
            CardSubLabelGroup,
            CardSubRow,
            CardSubRating,
            NodeAvatar,
            GlobalChip,
            ItemSharer,
            ItemMarker,
            PLabelSelector,
            IconGroup
        },
        data() {
            return {
                nameTrans: {
                    "document": "专题",
                    "node": "节点"
                },
                nodeLabels: availableLabel,
                topicItems: topicItems,
                labelItems: labelItems,
                plusIcon: getIcon('i-edit', 'add'),
                userConcern: userConcernTemplate(),
                editBase: false
            }
        },
        props: {
            baseData: {
                type: Object as () => NodeInfoPart,
                required: true
            },
            editMode: {
                type: Boolean,
                default: false
            },
            editInPaper: {
                type: Boolean,
                default: false
            },
            settingInPaper: {
                type: Object,
                default: () => nodeShowInPaperTemplate()
            },
        },
        computed: {
            info: function (): BaseNodeInfo {
                return this.baseData.Info
            },
            ctrl: function (): BaseNodeCtrl {
                return this.baseData.Ctrl
            },

            dataManager: function (): DataManagerState {
                return this.$store.state.dataManager
            },

            userDataManager: function (): UserDataManagerState {
                return this.$store.state.userDataManager
            },

            type: function (): DocumentItemType {
                return this.info.type
            },

            typeSelectable: function (): boolean {
                return ['node'].includes(this.type)
            },

            simplifySetting: function (): Record<string, any> {
                return {
                    titleSize: 'font-size: 18px',
                    chipSize: 'small',
                    renderAlias: true
                }
            },

            isUserControl: function (): boolean {
                return this.baseData.isSelf
            },

            editable: function (): boolean {
                // 既处于
                return this.isUserControl && (this.editMode || this.editBase)
            },

            editIcon: function (): IconItem[] {
                return [{
                    name: getIcon('i-edit-able', !this.editBase),
                    disabled: !this.isUserControl,
                    _func: this.edit,
                    toolTip: !this.editBase ? '编辑内容' : '停止编辑'
                }]
            },

            name: {
                get(): string {
                    return this.info.Name
                },
                set(value: string) {
                    let node = this.baseData as NodeInfoPart;
                    node.changeName(value)
                }
            },

            alias: {
                get(): string {
                    let output = this.info.Alias.join(";");
                    return output.length > 16 ? output.substring(0, 16) : output;
                },
                set(value: string): void {
                    let alias = value.split(";");
                    this.baseData.updateValue('Alias', alias)
                }
            },

            label: {
                get(): string {
                    return this.baseData._label
                },
                set(value: string) {
                    let node = this.baseData as NodeInfoPart;
                    node.changePrimaryLabel(value)
                }
            },

            mainImage: {
                get(): string {
                    return this.info.MainPic
                },
                set: function (value: string) {
                    this.baseData.changeImage(value)
                }
            },

            editProps: {
                get(): EditProps {
                    return Object.assign({
                        ExtraProps: {
                            value: this.info.ExtraProps,
                            type: "JsonField" as FieldType,
                            resolve: "normal" as ResolveType
                        }
                    }, this.info.StandardProps)
                },
                set(value: EditProps) {
                    this.updateValue('ExtraProps', value.ExtraProps.value);
                    let StandardProps = deepClone(value);
                    delete StandardProps.ExtraProps;
                    this.updateValue('StandardProps', StandardProps);
                    dispatchUserLabelProps({
                        [this.baseData._label]: Object.keys(this.baseData.Info.ExtraProps)
                    })
                }
            },

            labelGroup: function (): LabelGroup[] {
                return this.editable
                    ? [
                        {
                            "name": "作者的标注",
                            "labels": this.info.Labels,
                            "closeable": true,
                            "editable": true,
                            'prop': 'Info'
                        }
                    ]
                    : [
                        {
                            "name": "作者的标注",
                            "labels": this.info.Labels,
                            "closeable": false,
                            "editable": false,
                            'prop': 'Info'
                        },
                        {
                            "name": "用户的标注",
                            "labels": this.ctrl.Labels,
                            "closeable": false,
                            "editable": false,
                            'prop': 'Ctrl'
                        },
                        {
                            "name": "你的标注",
                            "labels": this.userConcern.Labels,
                            "closeable": true,
                            "editable": true,
                            'prop': 'UserConcern'
                        }
                    ]
            },

            levelGroup: function () {
                //todo 评分机制 已经列入文档
                return {}
            },

            imageList: function (): MediaInfoPart[] {
                let result: MediaInfoPart[] = [];
                this.info.IncludedMedia.map(_id => {
                    let media = this.dataManager.mediaManager[_id];
                    if (media && media._label === 'image') {
                        result.push(media)
                    }
                })
                return result;
            },
        },
        methods: {
            updateValue(prop: string, value: any) {
                this.baseData.updateValue(prop, value)
            },

            removeItem(removedLabel: string, prop: string) {
                this.baseData.isEdit = true
            },

            removeTopic(index: number) {
                this.info.Topic.splice(index, 1);
                this.baseData.isEdit = true
            },

            addItem(value: string[], prop: string) {
                prop === 'Info'
                    ? this.baseData.updateValue('Labels', value)
                    : (this.userConcern.Labels = value)
            },

            updateRating(prop: LevelConcern, rating: number) {

            },

            saveItem(isDraft: boolean, isAuto: boolean = false) {
                if (isDraft) {
                    this.baseData.draftSave(isAuto)
                } else {
                    let data = [this.baseData];
                    if (this.baseData.isRemote) {
                        nodeBulkUpdate(data)
                    } else {
                        nodeBulkCreate(data)
                    }
                }
            },

            edit() {
                this.editBase = !this.editBase
            }
        },
        watch: {

        },
        created(): void {
        },

        mounted(): void {
            if (this.baseData.isRemote) {
                dispatchUserConcernQuery([this.baseData._id]).then(() => {
                    let concern = this.userDataManager.userConcernDict[this.baseData._type][this.baseData._id];
                    if (concern) {
                        this.userConcern = concern
                    }
                })
            } else {
                //doNothing
            }
        },
        record: {
            status: 'done',
            description: 'NodeInfo'
            //todo 收藏 分享 单个点赞 已经列入文档
        }
    })
</script>

<style scoped>
    @import '../../../style/css/unselected.css';
    @import '../../../style/css/card.css';
</style>

/**
* Created by whb on 2019/11/29
* Updated by []
*/
