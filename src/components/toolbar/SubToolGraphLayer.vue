<template>
    <sub-tool-block :icon="layerGroup.layers" text="Graph Layer">
        <template v-slot:subToolContent>
            <icon-group :icon-list="iconList" small class-token="flex-wrap"></icon-group>
        </template>
    </sub-tool-block>
</template>

<script lang="ts">
    import Vue from 'vue'
    import SubToolBlock from "@/components/toolbar/SubToolBlock.vue";
    import IconGroup from "@/components/IconGroup.vue";
    import {DocumentSelfPart} from "@/class/settingBase";
    import {getIcon, iconMap} from "@/utils/icon";
    import {commitChangeGraphLayerListOn} from "@/store/modules/_mutations";

    export default Vue.extend({
        name: "SubToolGraphLayer",
        components: {
            SubToolBlock,
            IconGroup
        },
        data: function () {
            return {
                layerGroup: iconMap['i-graph-layer']
            }
        },
        props: {},
        computed: {
            dataManager: function (): DataManagerState {
                return this.$store.state.dataManager
            },
            currentDocument: function (): DocumentSelfPart {
                return this.dataManager.currentDocument
            },
            layerListOn: function (): boolean {
                return this.$store.state.componentState.graphLayerListOn
            },
            iconList: function (): IconItem[] {
                return [
                    {
                        name: this.layerGroup.add,
                        _func: this.addLayer,
                        toolTip: '新建一个图层'
                    },
                    {
                        name: getIcon('i-edit', 'collect'),
                        _func: this.collectItemsToLayer,
                        toolTip: '把选中的内容置为一个图层'
                    },
                    {
                        name: this.layerListOn ? this.layerGroup.search : this.layerGroup.off,
                        _func: this.changeGraphLayerListOn,
                        toolTip: this.layerListOn ? '关闭图层列表' : '打开图层列表'
                    }
                ]
            }
        },
        methods: {
            addLayer: function () {
                this.currentDocument.addEmptyGraphLayer()
            },
            collectItemsToLayer: function () {
                let document = this.currentDocument
                let items = document.itemsAllSubDoc.filter(item => item.isSelected);
                this.currentDocument.addCollectGraphLayer(items)
            },
            changeGraphLayerListOn: function () {
                commitChangeGraphLayerListOn()
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
