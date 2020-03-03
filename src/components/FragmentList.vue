<template>
    <v-card :height="container.height" :width="container.width" class="cardItem">
        <v-card-title>
            Your Fragment
        </v-card-title>
        <v-card-text>
            <card-page-fragment v-for="fragment in fragments" :key="fragment._id" :base-fragment="fragment">

            </card-page-fragment>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {FragmentInfoPart} from "@/class/graphItem";
    import CardPageFragment from "@/components/card/page/CardPageFragment.vue";

    export default Vue.extend({
        name: "FragmentList",
        components: {
            CardPageFragment
        },
        data: function () {
            return {}
        },
        props: {},
        computed: {
            userDataManager: function (): UserDataManagerState {
                return this.$store.state.userDataManager
            },
            fragments: function (): FragmentInfoPart[] {
                return this.userDataManager.fragments
            },
            styleManager: function (): StyleManagerState {
                return this.$store.state.styleComponentSize
            },
            container: function (): ComponentSize {
                return this.styleManager.noteBook
            },
        },
        methods: {},
        record: {
            status: 'empty',
            description: ''
        }
    })
</script>

<style scoped>

</style>
