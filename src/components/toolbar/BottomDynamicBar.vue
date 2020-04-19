<template>
    <v-card :style="bottomSheetStyle" v-show="bottomDynBarOn" class="unselected">
        <v-card-title class="px-2 py-1" style="background-color: coral; color: white">
            <template v-if="bottomDynBarType === 'path'">
                Current Path
            </template>
            <v-spacer></v-spacer>
            <icon-group :icon-list="bottomSheetIconList" color="white"></icon-group>
        </v-card-title>
        <v-card-text class="pa-0 ma-0">
            <path-drawer :container="pathContentRect" :path="path">

            </path-drawer>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import PathDrawer from "@/components/path/PathDrawer.vue";
    import IconGroup from "@/components/IconGroup.vue";
    import {RectByPoint} from "@/class/geometric";
    import {PathSelfPart} from "@/class/settingPath";
    import {getIcon} from "@/utils/icon";
    import {commitBottomDynamicBarChange, commitBottomDynamicBarResize} from "@/store/modules/_mutations";
    export default Vue.extend({
        name: "BottomDynamicBar",
        components: {
            PathDrawer,
            IconGroup
        },
        data: function () {
            return {
                path: PathSelfPart.emptyPathSelfPart()
            }
        },
        props: {},
        computed: {
            allComponentsStyle: function (): StyleManagerState {
                return this.$store.state.styleComponentSize
            },
            bottomSheetRect: function (): RectByPoint {
                return this.allComponentsStyle.bottomDynamicBar
            },
            bottomSheetArea: function (): AreaRect {
                return this.bottomSheetRect.positiveRect()
            },
            bottomSheetStyle: function (): CSSProp {
                return this.bottomSheetRect.getDivCSS({zIndex: 5})
            },
            pathContentRect: function (): RectObject {
                return {
                    width: (this.bottomSheetArea.width),
                    height: (this.bottomSheetArea.height - 44)
                }
            },
            bottomSheetIconList: function (): IconItem[] {
                return [
                    {name: getIcon('i-arrow-double', true), _func: this.bottomSheetLarge},
                    {name: getIcon('i-arrow-double', false), _func: this.bottomSheetDecrease},
                    {name: getIcon('i-edit', 'close'), _func: this.bottomSheetOff},
                ]
            },

            componentState: function (): ComponentState {
                return this.$store.state.componentState
            },

            bottomDynBarOn: function (): boolean {
                return this.componentState.bottomDynamicBarOn
            },

            bottomDynBarType: function (): BottomDynamicBarType {
                return this.componentState.bottomDynamicBarType
            }
        },
        methods: {
            bottomSheetOff: function () {
               commitBottomDynamicBarChange({on: false})
            },

            bottomSheetLarge: function () {
                this.bottomSheetResize(true);
            },

            bottomSheetDecrease: function () {
                this.bottomSheetResize(false);
            },

            bottomSheetResize: function (large?: boolean) {
                large === undefined && (large = true);
                let height = this.bottomSheetRect.start.y;
                large ? (height -= 240) : (height += 240);
                commitBottomDynamicBarResize(height)
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
