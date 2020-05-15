<template>
    <v-card :width="cardSize.width" :height="cardSize.height" flat>
        <markdown-render v-model="text" class="pa-2">

        </markdown-render>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {CardSize, getCardSize} from "@/interface/interfaceInComponent";
    import MarkdownRender from "@/components/markdown/MarkdownRender.vue";
    export default Vue.extend({
        name: "CardTextSimp",
        components: {
            MarkdownRender
        },
        data: function () {
            return {}
        },
        props: {
            setting: {
                type: Object as () => TextSetting,
                required: true
            },
            state: {
                type: Object as () => TextState,
                required: true
            },
            large: {
                type: Boolean,
                default: false
            },
            xLarge: {
                type: Boolean,
                default: false
            },
            small: {
                type: Boolean,
                default: false
            },
            xSmall: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            cardSize: function (): CardSize {
                return getCardSize(this.$props)
            },
            text: function(): string {
                return this.setting._text
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
