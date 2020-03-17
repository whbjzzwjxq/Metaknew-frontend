<template>
    <v-simple-table dense style="width: 100%">
        <template v-slot:default>
            <thead class="pl-4">
            <th class="text-left">Name</th>
            <th class="text-left">Explain</th>
            <th class="text-left">Value</th>
            </thead>
            <tbody>
            <tr v-for="(item, prop) in settingItem" :key="prop">
                <td>
                    <span :title="prop.length >= 8 && prop">{{textView(prop)}}</span>
                </td>
                <td>
                    <span :title="item.tips && item.tips">{{item.explain}}</span>
                </td>
                <td>
                    <v-edit-dialog>
            <span :title="selectionValue[prop].join(',')">
              {{ valueView(selectionValue[prop]) }}
            </span>
                        <template v-slot:input>
                            <v-card flat tile :width="330">
                                <v-card-title>
                                    {{prop}}
                                </v-card-title>
                                <v-subheader v-if="item.tips">
                                    {{'tips: ' + item.tips}}
                                </v-subheader>
                                <v-card-text>
                                    <v-color-picker
                                        v-if="item.type === 'Color'"
                                        :mode="'hexa'"
                                        :value="manyValue(prop)"
                                        @update:color="updateCache(item.type, $event.hex)"
                                        show-swatches
                                        hide-mode-switch>

                                    </v-color-picker>

                                    <template v-else-if="item.type === 'Number'">
                                        <card-sub-style-number
                                            :min="item.range[0]"
                                            :max="item.range[1]"
                                            :value="manyValue(prop)"
                                            :prop-name="prop"
                                            @update="updateCache(item.type, $event)">

                                        </card-sub-style-number>
                                    </template>

                                    <v-select
                                        v-else-if="item.type === 'String'"
                                        :value="manyValue(prop)"
                                        :items="item.range"
                                        @input="updateCache(item.type, $event)">

                                    </v-select>

                                    <v-switch
                                        v-else-if="item.type === 'Boolean'"
                                        :input-value="manyValue(prop)"
                                        @change="updateValue(prop, $event)"
                                        :label="manyValue(prop) ? 'Yes' : 'No'">
                                    </v-switch>

                                    <v-text-field
                                        v-else-if="item.type === 'Text'"
                                        :input-value="manyValue(prop)"
                                        @change="updateCache(item.type, $event)"
                                        @blur="saveValue(prop, item.type)"
                                    >

                                    </v-text-field>

                                </v-card-text>
                                <v-card-actions>
                                    <v-btn text @click="saveValue(prop, item.type)">Save</v-btn>
                                </v-card-actions>
                            </v-card>
                        </template>
                    </v-edit-dialog>
                </td>
            </tr>
            </tbody>
        </template>
    </v-simple-table>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {GraphItemSettingPart} from "@/class/graphItem";
    import {SettingGroup} from "@/interface/itemSetting";
    import CardSubStyleNumber from "@/components/card/subComp/CardSubStyleNumber.vue";

    type settingType = 'Color' | 'Number' | 'Boolean' | 'String' | 'Text'
    export default Vue.extend({
        name: "CardSubStyleRow",
        components: {
            CardSubStyleNumber
        },
        data() {
            return {
                cache: {
                    "Color": "",
                    "Number": null,
                    "Boolean": null,
                    "String": "",
                    "Text": ""
                } as Record<settingType, any>,
            }
        },
        props: {
            settingItem: {
                type: Object as () => SettingGroup,
                required: true
            },
            propGroup: {
                type: String,
                required: true
            },
            selection: {
                type: Array as () => GraphItemSettingPart[],
                required: true
            }
        },
        computed: {
            selectionValue: function () {
                let result: Record<string, any[]> = {};
                for (let prop of Object.keys(this.settingItem)) {
                    result[prop] = [];
                    // 把选中内容的值都提取出来
                    this.selection.map(item => {
                        let value = item.Setting[this.propGroup][prop];
                        result[prop].indexOf(value) === -1 &&
                        result[prop].push(value)
                    })
                }
                return result
            }
        },
        methods: {
            textView: (text: string) => text.length >= 8
                ? text.substring(0, 3) + "..."
                : text,

            valueView: (list: any[]) => list.length === 1
                ? list[0]
                : list.join(",").substring(0, 7) + "...",

            manyValue(prop: string) {
                return this.selectionValue[prop].length === 1
                    ? this.selectionValue[prop][0]
                    : 0
            },

            updateValue(prop: string, value: string | number) {
                this.selection.map(item => {
                    item.updateSetting(this.propGroup, prop, value)
                })
            },

            updateCache(prop: string, value: any) {
                this.$set(this.cache, prop, value)
            },

            saveValue(prop: string, type: settingType) {
                let cache = this.cache[type];
                switch (type) {
                    case "Number":
                        cache !== null && this.updateValue(prop, cache);
                        break;
                    case "String":
                        cache !== "" && this.updateValue(prop, cache);
                        break;
                    case "Color":
                        cache !== "" && this.updateValue(prop, cache);
                        break;
                    case "Boolean":
                        cache !== null && this.updateValue(prop, cache);
                        break;
                    default:
                        this.updateValue(prop, cache)
                }
            }
        },
        watch: {},
        record: {
            status: 'done',
            description: '单行的样式编辑器',
            //todo 细化 数字小于1的时候优化
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/11/25
* Updated by [whb on 2020年1月8日19:46:42]
*/
