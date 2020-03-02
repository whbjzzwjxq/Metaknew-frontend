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
    import {GraphSelfPart, NodeSettingPart} from "@/class/graphItem";

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
                type: Object as () => VisualNodeSetting,
                required: true
            },

            node: {
                type: Object as () => NodeSettingPart,
                required: true
            },

            hide: {
                type: Boolean as () => boolean,
                default: false
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
            boundGraph: function (): GraphSelfPart {
                return this.dataManager.graphManager[this.node._id]
            },
            buttonGroup: function (): IconItem[] {
                // 是否可以删除
                let deleteIcon;
                this.node._type === 'document'
                    ? deleteIcon = false
                    : this.node.isDeleted
                    ? deleteIcon = 'rollback'
                    : deleteIcon = true;

                // 是否可以爆炸
                let explodeAble =
                    this.boundGraph
                        ? this.boundGraph._id === this.dataManager.currentGraph._id
                        : false;
                let explodeIcon;
                !this.boundGraph
                    ? explodeIcon = 'unload'
                    : explodeIcon = !this.boundGraph.isExplode;
                return [
                    {name: getIcon("i-delete-able", deleteIcon), _func: this.deleteItem, disabled: !deleteIcon},
                    {name: 'mdi-arrow-top-right', _func: this.addLink},
                    {name: getIcon('i-eye', this.node.Setting.Show.showAll), _func: this.unShow},
                    {name: 'mdi-content-copy', _func: this.copyItem},
                    {name: getIcon("i-explode", explodeIcon), _func: this.explode, render: this.node._type === 'document', disabled: explodeAble}
                ]
            }
        },
        methods: {
            deleteItem() {
                let current = this.node.isDeleted;
                this.$set(this.node.State, 'isDeleted', !current);
            },
            unShow() {
                let current = this.node.Setting.Show.showAll;
                this.$set(this.node.Setting.Show, 'showAll', !current);
            },

            addLink() {
                this.$emit('add-link', this.node)
            },
            copyItem() {
                this.$emit('copy-item', this.node)
            },
            explode() {
                this.$emit('explode', this.node)
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
