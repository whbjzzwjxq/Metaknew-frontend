declare global {
    type IconGroup = 'i-star' | 'i-good' | 'i-bad' | 'i-collapse-arrow-double' |
        'i-edit-able' | 'i-edit' | 'i-delete-able' | 'i-explode' |
        'i-eye' | 'i-media-type' | 'i-collapse' | 'i-collapse-arrow' | 'i-knowledge-level' |
        'i-resize' | 'i-item' | 'i-get-media-type' | 'i-note-type' | 'i-is-dark' | 'i-is-locked'

    type IconAlias = 'i-show'

    interface IconItem {
        name: string,
        _func: Function | null,
        color?: string,
        render?: boolean,
        disabled?: boolean,
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
        copy: '',
        save: '',
        autoSave: ''
    },
    'i-delete-able': {
        true: 'mdi-delete',
        false: 'mdi-delete-off',
        rollback: 'mdi-refresh'
    },
    'i-explode': {
        true: 'mdi-arrow-expand-all',
        false: 'mdi-arrow-collapse-all',
        unload: 'mdi-magnify'
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
        canvas: 'mdi-brush'
    },
    'i-collapse': {
        true: 'mdi-minus',
        false: 'mdi-plus'
    },
    'i-collapse-arrow': {
        true: 'mdi-chevron-up',
        false: 'mdi-chevron-down'
    },
    'i-collapse-arrow-double': {
        true: 'mdi-chevron-double-up',
        false: 'mdi-chevron-double-down'
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
        double: 'mdi-plus-box-multiple'
    },
    'i-item': {
        node: 'mdi-cube-outline',
        link: 'mdi-arrow-top-right',
        note: 'mdi-note-text',
        media: 'mdi-image',
        document: "mdi-google-circles-communities",
        DocGraph: 'mdi-graph-outline',
        DocPaper: 'mdi-notebook',
        path: 'mdi-map-marker-path',
    },
    'i-get-media-type': {
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
    }

};

const iconAlias: Record<IconAlias, IconGroup> = {
    'i-show': 'i-eye',
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
        : iconGroup['true']
};
