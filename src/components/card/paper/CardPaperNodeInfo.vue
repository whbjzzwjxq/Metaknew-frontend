<template>
    <v-hover>
        <v-card outlined height="360px">

        </v-card>
    </v-hover>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {NodeInfoPart} from "@/class/info";

    export default Vue.extend({
        name: "CardPaperNodeInfo",
        components: {},
        data: function () {
            return {}
        },
        props: {
            info: {
                type: Object as () => NodeInfoPart,
                required: true
            },
            itemSetting: {
                type: Object as () => NodeSetting,
                required: true
            },
            state: {
                type: Object as () => NodeState,
                required: true
            },
            editMode: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            setting: function (): NodeStyleSettingPaper {
                return this.itemSetting.InPaper
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
