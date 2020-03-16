<template>
    <v-card :width="width" tile flat class="pa-2">
        <v-simple-table dense>
            <template v-slot:default>
                <thead>
                <tr>
                    <th class="text-left">Prop</th>
                    <th class="text-left">Value</th>
                    <th class="text-left" v-if="changeType">Type</th>
                    <th class="text-left" v-if="changeType">Resolve</th>
                    <th class="text-left" v-if="changeType">Action</th>
                </tr>
                </thead>

                <tbody>
                <tr v-for="(item, key) in dict" :key="key">
                    <td>
                        <v-text-field
                            :value="key"
                            :rules="rules"
                            @input="inputKey"
                            @blur="updateKey(key, item)"
                            :disabled="!changeType"
                            dense
                            height="16px"
                            style="width: 100px;"
                            class="pt-4">

                        </v-text-field>
                    </td>

                    <td>
                        <data-table-field
                            :prop-name="key"
                            :base-value="item.value"
                            :field-type="item.type"
                            :resolve="item.resolve"
                            :setting="fieldSetting"
                            :p-label="pLabel"
                            @update="updateValue(key, $event)">

                        </data-table-field>
                    </td>

                    <td v-if="changeType">
                        <v-select
                            :value="item.type"
                            @change="updateType(item, key, $event)"
                            :items="types"
                            dense>

                        </v-select>
                    </td>

                    <td v-if="changeType">
                        <v-select
                            :value="item.resolve"
                            @change="updateResolveType(item, key, $event)"
                            :items="resolves">

                        </v-select>
                    </td>

                    <td v-if="changeType">
                        <v-btn
                            v-if="editable"
                            @click="delProp(key)"
                            left x-small icon>
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                    </td>

                </tr>

                </tbody>
            </template>
        </v-simple-table>
        <template v-if="changeType">
            <div class="d-flex flex-row">
                <v-col cols="3">
                    <v-btn text small @click="addNewProp">
                        New Item
                        <v-icon right small>mdi-plus</v-icon>
                    </v-btn>
                </v-col>
                <v-col cols="3">
                    <v-btn text small @click="update">
                        Save
                        <v-icon right small>mdi-content-save</v-icon>
                    </v-btn>
                </v-col>
            </div>
        </template>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {fieldSetting, fieldDefaultValue, FieldType, ResolveType, ValueWithType} from '@/utils/fieldResolve'
    import {deepClone, fieldHandler} from '@/utils/utils';
    import {validGroup} from "@/utils/validation";
    import {Rule} from "@/interface/interfaceInComponent";
    import {dispatchUserPropResolveChange} from "@/store/modules/_dispatch";

    export default Vue.extend({
        name: 'fieldJson',
        data() {
            return {
                cacheKey: '' as string,
                rules: [
                    validGroup.String.badChar(),
                    validGroup.String.maxCheck('key', 20),
                    validGroup.String.notNone('key')
                ] as Rule<string>[],
                fieldSetting: fieldSetting,
                types: ['TextField', 'ArrayField', 'NumberField', 'StringField',
                    'JsonField', 'FileField', 'ImageField', 'BooleanField'] as FieldType[],
                resolves: ['name', 'time', 'location', 'normal'] as ResolveType[],
                reg: new RegExp('[\\\\:*?"<>|]'),
                stringHandler: fieldHandler()
            }
        },
        components: {
            dataTableField: () => import('@/components/DataTableField.vue')
        },
        props: {
            baseProps: {
                type: Object,
                required: true
            },
            propName: {
                type: String,
                required: true
            },
            width: {
                type: [Number, String],
                default: 360
            },
            // 是否是原生属性
            changeType: {
                type: Boolean,
                default: false
            },
            // 是否是editMode
            editable: {
                type: Boolean,
                default: true
            },
            pLabel: {
                type: String,
                required: true
            },

            defaultValue: {
                type: Object,
                default: function () {
                    return {}
                }
            },

            newPropType: {
                type: String as () => FieldType,
                default: 'StringField' as FieldType
            }
        },

        computed: {
            keys: function (): string[] {
                return Object.keys(this.dict)
            },
            dict: function (): Record<string, any> {
                return deepClone(this.baseProps)
            },
            propNum: function (): number {
                return this.keys.length
            },
            status: function (): 'default' | 'error' {
                return this.keys.filter((key: string) => (key && key.length <= 20)).length === this.propNum
                    ? 'default'
                    : 'error'
            },
            userDataManager: function (): UserDataManagerState {
                return this.$store.state.userDataManager
            }
        },

        methods: {
            inputKey($event: string) {
                this.cacheKey = $event
            },

            updateKey(key: string, item: ValueWithType<any>) {
                let newKey = this.cacheKey;
                let newValue: ValueWithType<any>;
                if (newKey !== '') {
                    this.delProp(key);
                    let propDescription = this.userDataManager.userPropResolve[newKey];
                    if (propDescription) {
                        let {resolve, type} = propDescription;
                        newValue = {
                            value: fieldDefaultValue[type],
                            resolve,
                            type
                        }
                    } else {
                        dispatchUserPropResolveChange({prop: newKey, resolve: item, strict: false});
                        newValue = item;
                    }
                    this.addProp(newKey, newValue);
                    this.cacheKey = '';
                }
            },

            updateValue(item: string, value: any) {
                this.$set(this.dict[item], 'value', value);
                this.update()
            },

            delProp(key: string) {
                this.$delete(this.dict, key);
                this.update()
            },

            addProp(key: string, item: any) {
                this.$set(this.dict, key, item);
                this.update()
            },

            addNewProp() {
                let key = '$_new' + this.propNum;
                let item = {
                    'value': fieldDefaultValue[this.newPropType],
                    'type': this.newPropType,
                    'resolve': 'normal',
                } as ValueWithType<any>;
                this.addProp(key, item)
            },

            updateType(item: ValueWithType<any>, key: string, type: FieldType) {
                item.type = type;
                item.value = this.stringHandler[type](item.value);
                dispatchUserPropResolveChange({prop: key, resolve: {resolve: item.resolve, type}, strict: true});
                this.update()
            },

            updateResolveType(item: ValueWithType<any>, key: string, resolve: ResolveType) {
                item.resolve = resolve;
                let {type} = item;
                dispatchUserPropResolveChange({prop: key, resolve: {resolve, type}, strict: true});
                this.update()
            },

            update() {
                this.$emit('update-value', this.propName, this.dict, this.status)
            }
        },

        record: {
            status: 'done',
            description: '字典格式编辑器'
        }
    })
</script>

<style scoped>

</style>
/**
* Created by whb on 2019/12/4
* Updated by [whb on 2020年1月8日19:58:44]
*/
