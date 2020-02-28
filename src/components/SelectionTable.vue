<template>
    <v-simple-table fixed-header style="width: 360px" :dense="length >= 10" class="mt-n4">
        <template v-slot:default>
            <thead style="width: 100%">
            <tr>
                <th class="text-left px-1 py-0" style="width: 15%">Index</th>
                <th class="text-left px-1 py-0" style="max-width: 100px">Name</th>
                <th class="text-left px-1 py-0" style="width: 25%">Label</th>
                <th class="text-left px-1 py-0" style="width: 15%">isMain</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, index) in settingItem" :key="index">
                <td class="text-left px-1 py-0" height="10px">{{ item.index}}</td>
                <td class="text-left px-1 py-0" height="10px">{{item.name}}</td>
                <td class="text-left px-1 py-0" height="10px">{{item.label}}</td>
                <td class="text-left px-1 py-0" height="10px">
                    <label>
                        <input type="checkbox" v-model="item.isMain">
                    </label>
                </td>
            </tr>
            </tbody>
        </template>
    </v-simple-table>
</template>

<script lang="ts">
    import Vue from 'vue'

    interface setting {
        index: number,
        name: string,
        label: string,
        isMain: boolean
    }

    export default Vue.extend({
        name: "SelectionTable",
        components: {},
        data() {
            return {}
        },
        props: {
            settingList: {
                type: Array as () => AllSettingPart[],
                required: true
            },
        },
        computed: {
            settingItem: function(): setting[] {
                return this.settingList.map((setting: AllSettingPart, index: number) => {
                    let name: string;
                    let type = setting._type;
                    if (type === 'link') {
                        name = setting.Setting._start.Setting._name + '->' + setting.Setting._end.Setting._name
                    } else {
                        name = setting.Setting._name
                    }
                    return {
                        index: index,
                        name,
                        isMain: setting.Setting.View.isMain,
                        label: setting._label
                    }
                })
            },
            length: function (): number {
                return this.settingList.length
            },
        },
        methods: {},
        watch: {},
        record: {
            status: 'done',
            description: '选择集的表格形式'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2020/1/6
* Updated by []
*/
