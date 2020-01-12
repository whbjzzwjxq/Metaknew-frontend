<template>
    <v-card flat tile class="pa-0 ma-0">
        <v-card-subtitle class="pa-0 ma-0" dense>
            New Item
            <v-icon v-text="'mdi-plus'" small></v-icon>
        </v-card-subtitle>
        <v-menu
            top
            offset-y
            :close-delay="2000"
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
            <v-card flat tile outlined :min-width="300" :min-height="200">
                <v-card-subtitle style="font-size: 18px">
                    {{ item.title }}
                </v-card-subtitle>
                <v-card-text>
                    <p-label-selector
                        v-if="key === 'node'"
                        label="BaseNode"
                        @update-label="addNode">

                    </p-label-selector>
                    <media-adder
                        v-else-if="key === 'media'"
                        @update-media="addMedia"
                    >

                    </media-adder>
                    <link-start-end-selector
                        v-else-if="key === 'link'"
                        :document="document"
                        @add-link="addLink"
                        edit-mode>

                    </link-start-end-selector>
                    <document-adder v-else-if="key === 'document'">

                    </document-adder>
                    <v-btn
                        outlined
                        tile
                        v-else-if="key === 'note'"
                        @click="addNote">
                        New Text Note
                    </v-btn>
                </v-card-text>
            </v-card>
        </v-menu>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {getIcon} from "@/utils/icon";
    import PLabelSelector from "@/components/PLabelSelector.vue";
    import MediaAdder from "@/components/media/MediaAdder.vue";
    import LinkStartEndSelector from "@/components/LinkStartEndSelector.vue";
    import DocumentAdder from "@/components/DocumentAdder.vue";

    export default Vue.extend({
        name: "SubToolNewItem",
        components: {
            PLabelSelector,
            MediaAdder,
            LinkStartEndSelector,
            DocumentAdder
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
                        title: 'New Node'
                    },
                    'media': {
                        icon: getIcon('i-item', 'media'),
                        title: 'New Media'
                    },
                    'link': {
                        icon: getIcon('i-item', 'link'),
                        title: 'New Link'
                    },
                    'document': {
                        icon: getIcon('i-item', 'document'),
                        title: 'New Document'
                    },
                    'note': {
                        icon: getIcon('i-item', 'note'),
                        title: 'New note'
                    }
                }
            },
            document: function () {
                return this.$store.state.dataManager.currentGraph
            }
        },
        methods: {
            addNode($event: string) {
                this.$emit('add-empty-node', $event);
            },
            addMedia(mediaIdList: id[]) {
                this.$emit('add-media', mediaIdList);
            },
            addLink(start: VisNodeSettingPart, end: VisNodeSettingPart) {
                this.$emit('add-empty-link', start, end);
            },

            addGraph() {

            },

            addNote() {
                this.$emit('add-empty-note')
            }

        },
        watch: {},
        record: {
            status: 'editing',
            description: '添加新内容的工具栏'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2020/1/4
* Updated by []
*/
