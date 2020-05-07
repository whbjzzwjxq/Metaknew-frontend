<template>
    <div>
        <template v-if="type === 'node' || type === 'document'">
            <card-node-simp
                :large="large"
                :x-large="xLarge"
                :small="small"
                :x-small="xSmall"
                :setting="item.Setting"
                :state="item.State"
            >

            </card-node-simp>
        </template>
        <template v-else-if="type === 'link'">
            <card-link-simp
                :large="large"
                :x-large="xLarge"
                :small="small"
                :x-small="xSmall"
                :setting="item.Setting"
                :state="item.State">

            </card-link-simp>
        </template>
        <template v-else-if="type === 'media'">
            <card-media-simp
                :large="large"
                :x-large="xLarge"
                :small="small"
                :x-small="xSmall"
                :setting="item.Setting"
                :state="item.State">

            </card-media-simp>
        </template>
        <template v-else-if="type === 'text'">
            <card-text-simp
                :large="large"
                :x-large="xLarge"
                :small="small"
                :x-small="xSmall"
                :setting="item.Setting"
                :state="item.State">

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
    import {ItemSettingPart} from "@/class/settingBase";

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
            //document特征render
            renderDocument: {
                type: Boolean,
                default: false
            },
            item: {
                type: Object as () => ItemSettingPart,
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
            type: function (): DocumentItemType {
                return this.item._type
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
