import {mergeSetting, SettingConfAll, SettingConfGroup} from "@/interface/style/interfaceStyleBase";

const section = () => {
    return {
        section: {
            default: -1,
            range: [-1, 99],
            type: "Number",
            explain: '处于多少行',
            tips: ''
        }
    } as SettingConfGroup
}

const row = () => {
    return {
        row: {
            default: -1,
            range: [-1, 99],
            type: "Number",
            explain: '处于多少行',
            tips: ''
        }
    } as SettingConfGroup
}

const width = () => {
    return {
        width: {
            default: 240,
            range: [180, 2880],
            type: "Number",
            explain: '计数宽度',
            tips: ''
        }
    } as SettingConfGroup
}

const height = () => {
    return {
        height: {
            default: 120,
            range: [60, 900],
            type: "Number",
            explain: '高度',
            tips: ''
        }
    } as SettingConfGroup
}

const showAll = () => {
    return {
        showAll: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            explain: '整体可视'
        }
    } as SettingConfGroup
};

const showTitle = () => {
    return {
        showTitle: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            explain: '标题可视'
        }
    } as SettingConfGroup
}

const showTopic = () => {
    return {
        showTopic: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            explain: '话题可视'
        }
    } as SettingConfGroup
}

const showLabels = () => {
    return {
        showLabels: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            explain: '标签可视'
        }
    } as SettingConfGroup
}

const showTranslate = () => {
    return {
        showTrans: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            explain: '翻译别名可视'
        }
    } as SettingConfGroup
}

const showRating = () => {
    return {
        showRating: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            explain: '评分可视'
        }
    } as SettingConfGroup
}

const showProps = () => {
    return {
        showProps: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            explain: '属性可视'
        }
    } as SettingConfGroup
}

const showDescription = () => {
    return {
        showProps: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            explain: '简介可视'
        }
    } as SettingConfGroup
}

const renderAsImage = () => {
    return {
        renderAsImage: {
            type: 'Boolean',
            default: false,
            range: '',
            tips: '',
            explain: '作为图片展示'
        }
    } as SettingConfGroup
}

const renderAsText = () => {
    return {
        renderAsText: {
            type: 'Boolean',
            default: false,
            range: '',
            tips: '',
            explain: '作为文字展示'
        }
    } as SettingConfGroup
}

const isFlat = () => {
    return {
        isFlat: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            explain: '是否无阴影'
        }
    } as SettingConfGroup
}

const isTile = () => {
    return {
        isTile: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            explain: '是否无圆角'
        }
    } as SettingConfGroup
}

const isOutlined = () => {
    return {
        isOutlined: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            explain: '是否无边框'
        }
    } as SettingConfGroup
}

const BaseSettingGroup = () => mergeSetting(section(), row(), width(), height())
const BaseShowSettingGroup = () => mergeSetting(showAll(), showTitle(), showLabels(), showProps(), showDescription())
const CardSettingGroup = () => mergeSetting(isFlat(), isTile(), isOutlined())

export const nodeSettingGroupInPaper = () => {
    let result = {
        Base: BaseSettingGroup(),
        Card: CardSettingGroup(),
        Show: mergeSetting(BaseShowSettingGroup(), showTopic(), showTranslate(), showRating()),
        Render: mergeSetting(renderAsImage(), renderAsText())
    }
    return result as SettingConfAll
}

export const linkSettingGroupInPaper = () => {
    let result = {
        Base: BaseShowSettingGroup(),
        Card: CardSettingGroup(),
    }
    return result as SettingConfAll
}

export const typeSettingDictPaper: Record<DocumentItemType, SettingConfAll> = {
    node: nodeSettingGroupInPaper(),
    link: linkSettingGroupInPaper(),
    document: nodeSettingGroupInPaper(),
    media: nodeSettingGroupInPaper(),
    note: nodeSettingGroupInPaper(),
    text: nodeSettingGroupInPaper()
}

export const nodeShowInPaperTemplate = () => ({
    showAll: true,
    showTitle: true,
    showLabels: true,
    showProps: true,
    showDescription: true,
    showTopic: true,
    showTranslate: true,
    showRating: true
}) as NodeShowInPaper

export const mediaShowInPaperTemplate = () => ({
    showAll: true,
    showDescription: true,
    showLabels: true,
    showProps: true,
    showTitle: true
}) as CardShowInPaper

const specialDict: { [prop: string]: any } = {};

export function settingTemplatePaper(_type: DocumentItemType | 'note') {
    let settingConf = typeSettingDictPaper[_type];
    let result: { [prop: string]: Object } = {};
    Object.entries(settingConf).forEach(([key, value]) => {
        let settingInstance: { [prop: string]: any } = {};
        Object.entries(value).forEach(([settingName, settingConf]) => {
            const name = settingName;
            specialDict[name] === undefined
                ? (settingInstance[name] = settingConf.default)
                : (settingInstance[name] = specialDict[name]);
        });
        result[key] = settingInstance
    });
    return result
}
