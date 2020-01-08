<template>
    <v-card width="width" height="100%" flat tile>
        <v-card-text class="pa-0">
            <v-tabs v-model="currentTab" grow height="36px" color="grey">
                <v-tabs-slider class="subTab"></v-tabs-slider>
                <v-tab v-for="(value, tab) in availableTabs" :key="tab" class="pa-0">
                    <v-icon left small> {{ value.icon }}</v-icon>
                    {{ tabTrans[tab][lang] }}
                </v-tab>
                <v-tabs-items v-model="currentTab">
                    <v-tab-item v-for="(value, tab) in availableTabs" :key="tab">
                        <template v-if="tab === 'info'">
                            <card-page-node-info
                                v-if="type === 'node'"
                                :base-data="info"
                                :edit-mode="editMode"
                            >

                            </card-page-node-info>
                            <card-page-link-info
                                v-else
                                :base-data="info"
                                :edit-mode="editMode"
                                :document="document"
                            >

                            </card-page-link-info>

                        </template>
                        <card-page-media-list
                            v-if="tab === 'medias'  && type === 'node'"
                            :base-data="info"
                            :width="width">

                        </card-page-media-list>

                    </v-tab-item>
                </v-tabs-items>
            </v-tabs>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import CardPageNodeInfo from "@/components/card/page/CardPageNodeInfo.vue";
    import CardPageLinkInfo from "@/components/card/page/CardPageLinkInfo.vue";
    import CardPageMediaList from "@/components/card/page/CardPageMediaList.vue";
    import {GraphSelfPart} from "@/utils/graphClass";
    import {InfoPart} from "@/store/modules/dataManager";
    import {TabContent} from "@/utils/interfaceInComponent";

    export default Vue.extend({
        name: "CardMetaKnowledge",
        components: {
            CardPageNodeInfo,
            CardPageLinkInfo,
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
            info: {
                type: Object as () => InfoPart,
                required: true
            },
            width: {
                type: Number as () => number,
                default: 400
            },
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
                    "info": {
                        icon: 'mdi-information-outline',
                        props: {}
                    },
                    "medias": {
                        icon: 'mdi-folder-multiple-image',
                        props: {}
                    },
                    "eco": {
                        icon: 'mdi-expand-all-outline',
                        props: {}
                    }
                }
            },
            availableTabs(): Record<string, TabContent> {
                return this.tabItems
            },
            type(): BaseType {
                let _type = this.info.Info.type;
                if (_type === 'document') {
                    return 'node'
                } else {
                    return _type
                }
            }
        },
        methods: {},
        watch: {},
        record: {
            status: 'empty',
            description: '知识元相关'
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
