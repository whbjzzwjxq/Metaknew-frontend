<template>
    <v-card tile flat outlined :style="toolbarStyle">
        <div :style="buttonStyle" class="floatButton">
            <div class="button-normal pb-4">
                
            </div>
            <div class="button-normal pb-4">
                <v-btn fixed fab color="green">
                    <v-icon color="#111111"> {{ fragmentIcon }}</v-icon>
                </v-btn>
            </div>
            <div class="button-normal pb-4">
                <v-btn fixed fab color="pink" @click="collapse">
                    <v-icon color="#111111"> {{ arrowIcon }}</v-icon>
                </v-btn>
            </div>
        </div>
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
                toolbarOn: true,
                fragmentIcon: getIcon('i-item', 'fragment')
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
                    left: '12px',
                    bottom: (this.styleManager.bottomBar.height - 72) + 'px',
                    position: "absolute",
                    width: '56px',
                    height: '168px',
                    zIndex: 2
                }
            },
            arrowIcon: function (): string {
                return getIcon('i-collapse-arrow-double', !this.toolbarOn)
            }
        },
        methods: {
            collapse() {
                let height;
                this.toolbarOn
                    ? height = 8
                    : height = 108;
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
    .button-normal {
        width: 56px;
        height: 64px;
    }
</style>

/**
* Created by whb on 2020/1/4
* Updated by []
*/
