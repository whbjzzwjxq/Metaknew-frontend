export type IconGroup =
    'i-star' | 'i-good' | 'i-bad' | 'i-chevron' |
    'i-edit-able' | 'i-edit' | 'i-delete' | 'i-explode' |
    'i-eye' | 'i-media-type' | 'i-collapse' | 'i-collapse-arrow' | 'i-knowledge-level'

export type IconAlias = 'i-show'

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
    'i-chevron': {
        true: 'mdi-chevron-double-up',
        false: 'mdi-chevron-double-down'
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
    'i-delete': {
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
    'i-collapse': {
        true: 'mdi-minus',
        false: 'mdi-plus'
    },
    'i-collapse-arrow': {
        true: 'mdi-chevron-up',
        false: 'mdi-chevron-down'
    },
    'i-knowledge-level': {
        eco: 'mdi-earth',
        document: 'mdi-google-circles-communities',
        node: 'mdi-numeric-1-circle-outline',
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
