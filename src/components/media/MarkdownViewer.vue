<template>
    <v-card :style="divStyle" flat tile v-show="value">
        <v-card-title class="pa-2">
            <v-spacer></v-spacer>
            <icon-group :icon-list="iconList">

            </icon-group>
        </v-card-title>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {getDivCSS} from "@/utils/geoMetric";
    import IconGroup from "@/components/IconGroup.vue";
    import {getIcon} from "@/utils/icon";

    export default Vue.extend({
        name: "MarkdownViewer",
        components: {
            IconGroup
        },
        data: function () {
            return {}
        },
        props: {
            container: {
                type: Object as () => AreaRect,
                required: true
            },
            value: {
                type: Boolean as () => boolean,
                default: false
            }
        },
        computed: {
            divStyle: function (): CSSProp {
                return getDivCSS(this.container)
            },
            iconList: function (): IconItem[] {
                return [
                    {name: getIcon('i-edit', 'close'), _func: this.close}
                ]
            }
        },
        methods: {
            close: function () {
                this.$emit('input', false)
            }
        },
        record: {
            status: 'empty',
            description: ''
        }
    })
</script>

<style scoped>

</style>
