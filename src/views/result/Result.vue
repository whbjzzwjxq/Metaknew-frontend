<template>
    <div v-if="!loading" class="d-flex flex-row">
        <card-root :document="currentDocument" :edit-mode="editMode">

        </card-root>
        <div class="d-flex flex-column flex-grow-1">
            <graph-top-navigation
                :document="currentDocument"
                :style="navigationStyle"
                class="unselected">

            </graph-top-navigation>
            <router-view class="flex-grow-1"></router-view>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import CardRoot from '@/components/card/CardRoot.vue';
    import GraphTopNavigation from "@/components/graphComponents/GraphTopNavigation.vue";
    import {commitGraphChange, commitRootGraph} from "@/store/modules/_mutations";
    import {getIndex} from "@/utils/utils";
    import {DocumentSelfPart, GraphSelfPart} from "@/class/graphItem";
    import {PaperSelfPart} from "@/class/paperItem";
    import {dispatchGraphQuery} from "@/store/modules/_dispatch";

    export default Vue.extend({
        name: "Result",
        components: {
            CardRoot,
            GraphTopNavigation
        },
        data() {
            return {
                loading: true,
                graphRouteRegex: /graph.*/,
                editRegex: /.*-edit/
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
                return this.graphRouteRegex.test(String(this.$route.name))
                    ? this.graph
                    : this.paper
            },
            editMode: function (): boolean {
                return this.editRegex.test(String(this.$route.name))
            },
            allComponentsStyle: function (): StyleManagerState {
                return this.$store.state.styleComponentSize
            },
            navigationStyle: function (): CSSProp {
                let {width} = this.allComponentsStyle.leftCard;
                let {height} = this.allComponentsStyle.toolBar;
                return {
                    position: 'absolute',
                    left: width + 'px',
                    top: height + 'px'
                }
            }
        },
        methods: {},
        watch: {},
        created(): void {
            let id = this.$route.params.id;
            if (id) {
                dispatchGraphQuery({_id: id, parent: null}).then(() => {
                        let graph = this.dataManager.graphManager[id];
                        commitGraphChange({graph});
                        commitRootGraph({graph});
                        this.loading = false;
                    }
                )
            } else {
                if (this.graph._id === '$_-1') {
                    let _id = getIndex();
                    let {graph, info} = GraphSelfPart.emptyGraphSelfPart(_id, null);
                    commitGraphChange({graph});
                    commitRootGraph({graph});
                    this.loading = false
                } else {
                    this.loading = false
                }
            }
        },
        mounted(): void {
        },
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
