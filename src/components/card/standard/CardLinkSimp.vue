<template>
    <v-card :width="cardSize.width" :height="cardSize.height" flat>
        <v-card-title class="pa-2 pb-0">
            <link-start-end-selector
                :current-start="start"
                :current-end="end"
                :document="document">

            </link-start-end-selector>
            <v-text-field
                dense
                disabled
                label="PrimaryLabel"
                class="pr-4"
                v-model="label">

            </v-text-field>
        </v-card-title>
        <v-card-text class="pa-2 pb-0">
            <slot name="content" :setting="setting" :state="state">

            </slot>
            <markdown-render v-model="info.description" v-if="!notRenderDescription">

            </markdown-render>
        </v-card-text>
        <v-card-actions class="pa-2 pb-0" style="position: absolute; bottom: 4px">
            <div class="flex-shrink-1">
                <icon-group :icon-list="iconList" small v-if="!notRenderDefaultIcon">

                </icon-group>
            </div>
            <slot name="iconContent" :setting="setting" :state="state">

            </slot>
        </v-card-actions>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import LinkStartEndSelector from "@/components/LinkStartEndSelector.vue";
    import IconGroup from "@/components/IconGroup.vue";
    import MarkdownRender from "@/components/markdown/MarkdownRender.vue";
    import {getIcon} from "@/utils/icon";
    import {CardSize, getCardSize} from "@/interface/interfaceInComponent";
    import {LinkInfoPart} from "@/class/info";
    import {commitItemChange} from "@/store/modules/_mutations";
    import {DocumentSelfPart} from "@/class/settingBase";

    export default Vue.extend({
        name: "CardLinkSimp",
        components: {
            LinkStartEndSelector,
            IconGroup,
            MarkdownRender
        },
        data: function () {
            return {}
        },
        props: {
            setting: {
                type: Object as () => LinkSetting,
                required: true
            },
            state: {
                type: Object as () => LinkState,
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
            name: function (): string {
                return this.setting._start._name + '->' + this.setting._end._name
            },
            type: function (): string {
                return this.setting._type
            },
            label: function (): string {
                return this.setting._label
            },
            start: function (): VisNodeSettingPart {
                return this.setting._start
            },
            end: function (): VisNodeSettingPart {
                return this.setting._end
            },
            document: function (): DocumentSelfPart {
                return this.$store.state.dataManager.currentDocument
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
            info: function (): LinkInfoPart {
                return this.$store.state.dataManager.linkManager[this.setting._id]
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

</style>
