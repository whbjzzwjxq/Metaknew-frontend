<template>
    <v-card :style="totalCardStyle" tile elevation="2">
        <v-tabs v-model="rootTab" fixed-tabs>
            <v-tabs-slider color="todo"></v-tabs-slider>
            <v-tab v-for="value in rootTabList" :key="value.key" class="pa-0">
                <v-icon left> {{ value.icon }}</v-icon>
                {{ value.name }}
            </v-tab>
        </v-tabs>
        <v-tabs-items v-model="rootTab">
            <v-tab-item v-for="value in rootTabList" :key="value.key">
                <v-tabs :value="subTab" @change="updateSubTab(arguments[0], value.children)" fixed-tabs>
                    <v-tabs-slider color="grey"></v-tabs-slider>
                    <v-tab v-for="subValue in value.children" :key="subValue.key" class="pa-0">
                        <v-icon left small> {{ subValue.icon }}</v-icon>
                        {{ subValue.name }}
                    </v-tab>
                </v-tabs>
                <v-tabs-items v-model="subTab">
                    <v-tab-item v-for="subValue in value.children" :key="subValue.key">
                        <div :style="subCardStyle" class="cardItem">
                            <template v-if="value.key === 'ecoSystem'">

                            </template>
                            <template v-else-if="value.key === 'document'">
                                <card-page-directory
                                    v-if="subValue.key === 'directory'"
                                    :edit-mode="editMode"
                                >

                                </card-page-directory>
                            </template>
                            <template v-else-if="value.key === 'metaKnowledge'">
                                <template v-if="subValue.key === 'info'">
                                    <card-page-node-info
                                        v-if="currentItemType === 'node'"
                                        :edit-mode="editMode"
                                        :base-data="currentItem">

                                    </card-page-node-info>
                                    <card-page-link-info
                                        v-else-if="currentItemType === 'link'"
                                        :edit-mode="editMode"
                                        :base-data="currentItem"
                                        :document="document">

                                    </card-page-link-info>
                                </template>
                                <template v-else-if="subValue.key === 'mediaList' && currentItemType === 'node'">
                                    <card-page-media-list
                                        :base-data="currentItem">

                                    </card-page-media-list>
                                </template>
                            </template>
                        </div>
                    </v-tab-item>
                </v-tabs-items>
            </v-tab-item>
        </v-tabs-items>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {GraphSelfPart, LinkInfoPart, NodeInfoPart} from "@/class/graphItem";
    import {getIcon} from "@/utils/icon";
    import {TabContent} from "@/interface/interfaceInComponent";
    import {commitChangeRootTab, commitChangeSubTab} from "@/store/modules/_mutations";
    import CardPageDirectory from "@/components/card/page/CardPageDirectory.vue";
    import CardPageMediaList from "@/components/card/page/CardPageMediaList.vue";
    import CardPageNodeInfo from "@/components/card/page/CardPageNodeInfo.vue";
    import CardPageLinkInfo from "@/components/card/page/CardPageLinkInfo.vue";
    import {leftCardPadding, ToolBar} from "@/store/modules/styleComponentSize";

    export default Vue.extend({
        name: "CardRoot",
        components: {
            CardPageDirectory,
            CardPageNodeInfo,
            CardPageLinkInfo,
            CardPageMediaList
        },
        data() {
            return {
                editPageRegex: new RegExp('edit.*'),
                bottomHeight: 108
            }
        },
        props: {
            document: {
                type: Object as () => GraphSelfPart,
                required: true
            },
            editMode: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            dataManager: function (): DataManagerState {
                return this.$store.state.dataManager
            },
            componentState: function (): ComponentState {
                return this.$store.state.componentState
            },
            currentItem: function (): NodeInfoPart | LinkInfoPart {
                return this.dataManager.currentItem
            },
            currentItemType: function (): GraphItemType {
                let _type = this.currentItem._type;
                _type === 'document' && (_type = 'node');
                return _type
            },
            documentInfo: function (): NodeInfoPart {
                return this.$store.getters.currentGraphInfo
            },
            allComponentSize: function (): StyleManagerState {
                return this.$store.state.styleComponentSize
            },
            toolBar: function (): ToolBar {
                return this.allComponentSize.toolBar
            },
            totalCardStyle: function (): CSSProp {
                return {
                    width: (this.allComponentSize.leftCard.width) + 'px',
                    height: this.allComponentSize.leftCard.height + 'px',
                    overflowY: "hidden",
                    overflowX: "hidden"
                }
            },
            subCardStyle: function (): CSSProp {
                return {
                    width: this.allComponentSize.leftCard.width + 'px',
                    height: (this.allComponentSize.leftCard.height - 96) + 'px',
                    backgroundColor: 'white'
                }
            },
            rootTabList: function (): TabContent[] {
                return [
                    {
                        key: 'ecoSystem',
                        icon: getIcon('i-knowledge-level', 'eco'),
                        name: '知识生态',
                        children: [
                            {
                                icon: getIcon('i-eco-system', 'map'),
                                name: '知识地图',
                                key: 'knownMap'
                            },
                            {
                                icon: getIcon('i-eco-system', 'community'),
                                name: '知识社区',
                                key: 'community'
                            },
                            {
                                icon: getIcon('i-eco-system', 'course'),
                                name: '知识课程',
                                key: 'course'
                            }
                        ],
                    },
                    {
                        key: 'document',
                        icon: getIcon('i-knowledge-level', 'document'),
                        name: '知识专题',
                        children: [
                            {
                                icon: getIcon('i-document-comp', 'directory'),
                                name: '知识目录',
                                key: 'directory'
                            },
                            {
                                icon: getIcon('i-document-comp', 'historyAndBranch'),
                                name: '其他版本',
                                key: 'historyBranch'
                            },
                            {
                                icon: getIcon('i-document-comp', 'comments'),
                                name: '知识评论',
                                key: 'comments'
                            }
                        ],
                    },
                    {
                        key: "metaKnowledge",
                        icon: getIcon('i-knowledge-level', 'node'),
                        name: '知识元',
                        children: [
                            {
                                icon: getIcon('i-meta-knowledge', 'info'),
                                name: '基本信息',
                                key: 'info'
                            },
                            {
                                icon: getIcon('i-meta-knowledge', 'medias'),
                                name: '包含媒体',
                                key: 'mediaList'
                            },
                            {
                                icon: getIcon('i-meta-knowledge', 'relative'),
                                name: '相关内容',
                                key: 'relative'
                            }
                        ]
                    }
                ]
            },

            rootTab: {
                get: function (): number {
                    return this.componentState.leftCardTab.root
                },
                set: function (value: number) {
                    commitChangeRootTab(value)
                }
            },

            subTab: {
                get: function (): number {
                    return this.componentState.leftCardTab.sub
                },
                set: function (value: SubTabName) {
                    commitChangeSubTab(value)
                }
            }
        },
        methods: {
            updateSubTab: function (tabIndex: number, subTabList: TabContent[]) {
                this.subTab = subTabList[tabIndex].key as SubTabName
            }
        },
        watch: {},
        record: {
            status: 'editing',
            description: '左边卡片的根组件'
        }
    })
</script>

<style scoped>
    @import "/src/style/css/card.css";
</style>

/**
* Created by whb on 2019/12/1
* Updated by []
*/
