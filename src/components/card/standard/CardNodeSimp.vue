<template>
    <v-card flat tile outlined class="subCard">
        <v-img
            class="white--text align-end"
            :src="realSrc">

        </v-img>
        <v-card-title>
            {{ info.Name }}
        </v-card-title>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {getSrc} from "@/utils/utils";
    import {NodeInfoPart} from "@/class/info";

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
        computed: {
            info: function (): BaseNodeInfo {
                return this.node.Info
            },

            realSrc: function (): string {
                return getSrc(this.info.MainPic)
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
    @import "src/style/css/subCard.css";
</style>
