import {mergeSetting, SettingConfAll, SettingConfGroup} from "@/interface/style/interfaceStyleBase";
const section = () => {
    return {
        section: {
            default: 0,
            range: [0, 99],
            type: "Number",
            explain: '处于多少行',
            tips: ''
        }
    } as SettingConfGroup
}

const row = () => {
    return {
        row: {
            default: 0,
            range: [0, 99],
            type: "Number",
            explain: '处于多少行',
            tips: ''
        }
    } as SettingConfGroup
}

const order = () => {
    return {
        order: {
            default: 1,
            range: [-1, 13],
            type: "Number",
            explain: '处于多少列',
            tips: ''
        }
    } as SettingConfGroup
}

const width = () => {
    return {
        width: {
            default: 2,
            range: [2, 12],
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

const BaseSettingGroup = () => mergeSetting(section(), row(), order(), width(), height()) as SettingConfGroup;
const BaseShowSettingGroup = () => mergeSetting(showAll(), showTitle(), showLabels(), showProps(), showDescription())

const nodeSetting = () => {
    let result = {
        Base: BaseSettingGroup(),
        Show: mergeSetting(BaseShowSettingGroup(), showTopic(), showTranslate(), showRating()),
        Render: mergeSetting(renderAsImage(), renderAsText())
    }
    return result as SettingConfAll
}

export const typeSettingDictPaper: Record<DocumentItemType, SettingConfAll> = {
    node: nodeSetting(),
    link: {},
    document: {},
    media: {},
    note: {},
    text: {}
}

export const paperDefaultRow = () => ({
    height: 200,
    forceAlign: true
})

export const paperSectionTemplate = () => ({
    Setting: {
        Left: {
            info: '',
            show: true,
            color: 'white'
        },
        Title: {
            text: '',
            show: true,
            color: 'white'
        },
        Rows: [
            paperDefaultRow(),
            paperDefaultRow()
        ]
    },
    State: {
        isDeleted: false,
        isSelected: false
    }
}) as PaperSectionSettingPart

const specialDict: { [prop: string]: any } = {

};

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
