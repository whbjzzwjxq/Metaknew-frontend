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
                        v-if="tab === 'info'"
                        :base-data="nodeInfo"
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
    import CardPageNodeInfo from "@/components/card/page/CardPageNodeInfo.vue";
    import CardPageMediaList from "@/components/card/page/CardPageMediaList.vue";
    import {NodeInfoPart} from "@/utils/graphClass";

    export default Vue.extend({
        name: "CardMetaKnowledge",
        components: {
            CardPageNodeInfo,
            CardPageMediaList,
        },
        data() {
            return {
                currentTab: 0,
                lang: "zh",
                tabTrans: {
                    "info": {
                        "zh": "基本信息"
                    },
                    "medias": {
                        "zh": "包含媒体"
                    },
                    "eco": {
                        "zh": "相关知识"
                    }
                }
            }
        },
        props: {
            nodeInfo: {
                type: Object as () => NodeInfoPart,
                required: true
            },
            width: {
                type: Number as () => number,
                default: 400
            }
        },
        computed: {
            tabItems(): Record<string, TabContent> {
                return {
                    "info": {
                        icon: 'mdi-information-outline',
                        props: {
                            baseData: this.nodeInfo
                        }
                    },
                    "medias": {
                        icon: 'mdi-folder-multiple-image',
                        props: {
                            baseData: this.nodeInfo
                        }
                    },
                    "eco": {
                        icon: 'mdi-expand-all-outline',
                        props: {}
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
    .subTab {
        height: 36px;
    }
</style>

/**
* Created by whb on 2019/12/5
* Updated by []
*/
