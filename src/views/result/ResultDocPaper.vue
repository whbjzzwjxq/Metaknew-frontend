 <template>
    <div>
        <div :style="viewBoxStyle" class="cardItem">
            <paper-view-box>

            </paper-view-box>
        </div>
        <toolbar-bottom @add-empty-note="newNote">
            <template v-slot:subTool>
                <div style="width: 100%; height: 100%" class="d-flex flex-row">
                    <div style="width: 80px; height: 100%">

                    </div>
                    <v-col cols="2" class="pa-0 ma-0">
                    </v-col>
                </div>
            </template>
        </toolbar-bottom>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {PaperSelfPart} from "@/class/paperItem";
    import {RectByPoint} from "@/class/geometric";
    import ToolbarBottom from "@/components/toolbar/ToolbarBottom.vue";
    import PaperViewBox from "@/components/paperComponents/PaperViewBox.vue";
    import {NoteSettingPart} from "@/class/graphItem";
    export default Vue.extend({
        name: "ResultDocPaper",
        components: {
            ToolbarBottom,
            PaperViewBox
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
            },
            allComponentsStyle: function (): StyleManagerState {
                return this.$store.state.styleComponentSize
            },
            viewBox: function (): RectByPoint {
                return this.allComponentsStyle.viewBox
            },
            viewBoxStyle: function (): CSSProp {
                return this.viewBox.getDivCSS({overflow: "hidden"})
            },
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
