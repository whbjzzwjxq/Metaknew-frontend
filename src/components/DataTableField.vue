<template>
    <v-edit-dialog v-if="fieldType !== 'BooleanField'">
        <v-chip label tile small :color="status" :disabled="!editable">
            {{ statusText }}
        </v-chip>
        <template v-slot:input>
            <field-string
                v-if="fieldType === 'StringField'"
                :prop-name="propName"
                :base-text="baseValue"
                :editable="editable"
                v-bind="setting[propName]"
                @update-value="update">

            </field-string>

            <field-array
                v-else-if="fieldType === 'ArrayField'"
                :prop-name="propName"
                :base-array="baseValue"
                :editable="editable"
                v-bind="setting[propName]"
                @update-value="update">

            </field-array>

            <field-number
                v-else-if="fieldType === 'NumberField'"
                :prop-name="propName"
                :base-num="baseValue"
                :editable="editable"
                v-bind="setting[propName]"
                @update-value="update">

            </field-number>

            <field-json
                v-else-if="fieldType === 'JsonField'"
                :prop-name="propName"
                :base-props="baseValue"
                :change-type="true"
                :p-label="pLabel"
                :editable="editable"
                v-bind="setting[propName]"
                @update-value="update">

            </field-json>

            <field-text
                v-else-if="fieldType === 'TextField'"
                :prop-name="propName"
                :base-text="baseValue"
                :editable="editable"
                v-bind="setting[propName]"
                @update-value="update">

            </field-text>

            <field-file
                v-else-if="fieldType === 'FileField'"
                :prop-name="propName"
                :base-files="baseValue"
                v-bind="setting[propName]"
                @update-value="update"
                upload-mode>

            </field-file>

            <node-avatar
                v-else-if="fieldType === 'ImageField'"
                :image-list="[]"
                :source-url="baseValue"
                @new-main-image="update(propName, arguments[0])"
                edit-mode
                v-bind="setting[propName]"
            >

            </node-avatar>
        </template>
    </v-edit-dialog>

    <v-checkbox
        v-else-if="fieldType === 'BooleanField'"
        :value="baseValue"
        :disabled="!editable"
        @change="update(propName, !baseValue, 'default')">

    </v-checkbox>

</template>

<script lang="ts">
    import Vue from 'vue'
    import {fieldSetting, FieldType} from "@/utils/fieldResolve"
    import FieldText from '@/components/field/FieldText.vue'
    import FieldString from '@/components/field/FieldString.vue'
    import FieldArray from '@/components/field/FieldArray.vue'
    import FieldFile from '@/components/field/FieldFile.vue';
    import FieldJson from '@/components/field/FieldJson.vue';
    import FieldNumber from '@/components/field/FieldNumber.vue';
    import NodeAvatar from "@/components/NodeAvatar.vue";
    import {indexToColor} from "@/utils/utils"

    export default Vue.extend({
        name: "dataTableField",
        components: {
            FieldText,
            FieldString,
            FieldArray,
            FieldNumber,
            FieldJson,
            FieldFile,
            NodeAvatar
        },
        data() {
            return {
                status: "default",
                checkStatus: true,
                actionColor: {
                    "exist": "primary",
                    "uploading": "todo",
                    "done": "success",
                    "error": "error"
                }
            }
        },
        computed: {
            statusText: function (): string {
                switch (this.fieldType) {
                    case 'StringField':
                        return this.textView(this.baseValue);
                    case 'ArrayField':
                        return this.baseValue.length;
                    case 'NumberField':
                        return this.baseValue;
                    case 'JsonField':
                        return this.jsonView(this.baseValue).toString();
                    case 'TextField':
                        return this.jsonView(this.baseValue).toString();
                    case 'FileField':
                        return this.baseValue.length;
                    case 'ImageField':
                        return this.baseValue ? 'done' : 'empty';
                    default:
                        return 'default'
                }
            }
        },
        props: {
            propName: {
                type: String,
                required: true
            },
            baseValue: {
                type: [String, Object, Array, Number, Boolean],
                required: true
            },

            fieldType: {
                type: String as () => FieldType,
                required: true
            },

            pLabel: {
                type: String,
                required: true
            },
            resolve: {
                type: String,
                required: true
            },
            setting: {
                type: Object,
                default() {
                    return fieldSetting
                }
            },
            editable: {
                type: Boolean,
                default: true
            }
        },

        methods: {
            update(propName: string, value: any, status: string = 'default') {
                this.status = status;
                this.$emit("update", value);
            },

            //chip颜色
            indexToColor(index: number) {
                return indexToColor(index)
            },

            //字显示模式
            textView: (value: string) => value.length >= 21
                ? value.slice(0, 18) + "..."
                : value,

            jsonView: (value: object) => Object.keys(value).length,

        },
        record: {
            status: 'done',
            description: '针对不同类型的数据的编辑器'
        }
    })
</script>

<style scoped>

</style>
