<template>
    <v-card flat tile class="pa-0 ma-0">
        <v-card-subtitle class="pa-0 ma-0 mb-n2" dense>
            <v-chip class="unselected pa-0" label pill color="white">
                New Item
                <v-icon v-text="'mdi-plus'" small></v-icon>
            </v-chip>
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
                    <document-adder v-else-if="key === 'document'" @add-document="addDocument">

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
    import {DocumentSelfPart, MediaSettingPart} from "@/class/settingBase";

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
                        title: 'New Node',
                        toolTip: ''
                    },
                    'media': {
                        icon: getIcon('i-item', 'media'),
                        title: 'New Media',
                        toolTip: ''
                    },
                    'link': {
                        icon: getIcon('i-item', 'link'),
                        title: 'New Link',
                        toolTip: ''
                    },
                    'document': {
                        icon: getIcon('i-item', 'document'),
                        title: 'New Document',
                        toolTip: ''
                    },
                    'note': {
                        icon: getIcon('i-item', 'text'),
                        title: 'New note',
                        toolTip: ''
                    }
                }
            },
            dataManager: function(): DataManagerState {
                return this.$store.state.dataManager
            },
            document: function (): DocumentSelfPart {
                return this.dataManager.currentDocument
            }
        },
        methods: {
            addNode(_label: string) {
                this.document.addEmptyNode('node', _label);
            },

            addMedia(mediaIdList: id[]) {
                let mediaSettingList = mediaIdList.map(_id => this.dataManager.mediaManager[_id])
                    .map(info => {
                        return MediaSettingPart.emptyMediaSettingFromInfo(info, this.document)
                    });
                this.document.addItems(mediaSettingList);
                return mediaSettingList
            },

            addLink(start: VisNodeSettingPart, end: VisNodeSettingPart) {
                this.document.addEmptyLink(start, end);
            },

            addDocument() {
                this.document.addEmptyGraph();
            },

            addNote() {
                this.document.addEmptyGraph();
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
