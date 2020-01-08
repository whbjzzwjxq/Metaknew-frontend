<template>
    <icon-group
        :container-style="buttonGroupStyle"
        :icon-list="buttonGroup"
        vertical
        x-small
        :hide="!node.State.isMouseOn && node.Setting.Show.showAll">

    </icon-group>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {getIcon} from "@/utils/icon";
    import IconGroup from "@/components/iconGroup/IconGroup.vue";
    import {NodeSettingPart} from "@/utils/graphClass";

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
                type: Object,
                required: true
            },

            node: {
                type: Object as () => NodeSettingPart,
                required: true
            }
        },
        computed: {
            buttonGroupStyle: function () {
                return {
                    width: '18px',
                    height: '120px',
                    left: this.x + 'px',
                    top: this.y + 'px',
                    position: 'absolute'
                }
            },
            x: function () {
                return this.nodeSetting.x + this.nodeSetting.width + 12
            },
            y: function () {
                return this.nodeSetting.y - this.nodeSetting.height - 12
            },
            showNode: function () {
                return this.nodeSetting.show
            },
            dataManager: function () {
                return this.$store.state.dataManager
            },
            boundGraph: function () {
                return this.dataManager.graphManager[this.node.Setting._id]
            },
            buttonGroup: function (): IconItem[] {
                // 是否可以删除
                let deleteIcon;
                this.node.Setting._type === 'document'
                    ? deleteIcon = false
                    : this.node.State.isDeleted
                    ? deleteIcon = 'rollback'
                    : deleteIcon = true;

                // 是否可以爆炸
                let explodeAble =
                    this.boundGraph
                        ? this.boundGraph.id === this.dataManager.currentGraph.id
                        : false;
                let explodeIcon;
                !this.boundGraph
                    ? explodeIcon = 'unload'
                    : explodeIcon = !this.boundGraph.Conf.State.isExplode;
                return [
                    {name: getIcon("i-delete-able", deleteIcon), _func: this.deleteItem, disabled: !deleteIcon},
                    {name: 'mdi-arrow-top-right', _func: this.addLink},
                    {name: getIcon('i-eye', this.node.Setting.Show.showAll), _func: this.unShow},
                    {name: 'mdi-content-copy', _func: this.copyItem},
                    {
                        name: getIcon("i-explode", explodeIcon),
                        _func: this.explode,
                        render: this.node.Setting._type === 'document',
                        disabled: explodeAble
                    }
                ]
            }
        },
        methods: {
            deleteItem() {
                let current = this.node.State.isDeleted;
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
            status: 'done-old'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/6
* Updated by []
*/
