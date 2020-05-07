<template>
    <div class="pa-2">
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
                    @focus="updateState"
                    @focusout="update"
                    @select="updateState"
                    auto-grow
                    filled
                    ref="markdownInput"
                    class="cardItem"
                    v-model="value"
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

    export default Vue.extend({
        name: "MarkdownRender",
        components: {
            MarkdownToolbar
        },
        data: function () {
            return {
                value: '',
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
            text: {
                type: String,
                default: ''
            },
            editBase: {
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
            placeholder: {
                type: String,
                default: ''
            }
        },
        computed: {
            renderer: function (): MarkdownIt {
                return this.simply
                    ? this.renderDict['simply']
                    : this.renderDict['all']
            },
            editMode: function (): boolean {
                return this.instance.editMode
            }
        },
        methods: {
            renderHtml: function () {
                this.renderResult = this.renderer.render(this.value, {})
            },
            update: function () {
                this.renderHtml()
                this.$emit('update-text', this.value)
            },
            updateState: function () {
                //@ts-ignore
                this.instance.dom = this.$refs.markdownInput
                commitMarkdownState(this.instance)
            },
            changeEditMode: function () {
                this.instance.editMode = !this.instance.editMode
            }
        },
        mounted(): void {
            this.value = this.text;
            this.renderHtml()
        },
        created(): void {
            this.updateState()
        },
        record: {
            status: 'empty',
            description: ''
        }
    })
</script>

<style scoped>

</style>
