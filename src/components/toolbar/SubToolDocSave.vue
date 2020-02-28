<template>
    <v-card flat tile class="pa-0 ma-0">
        <v-card-subtitle class="pa-0 ma-0 mb-n2" dense>
            <v-chip class="unselected pa-0" label pill color="white">
                Save Document
                <v-icon v-text="'mdi-content-save'" small></v-icon>
            </v-chip>
        </v-card-subtitle>
        <icon-group :icon-list="iconLiSt">

        </icon-group>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import IconGroup from "@/components/IconGroup.vue";
    import {getIcon} from "@/utils/icon";

    export default Vue.extend({
        name: "SubToolDocSave",
        components: {
            IconGroup
        },
        data: function () {
            return {}
        },
        props: {},
        computed: {
            iconLiSt: function (): IconItem[] {
                return [
                    {
                        name: getIcon('i-edit', 'save'),
                        _func: this.saveDocument,

                    }
                ]
            }
        },
        methods: {
            saveDocument(payload: {}) {

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
