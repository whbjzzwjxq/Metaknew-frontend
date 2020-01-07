<template>
    <v-card width="width" height="100%" flat tile>
        <v-card-text class="pa-0">
            <v-tabs v-model="currentTab" fixed-tabs height="36px" color="grey">
                <v-tabs-slider class="subTab"></v-tabs-slider>
                <v-tab v-for="(value, tab) in availableTabs" :key="tab" class="pa-0">
                    <v-icon left small> {{ value.icon }}</v-icon>
                    {{ value.name }}
                </v-tab>
                <v-tabs-items v-model="currentTab">
                    <v-tab-item v-for="(value, tab) in availableTabs" :key="tab">
                        <card-page-directory
                            v-if="tab === 'directory'"
                            :edit-mode="editMode"
                            :document="document"
                        >

                        </card-page-directory>
                    </v-tab-item>
                </v-tabs-items>
            </v-tabs>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {TabContent} from "@/utils/interfaceInComponent";
    import {GraphSelfPart} from "@/utils/graphClass";
    import CardPageDirectory from "@/components/card/page/CardPageDirectory.vue";

    export default Vue.extend({
        name: "CardDocument",
        components: {
            CardPageDirectory
        },
        data() {
            return {
                currentTab: 0,
                lang: "zh",
            }
        },
        props: {
            editMode: {
                type: Boolean as () => boolean,
                default: false
            },
            document: {
                type: Object as () => GraphSelfPart,
                required: true
            }
        },
        computed: {
            tabItems(): Record<string, TabContent> {
                return {
                    "directory": {
                        icon: 'mdi-format-list-checkbox',
                        name: '专题目录'
                    },
                    'historyBranch': {
                        icon: 'mdi-source-branch',
                        name: '其他版本'
                    },
                    'comment': {
                        icon: 'mdi-comment-multiple-outline',
                        name: '专题评论'
                    }
                }
            },
            availableTabs(): Record<string, TabContent> {
                let result: Record<string, TabContent>;
                let {directory, documentStyle, nodeStyle, linkStyle, historyBranch, comment} = this.tabItems;
                this.editMode
                    ? result = {directory, historyBranch, comment}
                    : result = {directory, historyBranch, comment};
                return result
            }
        },
        methods: {},
        watch: {},
        record: {
            status: 'empty'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/4
* Updated by []
*/
