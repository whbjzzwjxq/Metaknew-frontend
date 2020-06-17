<template>
    <div class="pa-0 d-flex flex-column">
        <graph-top-navigation :document="graph" class="d-inline-flex pt-4 pl-4">

        </graph-top-navigation>
        <div class="flex-grow-1">
            <router-view name="content" :graph="graph"></router-view>
        </div>
        <router-view name="toolbarBottom" :graph="graph">

        </router-view>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {DocumentSelfPart} from "@/class/settingBase";
    import BottomDynamicBar from "@/components/toolbar/BottomDynamicBar.vue";
    import GraphTopNavigation from "@/components/graphComponents/GraphTopNavigation.vue";
    export default Vue.extend({
        name: "ResultDocGraph",
        components: {
            BottomDynamicBar,
            GraphTopNavigation
        },
        data() {
            return {}
        },
        props: {},
        computed: {
            allComponentsStyle: function (): StyleManagerState {
                return this.$store.state.styleComponentSize
            },
            graph: function (): DocumentSelfPart {
                return this.$store.state.dataManager.currentDocument
            }
        },
        methods: {},
        record: {
            status: 'editing',
            description: ''
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/4
* Updated by []
*/
