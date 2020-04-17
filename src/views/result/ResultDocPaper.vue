 <template>
    <div class="pa-0 d-flex flex-column">
        <div class="flex-grow-1 cardItem">
            <router-view name="content" :paper="paper"></router-view>
        </div>
        <router-view name="toolbarBottom" :paper="paper">

        </router-view>
        <bottom-dynamic-bar>

        </bottom-dynamic-bar>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {PaperSelfPart} from "@/class/paperItem";
    import ToolbarBottom from "@/components/toolbar/ToolbarBottom.vue";
    import PaperViewBox from "@/components/paperComponents/PaperViewBox.vue";
    import BottomDynamicBar from "@/components/toolbar/BottomDynamicBar.vue";
    import {NoteSettingPart} from "@/class/graphItem";
    export default Vue.extend({
        name: "ResultDocPaper",
        components: {
            ToolbarBottom,
            PaperViewBox,
            BottomDynamicBar
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
            paper: function (): PaperSelfPart {
                return this.dataManager.currentPaper
            }
        },
        methods: {
            newNote: function () {
                NoteSettingPart.emptyNoteSetting('note', '', '', this.paper._id, true)
            },
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
