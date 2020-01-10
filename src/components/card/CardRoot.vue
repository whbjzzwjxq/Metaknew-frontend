<template>
    <div :style="totalCardStyle" class="cardItem">
        <v-tabs v-model="currentTab" fixed-tabs>
            <v-tabs-slider color="todo"></v-tabs-slider>
            <v-tab v-for="(value, tab) in availableTabs" :key="tab" class="pa-0">
                <v-icon left> {{ value.icon }}</v-icon>
                {{ tabTrans[tab][lang] }}
            </v-tab>
        </v-tabs>
        <v-tabs-items v-model="currentTab">
            <v-tab-item v-for="(value, tab) in availableTabs" :key="tab">
                <card-eco-system v-if=" tab === 'eco'" v-bind="value.props"></card-eco-system>
                <card-document
                    v-if="tab === 'document'"
                    v-bind="value.props"
                    :document="document"
                    :edit-mode="editMode">

                </card-document>
                <card-meta-knowledge
                    v-if="tab === 'node'"
                    :info="dataManager.currentItem"
                    :width="allComponentSize.leftCard.width"
                    :edit-mode="editMode"
                    :document="document"
                >

                </card-meta-knowledge>
            </v-tab-item>
        </v-tabs-items>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import CardEcoSystem from '@/components/card/CardEcoSystem.vue';
    import CardDocument from '@/components/card/CardDocument.vue';
    import CardMetaKnowledge from '@/components/card/CardMetaKnowledge.vue';
    import {GraphSelfPart} from "@/utils/graphClass";
    import {getIcon} from "@/utils/icon";
    import {TabContent} from "@/utils/interfaceInComponent";

    export default Vue.extend({
        name: "CardRoot",
        components: {
            CardDocument,
            CardMetaKnowledge,
            CardEcoSystem
        },
        data() {
            return {
                tabTrans: {
                    "eco": {
                        "zh": "知识生态"
                    },
                    "document": {
                        "zh": "知识专题"
                    },
                    "node": {
                        "zh": "知识元"
                    }
                },
                currentTab: 1,
                lang: 'zh',
                editPageRegex: new RegExp('edit.*')
            }
        },
        props: {},
        computed: {
            dataManager: function (): DataManagerState {
                return this.$store.state.dataManager
            },
            document: function (): GraphSelfPart {
                return this.dataManager.currentGraph
            },
            allComponentSize: function (): StyleManagerState {
                return this.$store.state.styleComponentSize
            },
            toolBar: function () {
                return this.allComponentSize.toolBar
            },
            totalCardStyle: function (): CSSProp {
                return {
                    width: this.allComponentSize.leftCard.width + 'px',
                    height: '100%',
                    zIndex: 1
                }
            },
            tabItems(): Record<string, TabContent> {
                return {
                    "eco": {
                        icon: getIcon('i-knowledge-level', 'eco'),
                        props: {}
                    },
                    "document": {
                        icon: getIcon('i-knowledge-level', 'document'),
                        props: {}
                    },
                    "node": {
                        icon: getIcon('i-knowledge-level', 'node'),
                        props: {}
                    }
                }
            },

            availableTabs(): Record<string, TabContent> {
                return this.tabItems
            },

            editMode(): boolean {
                return this.editPageRegex.test(String(this.$route.name))
            }
        },
        methods: {},
        watch: {},
        record: {
            status: 'editing',
            description: '左边卡片的根组件'
            //todo 用vuex来控制组件
        }
    })
</script>

<style scoped>
    @import '../../style/css/card.css';

    .cardTitle {
        -moz-user-select: none;
        -webkit-user-select: none;
        user-select: none;
        font-weight: bolder;
    }

</style>

/**
* Created by whb on 2019/12/1
* Updated by []
*/
