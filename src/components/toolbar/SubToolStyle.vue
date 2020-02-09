<template>
    <v-card flat tile class="pa-0 ma-0">
        <v-card-subtitle class="pa-0 ma-0 mb-n2" dense>
            <v-chip class="unselected pa-0" label pill color="white">
                Style Editor
                <v-icon small> {{ styleIcon }}</v-icon>
            </v-chip>
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
                    <v-icon v-text="item.name">

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
                    :setting-list="
                    key !== 'document'
                    ? document.getItemByState(key, 'isSelected')
                    : [document.Conf]"
                >

                </card-page-style-editor>
            </v-card>
        </v-menu>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {getIcon} from "@/utils/icon";
    import {GraphSelfPart} from "@/class/graphItem";
    import CardPageStyleEditor from "@/components/card/page/CardPageStyleEditor.vue";

    export default Vue.extend({
        name: "SubToolNewItem",
        components: {
            CardPageStyleEditor
        },
        data() {
            return {
                styleIcon: getIcon('i-style', 'palette')
            }
        },
        props: {},
        computed: {
            contentItemDict: function ():Record<string, IconItem> {
                return {
                    'node': {
                        name: getIcon('i-item', 'node'),
                        title: 'Selection Node'
                    },
                    'media': {
                        name: getIcon('i-item', 'media'),
                        title: 'Selection Media'
                    },
                    'link': {
                        name: getIcon('i-item', 'link'),
                        title: 'Selection Link'
                    },
                    'document': {
                        name: getIcon('i-item', 'document'),
                        title: 'Current Graph'
                    }
                }
            },
            document: function (): GraphSelfPart {
                return this.$store.state.dataManager.currentGraph
            },
        },
        methods: {},
        watch: {},
        record: {
            status: 'done',
            description: ' 编辑样式用的工具栏'
            //todo 专题样式编辑
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2020/1/6
* Updated by []
*/
