<template>
    <v-card flat tile class="ma-0 pa-0">
        <v-card-title class="ma-0 pa-0" dense>
            Fragment
            <v-icon small></v-icon>
        </v-card-title>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {getIcon} from "@/utils/icon";

    export default Vue.extend({
        name: "SubToolFragment",
        components: {},
        data: function () {
            return {
                fragmentIcon: getIcon('i-item', 'fragment')
            }
        },
        props: {},
        computed: {},
        methods: {},
        record: {
            status: 'empty',
            description: ''
        }
    })
</script>

<style scoped>

</style>
