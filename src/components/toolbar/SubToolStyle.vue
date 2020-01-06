<template>
    <v-card flat tile class="pa-0 ma-0">
        <v-card-subtitle class="pa-0 ma-0" dense>
            Style Edit
            <v-icon v-text="'mdi-palette'" small></v-icon>
        </v-card-subtitle>
        <v-menu
            top
            offset-y
            :close-delay="500"
            :close-on-content-click="false"
            v-for="(item, key) in contentItemDict"
            :key="key"
        >
            <template v-slot:activator="{ on }">
                <v-btn icon v-on="on">
                    <v-icon v-text="item.icon">

                    </v-icon>
                </v-btn>
            </template>
            <v-card
                flat
                tile
                outlined
                :min-width="300"
                :min-height="200"
                :max-height="600"
                class="cardItem">
                <v-card-subtitle style="font-size: 18px">
                    {{ item.title }}
                </v-card-subtitle>
                <card-page-style-editor
                    :comp-type="key"
                    :setting-list="document.getItemByState(key, 'isSelected')"
                >

                </card-page-style-editor>
            </v-card>
        </v-menu>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {getIcon} from "@/utils/icon";
    import {GraphSelfPart, id} from "@/utils/graphClass";
    import CardPageStyleEditor from "@/components/card/page/CardPageStyleEditor.vue";

    export default Vue.extend({
        name: "SubToolNewItem",
        components: {
            CardPageStyleEditor
        },
        data() {
            return {}
        },
        props: {},
        computed: {
            contentItemDict: function () {
                return {
                    'node': {
                        icon: getIcon('i-item', 'node'),
                        title: 'Selection Node'
                    },
                    'media': {
                        icon: getIcon('i-item', 'media'),
                        title: 'Selection Media'
                    },
                    'link': {
                        icon: getIcon('i-item', 'link'),
                        title: 'Selection Link'
                    },
                }
            },
            document: function (): GraphSelfPart {
                return this.$store.state.dataManager.currentGraph
            },
        },
        methods: {
            addNode($event: string) {
                this.$emit('add-empty-node', $event);
            },
            addMedia(mediaIdList: id[]) {
                this.$emit('add-media', mediaIdList);
            },
            addLink() {

            },

            addGraph() {

            },

        },
        watch: {},
        record: {
            status: 'empty'
        }
    })
</script>

<style scoped>
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
* Created by whb on 2020/1/6
* Updated by []
*/
