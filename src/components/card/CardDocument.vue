<template>
    <v-card width="width" height="100%" flat tile>
        <v-card-text class="pa-2 pl-3 pt-0">
            <v-tabs v-model="currentTab" fixed-tabs height="36px" color="grey">
                <v-tabs-slider class="subTab"></v-tabs-slider>
                <v-tab v-for="(value, tab) in availableTabs" :key="tab">
                    <v-icon left small> {{ value.icon }}</v-icon>
                    {{ tabTrans[tab][lang] }}
                </v-tab>
                <v-tabs-items v-model="currentTab">
                    <v-tab-item v-for="(value, tab) in availableTabs" :key="tab">
                        <card-page-node-info
                            v-if="tab === 'directory'"
                            :base-data="nodeInfo"
                            :edit-mode="editMode"
                        >

                        </card-page-node-info>

                        <card-page-media-list
                            v-if="tab === 'medias'"
                            :base-data="nodeInfo">

                        </card-page-media-list>
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

    export default Vue.extend({
        name: "CardDocument",
        components: {},
        data() {
            return {
                currentTab: 0,
                lang: "zh",
            }
        },
        props: {
            editMode: {
                type: Boolean,
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
                    "document-style": {
                        icon: 'mdi-palette',
                        name: '专题样式'
                    },
                    "node-style": {
                        icon: 'mdi-palette',
                        name: '节点样式'
                    },
                    'link-style': {
                        icon: 'mdi-palette',
                        name: '关系样式'
                    },
                    'history&branch': {
                        icon: 'mdi-source-branch',
                        name: '历史与分支'
                    },
                    'comment': {
                        icon: 'mdi-comment-multiple-outline',
                        name: '专题评论'
                    }
                }
            },
            availableTabs(): Record<string, TabContent> {
                return this.tabItems
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
