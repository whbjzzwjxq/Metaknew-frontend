<template>
    <v-card :class="`${className}-card`" flat>
        <v-card-title class="pa-2 pb-0">
            <div class="d-flex flex-row">
                <div :class="['pa-2', `${className}-card-avatar`]">
                    <node-avatar :source-url="mainImage">

                    </node-avatar>
                </div>
                <div :class="['pa-2', `${className}-card-label`]">
                    <v-text-field
                        v-model="name"
                        label="Name"
                        disabled
                        dense
                        class="mt-2">

                    </v-text-field>
                    <p-label-selector
                        :label="label"
                        disabled
                        class="mt-n4">

                    </p-label-selector>
                </div>
            </div>
        </v-card-title>
        <v-card-text :class="['pa-2 py-0', `${className}-card-content`]" style="overflow: hidden">
            <slot name="content" :setting="setting" :state="state" class="pa-2 py-0">

            </slot>
            <markdown-render v-model="info.description" v-if="!notRenderDescription" class="pa-2 py-0">

            </markdown-render>
        </v-card-text>
        <v-card-actions :class="['px-4 py-1', `${className}-card-foot`]">
            <div class="flex-shrink-1">
                <icon-group :icon-list="iconList" v-bind="$props" v-if="!notRenderDefaultIcon">

                </icon-group>
            </div>
            <slot name="iconContent" :setting="setting" :state="state">

            </slot>
        </v-card-actions>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import NodeAvatar from "@/components/NodeAvatar.vue";
    import PLabelSelector from "@/components/PLabelSelector.vue";
    import IconGroup from "@/components/IconGroup.vue";
    import MarkdownRender from "@/components/markdown/MarkdownRender.vue";
    import {getIcon} from "@/utils/icon";
    import {commitItemChange} from "@/store/modules/_mutations";
    import {CardSize, getCardSize, getSizeName} from "@/interface/interfaceInComponent";
    import {NodeInfoPart} from "@/class/info";
    import {SizeName} from "@/interface/style/interfaceStyleBase";
    //todo mixin 估计Vue3才解决了 笑死

    export default Vue.extend({
        name: "CardNodeSimp",
        components: {
            NodeAvatar,
            PLabelSelector,
            IconGroup,
            MarkdownRender
        },
        data: function () {
            return {}
        },
        props: {
            setting: {
                type: Object as () => NodeSetting,
                required: true
            },
            state: {
                type: Object as () => NodeState,
                required: true
            },
            notRenderDefaultIcon: {
                type: Boolean,
                default: false
            },
            notRenderDescription: {
                type: Boolean,
                default: false
            },
            appendIconList: {
                type: Array as () => IconItem[],
                default: () => []
            },
            large: {
                type: Boolean,
                default: false
            },
            xLarge: {
                type: Boolean,
                default: false
            },
            small: {
                type: Boolean,
                default: false
            },
            xSmall: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            mainImage: function (): string {
                return this.setting._image
            },
            name: function (): string {
                return this.setting._name
            },
            type: function (): string {
                return this.setting._type
            },
            label: function (): string {
                return this.setting._label
            },
            iconList: function (): IconItem[] {
                let base = [
                    {
                        name: getIcon('i-explode', 'goto'),
                        _func: this.gotoLeftCard,
                        toolTip: '转到知识元卡片'
                    }
                ] as IconItem[]
                base.push(...this.appendIconList)
                return base
            },
            cardSize: function (): CardSize {
                return getCardSize(this.$props)
            },
            info: function (): NodeInfoPart {
                return this.$store.state.dataManager.nodeManager[this.setting._id]
            },
            className: function (): SizeName {
                return getSizeName(this.$props)
            }
        },
        methods: {
            gotoLeftCard: function () {
                this.info && commitItemChange(this.info)
            }
        },
        record: {
            status: 'empty',
            description: ''
        }
    })
</script>

<style scoped>
    @import "../../../style/css/standardCard.css";
</style>
