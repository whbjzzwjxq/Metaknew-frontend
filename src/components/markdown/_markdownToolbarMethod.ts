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
    'imageLink': {
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
    'alignCenter': {
        prefix: '::: hljs-center\n\n',
        suffix: '\n\n:::\n',
    },
    'alignRight': {
        prefix: '::: hljs-right\n\n',
        suffix: '\n\n:::\n',
    },
    'alignLeft': {
        prefix: '::: hljs-left\n\n',
        suffix: '\n\n:::\n',
    }
} as Record<MarkdownIconName, MarkdownInsertItem>

// 处理粗体与斜体冲突问题 todo 扩展
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

export enum MarkdownIconName {
    REDO = 'redo',
    UNDO = 'undo',
    EDIT = 'edit',
    BOLD = 'bold',
    ITALIC = 'italic',
    HEADER1 = 'header1',
    HEADER2 = 'header2',
    HEADER3 = 'header3',
    HEADER4 = 'header4',
    HEADER5 = 'header5',
    HEADER6 = 'header6',
    UNDERLINE = 'underline',
    STRIKETHROUGH = 'strikethrough',
    MARK = 'mark',
    SUPERSCRIPT = 'superscript',
    SUBSCRIPT = 'subscript',
    QUOTE = 'quote',
    LINK = 'link',
    IMAGELINK = 'imageLink',
    CODE = 'code',
    TABLE = 'table',
    ALIGNCENTER = 'alignCenter',
    ALIGNLEFT = 'alignLeft',
    ALIGNRIGHT = 'alignRight'
}
