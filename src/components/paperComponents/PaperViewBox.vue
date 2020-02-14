<template>
    <div class="d-flex">

    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {PaperSelfPart} from "@/class/paperItem";

    export default Vue.extend({
        name: "PaperViewBox",
        components: {},
        data: function () {
            return {}
        },
        props: {
            paper: {
                type: Object as () => PaperSelfPart,
                required: true
            }
        },
        computed: {

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
