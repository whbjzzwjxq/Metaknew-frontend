<template>
    <v-card :width="width" tile flat>
        <v-tabs v-model="tab" v-if="setting.multiLanguage" height="24px" color="accent">
            <v-tabs-slider></v-tabs-slider>
            <v-tab v-for="(value, key) in text" :key="key" :href="'#tab-' + key">
                <p style="margin: unset">{{ key }}</p>
                <v-btn icon x-small @click="deleteText(key)" class="mt-n1" v-if="setting.editable">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-btn icon x-small v-else>

                </v-btn>
            </v-tab>
            <v-tab :href="'#tab-default'" v-if="setting.editable">
                <label style="width: 40px; height: 18px">
                    <input
                        v-model="newLang"
                        style="width: 40px; height: 18px"
                        placeholder="NEW"
                        class="pt-1 pr-2">
                </label>
                <v-btn icon x-small @click="createNewText" class="mt-n1">
                    <v-icon>mdi-plus</v-icon>
                </v-btn>
            </v-tab>

            <v-tab-item v-for="(value, key) in text" :key="key" :value="'tab-'+ key">
                <field-text-render
                    :prop-name="key"
                    :disabled="!setting.editable"
                    :placeholder="placeholder"
                    :width="width"
                    :single-line="setting.singleLine"
                    :label="label"
                    :value="value"
                    @update-text="updateText">

                </field-text-render>
            </v-tab-item>

            <v-tab-item :value="'tab-default'">
                <field-text-render
                    :single-line="setting.singleLine"
                    :label="label"
                    value=""
                    prop-name="default"
                    placeholder="请在上方输入语言类型"
                    disabled>

                </field-text-render>
            </v-tab-item>
        </v-tabs>

        <template v-else>
            <div style="height: 24px">

            </div>
            <field-text-render
                :value="text[singleKey]"
                :prop-name="singleKey"
                :disabled="!setting.editable"
                :single-line="setting.singleLine"
                :label="label"
                :placeholder="placeholder"
                :width="width"
                :rows="rows"
                @update-text="updateText">

            </field-text-render>
        </template>

        <v-card-actions v-if="setting.showSetter" class="pa-0" style="height: 24px">
            <v-btn icon x-small @click="multiLanguage = !multiLanguage">
                <v-icon>
                    {{setterIcon}}
                </v-icon>
            </v-btn>
            <div>
                <p style="font-size: 16px;margin: unset">MultiLanguage</p>
            </div>
        </v-card-actions>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {deepClone} from '@/utils/utils'
    import FieldTextRender from "@/components/field/FieldTextRender.vue";

    export default Vue.extend({
        name: 'FieldText',
        components: {FieldTextRender},
        data() {
            return {
                cacheText: '',
                tab: 'tab-auto',
                newLang: '',
                status: 'default',
                multiLanguage: true
            }
        },
        props: {
            baseText: {
                type: Object as () => Text,
                required: true
            },
            propName: {
                type: String,
                required: true
            },
            width: {
                type: [String, Number],
                default: 400
            },
            defaultValue: {
                type: Object,
                default: function () {
                    return {
                        'auto': ''
                    }
                }
            },
            placeholder: {
                type: String,
                default: ''
            },
            label: {
                type: String,
                default: ''
            },
            editable: {
                type: Boolean,
                default: true
            },
            singleLine: {
                type: Boolean,
                default: false
            },
            rows: {
                type: Number,
                default: 10
            }
        },
        computed: {
            text: function (): Translate {
                return Object.keys(this.baseText).length > 0
                    ? deepClone(this.baseText)
                    : deepClone(this.defaultValue)
            },

            languageList: function (): string[] {
                return Object.keys(this.text)
            },
            editModeSetting: function (): Record<string, boolean> {
                return {
                    showSetter: true,
                    multiLanguage: this.multiLanguage,
                    editable: true,
                    singleLine: this.singleLine
                }
            },
            normalModeSetting: function (): Record<string, boolean> {
                return {
                    showSetter: false,
                    multiLanguage: this.languageList.length > 1,
                    editable: false,
                    singleLine: this.singleLine
                }
            },
            setting: function (): Record<string, boolean> {
                return this.editable ? this.editModeSetting : this.normalModeSetting
            },
            setterIcon: function (): string {
                return this.multiLanguage ? 'mdi-check' : 'mdi-close'
            },
            singleKey: function (): string {
                return Object.keys(this.text)[0]
            }
        },
        methods: {
            updateText(key: string, value: string) {
                this.$set(this.text, key, value);
                this.$emit('update-value', this.propName, this.text, this.status)
            },

            createNewText() {
                if (this.newLang) {
                    this.$set(this.text, this.newLang, '');
                    this.$emit('update-value', this.propName, this.text, this.status);
                    this.newLang = ''
                }
            },

            deleteText(key: string) {
                this.$delete(this.text, key);
                this.$emit('update-value', this.propName, this.text, this.status)
            }
        },
        created() {

        },
        record: {
            status: 'done',
            description: '翻译文本编辑器'
            //todo 样式优化
        }
    })
</script>

<style scoped>

</style>
/**
* Created by whb on 2019/12/4
* Updated by [whb on 2020年1月8日19:58:44]
*/
