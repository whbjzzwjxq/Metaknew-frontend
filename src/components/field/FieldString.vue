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
                v-model="text"
                :rules="rules"
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
                    <v-icon @click="restoreText(index)" right small>mdi-restore</v-icon>
                </v-chip>
            </v-chip-group>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {validGroup} from "@/utils/validation";
    import {Rule} from "@/interface/interfaceInComponent";

    export default Vue.extend({
        name: 'fieldString',
        data() {
            return {
                editHistory: [] as string[],
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
                type: Array as () => string[],
                default: function () {
                    return []
                }
            },

            // 是否是选择型字段
            select: {
                type: Boolean,
                default: false
            },

            // 可供选择的内容
            selection: {
                type: Array as () => string[],
                default: function () {
                    return []
                }
            },

            //宽度
            width: {
                type: Number,
                default: 200
            },

            //是否可编辑
            editable: {
                type: Boolean,
                default: true
            },

            // 默认值
            defaultValue: {
                type: String,
                default: ''
            }

        },
        computed: {
            //是否渲染历史
            renderHistory: function (): boolean {
                return !this.select && this.editable
            },

            text: {
                get(): string {
                    return this.baseText !== undefined
                        ? this.baseText.toString()
                        : this.defaultValue.toString()
                },
                set(value: string): void {
                    if (this.editHistory.includes(value)) {
                        this.editHistory.push(value);
                        if (this.editHistory.length > 5) {
                            this.editHistory.splice(0, 1)
                        }
                    }
                    this.update(value);
                }
            },

            rules: function (): Rule<string>[] {
                return [
                    validGroup.String.notNone(this.propName),
                    validGroup.String.duplicate(this.textPool),
                    validGroup.String.badChar()
                ]
            },

            status: function(): string {
                return this.rules.map(rule => rule(this.text)).filter(check => check !== true).length > 0
                    ? 'error'
                    : 'default'
            }
        },
        methods: {
            restoreText(index: number) {
                this.text = this.editHistory[index]
            },

            update($event: string) {
                this.$emit('update-value', this.propName, $event, this.status)
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
