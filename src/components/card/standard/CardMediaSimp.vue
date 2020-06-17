<template>
    <media-viewer
        :max-height="cardSize.height"
        :width="cardSize.width"
        :src="src"
        :label="label"
        ref="mediaViewer">
        <template slot="content">

        </template>
    </media-viewer>
</template>

<script lang="ts">
    import Vue from 'vue'
    import MediaViewer from "@/components/media/MediaViewer.vue";
    import {CardSize, getCardSize} from "@/interface/interfaceInComponent";

    export default Vue.extend({
        name: "CardMediaSimp",
        components: {
            MediaViewer
        },
        data: function () {
            return {

            }
        },
        props: {
            setting: {
                type: Object as () => MediaSetting,
                required: true
            },
            state: {
                type: Object as () => MediaState,
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
            src: function (): string {
                return this.setting._src
            },
            label: function(): string {
                return this.setting._label
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
