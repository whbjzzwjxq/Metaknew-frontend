<template>
    <div>
        <div style="height: 100%; width: 100%">
            <template v-if="!editMode">
                <div v-html="renderResult">

                </div>
            </template>
            <template v-else>
                <v-textarea
                    :disabled="disabled"
                    :placeholder="placeholder"
                    :rows="rows"
                    :value="value"
                    @input="input"
                    @focus="updateState"
                    @focusout="focusOut"
                    @select="updateState"
                    auto-grow
                    filled
                    ref="markdownInput"
                    class="cardItem"
                >

                </v-textarea>
            </template>
        </div>
        <div v-if="renderToolBar" style="position: absolute; bottom: 32px; width: 100%; background-color: white">
            <markdown-toolbar :simply="simply" @change-edit-mode="changeEditMode"></markdown-toolbar>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import MarkdownToolbar from "@/components/markdown/MarkdownToolbar.vue";
    import {markdownAll, markdownSimply} from "@/components/markdown/_markdownPreset";
    import MarkdownIt from "markdown-it/lib";
    import {commitMarkdownState} from "@/store/modules/_mutations";
    import {MarkdownInputState} from "@/components/markdown/_markdownInterface";
    import {throttle} from 'lodash';

    export default Vue.extend({
        name: "MarkdownRender",
        components: {
            MarkdownToolbar
        },
        data: function () {
            return {
                renderResult: '',
                renderDict: {
                    'simply': markdownSimply,
                    'all': markdownAll
                },
                instance: {
                    dom: undefined,
                    editMode: this.editBase
                } as MarkdownInputState,
            }
        },
        props: {
            value: {
                type: String,
                default: ''
            },
            editBase: {
                type: Boolean,
                default: false
            },
            controlEditByParent: {
                type: Boolean,
                default: false
            },
            //只支持基础语法
            simply: {
                type: Boolean,
                default: false
            },
            //渲染工具栏
            renderToolBar: {
                type: Boolean,
                default: false
            },
            rows: {
                type: Number,
                default: 4
            },
            disabled: {
                type: Boolean,
                default: false
            },
            //占位符
            placeholder: {
                type: String,
                default: ''
            },
        },
        computed: {
            renderer: function (): MarkdownIt {
                return this.simply
                    ? this.renderDict['simply']
                    : this.renderDict['all']
            },
            editMode: function (): boolean {
                return this.controlEditByParent
                    ? this.editBase
                    : this.instance.editMode
            },
            renderHtml: function (): Function {
                let _vm = this;
                return throttle(function () {
                    _vm.renderResult = _vm.renderer.render(_vm.value, {})
                }, 1000)
            },
        },
        methods: {
            input: function ($event: string) {
                this.$emit('input', $event)
            },
            updateState: function () {
                //@ts-ignore
                this.instance.dom = this.$refs.markdownInput
                commitMarkdownState(this.instance)
            },
            changeEditMode: function () {
                this.instance.editMode = !this.instance.editMode
            },
            focusOut: function() {
                this.renderHtml()
            },
        },
        created(): void {
            this.renderHtml()
            this.updateState()
        },
        watch: {
            value: function (): void {
                this.renderHtml()
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
