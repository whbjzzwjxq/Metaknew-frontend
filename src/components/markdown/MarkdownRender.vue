<template>
    <div>
        <div v-if="!editMode" v-html="renderResult">

        </div>
        <div v-else>
            <label>
            <textarea
                ref="markdownInput"
                v-model="value"
                @select="updateState"
                @focus="updateState"
                @focusout="update"
                style="width: 100%; height: 100%; background-color: whitesmoke"
                class="cardItem"
                :rows="rows"
                :disabled="disabled"
                :placeholder="placeholder"
            >

            </textarea>
            </label>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {markdownAll, markdownSimply} from "@/components/markdown/_markdownPreset";
    import MarkdownIt from "markdown-it/lib";
    import {commitMarkdownState} from "@/store/modules/_mutations";
    import {MarkdownInputState} from "@/components/markdown/_markdownInterface";

    export default Vue.extend({
        name: "MarkdownRender",
        components: {},
        data: function () {
            return {
                value: '',
                renderResult: '',
                renderDict: {
                    'simply': markdownSimply,
                    'all': markdownAll
                },
                //@ts-ignore
                instance: {
                    history: [],
                    historyIndex: 0,
                    dom: undefined
                } as MarkdownInputState,
            }
        },
        props: {
            text: {
                type: String,
                default: ''
            },
            editMode: {
                type: Boolean,
                default: false
            },
            simply: {
                type: Boolean,
                default: false
            },
            shortcutAble: {
                type: Boolean,
                default: false
            },
            rows: {
                type: Number,
                default: 10
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
