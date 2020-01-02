<template>
    <div>
        <card-sub-row text="关系信息">
            <template v-slot:content>
                <v-col class="pt-0 pb-0 ma-0 pl-2">
                    <link-start-end-selector
                        :current-start="start"
                        :current-end="end"
                        :document="document"
                        :edit-mode="editMode"
                        @select-link="changeNode">

                    </link-start-end-selector>
                    <v-text-field
                        :disabled="!editMode"
                        :style="titleSize"
                        class="pr-2 font-weight-bold"
                        dense
                        label="PrimaryLabel"
                        v-model.lazy="pLabel">

                    </v-text-field>
                </v-col>
            </template>
        </card-sub-row>
        <card-sub-row text="关系标签">
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
        <card-sub-row text="关系信息">
            <template v-slot:content>
                <field-json
                    :p-label="'link'"
                    :base-props="editProps"
                    :prop-name="'Info'"
                    :editable="editMode"
                    @update-value="editProps = arguments[1]">

                </field-json>
            </template>
        </card-sub-row>

        <card-sub-row :text="'关系描述'">
            <template v-slot:content>
                <field-text
                    :base-text="info.Text"
                    :prop-name="'Text'"
                    @update-value="updateValue(arguments[0], arguments[1])"
                >

                </field-text>
            </template>
        </card-sub-row>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import CardSubRow from "@/components/card/subComp/CardSubRow.vue";
    import FieldText from "@/components/field/FieldText.vue";
    import FieldJson from "@/components/field/FieldJson.vue";
    import CardSubLabelGroup from "@/components/card/subComp/CardSubLabelGroup.vue";
    import LinkStartEndSelector from "@/components/LinkStartEndSelector.vue";
    import {GraphSelfPart, LinkInfoPart, VisualNodeSettingPart} from "@/utils/graphClass";
    import {FieldType, labelItems, ResolveType, unActivePropLink} from "@/utils/labelField";
    import {EditProps} from "@/utils/interfaceInComponent";
    import {deepClone} from "@/utils/utils";

    export default Vue.extend({
        name: "CardPageLinkInfo",
        components: {
            CardSubRow,
            FieldText,
            FieldJson,
            CardSubLabelGroup,
            LinkStartEndSelector
        },
        data() {
            return {
                titleSize: "font-size: 18px",
                labelItems: labelItems
            }
        },
        props: {
            baseData: {
                type: Object as () => LinkInfoPart,
                required: true
            },
            document: {
                type: Object as () => GraphSelfPart,
                required: true
            },
            editMode: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            start: function (): VisualNodeSettingPart {
                return this.baseData.Ctrl.Start
            },
            end: function () {
                return this.baseData.Ctrl.End
            },
            info: function () {
                return this.baseData.Info
            },
            pLabel: {
                get(): string {
                    return this.info.PrimaryLabel
                },
                set(value: string): void {
                    this.baseData.changeLabel(value)
                }
            },
            //获得ExtraProp
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
            labelGroup: vm => [
                {"name": "作者的标注", "labels": vm.info.Labels, "closeable": false, "editable": true, 'prop': 'Info'}
            ]
        },
        methods: {
            //更换Link start / end
            changeNode(start: VisualNodeSettingPart | null, end: VisualNodeSettingPart | null) {
                this.baseData.changeNode(start, end)
            },
            //更新单个值
            updateValue(prop: string, value: any) {
                this.baseData.updateValue(prop, value)
            },

            removeItem(removedLabel: string, prop: string) {
                this.$set(this.baseData, 'isEdit', true);
            },

            addItem(value: string[], prop: string) {
                this.baseData.updateValue('Labels', value)
            },
        },
        watch: {},
        record: {
            status: 'done-old',
            description: "关系信息卡片"
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/11/29
* Updated by []
*/
