<template>
    <div :style="divStyle" v-show="!hide">
        <icon-group
            :container-style="buttonGroupStyle"
            :icon-list="buttonGroup"
            vertical
            x-small
            :hide="hide">

        </icon-group>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {getIcon} from "@/utils/icon";
    import IconGroup from "@/components/IconGroup.vue";
    import {DocumentSelfPart, NodeSettingPart} from "@/class/settingBase";

    export default Vue.extend({
        name: "GraphNodeButton",
        components: {
            IconGroup
        },
        data() {
            return {}
        },
        props: {
            nodeSetting: {
                type: Object as () => NodeSettingSimply,
                required: true
            },

            node: {
                type: Object as () => NodeSettingPart,
                required: true
            },

            hide: {
                type: Boolean,
                default: false
            },

            editMode: {
                type: Boolean,
                default: true
            }
        },
        computed: {
            divStyle: function (): CSSProp {
                return {
                    width: '24px',
                    height: '120px',
                    left: this.x + 'px',
                    top: this.y + 'px',
                    position: 'absolute',
                }
            },
            buttonGroupStyle: function (): CSSProp {
                return {
                    width: '18px',
                    height: '120px',
                    left: '3px',
                    top: 0,
                    position: 'absolute',
                }
            },
            x: function (): number {
                return this.nodeSetting.x + this.nodeSetting.width + 12
            },
            y: function (): number {
                return this.nodeSetting.y - this.nodeSetting.height - 12
            },
            showNode: function (): boolean {
                return this.nodeSetting.show
            },
            dataManager: function (): DataManagerState {
                return this.$store.state.dataManager
            },
            boundDocument: function (): DocumentSelfPart | undefined {
                return this.node.boundDocument
            },
            currentDocument: function (): DocumentSelfPart {
                return this.dataManager.currentDocument
            },
            buttonGroup: function (): IconItem[] {
                // 是否可以删除
                let editMode = this.editMode;
                let deleteIcon;
                this.node._id === this.dataManager.currentDocument._id
                    ? deleteIcon = false
                    : this.node.isDeleted
                    ? deleteIcon = 'rollback'
                    : deleteIcon = true;

                let explodeIcon: IconItem;
                if (this.boundDocument) {
                    explodeIcon = {
                        name: getIcon("i-explode", !this.boundDocument.isExplodeState),
                        _func: this.explode,
                        toolTip: !this.boundDocument.isExplodeState ? '展开专题' : '关闭专题',
                        render: this.node._type === 'document',
                        disabled: this.boundDocument._id === this.currentDocument._id
                    }
                } else {
                    explodeIcon = {
                        name: getIcon("i-explode", 'unload'),
                        _func: this.loadDocument,
                        toolTip: '加载专题',
                        render: this.node._type === 'document'
                    }
                }
                return [
                    {
                        name: getIcon("i-delete-able", deleteIcon),
                        _func: this.delSingleNode,
                        disabled: !deleteIcon,
                        render: editMode
                    },
                    {name: 'mdi-arrow-top-right', _func: this.addLink, render: editMode},
                    explodeIcon,
                    {name: getIcon('i-eye', this.node.StyleInGraph.Show.showAll), _func: this.unShow},
                ]
            }
        },
        methods: {
            delSingleNode() {
                this.node.parent.deleteItem(this.node)
            },
            unShow() {
                let current = this.node.StyleInGraph.Show.showAll;
                this.node.updateGraphSetting('Show', 'showAll', !current);
            },

            addLink() {
                this.$emit('add-link', this.node)
            },
            loadDocument() {
                this.$emit('load-document', this.node)
            },
            explode() {
                this.boundDocument && this.boundDocument.explode()
            }
        },
        watch: {},
        record: {
            status: 'done',
            description: "Node旁边的按钮"
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/6
* Updated by [whb on 2020年1月9日02:14:22]
*/
