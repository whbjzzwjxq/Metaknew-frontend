<template>
    <v-card width="width" height="100%" flat tile>
        <v-card-text class="pa-0">
            <v-tabs v-model="subTab" grow height="36px" color="grey">
                <v-tabs-slider class="subTab"></v-tabs-slider>
                <v-tab v-for="(value, tab) in availableTabs" :key="tab" class="pa-0">
                    <v-icon left small> {{ value.icon }}</v-icon>
                    {{ tabTrans[tab][lang] }}
                </v-tab>
                <v-tabs-items v-model="subTab" class="cardItem">
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
                            v-if="tab === 'medias' && type === 'node'"
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
    import {TabContent} from "@/utils/interfaceInComponent";
    import {tabDict} from "@/store/modules/styleComponentSize";

    export default Vue.extend({
        name: "CardMetaKnowledge",
        components: {
            CardPageNodeInfo,
            CardPageLinkInfo,
            CardPageMediaList,
        },
        data() {
            return {
                tabList: tabDict['metaKnowledge']
            }
        },
        props: {
            info: {
                type: Object as () => InfoPart,
                required: true
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
            tabItems: function (): Record<string, TabContent> {
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
            },
            subTab: {
                get: function () {

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
