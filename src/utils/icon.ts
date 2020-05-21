import {MarkdownIconName} from "@/components/markdown/_markdownToolbarMethod";

declare global {
    type IconGroup = 'i-star' | 'i-good' | 'i-bad' | 'i-arrow-double' |
        'i-edit-able' | 'i-edit' | 'i-delete-able' | 'i-explode' |
        'i-eye' | 'i-media-type' | 'i-collapse' | 'i-arrow' | 'i-knowledge-level' |
        'i-resize' | 'i-item' | 'i-add-media-method' | 'i-note-type' | 'i-is-dark' | 'i-is-locked' |
        'i-path' | 'i-style' | 'i-page' | 'i-eco-system' | 'i-document-comp' | 'i-meta-knowledge' | 'i-shape' | 'i-save' |
        'i-mode' | 'i-paper' | 'i-card' | 'i-markdown' | 'i-graph-layer'

    type IconAlias = 'i-show' | 'i-normal'

    interface IconItem {
        name: string,
        _func?: Function,
        payload?: any,
        color?: string,
        render?: boolean,
        disabled?: boolean,
        //是否需要emit出来
        _isTrigger?: boolean,
        //emit事件名称
        _eventName?: string,
        //提示
        toolTip?: string,
        toolTipOn?: boolean,
        [prop: string]: any
    }
}

export const iconMap: Record<IconGroup, Record<string, string>> = {
    'i-star': {
        true: 'mdi-star',
        false: 'mdi-star-outline'
    },
    'i-good': {
        true: 'mdi-thumb-up',
        false: 'mdi-thumb-up-outline'
    },
    'i-bad': {
        true: 'mdi-thumb-down',
        false: 'mdi-thumb-down-outline'
    },
    'i-edit-able': {
        true: 'mdi-pencil',
        false: 'mdi-pencil-off'
    },
    'i-edit': {
        edit: 'mdi-pencil',
        delete: 'mdi-delete',
        copy: 'mdi-content-copy',
        save: 'mdi-content-save',
        autoSave: '',
        close: 'mdi-close',
        share: 'mdi-share-variant',
        search: 'mdi-magnify',
        add: 'mdi-plus',
        plus: 'mdi-plus',
        decrease: 'mdi-minus',
        select: 'mdi-select',
        mode: 'mdi-state-machine',
        collect: 'mdi-inbox-arrow-down',
        newOne: 'mdi-new-box',
        clear: 'mdi-notification-clear-all'
    },
    'i-delete-able': {
        true: 'mdi-delete',
        false: 'mdi-delete-off',
        rollback: 'mdi-refresh'
    },
    'i-explode': {
        true: 'mdi-arrow-expand-all',
        false: 'mdi-arrow-collapse-all',
        unload: 'mdi-magnify',
        goto: 'mdi-open-in-new'
    },
    'i-eye': {
        true: 'mdi-eye',
        false: 'mdi-eye-off'
    },
    'i-media-type': {
        true: "mdi-help-circle-outline",
        image: 'mdi-image',
        text: 'mdi-message-text',
        audio: 'mdi-volume-high',
        video: 'mdi-video',
        pdf: 'mdi-file-pdf',
        markdown: 'mdi-markdown',
    },
    'i-note-type': {
        text: 'mdi-note-text',
        canvas: 'mdi-brush',
        notebook: 'mdi-notebook-multiple',
        addNote: 'mdi-plus'
    },
    'i-collapse': {
        true: 'mdi-minus',
        false: 'mdi-plus'
    },
    'i-arrow': {
        true: 'mdi-chevron-up',
        false: 'mdi-chevron-down',
        up: 'mdi-chevron-up',
        down: 'mdi-chevron-down',
        left: 'mdi-chevron-left',
        right: 'mdi-chevron-right'
    },
    'i-arrow-double': {
        true: 'mdi-chevron-double-up',
        false: 'mdi-chevron-double-down',
        up: 'mdi-chevron-double-up',
        down: 'mdi-chevron-double-down',
        left: 'mdi-chevron-double-left',
        right: 'mdi-chevron-double-right'
    },
    'i-knowledge-level': {
        eco: 'mdi-earth',
        document: 'mdi-google-circles-communities',
        node: 'mdi-numeric-1-circle-outline',
    },
    'i-resize': {
        plus: 'mdi-magnify-plus',
        minus: 'mdi-magnify-minus',
        five: 'mdi-numeric-5-box',
        three: 'mdi-numeric-3-box',
        two: 'mdi-numeric-2-box',
        one: 'mdi-numeric-1-box',
        double: 'mdi-plus-box-multiple'
    },
    'i-item': {
        node: 'mdi-cube-outline',
        link: 'mdi-arrow-top-right',
        note: 'mdi-note-text',
        media: 'mdi-image',
        document: "mdi-google-circles-communities",
        graph: 'mdi-graph-outline',
        paper: 'mdi-notebook',
        path: 'mdi-map-marker-path',
        fragment: 'mdi-cube-unfolded',
        text: 'mdi-format-text',
        svg: 'mdi-shape-plus'
    },
    'i-add-media-method': {
        upload: 'mdi-upload',
        fromCloud: 'mdi-cloud-search',
        fromWeb: 'mdi-web'
    },
    'i-is-dark': {
        true: 'mdi-brightness-4',
        false: 'mdi-brightness-1'
    },
    'i-is-locked': {
        true: 'mdi-lock-open',
        false: 'mdi-lock-outline'
    },
    'i-path': {
        current: 'mdi-file-tree',
        list: 'mdi-format-list-bulleted',
        next: 'mdi-skip-next',
        pre: 'mdi-skip-previous',
    },
    'i-style': {
        palette: 'mdi-palette'
    },
    'i-page': {
        prev: 'mdi-minus',
        next: 'mdi-plus',
        first: "mdi-page-first",
        last: "mdi-page-last"
    },
    'i-eco-system': {
        map: '',
        community: '',
        course: ''
    },
    'i-document-comp': {
        directory: 'mdi-format-list-checkbox',
        historyAndBranch: 'mdi-source-branch',
        comments: 'mdi-comment-multiple-outline'
    },
    'i-meta-knowledge': {
        info: 'mdi-information-outline',
        medias: 'mdi-folder-multiple-image',
        relative: 'mdi-expand-all-outline'
    },
    'i-shape': {
        rect: 'mdi-rectangle-outline',
        square: 'mdi-crop-square',
        circle: 'mdi-circle-outline',
        ellipse: 'mdi-ellipse-outline',
        triangle: 'mdi-triangle-outline',
        polyline: 'mdi-vector-polyline',
    },
    'i-save': {
        save: 'mdi-content-save',
        saveAll: 'mdi-content-save-settings',
        savePublish: 'mdi-content-save-move',
        saveDraft: 'mdi-content-save-edit'
    },
    'i-mode': {
        state: 'mdi-state-machine',
        normal: 'mdi-alpha-n-box-outline',
        timeline: 'mdi-chart-timeline-variant',
        geo: 'mdi-map-marker-circle',
        edit: 'mdi-pencil'
    },
    'i-paper': {
        list: 'mdi-view-list',
        section: 'mdi-'
    },
    'i-card': {
        flat: 'mdi-box-shadow',
        radius: 'mdi-square-outline',
        outlined: 'mdi-square-off-outline',
        reset: 'mdi-refresh'
    },
    'i-graph-layer': {
        add: 'mdi-layers-plus',
        remove: 'mdi-layers-remove',
        list: 'mdi-layers-triple',
        triple: 'mdi-layers-triple',
        layers: 'mdi-layers',
        minus: 'mdi-layers-minus',
        plus: 'mdi-layers-plus',
        disable: 'mdi-layers-off',
        search: 'mdi-layers-search',
        off: 'mdi-layers-off'
    },
    'i-markdown': {
        redo: 'mdi-redo',
        undo: 'mdi-undo',
        edit: 'mdi-pencil',
        bold: 'mdi-format-bold',
        italic: 'mdi-format-italic',
        header1: 'mdi-format-header-1',
        header2: 'mdi-format-header-2',
        header3: 'mdi-format-header-3',
        header4: 'mdi-format-header-4',
        header5: 'mdi-format-header-5',
        header6: 'mdi-format-header-6',
        underline: 'mdi-format-underline',
        strikethrough: 'mdi-format-strikethrough',
        mark: 'mdi-format-mark',
        superscript: 'mdi-format-superscript',
        subscript: 'mdi-format-subscript',
        quote: 'mdi-format-quote',
        link: 'mdi-link',
        imageLink: 'mdi-image',
        code: 'mdi-code',
        table: 'mdi-table',
        alignCenter: 'mdi-align-center',
        alignRight: 'mdi-align-right',
        alignLeft: 'mdi-align-left'
    } as Record<MarkdownIconName, string>
};

const iconAlias: Record<IconAlias, IconGroup> = {
    'i-show': 'i-eye',
    'i-normal': 'i-edit'
};

export function isIconGroup(name: IconAlias | IconGroup): name is IconGroup {
    return Object.keys(iconMap).includes(name)
}

export const getIcon = (iconGroupName: IconGroup | IconAlias, status: string | boolean) => {
    let iconGroup;
    isIconGroup(iconGroupName)
        ? iconGroup = iconMap[iconGroupName]
        : iconGroup = iconMap[iconAlias[iconGroupName]];
    let index: string;
    typeof status === "boolean"
        ? status
        ? index = 'true'
        : index = 'false'
        : index = status;
    return iconGroup[index]
        ? iconGroup[index]
        : Object.values(iconGroup)[0]
};
