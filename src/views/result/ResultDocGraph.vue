<template>
    <div class="pa-0 d-flex flex-column">
        <div class="flex-grow-1">
            <router-view name="content" :graph="graph"></router-view>
        </div>
        <router-view name="toolbarBottom" :graph="graph">

        </router-view>
        <bottom-dynamic-bar>

        </bottom-dynamic-bar>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {GraphSelfPart} from "@/class/settingGraph";
    import BottomDynamicBar from "@/components/toolbar/BottomDynamicBar.vue";
    export default Vue.extend({
        name: "ResultDocGraph",
        components: {
            BottomDynamicBar
        },
        data() {
            return {}
        },
        props: {},
        computed: {
            allComponentsStyle: function (): StyleManagerState {
                return this.$store.state.styleComponentSize
            },
            graph: function (): GraphSelfPart {
                return this.$store.state.dataManager.currentGraph
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
