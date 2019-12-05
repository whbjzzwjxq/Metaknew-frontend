<template>
    <v-card>
        <v-tabs>

        </v-tabs>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'

    export default Vue.extend({
        name: "CardEcoSystem",
        components: {},
        data() {
            return {
                tabItems: {
                    "known-map": {},
                    "fragment": {},
                    "community": {},

                },
            }
        },
        props: {},
        computed: {},
        methods: {},
        watch: {},
        record: {
            status: 'empty'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/4
* Updated by []
*/
