<template>
    <v-autocomplete
        :items="availableLabel"
        :value="label"
        @input="choosePrimaryLabel"
        autofocus
        persistent-hint
        label="PrimaryLabel Select">

    </v-autocomplete>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {availableLabel} from "@/utils/labelField";

    export default Vue.extend({
        name: "PLabelSelector",
        components: {},
        data() {
            return {
                availableLabel: availableLabel
            }
        },
        props: {
            label: {
                type: String,
                required: true
            }
        },
        computed: {},
        methods: {
            choosePrimaryLabel($event: string) {
                this.$emit("update-label", $event)
            }
        },
        watch: {},
        record: {
            status: 'done'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/11/25
* Updated by []
*/
