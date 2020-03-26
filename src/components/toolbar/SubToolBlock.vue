<template>
    <v-card flat tile class="pa-0 ma-0">
        <v-card-subtitle class="pa-0 ma-0 mb-n2" dense>
            <v-chip class="unselected pa-0" label pill color="white">
                {{text}}
                <v-icon small> {{ icon }}</v-icon>
            </v-chip>
        </v-card-subtitle>
        <slot name="subToolContent">

        </slot>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'

    export default Vue.extend({
        name: "SubToolBlock",
        components: {},
        data: function () {
            return {}
        },
        props: {
            icon: {
                type: String,
                default: ''
            },
            text: {
                type: String,
                default: ''
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

</style>
