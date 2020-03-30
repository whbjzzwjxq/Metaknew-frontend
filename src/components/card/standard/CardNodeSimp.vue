<template>
    <v-card flat class="subCard">
        <v-img>

        </v-img>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {NodeInfoPart} from "@/class/graphItem";
    import {getSrc} from "@/utils/utils";

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
            realSrc: function (): string {
                return getSrc(this.node.Info.MainPic)
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
    @import "src/style/css/subCard.css";
</style>
