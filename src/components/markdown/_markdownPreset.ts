import highlightLang from './hightlight/lang'
import MarkdownIt from "markdown-it/lib";
const markdown: MarkdownIt = require('markdown-it');
const presetSimply = {
    options: {
        html: false,
        xhtmlOut: false,
        breaks: false,
        langPrefix: 'language-',
        linkify: false,
        quotes: '“”‘’',
        highlight: null,
        typographer: true,
        maxNesting: 20
    },

    components: {
        core: {
            rules: [
                'normalize',
                'block',
                'inline'
            ]
        },
        block: {
            rules: [
                'paragraph'
            ]
        },
        inline: {
            rules: [
                'text',
                'balance_pairs',
                'text_collapse'
            ]
        }
    }
};
const presetAll = {
    options: {
        html: true,
        xhtmlOut: true,
        breaks: true,
        langPrefix: 'language-',
        linkify: false,
        quotes: '“”‘’',
        highlight: function (str: string, lang: string) {
            if (lang && highlightLang[lang]) {
                return '<pre><div class="hljs"><code class="' + lang + '">' + markdown.utils.escapeHtml(str) + '</code></div></pre>';
            }
            return '<pre><code class="' + lang + '">' + markdown.utils.escapeHtml(str) + '</code></pre>';
        },
        typographer: true,
        maxNesting: 20
    },

    components: {
        core: {
            rules: [
                'normalize',
                'block',
                'inline'
            ]
        },
        block: {
            rules: [
                'paragraph'
            ]
        },
        inline: {
            rules: [
                'text',
                'balance_pairs',
                'text_collapse'
            ]
        }
    }
}
// 表情
const emoji = require('markdown-it-emoji');
// 下标
const sub = require('markdown-it-sub')
// 上标
const sup = require('markdown-it-sup')
// <dl/>
const defList = require('markdown-it-deflist')
// <abbr/>
const abbr = require('markdown-it-abbr')
// footnote
const footnote = require('markdown-it-footnote')
// insert 带有下划线 样式 ++ ++
const insert = require('markdown-it-ins')
// mark
const mark = require('markdown-it-mark')
// taskLists
const taskLists = require('markdown-it-task-lists')
// container
const container = require('markdown-it-container')
//
const toc = require('markdown-it-toc')
//
const highlight = require('markdown-it-highlightjs-external');
// math katex
const katex = require('markdown-it-katex-external');
//
const imagePre = require('markdown-it-images-preview');

//@ts-ignore
export const markdownSimply = markdown(presetSimply)
//@ts-ignore
export const markdownAll = markdown(presetAll)

markdownSimply.use(insert)
markdownAll
    .use(emoji)
    .use(taskLists)
    .use(sup)
    .use(sub)
    .use(container)
    .use(container, 'hljs-left') /* align left */
    .use(container, 'hljs-center')/* align center */
    .use(container, 'hljs-right')/* align right */
    .use(defList)
    .use(abbr)
    .use(footnote)
    .use(insert)
    .use(mark)
    .use(container)
    .use(imagePre)
    .use(katex)
