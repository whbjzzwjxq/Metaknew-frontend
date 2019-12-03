<template>
    <div>
        <card-sub-row :text="'Selection'">
            <template v-slot:content>
                <v-simple-table dense fixed-header>
                    <template v-slot:default>
                        <thead>
                        <tr>
                            <th class="text-left">Index</th>
                            <th class="text-left">Name</th>
                            <th class="text-left">Label</th>
                            <th class="text-left">isMain</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(item, index) in settingItem" :key="index">
                            <td class="text-left">{{index}}</td>
                            <td class="text-left">{{item.name}}</td>
                            <td class="text-left">{{item.label}}</td>
                            <td class="text-left">
                                <v-checkbox v-model="item.isMain">

                                </v-checkbox>
                            </td>
                        </tr>
                        </tbody>
                    </template>
                </v-simple-table>
            </template>
        </card-sub-row>

        <card-sub-row
            v-for="(value, key) in setting"
            :key="key"
            :text="key + ' Style'">
            <template v-slot:content>
                <card-sub-style-row
                    :selection="settingList"
                    :prop-group="key"
                    :setting-item="value">

                </card-sub-style-row>
            </template>
        </card-sub-row>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import CardSubRow from '@/components/card/subComp/CardSubRow.vue';
    import CardSubStyleRow from '@/components/card/subComp/CardSubStyleRow.vue';
    import {AllSettingPart, BaseType} from '@/utils/graphClass'
    import {typeSetting} from '@/utils/settingTemplate'

    export default Vue.extend({
        name: "CardPageStyleEditor",
        components: {
            CardSubRow,
            CardSubStyleRow
        },
        data() {
            return {
                setting: typeSetting[this.compType]
            }
        },
        props: {
            settingList: {
                type: Array as () => AllSettingPart[],
                required: true
            },
            compType: {
                type: String as () => BaseType,
                required: true
            }
        },
        computed: {
            settingItem(): any[] {
                return this.settingList.map(setting => {
                    let name: string;
                    let type = setting.Setting._type;
                    if (type === 'link') {
                        name = setting.Setting._start.Setting._name + '->' + setting.Setting._end.Setting._name
                    } else {
                        name = setting.Setting._name
                    }
                    return {
                        name,
                        isMain: setting.Setting.Base.isMain,
                        label: setting.Setting._label
                    }
                })
            }
        },
        methods: {},
        watch: {},
        record: {
            status: 'done'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/1
* Updated by []
*/
