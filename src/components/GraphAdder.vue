<template>
    <v-card flat tile>
        <v-btn
            :block="item.isBlock"
            :key="key"
            @click="item._func"
            class="pr-6 pl-4"
            depressed
            outlined
            icon
            tile
            v-for="(item, key) in itemDict">
            <v-icon> {{ item.icon }}</v-icon>
            {{ item.text }}
        </v-btn>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {getIcon} from "@/utils/icon";

    export default Vue.extend({
        name: "GraphAdder",
        components: {},
        data() {
            return {}
        },
        props: {},
        computed: {
            itemDict: function () {
                return {
                    graph: {
                        icon: getIcon('i-item', 'DocGraph'),
                        text: 'New Graph',
                        isBlock: false,
                        _func: this.addGraph
                    },
                    paper: {
                        icon: getIcon('i-item', 'DocPaper'),
                        text: 'New Paper',
                        isBlock: false,
                        _func: this.addPaper
                    },
                    fromCloud: {
                        icon: getIcon('i-get-media-type', 'fromCloud'),
                        text: 'From CloudRepo',
                        isBlock: true,
                        _func: this.doNothing
                    },
                    fromWeb: {
                        icon: getIcon('i-get-media-type', 'fromWeb'),
                        text: 'From HyperLink',
                        isBlock: true,
                        _func: this.doNothing
                    }
                }
            }
        },
        methods: {
            addGraph() {
                this.$emit('add-document', 'DocGraph')
            },
            addPaper() {
                this.$emit('add-document', 'DocPaper')
            },
            doNothing() {

            }
        },
        watch: {},
        record: {
            status: 'empty'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2020/1/6
* Updated by []
*/
