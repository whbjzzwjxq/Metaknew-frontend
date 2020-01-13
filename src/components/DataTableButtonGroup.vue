<template>
    <v-container class="pa-0 ma-0" fluid>
        <v-menu open-on-hover offset-y>
            <template v-slot:activator="{ on }">
                <v-btn outlined small color="primary" class="mb-2" v-on="on" tile right>新增对象</v-btn>
            </template>
            <v-list>
                <v-list-item v-for="(item, index) in newNodeNumList" :key="index" @click="addEmptyNode(item.num)">
                    <v-list-item-title>
                        {{ item.text }}
                    </v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>

        <v-btn outlined small color="error" class="mb-2" @click="delSelectedObj" tile right>删除对象</v-btn>

        <v-menu open-on-hover offset-y>
            <template v-slot:activator="{ on }">
                <v-btn outlined small color="primary" class="mb-2" v-on="on" tile right>保存对象</v-btn>
            </template>
            <v-list>
                <v-list-item v-for="(item, index) in saveObjectItem" :key="index" @click="saveNode(item.action)">
                    <v-list-item-title>
                        {{ item.text }}
                    </v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </v-container>
</template>

<script lang="ts">
    import Vue from 'vue'

    export default Vue.extend({
        name: "DataTableButtonGroup",
        components: {},
        data() {
            return {
                saveObjectItem: [
                    {"text": "保存选中内容", "action": "Select"},
                    {"text": "保存所有内容", "action": "All"}
                ]
            }
        },
        props: {
            rowNum: {
                type: Number,
                required: true
            }
        },
        computed: {
            newNodeNumList: function (): {text: string, num: number}[] {
                return [
                    {text: "新建一个节点", num: 1},
                    {text: "新建五个节点", num: 5},
                    {text: "新建一页", num: this.rowNum}
                ]
            }

        },
        methods: {
            addEmptyNode(num: number) {
                this.$emit("add-empty-node", num)
            },

            delSelectedObj() {
                this.$emit("del-selected-node")
            },

            saveNode(type: string) {
                type === 'Select'
                    ? this.$emit("save-select-item")
                    : this.$emit("save-all")
            }
        },
        watch: {},
        record: {
            status: 'done',
            description: 'DataTable的按钮组'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/3
* Updated by []
*/
