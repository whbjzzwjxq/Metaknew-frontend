<template>
    <div v-if="!loading" class="d-flex flex-row">
        <card-root :document="currentDocument" :edit-mode="editMode">

        </card-root>
        <div class="d-flex flex-column flex-grow-1">
            <router-view class="flex-grow-1"></router-view>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import CardRoot from '@/components/card/CardRoot.vue';
    import {commitDocumentChange, commitRootDocPush} from "@/store/modules/_mutations";
    import {getIndex} from "@/utils/utils";
    import {DocumentSelfPart} from "@/class/settingBase";
    import {dispatchGraphQuery} from "@/store/modules/_dispatch";

    export default Vue.extend({
        name: "Result",
        components: {
            CardRoot
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
            currentDocument: function (): DocumentSelfPart {
                return this.dataManager.currentDocument
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
        methods: {
            fetchData() {
                let id = this.$route.params.id;
                const commitGraph = (graph: DocumentSelfPart) => {
                    commitDocumentChange({graph});
                    commitRootDocPush({document: graph});
                    this.loading = false;
                    return true
                };
                if (id) {
                    let graph = this.dataManager.documentManager[id]
                    if (graph !== undefined) {
                        return commitGraph(graph)
                    } else {
                        return dispatchGraphQuery({_id: id, parent: null}).then(() => {
                            let graph = this.dataManager.documentManager[id];
                            return commitGraph(graph)
                        })
                    }
                } else {
                    if (this.currentDocument._id === '$_-1') {
                        let _id = getIndex();
                        let {graph} = DocumentSelfPart.emptyInit(_id, null);
                        graph.addEmptyNode('node', 'BaseNode')
                        return commitGraph(graph)
                    } else {
                        this.loading = false
                        return true
                    }
                }
            }
        },
        watch: {
            $route() {
                this.fetchData()
            }
        },

        created(): void {
            this.fetchData()
        },
        mounted(): void {

        },
        updated(): void {

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
