<template>
    <div>
        <icon-group :icon-list="iconList"></icon-group>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import IconGroup from "@/components/IconGroup.vue";
    import {MarkdownInputState, MarkdownInsertItem} from "@/components/markdown/_markdownInterface";
    import {insertItemDict, isItalicAndBoldConflict, maxHistory} from "@/components/markdown/_markdownToolbarMethod";
    import {insertText} from "@/utils/insertText";

    export default Vue.extend({
        name: "MarkdownToolbar",
        components: {
            IconGroup
        },
        data: function () {
            return {
                insertDict: insertItemDict
            }
        },
        props: {
            closeBolder: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            iconList: function (): IconItem[] {
                //撤销重做只是提示
                return [
                    {
                        name: 'mdi-undo',
                        disabled: false,
                        toolTip: '撤销(ctrl+z) 点击无效'
                    },
                    {
                        name: 'mdi-redo',
                        disabled: false,
                        toolTip: '重做(ctrl+y) 点击无效'
                    },
                    {
                        name: 'mdi-format-bold',
                        _func: this.changeStyle,
                        payload: this.insertDict.bold,
                        render: !this.closeBolder
                    }
                ]
            },
            markdownInstance: function (): MarkdownInputState {
                return this.$store.state.markdown.currentMarkdown
            }
        },
        methods: {
            changeStyle: function (payload: MarkdownInsertItem) {
                if (this.markdownInstance.dom !== undefined) {
                    let {prefix, suffix} = payload
                    let {dom} = this.markdownInstance
                    let {value, selectionStart, selectionEnd} = dom
                    //前缀是否匹配
                    let prefixMatch = value.substring(selectionStart - prefix.length, selectionStart) === prefix
                    //后缀是否匹配
                    let suffixMatch = value.substring(selectionEnd + suffix.length, selectionEnd) === suffix
                    //是否是'*'和'**'
                    let italicBoldConflict = isItalicAndBoldConflict(payload, this.markdownInstance)
                    if (selectionStart !== selectionEnd && prefixMatch && suffixMatch && !italicBoldConflict) {
                        //删除已经插入的内容
                        dom.selectionStart -= prefix.length;
                        dom.selectionEnd += suffix.length;
                        let newValue = value.substring(selectionStart, selectionEnd)
                        this.insert(newValue)
                        //减去前缀长度 注意selectionStart是缓存的
                        dom.selectionStart = selectionStart - prefix.length;
                        dom.selectionEnd = selectionEnd - prefix.length;
                        dom.focus()
                    } else {
                        //插入内容
                        this.insert(prefix + dom.value.substring(selectionStart, selectionEnd) + suffix)
                        dom.selectionStart = selectionStart + prefix.length;
                        dom.selectionEnd = selectionEnd + prefix.length;
                        dom.focus()
                    }
                }
            },
            insert: function (text: string) {
                this.markdownInstance.dom && insertText(this.markdownInstance.dom, text)
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
