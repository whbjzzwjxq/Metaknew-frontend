<template>
    <v-card flat class="subCard">

    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {NodeInfoPart} from "@/class/graphItem";

    export default Vue.extend({
        name: "CardNodeSimp",
        components: {},
        data: function () {
            return {}
        },
        props: {
            node: {
                type: Object as () => NodeInfoPart,
                required: true
            }
        },
        computed: {},
        methods: {},
        record: {
            status: 'empty',
            description: ''
        }
    })
</script>

<style scoped>
    @import "src/style/css/subCard.css";
</style>
