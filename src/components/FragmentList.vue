<template>
    <v-card :height="height" :width="width" class="cardItem">
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
        props: {
            width: {
                type: Number as () => number,
                default: 480
            },
            height: {
                type: Number as () => number,
                default: 720
            }
        },
        computed: {
            userDataManager: function (): UserDataManagerState {
                return this.$store.state.userDataManager
            },
            fragments: function (): FragmentInfoPart[] {
                return this.userDataManager.fragments
            }
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
