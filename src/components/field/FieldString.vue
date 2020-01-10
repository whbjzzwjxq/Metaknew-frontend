<template>
    <v-card :width="width" tile flat class="pa-2">
        <v-card-text>
            <span class="subheading">Current {{propName}}</span>
            <v-autocomplete
                v-if="select"
                :value="text"
                :items="selection"
                @change="update"
                single-line>

            </v-autocomplete>

            <v-text-field
                v-else
                :value="text"
                :rules="[rules.empty, rules.errorChar, rules.duplicate]"
                @blur="saveText"
                @input="inputText"
                label="EditText"
                single-line
                counter>

            </v-text-field>
        </v-card-text>

        <v-card-text v-if="renderHistory">
            <span class="subheading">History {{propName}}</span>
            <v-chip-group column active-class="primary--text">
                <v-chip
                    v-for="(item, index) in editHistory"
                    :key="index"
                    color="secondary"
                    label
                    outlined
                    tile>
                    {{ item }}
                    <v-icon @click="restoreText(index)" right>restore</v-icon>
                </v-chip>
            </v-chip-group>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {checkDuplicate, checkExist} from '@/utils/utils'

    export default Vue.extend({
        name: 'fieldString',
        data() {
            return {
                editHistory: [] as string[],
                cacheText: this.select ? 'auto' : '',
                rules: {
                    empty: (value: string) => value === ''
                        ? '字符串不能为空！'
                        : false,
                    errorChar: (value: string) => new RegExp('[\\\\:*?"<>|]').test(value)
                        ? '含有异常字符!'
                        : false,
                    duplicate: (value: string) => this.checkDuplicate && checkExist(this.textPool, value)
                        ? '重复的' + this.propName + '!'
                        : false
                }
            }
        },
        props: {
            // 基础值
            baseText: {
                type: [String, Number],
                required: true
            },

            // 属性名
            propName: {
                type: String,
                required: true
            },

            // 字段池 用于检测重复
            textPool: {
                type: Array,
                default: function () {
                    return []
                }
            },

            // 是否使用selection
            select: {
                type: Boolean,
                default: false
            },

            // 选择内容
            selection: {
                type: Array,
                default: function () {
                    return []
                }
            },

            width: {
                type: Number,
                default: 200
            },

            editable: {
                type: Boolean,
                default: true
            },

            defaultValue: {
                type: String,
                default: function () {
                    return ''
                }
            },

            checkDuplicate: {
                type: Boolean,
                default: false
            }

        },
        computed: {

            renderHistory: function () {
                return !this.select && this.editable
            },
            text: function () {
                return this.baseText
                    ? this.baseText.toString()
                    : this.defaultValue.toString()
            }
        },
        methods: {
            inputText($event: string) {
                this.cacheText = $event
            },

            saveText() {
                let text = this.text;
                if (this.cacheText !== '') {
                    this.editHistory.push(text);
                    this.update(this.cacheText);
                    this.cacheText = ''
                }
            },

            restoreText(index: number) {
                index > 0
                    ? this.$set(this.editHistory, index, this.text)
                    : this.$set(this.editHistory, 1, this.text);
                this.update(this.editHistory[index])
            },

            update($event: string) {
                this.$emit('update-value', this.propName, $event, this.status(this.cacheText))
            },

            status(text: string) {
                let result;
                this.rules.empty(text) || // 是否为空
                this.rules.errorChar(text) || // 是否异常字符串
                (this.checkDuplicate && checkDuplicate(this.textPool, text)) // 是否重复
                    ? result = 'error'
                    : result = 'default';
                return result
            }
        },
        watch: {},

        record: {
            status: 'done',
            description: '字符编辑器'
            //todo 字符解析
        }

    })
</script>

<style scoped>

</style>
/**
* Created by whb on 2019/12/4
* Updated by [whb on 2020年1月8日19:58:44]
*/
