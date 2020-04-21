<template>
    <div class="pa-0 d-flex flex-column" style="overflow: hidden">
        <v-card outlined tile height="48">
            <graph-top-navigation :document="document" class="d-inline-flex pa-4">

            </graph-top-navigation>
        </v-card>
        <div class="flex-grow-1">
            <router-view name="content" :document="document"></router-view>
        </div>
        <router-view name="toolbarBottom">

        </router-view>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {DocumentSelfPart, NoteSettingPart} from "@/class/settingBase";
    import ToolbarBottom from "@/components/toolbar/ToolbarBottom.vue";
    import PaperViewBox from "@/components/paperComponents/PaperViewBox.vue";
    import BottomDynamicBar from "@/components/toolbar/BottomDynamicBar.vue";
    import GraphTopNavigation from "@/components/graphComponents/GraphTopNavigation.vue";

    export default Vue.extend({
        name: "Result_DocPaper",
        components: {
            ToolbarBottom,
            PaperViewBox,
            BottomDynamicBar,
            GraphTopNavigation
        },
        data() {
            return {
                editPageRegex: new RegExp('edit-.*'),
            }
        },
        props: {},
        computed: {
            dataManager: function (): DataManagerState {
                return this.$store.state.dataManager
            },
            editMode: function (): boolean {
                return this.editPageRegex.test(String(this.$route.name))
            },
            document: function (): DocumentSelfPart {
                return this.dataManager.currentDocument
            }
        },
        methods: {
            newNote: function () {
                NoteSettingPart.emptyNoteSetting('note', '', '', this.document._id, true)
            }
        },
        watch: {},
        record: {
            status: 'empty'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/4
* Updated by []
*/
