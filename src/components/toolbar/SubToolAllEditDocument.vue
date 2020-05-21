<template>
    <v-card flat tile class="pa-0 ma-0">
        <v-card-subtitle class="pa-0 ma-0 mb-n2" dense>
            <v-chip class="unselected pa-0" label pill color="white">
                Document
                <v-icon small> {{ saveGroup.save }}</v-icon>
            </v-chip>
        </v-card-subtitle>
        <icon-group :icon-list="iconLiSt" small class-token="flex-wrap">

        </icon-group>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import IconGroup from "@/components/IconGroup.vue";
    import {iconMap} from "@/utils/icon";
    import {dispatchAllInfoUpdate, dispatchDocumentSave} from "@/store/modules/_dispatch";
    import {getIndex} from "@/utils/utils";
    import {DocumentSelfPart} from "@/class/settingBase";

    export default Vue.extend({
        name: "SubToolEditDocument",
        components: {
            IconGroup
        },
        data: function () {
            return {
                saveGroup: iconMap['i-save'],
                editGroup: iconMap['i-edit']
            }
        },
        props: {},
        computed: {
            iconLiSt: function (): IconItem[] {
                return [
                    {
                        name: this.saveGroup.saveAll,
                        _func: this.saveDocument,
                        payload: {isDraft: false, isAuto: false},
                        toolTip: '保存所有专题'
                    },
                    {
                        name: this.saveGroup.saveDraft,
                        _func: this.saveAll,
                        payload: {isDraft: false, isAuto: false},
                        toolTip: '保存所有内容'
                    },
                    {
                        name: this.editGroup.collect,
                        _func: this.collectItemsToNewGraph,
                        payload: true,
                        render: this.viewMode === 'graph',
                        toolTip: '把选中的内容置为专题(删除原专题内的内容)'
                    },
                    {
                        name: this.editGroup.newOne,
                        _func: this.collectItemsToNewGraph,
                        payload: false,
                        render: this.viewMode === 'graph',
                        toolTip: '把选中的内容置为专题(不删除原专题内的内容)'
                    },
                ]
            },

            dataManager: function (): DataManagerState {
                return this.$store.state.dataManager
            },
            currentDocument: function (): DocumentSelfPart {
                return this.dataManager.currentDocument
            },
            viewMode: function (): string {
                return this.$route.name === undefined
                    ? 'graph'
                    : this.$route.name.split('-')[0]
            }
        },
        methods: {
            saveDocument(payload: {isDraft: boolean, isAuto: boolean}) {
                dispatchDocumentSave(payload)
            },
            saveAll(payload: {isDraft: boolean, isAuto: boolean}) {
                this.saveDocument(payload);
                dispatchAllInfoUpdate(payload);
            },
            collectItemsToNewGraph(deleteSource: boolean) {
                let _id = getIndex();
                let parent = this.currentDocument;
                let items = parent.itemsAllSubDoc.filter(item => item.isSelected);
                return DocumentSelfPart.initCollect({_id, parent, commitToVuex: true}, items, deleteSource);
            }
        },
        record: {
            status: 'empty',
            description: ''
        }
    })
</script>

<style scoped>

</style>
