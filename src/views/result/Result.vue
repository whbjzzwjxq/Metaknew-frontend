  <template>
    <v-container
        v-if="!loading"
        fluid
        fill-height
        class="d-flex flex-row ma-0 pa-0">
        <card-root
            :document="graph">

        </card-root>
        <router-view></router-view>
    </v-container>
</template>

<script lang="ts">
    import Vue from 'vue'
    import CardRoot from '@/components/card/CardRoot.vue';
    import {
        commitGraphChange,
        commitRootGraph,
    } from "@/store/modules/_mutations";
    import {getIndex} from "@/utils/utils";
    import {GraphSelfPart} from "@/class/graphItem";
    import {PaperSelfPart} from "@/class/paperItem";

    export default Vue.extend({
        name: "Result",
        components: {
            CardRoot
        },
        data() {
            return {
                loading: true,
                graphRouteRegex: new RegExp('graph.*')
            }
        },
        props: {},
        computed: {
            dataManager: function (): DataManagerState {
                return this.$store.state.dataManager
            },
            graph: function (): GraphSelfPart {
                return this.dataManager.currentGraph
            },
            paper: function (): PaperSelfPart {
                return this.dataManager.currentPaper
            },
            currentDocument: function (): DocumentSelfPart {

            }
        },
        methods: {},
        watch: {},
        created(): void {
            if (this.graph._id === '$_-1') {
                let _id = getIndex();
                let {graph, info} = GraphSelfPart.emptyGraphSelfPart(_id, null);
                commitGraphChange({graph});
                commitRootGraph({graph});
                this.loading = false
            } else {
                this.loading = false
            }
        },
        mounted(): void {},
        record: {
            status: 'done',
            description: '结果页整体框架'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/4
* Updated by [whb on 2020年1月9日03:12:11]
*/
