<template>
    <v-chip @click="click"
            :color="labelColor"
            :small="small"
            :x-small="xSmall"
            :large="large"
            :x-large="xLarge"
            :close="closeable"
            @click:close="deleteChip"
            v-show="show">
        {{label}}
    </v-chip>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {commitNewLabel} from "@/store/modules/_mutations";

    export default Vue.extend({
        name: "GlobalChip",
        components: {},
        data() {
            return {
                show: true,
                closeChip: 0 as number,
            }
        },
        props: {
            label: {
                type: String,
                required: true
            },
            color: {
                type: String
            },
            closeable: {
                type: Boolean,
                default: false
            },
            action: Function as () => Function | null,
            jumpToPlaza: {
                type: Boolean,
                default: true
            },
            size: {
                type: String,
                default: "default"
            },
            index: {
                type: Number,
                required: true
            },
            timeout: {
                type: Number,
                default: 3000
            },
            small: {
                type: Boolean,
                default: false
            },
            xSmall: {
                type: Boolean,
                default: false
            },
            large: {
                type: Boolean,
                default: false
            },
            xLarge: {
                type: Boolean,
                default: false
            },
        },
        computed: {
            labelColor(): string {
                if (this.color) {
                    return this.color
                } else {
                    if (this.$store.getters.currentLabels.indexOf(this.label) < 0) {
                        commitNewLabel([this.label]);
                    }
                    return this.$store.state.styleLabelColor[this.label].color
                }
            }
        },
        methods: {

            click() {
                if (this.action) {
                    this.action(this.label)
                } else if (this.jumpToPlaza) {
                    this.jump(this.label)
                }
            },

            deleteChip() {
                this.show = false;
                let payload = {
                    "timeout": this.timeout,
                    "color": "error",
                    "content": "移除了标签",
                    "buttonText": "撤销",
                    "action": this.rollBackDelete,
                    "actionObj": this.show,
                    "name": "deleteLabel",
                    "once": false
                };
                this.$store.commit('snackBarOn', payload);
                let vm = this;
                this.closeChip = setTimeout(() => {
                        vm.$emit("close-chip", vm.index)
                    },
                    this.timeout)
            },

            rollBackDelete(target: any) {
                this.resetChip();
                this.$store.commit('snackBarOff')
            },
            resetChip() {
                this.$set(this, 'show', true);
                clearTimeout(this.closeChip)
            },

            jump(label: string) {

            }
        },
        watch: {},
        record: {
            status: 'done'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/11/25
* Updated by []
*/