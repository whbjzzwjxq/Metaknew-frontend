<template>
    <v-card tile flat outlined :style="toolbarStyle">
        <v-btn fixed fab color="pink" @click="collapse" :style="buttonStyle">
            <v-icon color="#111111"> {{ arrowIcon }}</v-icon>
        </v-btn>
        <slot name="subTool"></slot>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {getIcon} from "@/utils/icon";

    export default Vue.extend({
        name: "ToolbarBottom",
        components: {},
        data() {
            return {
                toolbarOn: true
            }
        },
        props: {},
        computed: {
            styleManager: function (): StyleManagerState {
                return this.$store.state.styleComponentSize
            },
            toolbarStyle: function (): CSSProp {
                return {
                    position: "absolute",
                    left: this.styleManager.leftCard.width + 'px',
                    bottom: 0,
                    height: this.styleManager.bottomBar.height + 'px',
                    width: this.styleManager.bottomBar.width,
                    backgroundColor: 'white',
                    overflow: "hidden"
                }
            },
            buttonStyle: function (): CSSProp {
                return {
                    left: (this.styleManager.leftCard.width + 12) + 'px',
                    bottom: (this.styleManager.bottomBar.height - 28) + 'px',
                }
            },
            arrowIcon: function () {
                return getIcon('i-collapse-arrow-double', !this.toolbarOn)
            }
        },
        methods: {
            collapse() {
                let height;
                this.toolbarOn
                    ? height = 8
                    : height = 90;
                this.$store.commit('resetBottomBar', height);
                this.toolbarOn = !this.toolbarOn
            }
        },
        watch: {},
        record: {
            status: 'done',
            description: '下方用的工具栏'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2020/1/4
* Updated by []
*/
