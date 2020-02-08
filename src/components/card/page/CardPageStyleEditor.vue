<template>
    <div>
        <selection-table
            :setting-list="settingList"
            class="px-4 pt-2">

        </selection-table>

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
    import SelectionTable from "@/components/SelectionTable.vue";
    import {ToPascalCase} from "@/utils/utils";
    import {typeSetting} from "@/interface/itemSetting";

    export default Vue.extend({
        name: "CardPageStyleEditor",
        components: {
            CardSubRow,
            CardSubStyleRow,
            SelectionTable
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
                type: String as () => GraphItemType,
                required: true
            }
        },
        computed: {
            title: function () {
                return 'Selection ' + ToPascalCase(this.compType)
            }
        },
        methods: {},
        watch: {},
        record: {
            status: 'done',
            description: '样式编辑器'
            //todo 更加细化的样式编辑器
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/1
* Updated by []
*/
