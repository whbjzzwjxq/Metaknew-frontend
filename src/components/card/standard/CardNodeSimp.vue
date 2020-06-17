<template>
    <v-card :class="[`${className}-card`, 'unselected']" flat>
        <div>
            <div class="d-flex flex-row">
                <div :class="[`${className}-card-avatar`]">
                    <node-avatar :source-url="mainImage">

                    </node-avatar>
                </div>
                <div :class="[`${className}-card-label`]">
                    <p :class="[`${className}-card-label-title`, 'ma-0']"> Name </p>
                    <p :class="[`${className}-card-label-content`, 'ma-0']"> {{ name }}</p>
                    <p :class="[`${className}-card-label-title`, 'ma-0']"> PrimaryLabel </p>
                    <p :class="[`${className}-card-label-content`, 'ma-0']"> {{ label }}</p>
                </div>
            </div>
        </div>
        <div :class="[`${className}-card-content`]" style="overflow: hidden">
            <slot name="content" :setting="setting" :state="state">

            </slot>
            <markdown-render v-model="info.description" v-if="!notRenderDescription">

            </markdown-render>
        </div>
        <div :class="[`${className}-card-foot`]">
            <div class="flex-shrink-1">
                <icon-group :icon-list="iconList" v-bind="$props" v-if="!notRenderDefaultIcon">

                </icon-group>
            </div>
            <slot name="iconContent" :setting="setting" :state="state">

            </slot>
        </div>
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
