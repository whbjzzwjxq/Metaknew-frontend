<template>
    <div v-if="!loading">
        <card-sub-row :text="nameTrans[type] + '标题'">
            <template v-slot:content>
                <v-col cols="4" class="pa-0 ma-0 pb-1">
                    <node-avatar
                        :source-url="mainImage"
                        :imageList="imageList"
                        @new-main-image="mainImage = arguments[0]"
                        @clear-main-image="mainImage = ''">

                    </node-avatar>
                </v-col>
                <v-col cols="8" class="pt-1 ma-0 pl-4">
                    <v-row>
                        <v-text-field
                            v-model="name"
                            class="pr-2 font-weight-bold"
                            :style="simplifySetting.titleSize"
                            :disabled="!editMode"
                            label="Name"
                            dense>

                        </v-text-field>
                    </v-row>
                    <v-row>
                        <v-autocomplete
                            :disabled="!typeSelectable"
                            :items="nodeLabels"
                            :value="info.PrimaryLabel"
                            class="pr-2 font-weight-bold"
                            dense
                            label="PrimaryLabel"
                            style="font-size: 18px;"
                            v-model="label">

                        </v-autocomplete>
                    </v-row>
                </v-col>
            </template>
        </card-sub-row>

        <card-sub-row :text="nameTrans[type] + '相关话题'">
            <template v-slot:content>
                <v-chip-group column>
                    <global-chip
                        v-for="(label, index) in info.Topic"
                        :key="label"
                        :label="label"
                        :size="simplifySetting.chipSize"
                        :index="index"
                        @close-chip="removeTopic">

                    </global-chip>

                    <v-edit-dialog>
                        <v-chip
                            v-if="editMode"
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

        <card-sub-row :text="nameTrans[type] + '的别名与翻译'">
            <template v-slot:content>
                <v-text-field
                    :disabled="!editMode"
                    class="pt-2 font-weight-bold"
                    dense
                    label="Alias"
                    placeholder="使用;分割多个别名"
                    style="font-size: 16px;"
                    v-if="simplifySetting.renderAlias"
                    v-model="alias">

                </v-text-field>
                <field-text
                    :base-text="info.Translate"
                    :editable="editMode"
                    :prop-name="'Translate'"
                    @update-value="updateValue"
                    label="Translate"
                    single-line
                >

                </field-text>
            </template>
        </card-sub-row>

        <card-sub-row :text="nameTrans[type] + '有关的标签'">
            <template v-slot:content>
                <card-sub-label-group
                    @remove-item="removeItem"
                    @add-item="addItem"
                    :label-group="labelGroup"
                    :label-items="labelItems"
                    small>

                </card-sub-label-group>
            </template>
        </card-sub-row>

        <card-sub-row :text="'你的评分'">
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

        <card-sub-row :text="nameTrans[type] + '属性'">
            <template v-slot:content>
                <field-json
                    :base-props="editProps"
                    :change-type="false"
                    :editable="editMode"
                    :prop-name="'Info'"
                    :p-label="info.PrimaryLabel"
                    @update-value="editProps = arguments[1]">

                </field-json>
            </template>
        </card-sub-row>

        <card-sub-row :text="nameTrans[type] + '描述'">
            <template v-slot:content>
                <field-text
                    class="pa-1"
                    :base-text="info.Text"
                    :prop-name="'Text'"
                    :editable="editMode"
                    @update-value="updateValue"
                >

                </field-text>
            </template>
        </card-sub-row>

        <v-btn text>
            Learn More
        </v-btn>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {LevelConcern, MediaInfoPart, NodeInfoPart} from "@/utils/graphClass";
    import FieldArray from "@/components/field/FieldArray.vue";
    import FieldJson from "@/components/field/FieldJson.vue";
    import FieldText from "@/components/field/FieldText.vue";
    import CardSubLabelGroup from "@/components/card/subComp/CardSubLabelGroup.vue";
    import CardSubRow from "@/components/card/subComp/CardSubRow.vue";
    import CardSubRating from "@/components/card/subComp/CardSubRating.vue";
    import NodeAvatar from "@/components/NodeAvatar.vue";
    import GlobalChip from "@/components/global/GlobalChip.vue";
    import {availableLabel, FieldType, labelItems, ResolveType, topicItems} from "@/utils/labelField";
    import {DataManagerState} from "@/store/modules/dataManager";
    import {EditProps, LabelGroup} from "@/utils/interfaceInComponent"
    import {deepClone} from "@/utils/utils";

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
            GlobalChip
        },
        data() {
            return {
                nameTrans: {
                    "document": "专题",
                    "node": "节点"
                },
                nodeLabels: availableLabel.concat(["DocGraph", "DocPaper"]),
                topicItems: topicItems,
                labelItems: labelItems,
                loading: true,
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
            isSimplify: {
                type: Boolean as () => boolean,
                default: false
            }
        },
        computed: {
            info: function () {
                return this.baseData.Info
            },
            ctrl: function () {
                return this.baseData.Ctrl
            },
            userConcern: function () {
                return this.baseData.UserConcern
            },

            dataManager: function (): DataManagerState {
                return this.$store.state.dataManager
            },

            type: function () {
                return this.info.type
            },

            typeSelectable: function () {
                return ['node'].includes(this.type)
            },

            simplifySetting: function () {
                return this.isSimplify
                    ? {
                        titleSize: 'font-size: 14px',
                        chipSize: 'xSmall',
                        renderAlias: true
                    }
                    : {
                        titleSize: 'font-size: 18px',
                        chipSize: 'small',
                        renderAlias: true
                    }
            },

            name: {
                get(): string {
                    return this.info.Name
                },
                set(value: string) {
                    this.baseData.changeName(value)
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
                    return this.info.PrimaryLabel
                },
                set(value: string) {
                    this.baseData.changePrimaryLabel(value)
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
                    }, this.info.CommonProps)
                },
                set(value: EditProps) {
                    this.updateValue('ExtraProps', value.ExtraProps.value);
                    let commonProps = deepClone(value);
                    delete commonProps.ExtraProps;
                    this.updateValue('CommonProps', commonProps)
                }
            },

            labelGroup: function (): LabelGroup[] {
                return this.editMode
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

            levelGroup() {
                return {}
            },

            imageList() {
                let vm = this;
                return vm.isSimplify
                    ? []
                    : vm.info.IncludedMedia.map(id => {
                        let media = vm.dataManager.mediaManager[id];
                        if (media && media.Info.PrimaryLabel === 'image') {
                            return media as MediaInfoPart
                        } else {
                            return undefined
                        }
                    }).filter(media => media !== undefined)
            },

        },
        methods: {
            updateValue(prop: string, value: any) {
                this.baseData.updateValue(prop, value)
            },

            removeItem(removedLabel: string, prop: string) {
                this.$set(this.baseData, 'isEdit', true);
            },

            removeTopic(index: number) {
                this.info.Topic.splice(index, 1);
                this.$set(this.baseData, 'isEdit', true)
            },

            addItem(value: string[], prop: string) {
                prop === 'Info'
                    ? this.baseData.updateValue('Labels', value)
                    : this.baseData.updateUserConcern('Labels', value)
            },

            updateRating(prop: LevelConcern, rating: number) {
                this.baseData.updateUserConcern(prop, rating)
            }
        },
        watch: {},
        created() {
            this.$store.dispatch('mediaQuery', this.baseData.Info.IncludedMedia).then(() => {
                this.loading = false
            })
        },

        updated() {
            this.$store.dispatch('mediaQuery', this.baseData.Info.IncludedMedia).then(() => {
                this.loading = false
            })
        },
        record: {
            status: 'done-old'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/11/29
* Updated by []
*/
