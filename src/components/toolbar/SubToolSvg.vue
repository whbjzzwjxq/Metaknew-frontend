<template>
    <v-card flat tile class="pa-0 ma-0">
        <v-card-subtitle class="pa-0 ma-0 mb-n2" dense>
            <v-chip class="unselected pa-2" label pill color="white">
                Shape Add
                <v-icon small right> {{ svgIcon }}</v-icon>
            </v-chip>
        </v-card-subtitle>
        <icon-group :icon-list="iconList" :container-style="{width: '100%'}">

        </icon-group>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {getIcon} from "@/utils/icon";
    import {GraphSelfPart, TextSettingPart} from "@/class/graphItem";
    import IconGroup from "@/components/IconGroup.vue";
    import {getIndex} from "@/utils/utils";

    export default Vue.extend({
        name: "SubToolSvg",
        components: {
            IconGroup
        },
        data: function () {
            return {
                svgIcon: getIcon('i-item', 'text')
            }
        },
        props: {},
        computed: {
            iconList: function (): IconItem[] {
                return [
                    {name: getIcon('i-shape', 'rect'), _func: this.addNewRect},
                    {name: getIcon('i-shape', 'square'), _func: this.addNewSquare},
                    {name: getIcon('i-shape', 'ellipse'), _func: this.addNewEllipse},
                    {name: getIcon('i-shape', 'polyline'), _func: this.addNewPolyline}
                ]
            },
            currentGraph: function (): GraphSelfPart {
                return this.$store.state.dataManager.currentGraph
            }
        },
        methods: {
            addNewRect() {
                let _id = getIndex();
                let rect = TextSettingPart.emptyRect(_id, this.currentGraph);
                this.currentGraph.addItems([rect])
            },
            addNewSquare() {

            },
            addNewEllipse() {

            },
            addNewPolyline() {

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
