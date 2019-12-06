<template>
    <div class="flex-column" :style="buttonGroupStyle" v-show="node.State.isMouseOn">
        <v-btn
            :key="index"
            :disabled="button.disabled"
            @click="button._func"
            v-for="(button, index) in buttonGroup"
            icon
            x-small
        >
            <v-icon>
                {{button.icon}}
            </v-icon>
        </v-btn>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'

    export default Vue.extend({
        name: "GraphNodeButton",
        components: {},
        data() {
            return {}
        },
        props: {
            nodeSetting: {
                type: Object,
                required: true
            },

            node: {
                type: Object,
                required: true
            }
        },
        computed: {
            buttonGroupStyle() {
                return {
                    width: '36px',
                    height: '120px',
                    left: this.x + 5 + 'px',
                    top: this.y + 5 + 'px',
                    position: 'absolute'
                }
            },
            x: vm => vm.nodeSetting.x + vm.nodeSetting.width + 18,
            y: vm => vm.nodeSetting.y + vm.nodeSetting.height,
            showNode: vm => vm.nodeSetting.show,
            arrowIcon: vm => !vm.boundGraph
                ? 'mdi-magnify'
                : !vm.boundGraph.State.isExplode
                    ? 'mdi-arrow-expand-all'
                    : 'mdi-arrow-collapse-all',
            boundGraph: vm => vm.$store.state.dataManager.graphManager[vm.node.Setting._id],
            buttonGroup: vm => [
                {icon: 'mdi-close', _func: vm.deleteItem},
                {icon: 'mdi-arrow-top-right', _func: vm.addLink},
                {icon: 'mdi-eye', _func: vm.unShow},
                {icon: 'mdi-content-copy', _func: vm.copyItem},
                {icon: vm.arrowIcon, _func: vm.explode, disabled: vm.node.Setting._type !== 'document'}
            ]
        },
        methods: {
            deleteItem() {
                let current = this.node.State.isDeleted;
                this.$set(this.node.State, 'isDeleted', !current);
                current ? this.buttonGroup[2].icon = 'mdi-delete' : this.buttonGroup[2].icon = 'mdi-refresh'
            },
            unShow() {
                let current = this.node.Setting.Show.showAll;
                this.$set(this.node.Setting.Show, 'showAll', !current);
                current ? this.buttonGroup[2].icon = 'mdi-eye-off' : this.buttonGroup[2].icon = 'mdi-eye'
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
            status: 'empty'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/6
* Updated by []
*/
