<template>
    <v-card flat tile class="pa-0 ma-0">
        <v-card-subtitle class="pa-0 ma-0 mb-n2" dense>
            <v-chip class="unselected pa-0" label pill color="white">
                Save Document
                <v-icon small> {{ saveGroup.save }}</v-icon>
            </v-chip>
        </v-card-subtitle>
        <icon-group :icon-list="iconLiSt">

        </icon-group>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import IconGroup from "@/components/IconGroup.vue";
    import {getIcon, iconMap} from "@/utils/icon";
    import {dispatchDocumentSave} from "@/store/modules/_dispatch";

    export default Vue.extend({
        name: "SubToolDocSave",
        components: {
            IconGroup
        },
        data: function () {
            return {
                saveGroup: iconMap['i-save']
            }
        },
        props: {},
        computed: {
            iconLiSt: function (): IconItem[] {
                return [
                    {
                        name: this.saveGroup.save,
                        _func: this.saveDocument,
                        payload: 'current',
                        toolTip: '保存现有的专题'
                    },
                    {
                        name: this.saveGroup.saveAll,
                        _func: this.saveDocument,
                        payload: 'all',
                        toolTip: '保存所有专题'
                    }
                ]
            },

            dataManager: function (): DataManagerState {
                return this.$store.state.dataManager
            }
        },
        methods: {
            saveDocument(payload: 'current' | 'all') {
                dispatchDocumentSave(payload)
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
