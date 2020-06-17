<template>
    <div :style="rowStyle" v-show="value" class="pa-2 pb-0">
        <hr class="cardHr"/>
        <v-row class="pa-0 ma-0" no-gutters :style="rowStyle" justify="end">
            <v-col cols="8">
                <v-subheader class="pr-0" style="height: 36px">{{text}}</v-subheader>
            </v-col>
            <v-spacer></v-spacer>
            <v-col class="pt-2">
                <icon-group :icon-list="iconList" x-small></icon-group>
            </v-col>
        </v-row>
        <v-row class="pa-2 ma-0" v-show="!isCollapsed" :style="rowStyle">
            <slot name="content"></slot>
        </v-row>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {getIcon} from "@/utils/icon";
    import {leftCardWidth} from "@/store/modules/styleComponentSize";
    import IconGroup from "@/components/IconGroup.vue";

    export default Vue.extend({
        name: "CardSubRow",
        components: {
            IconGroup
        },
        data() {
            return {
                isCollapsed: false,

            }
        },
        props: {
            noCollapse: {
                type: Boolean,
                default: false
            },
            text: {
                type: String,
                default: ''
            },
            value: {
                type: Boolean,
                default: true
            },
            closeAble: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            iconList: function(): IconItem[] {
                return [
                    {
                        name: getIcon("i-collapse", !this.isCollapsed),
                        render: !this.noCollapse,
                        _func: this.input,
                        toolTip: '折叠'
                    },
                    {
                        name: getIcon("i-edit", "close"),
                        render: this.closeAble,
                        _func: this.close,
                        toolTip: '关闭'
                    }
                ]
            },
            rowStyle: function (): CSSProp {
                return {
                    width: '100%'
                }
            }

        },
        methods: {
            input() {
                this.isCollapsed = !this.isCollapsed
            },

            close() {
                this.$emit('input', false)
            }
        },
        watch: {},
        record: {
            status: 'done',
            description: '卡片用的缩放栏'
        }
    });
</script>

<style scoped>
    .cardHr {
        display: block;
        unicode-bidi: isolate;
        margin-block-start: 8px;
        margin-block-end: 8px;
        margin-inline-start: 8px;
        margin-inline-end: 8px;
        overflow: hidden;
        border-style: inset;
        border-width: 1px;
        color: grey;
        opacity: 0.3;
    }
</style>

/**
* Created by whb on 2019/11/25
* Updated by [whb on 2020年1月8日19:44:26]
*/
