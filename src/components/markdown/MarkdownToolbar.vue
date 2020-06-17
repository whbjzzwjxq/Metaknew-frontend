<template>
    <div>
        <icon-group :icon-list="activeIconList" small></icon-group>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import IconGroup from "@/components/IconGroup.vue";
    import {MarkdownInputState} from "@/components/markdown/_markdownInterface";
    import {
        insertItemDict,
        isItalicAndBoldConflict,
        MarkdownIconName
    } from "@/components/markdown/_markdownToolbarMethod";
    import {insertText} from "@/utils/insertText";
    import {iconMap} from "@/utils/icon";

    export default Vue.extend({
        name: "MarkdownToolbar",
        components: {
            IconGroup
        },
        data: function () {
            return {
                insertDict: insertItemDict,
                renderDict: {
                    'simply': [
                        MarkdownIconName.EDIT,
                        MarkdownIconName.BOLD,
                        MarkdownIconName.ITALIC,
                        MarkdownIconName.HEADER1,
                        MarkdownIconName.UNDERLINE
                    ],
                    'default': [
                        MarkdownIconName.REDO,
                        MarkdownIconName.UNDO,
                        MarkdownIconName.EDIT,
                        MarkdownIconName.BOLD,
                        MarkdownIconName.ITALIC,
                        MarkdownIconName.HEADER1,
                        MarkdownIconName.UNDERLINE,
                    ]
                } as Record<string, MarkdownIconName[]>,
                iconDict: iconMap["i-markdown"] as Record<MarkdownIconName, string>
            }
        },
        props: {
            simply: {
                type: Boolean,
                default: false
            },
            excludeIconNameList: {
                type: Array as () => MarkdownIconName[],
                default: () => []
            }
        },
        computed: {
            iconList: function (): IconItem[] {
                //撤销重做只是提示
                return [
                    {
                        name: this.iconDict.undo,
                        disabled: false,
                        toolTip: '撤销(ctrl+z) 点击无效',
                        payload: MarkdownIconName.UNDO
                    },
                    {
                        name: this.iconDict.redo,
                        disabled: false,
                        toolTip: '重做(ctrl+y) 点击无效',
                        payload: MarkdownIconName.REDO
                    },
                    {
                        name: this.iconDict.edit,
                        _func: this.changeEdit,
                        color: this.markdownInstance.editMode ? 'green' : 'default',
                        toolTip: this.markdownInstance.editMode ? '渲染内容' : '编辑内容',
                        payload: MarkdownIconName.EDIT
                    },
                    {
                        name: 'mdi-format-bold',
                        _func: this.changeStyle,
                        payload: MarkdownIconName.BOLD,
                        toolTip: '粗体'
                    },
                    {
                        name: 'mdi-format-italic',
                        _func: this.changeStyle,
                        payload: MarkdownIconName.ITALIC,
                        toolTip: '斜体'
                    },
                    {
                        name: 'mdi-format-header-1',
                        _func: this.changeStyle,
                        payload: MarkdownIconName.HEADER1,
                        toolTip: '一级标题'
                    },
                    {
                        name: 'mdi-format-header-2',
                        _func: this.changeStyle,
                        payload: MarkdownIconName.HEADER2,
                        toolTip: '二级标题'
                    },
                    {
                        name: 'mdi-format-header-3',
                        _func: this.changeStyle,
                        payload: MarkdownIconName.HEADER3,
                        toolTip: '三级标题'
                    },
                    {
                        name: 'mdi-format-header-4',
                        _func: this.changeStyle,
                        payload: MarkdownIconName.HEADER4,
                        toolTip: '四级标题'
                    },
                    {
                        name: 'mdi-format-header-5',
                        _func: this.changeStyle,
                        payload: MarkdownIconName.HEADER5,
                        toolTip: '五级标题'
                    },
                    {
                        name: 'mdi-format-header-6',
                        _func: this.changeStyle,
                        payload: MarkdownIconName.HEADER6,
                        toolTip: '六级标题'
                    },
                    {
                        name: 'mdi-format-underline',
                        _func: this.changeStyle,
                        payload: MarkdownIconName.UNDERLINE,
                        toolTip: '下划线'
                    },
                ]
            },
            markdownInstance: function (): MarkdownInputState {
                return this.$store.state.markdown.currentMarkdown
            },
            activeIconNameList: function (): MarkdownIconName[] {
                return this.simply
                    ? this.renderDict['simply']
                    : this.renderDict['default']
            },
            activeIconList: function(): IconItem[] {
                return this.iconList.filter(item =>
                    this.activeIconNameList.includes(item.payload) &&
                    !this.excludeIconNameList.includes(item.payload)
                )
            }
        },
        methods: {
            changeStyle: function (name: MarkdownIconName) {
                let payload = this.insertDict[name]
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
            },
            changeEdit: function () {
                this.$emit('change-edit-mode')
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
