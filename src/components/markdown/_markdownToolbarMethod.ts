import {MarkdownInputState, MarkdownInsertItem} from "@/components/markdown/_markdownInterface";

export const maxHistory = 128;
export const insertItemDict = {
    'bold': {
        prefix: '**',
        suffix: '**',
    },
    'italic': {
        prefix: '*',
        suffix: '*',
    },
    'header': {
        prefix: '# ',
        suffix: '',
    },
    'header1': {
        prefix: '# ',
        suffix: '',
    },
    'header2': {
        prefix: '## ',
        suffix: '',
    },
    'header3': {
        prefix: '### ',
        suffix: '',
    },
    'header4': {
        prefix: '#### ',
        suffix: '',
    },
    'header5': {
        prefix: '##### ',
        suffix: '',
    },
    'header6': {
        prefix: '###### ',
        suffix: '',
    },
    'underline': {
        prefix: '++',
        suffix: '++',
    },
    'strikethrough': {
        prefix: '~~',
        suffix: '~~',
    },
    'mark': {
        prefix: '==',
        suffix: '==',
    },
    'superscript': {
        prefix: '^',
        suffix: '^',
    },
    'subscript': {
        prefix: '~',
        suffix: '~',
    },
    'quote': {
        prefix: '> ',
        suffix: '',
    },
    'link': {
        prefix: '[](',
        suffix: ')',
    },
    'imagelink': {
        prefix: '![](',
        suffix: ')',
    },
    'code': {
        prefix: '```',
        suffix: '\n\n```\n',
    },
    'table': {
        prefix: '',
        suffix: '',
    },
    'aligncenter': {
        prefix: '::: hljs-center\n\n',
        suffix: '\n\n:::\n',
    },
    'alignright': {
        prefix: '::: hljs-right\n\n',
        suffix: '\n\n:::\n',
    },
    'alignleft': {
        prefix: '::: hljs-left\n\n',
        suffix: '\n\n:::\n',
    }
}

// 处理粗体与斜体冲突问题
export function isItalicAndBoldConflict(insertItem: MarkdownInsertItem, instance: MarkdownInputState) {
    let {prefix, suffix} = insertItem
    if (prefix === '*' && suffix === '*' && instance.dom !== undefined) {
        let {value, selectionStart, selectionEnd} = instance.dom
        if (value.substring(selectionStart - 2, selectionStart) === '**' && value.substring(selectionEnd, selectionEnd + 2) === '**') {
            return true
        }
    }
    return false
}
