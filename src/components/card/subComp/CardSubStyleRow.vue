<template>
    <v-simple-table dense>
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
                                        <v-slider
                                            :value="manyValue(prop)"
                                            :min="item.range[0]"
                                            :max="item.range[1]"
                                            @change="updateCache(item.type, $event)"
                                            thumb-label>
                                            <template v-slot:append>
                                                <v-text-field
                                                    :value="selectionValue[prop][0]"
                                                    @input="updateCache(item.type, parseFloat($event))"
                                                    :rules="[value => (item.range[0]<= value <= item.range[1]) || 'out of range']"
                                                    class="mt-0 pt-0"
                                                    single-line
                                                    :type="'number'"
                                                    style="width: 80px">

                                                </v-text-field>
                                            </template>
                                        </v-slider>
                                        <p>{{'minValue: ' + item.range[0]}}</p>
                                        <p>{{'maxValue: ' + item.range[1]}}</p>
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
    import {baseSettingConf} from "@/utils/settingTemplate";
    import {SettingPart} from "@/utils/graphClass";

    type settingType = 'Color' | 'Number' | 'Boolean' | 'String' | 'Text'
    export default Vue.extend({
        name: "CardSubStyleRow",
        components: {},
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
                type: Object as () => Record<string, baseSettingConf>,
                required: true
            },
            propGroup: {
                type: String,
                required: true
            },
            selection: {
                type: Array as () => SettingPart[],
                required: true
            }
        },
        computed: {
            selectionValue: function () {
                let result: Record<string, any[]> = {};
                for (let prop in this.settingItem) {
                    result[prop] = [];
                    this.selection.map(item => {
                        let value = item.Setting[this.propGroup][prop];
                        result[prop].indexOf(value) === -1 &&
                        result[prop].push(value)
                    })
                }
                return result
            },
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
                    : undefined
            },

            updateValue(prop: string, value: string | number) {
                let vm = this;
                vm.selection.map(item => {
                    item.updateSetting(this.propGroup, prop, value)
                })
            },

            updateCache(prop: string, value: any) {
                let vm = this;
                vm.$set(vm.cache, prop, value)
            },

            saveValue(prop: string, type: settingType) {
                let vm = this;
                let cache = vm.cache[type];
                switch (type) {
                    case "Number":
                        cache !== null && vm.updateValue(prop, cache);
                        break;
                    case "String":
                        cache !== "" && vm.updateValue(prop, cache);
                        break;
                    case "Color":
                        cache !== "" && vm.updateValue(prop, cache);
                        break;
                    case "Boolean":
                        cache !== null && vm.updateValue(prop, cache);
                        break;
                    default:
                        vm.updateValue(prop, cache)
                }
            }
        },
        watch: {},
        record: {
            status: 'done'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/11/25
* Updated by []
*/