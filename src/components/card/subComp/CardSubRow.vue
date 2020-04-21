<template>
    <div :style="rowStyle">
        <hr class="cardHr"/>
        <v-row class="px-4 pb-2 pt-0 ma-0 justify-content-between" :style="rowStyle">
            <v-col class="pa-0 ma-0" cols="11">
                <v-subheader class="ml-n4 card-subheader" style="height: 36px">{{text}}</v-subheader>
            </v-col>
            <v-col class="pa-0 ma-0" cols="1">
                <icon-group :icon-list="iconList" x-small></icon-group>
            </v-col>
        </v-row>
        <v-row class="px-4 pb-2 pt-0 ma-0" v-show="!isCollapsed" :style="rowStyle">
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
                type: Boolean as () => boolean,
                default: false
            },
            text: {
                type: String as () => string,
                default: ''
            },
            width: {
                type: Number,
                default: leftCardWidth
            },
            editMode: {
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
                        render: this.editMode,
                        _func: this.close
                    }
                ]
            },
            collapsedIcon: function (): string {
                return getIcon("i-collapse", !this.isCollapsed)
            },
            activeWidth: function (): number {
                return this.width
                    ? this.width
                    : this.$store.state.styleComponentSize.leftCard.width
            },
            rowStyle: function (): CSSProp {
                return {
                    width: (this.activeWidth - 4) + 'px'
                }
            }

        },
        methods: {
            input() {
                this.isCollapsed = !this.isCollapsed
            },

            close() {
                this.$emit('close')
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
        margin-inline-start: 10px;
        margin-inline-end: 10px;
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
