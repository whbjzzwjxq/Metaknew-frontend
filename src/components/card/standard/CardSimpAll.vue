<template>
    <div>
        <template v-if="type === 'node' || type === 'document'">
            <template v-if="type === 'document' && renderDocument">

            </template>
            <template v-else>
                <card-node-simp
                    :large="large"
                    :x-large="xLarge"
                    :small="small"
                    :x-small="xSmall"
                    :setting="setting"
                    :state="state"
                    :not-render-default-icon="notRenderDefaultIcon"
                    :not-render-description="notRenderDescription"
                    :append-icon-list="appendIconList"
                >

                </card-node-simp>
            </template>
        </template>
        <template v-else-if="type === 'link'">
            <card-link-simp
                :large="large"
                :x-large="xLarge"
                :small="small"
                :x-small="xSmall"
                :setting="setting"
                :state="state"
                :not-render-default-icon="notRenderDefaultIcon"
                :not-render-description="notRenderDescription"
                :append-icon-list="appendIconList">

            </card-link-simp>
        </template>
        <template v-else-if="type === 'media'">
            <card-media-simp
                :large="large"
                :x-large="xLarge"
                :small="small"
                :x-small="xSmall"
                :setting="setting"
                :state="state">

            </card-media-simp>
        </template>
        <template v-else-if="type === 'text'">
            <card-text-simp
                :large="large"
                :x-large="xLarge"
                :small="small"
                :x-small="xSmall"
                :setting="setting"
                :state="state">

            </card-text-simp>
        </template>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import CardNodeSimp from "@/components/card/standard/CardNodeSimp.vue";
    import CardTextSimp from "@/components/card/standard/CardTextSimp.vue";
    import CardLinkSimp from "@/components/card/standard/CardLinkSimp.vue";
    import CardMediaSimp from "@/components/card/standard/CardMediaSimp.vue";

    export default Vue.extend({
        name: "CardSimpAll",
        components: {
            CardNodeSimp,
            CardTextSimp,
            CardLinkSimp,
            CardMediaSimp
        },
        data: function () {
            return {}
        },
        props: {
            setting: {
                type: Object as () => DocumentItemSetting,
                required: true
            },
            state: {
                type: Object as () => DocumentItemState,
                required: true
            },
            //document特征render
            renderDocument: {
                type: Boolean,
                default: false
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
            },
            notRenderDefaultIcon: {
                type: Boolean,
                default: false
            },
            notRenderDescription: {
                type: Boolean,
                default: false
            },
            appendIconList: {
                type: Array as () => IconItem[],
                default: () => []
            }
        },
        computed: {
            type: function (): DocumentItemType {
                return this.setting._type
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
