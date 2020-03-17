<template>
    <v-edit-dialog v-if="fieldType === 'StringField'">
        <v-chip label tile small :color="status">
            {{ textView(baseValue) }}
        </v-chip>
        <template v-slot:input>
            <field-string
                :prop-name="propName"
                :base-text="baseValue"
                v-bind="setting[propName]"
                @update-value="update">

            </field-string>
        </template>
    </v-edit-dialog>

    <v-edit-dialog v-else-if="fieldType === 'ArrayField'">
        <v-chip label outlined small :color="status">
            {{ baseValue.length }}
        </v-chip>
        <template v-slot:input>
            <field-array
                :prop-name="propName"
                :base-array="baseValue"
                v-bind="setting[propName]"
                @update-value="update">

            </field-array>
        </template>
    </v-edit-dialog>

    <v-edit-dialog v-else-if="fieldType === 'NumberField'">
        <v-chip
            label outlined
            small :color="status">
            {{ baseValue }}
        </v-chip>
        <template v-slot:input>
            <field-number
                :prop-name="propName"
                :base-num="baseValue"
                v-bind="setting[propName]"
                @update-value="update">

            </field-number>
        </template>
    </v-edit-dialog>

    <v-edit-dialog v-else-if="fieldType === 'JsonField'">
        <v-chip
            label outlined
            small :color="status">
            {{ jsonView(baseValue) }}
        </v-chip>
        <template v-slot:input>
            <field-json
                :prop-name="propName"
                :base-props="baseValue"
                :change-type="true"
                :p-label="pLabel"
                v-bind="setting[propName]"
                @update-value="update">

            </field-json>
        </template>
    </v-edit-dialog>

    <v-edit-dialog v-else-if="fieldType === 'TextField'">
        <v-chip
            label outlined
            small :color="status">
            {{ Object.keys(baseValue).length }}
        </v-chip>
        <template v-slot:input>
            <field-text
                :prop-name="propName"
                :base-text="baseValue"
                v-bind="setting[propName]"
                @update-value="update">

            </field-text>
        </template>
    </v-edit-dialog>

    <v-edit-dialog v-else-if="fieldType === 'FileField'">
        <v-chip
            label outlined
            small :color="status">
            {{ status }}
        </v-chip>
        <template v-slot:input>
            <field-file
                :prop-name="propName"
                :base-files="baseValue"
                v-bind="setting[propName]"
                @update-value="update"
                upload-mode>

            </field-file>
        </template>
    </v-edit-dialog>

    <v-checkbox v-else-if="fieldType === 'BooleanField'" :value="baseValue"
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
    import {indexToColor} from "@/utils/utils"

    export default Vue.extend({
        name: "dataTableField",
        components: {
            FieldText,
            FieldString,
            FieldArray,
            FieldNumber,
            FieldJson,
            FieldFile
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
        computed: {},
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
            }
        },

        methods: {
            update(propName: string, value: any, status: string) {
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
