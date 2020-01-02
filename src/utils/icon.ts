export type IconGroup =
    'Star' | 'Good' | 'Bad' | 'Chevron' |
    'Edit' | 'DeleteAble' | 'MediaWatch' | 'GraphExplode' |
    'Eye' | 'MediaType'

export const iconMap: Record<IconGroup, Record<string, string>> = {
    Star: {
        true: 'mdi-star',
        false: 'mdi-star-outline'
    },
    Good: {
        true: 'mdi-thumb-up',
        false: 'mdi-thumb-up-outline'
    },
    Bad: {
        true: 'mdi-thumb-down',
        false: 'mdi-thumb-down-outline'
    },
    Chevron: {
        true: 'mdi-chevron-double-up',
        false: 'mdi-chevron-double-down'
    },
    Edit: {
        true: 'mdi-pencil',
        false: 'mdi-pencil-off'
    },
    DeleteAble: {
        true: 'mdi-delete',
        false: 'mdi-delete-off'
    },
    MediaWatch: {
        true: '',
        false: ''
    },
    GraphExplode: {
        true: 'mdi-arrow-expand-all',
        false: 'mdi-arrow-collapse-all',
        unload: 'mdi-magnify'
    },
    Eye: {
        true: 'mdi-eye',
        false: 'mdi-eye-off'
    },
    MediaType: {
        true: "mdi-help-circle-outline",
        image: 'mdi-image',
        text: 'mdi-message-text',
        audio: 'mdi-volume-high',
        video: 'mdi-video',
        pdf: 'mdi-file-pdf',
        markdown: 'mdi-markdown',
    }

};

export const getIcon = (iconGroupName: IconGroup, status: string | boolean) => {
    let iconGroup = iconMap[iconGroupName];
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
export const mediaIconDict = {
    'image': 'mdi-image',
    'text': 'mdi-message-text',
    'audio': 'mdi-volume-high',
    'video': 'mdi-video',
    'pdf': 'mdi-file-pdf',
    'markdown': 'mdi-markdown',
} as Record<string, string>;
