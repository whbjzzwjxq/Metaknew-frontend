<template>
    <div :style="totalCardStyle" class="cardItem">
        <v-tabs v-model="currentTab" fixed-tabs>
            <v-tabs-slider color="todo"></v-tabs-slider>
            <v-tab v-for="(value, tab) in availableTabs" :key="tab">
                <v-icon left> {{ value.icon }}</v-icon>
                {{ tabTrans[tab][lang] }}
            </v-tab>
        </v-tabs>
        <v-tabs-items v-model="currentTab">
            <v-tab-item v-for="(value, tab) in availableTabs" :key="tab">
                <card-eco-system v-if=" tab === 'eco'" v-bind="value.props"></card-eco-system>
                <card-document v-if="tab === 'document'"></card-document>
                <card-meta-knowledge v-if="tab === 'node'"></card-meta-knowledge>
            </v-tab-item>
        </v-tabs-items>

    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {StyleManagerState, ToolBar} from "@/store/modules/styleWindowSize"
    import CardEcoSystem from '@/components/card/CardEcoSystem.vue';
    import CardDocument from '@/components/card/CardDocument.vue';
    import CardMetaKnowledge from '@/components/card/CardMetaKnowledge.vue';

    interface TabContent {
        icon: string,
        props: Record<string, any>
    }

    export default Vue.extend({
        name: "CardRoot",
        components: {
            CardDocument,
            CardMetaKnowledge,
            CardEcoSystem
        },
        data() {
            return {
                tabItems: {
                    "eco": {
                        icon: 'mdi-earth',
                        props: {}
                    },
                    "document": {
                        icon: 'mdi-graph-outline',
                        props: {}
                    },
                    "node": {
                        icon: 'mdi-numeric-1-circle-outline',
                        props: {}
                    }
                } as Record<string, TabContent>,
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
                lang: 'zh'
            }
        },
        props: {},
        computed: {
            allComponentSize(): StyleManagerState {
                return this.$store.state.styleComponentSize
            },
            toolBar(): ToolBar {
                return this.allComponentSize.toolBar
            },
            totalCardStyle(): object {
                return {
                    width: this.allComponentSize.leftCard.width + 'px',
                    height: '100%',
                    'z-index': 1
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
    .cardTitle {
        -moz-user-select: none;
        -webkit-user-select: none;
        user-select: none;
        font-weight: bolder;
    }

    .cardItem {
        overflow-y: scroll;
        overflow-x: hidden;
        background: white;
    }

    .cardItem::-webkit-scrollbar {
        width: 6px;
        height: 1px;
    }

    .cardItem::-webkit-scrollbar-thumb {
        border-radius: 4px;
        background: grey;
        height: 0;
    }

    .cardItem::-webkit-scrollbar-track {
        -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
        border-radius: 10px;
        background: #EDEDED;
    }
</style>

/**
* Created by whb on 2019/12/1
* Updated by []
*/
