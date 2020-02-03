<template>
    <v-card flat tile>
        <v-btn
            :block="item.isBlock"
            :key="key"
            @click="item._func"
            class="pr-6 pl-4"
            depressed
            outlined
            text
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
        name: "DocumentAdder",
        components: {},
        data() {
            return {}
        },
        props: {},
        computed: {
            itemDict: function (): Record<string, IconItem> {
                return {
                    graph: {
                        name: getIcon('i-item', 'DocGraph'),
                        text: 'New Graph',
                        isBlock: false,
                        _func: this.addGraph
                    },
                    paper: {
                        name: getIcon('i-item', 'DocPaper'),
                        text: 'New Paper',
                        isBlock: false,
                        _func: this.addPaper
                    },
                    fromCloud: {
                        name: getIcon('i-add-media-method', 'fromCloud'),
                        text: 'From CloudRepo',
                        isBlock: true,
                        _func: this.doNothing
                    },
                    fromWeb: {
                        name: getIcon('i-add-media-method', 'fromWeb'),
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
            status: 'editing',
            description: '添加专题用的工具'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2020/1/6
* Updated by []
*/
