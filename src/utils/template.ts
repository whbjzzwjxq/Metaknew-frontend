import {currentTime, getCookie, randomNumberInRange} from '@/utils/utils';
import {fieldDefaultValue, nodeLabelToProp, ValueWithType} from "@/utils/labelField";
import PDFJS from 'pdfjs-dist';
PDFJS.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.js';

type SettingConf = Record<string, Record<string, BaseSettingConf>>

export interface BaseSettingConf {
    type: string,
    default: any,
    range: Array<any> | '',
    tips: string,
    required: any,
    explain: string
}

const nodeSetting: SettingConf = {
    Base: {
        size: {
            type: 'Number',
            default: 0,
            range: [10, 48],
            tips: '如果为0则会根据综合指标体现大小',
            required: null,
            explain: '节点可视化尺寸'
        },
        scaleX: {
            type: 'Number',
            default: 1,
            range: [0.2, 5],
            tips: '',
            required: null,
            explain: '宽度与高度之比'
        },
        x: {
            type: 'Number',
            default: 0.3,
            range: [0, 1],
            tips: '',
            required: null,
            explain: '节点横向坐标'
        },
        y: {
            type: 'Number',
            default: 0.3,
            range: [0, 1],
            tips: '',
            required: null,
            explain: '节点纵向坐标'
        },
        color: {
            type: 'Color',
            default: '#000000',
            range: '',
            tips: '没有图片时才会呈现纯色',
            required: null,
            explain: '节点颜色'
        },
        opacity: {
            type: 'Number',
            default: 1,
            range: [0.2, 1],
            tips: '',
            required: null,
            explain: '节点透明度'
        },
        type: {
            type: 'String',
            default: 'rectangle',
            range: ['rectangle', 'rhombus', 'ellipse'],
            tips: '具体形状可以通过宽高比控制',
            required: null,
            explain: '节点形状'
        },
        isMain: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '合理地主要节点设置会提高内容可信度',
            required: null,
            explain: '是否是主要节点'
        }
    },
    Border: {
        width: {
            type: 'Number',
            default: 3,
            range: [1, 8],
            tips: '',
            required: null,
            explain: '描边宽度'
        },
        color: {
            type: 'Color',
            default: '',
            range: '',
            tips: '如果不设置颜色则颜色会根据节点类型产生',
            required: null,
            explain: '描边颜色'
        },
        isDash: {
            type: 'Boolean',
            default: false,
            range: '',
            tips: '',
            required: null,
            explain: '描边是否是虚线'
        }
    },
    Show: {
        showAll: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            required: null,
            explain: '整体可视'
        },
        showName: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            required: null,
            explain: '名字是否可视'
        },
        showPic: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            required: null,
            explain: '图片是否可视'
        },
        showBorder: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            required: null,
            explain: '边框是否可视'
        },
        showColor: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '如果关闭就以文字形式呈现',
            required: null,
            explain: '颜色填充是否可视'
        },
        showInlineText: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            required: null,
            explain: '内部文字是否可视'
        }
    },
    Text: {
        inlineText: {
            type: 'Text',
            default: '',
            range: '',
            tips: '',
            required: null,
            explain: '显示在节点内的文字'
        },
        inlineTextColor: {
            type: 'Color',
            default: '#FFFFFF',
            range: '',
            tips: '',
            required: null,
            explain: '节点内文字颜色'
        },
        inlineTextSize: {
            type: 'Number',
            default: 12,
            range: [8, 20],
            tips: '',
            required: null,
            explain: '节点内文字尺寸'
        },
        inlineTwoline: {
            type: 'Boolean',
            default: false,
            range: '',
            tips: '',
            required: null,
            explain: '节点内文字是否两行显示'
        },
        textSize: {
            type: 'Number',
            default: 14,
            range: [8, 20],
            tips: '',
            required: null,
            explain: '节点名字尺寸'
        },
        textColor: {
            type: 'Color',
            default: '#000000',
            range: '',
            tips: '',
            required: null,
            explain: '节点名字颜色'
        },
        twoLine: {
            type: 'Boolean',
            default: false,
            range: '',
            tips: '',
            required: null,
            explain: '名字是否两行显示'
        }
    }
};

const linkSetting: SettingConf = {
    Base: {
        width: {
            type: 'Number',
            default: 2,
            range: [1, 10],
            tips: '',
            required: null,
            explain: '线条宽度'
        },
        color: {
            type: 'Color',
            default: '#000000',
            range: '',
            tips: '',
            required: null,
            explain: '线条颜色'
        },
        type: {
            type: 'String',
            default: 'linear',
            range: ['linear', 'curve', 'polyline'],
            tips: '直线，曲线，折线',
            required: null,
            explain: '线条样式'
        },
        direct: {
            type: 'String',
            default: 'top',
            range: ['top', 'bottom'],
            tips: '线条控制点方向',
            required: null,
            explain: '线条方向'
        },
        isDash: {
            type: 'Boolean',
            default: false,
            range: '',
            tips: '',
            required: null,
            explain: '是否是虚线'
        },
        startLoc: {
            type: 'String',
            default: 'center',
            range: ['top', 'bottom', 'left', 'right', 'center'],
            tips: '起点节点的位置',
            required: null,
            explain: '起点位置'
        },
        endLoc: {
            type: 'String',
            default: 'center',
            range: ['top', 'bottom', 'left', 'right', 'center'],
            tips: '终点节点的位置',
            required: null,
            explain: '终点位置'
        },
        isMain: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '合理地主要节点设置会提高内容可信度',
            required: null,
            explain: '是否是主要节点'
        }
    },
    Arrow: {
        arrowLength: {
            type: 'Number',
            default: 14,
            range: [8, 24],
            tips: '',
            required: null,
            explain: '箭头长度'
        },
        arrowColor: {
            type: 'Color',
            default: '#000000',
            range: '',
            tips: '',
            required: null,
            explain: '箭头颜色'
        },
        showArrow: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            required: null,
            explain: '是否显示箭头'
        }
    },
    Text: {
        extraText: {
            type: 'Text',
            default: '',
            range: '',
            tips: '可以选择前置还是后置',
            required: null,
            explain: '额外显示的文字'
        },
        prefix: {
            type: 'String',
            default: '',
            range: ['append', 'prepend'],
            tips: '',
            required: null,
            explain: '额外文字的位置'
        },
        textLocationX: {
            type: 'Number',
            default: 0.5,
            range: [0.1, 0.9],
            tips: '值越小越靠近起始节点',
            required: null,
            explain: '标签的横向位置'
        },
        textLocationY: {
            type: 'Number',
            default: 0.5,
            range: [0.1, 0.9],
            tips: '值越小越靠近起始节点',
            required: null,
            explain: '标签的纵向位置'
        },
        textColor: {
            type: 'Color',
            default: '#000000',
            range: '',
            tips: '',
            required: null,
            explain: '标签颜色'
        }
    }
};

const documentSetting: SettingConf = {
    Base: {
        background: {
            type: 'String',
            default: '',
            range: ['galaxy-1', 'galaxy-2', 'galaxy-3'],
            tips: '暂未开放',
            required: null,
            explain: '背景图'
        },
        backgroundColor: {
            type: 'Color',
            default: '#eeeeee',
            range: '',
            tips: '暂未开放',
            required: null,
            explain: '背景颜色'
        },
        theme: {
            type: 'String',
            default: '',
            range: ['galaxy-1', 'galaxy-2', 'galaxy-3'],
            tips: '暂未开放',
            required: null,
            explain: '主题'
        },
        defaultMode: {
            type: 'String',
            default: '',
            range: ['normal', 'imp', 'geo', 'time'],
            tips: '暂未开放',
            required: null,
            explain: '默认模式'
        }
    }
};

const mediaSetting: SettingConf = {
    Base: {
        size: {
            type: 'Number',
            default: 300,
            range: [50, 400],
            tips: '不能为0',
            required: null,
            explain: '节点可视化尺寸'
        },
        scaleX: {
            type: 'Number',
            default: 0.6,
            range: [0.2, 5],
            tips: '',
            required: null,
            explain: '宽度与高度之比'
        },
        x: {
            type: 'Number',
            default: 0.3,
            range: [0, 1],
            tips: '',
            required: null,
            explain: '节点横向坐标'
        },
        y: {
            type: 'Number',
            default: 0.3,
            range: [0, 1],
            tips: '',
            required: null,
            explain: '节点纵向坐标'
        },
        opacity: {
            type: 'Number',
            default: 1,
            range: [0.2, 1],
            tips: '',
            required: null,
            explain: '节点透明度'
        },
        isMain: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '合理地主要节点设置会提高内容可信度',
            required: null,
            explain: '是否是主要节点'
        }
    },
    Border: {
        width: {
            type: 'Number',
            default: 3,
            range: [1, 8],
            tips: '',
            required: null,
            explain: '描边宽度'
        },
        color: {
            type: 'Color',
            default: '',
            range: '',
            tips: '如果不设置颜色则颜色会根据节点类型产生',
            required: null,
            explain: '描边颜色'
        },
        isDash: {
            type: 'Boolean',
            default: false,
            range: '',
            tips: '',
            required: null,
            explain: '描边是否是虚线'
        }
    },
    Show: {
        showAll: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            required: null,
            explain: '整体可视'
        },
        showName: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            required: null,
            explain: '名字是否可视'
        },
        showBorder: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            required: null,
            explain: '边框是否可视'
        },
        showInlineText: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            required: null,
            explain: '内部文字是否可视'
        },
        showAppendText: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            required: null,
            explain: '附加文字是否可视'
        }
    },
    Text: {
        inlineText: {
            type: 'Text',
            default: '',
            range: '',
            tips: '',
            required: null,
            explain: '显示在节点内的文字'
        },
        inlineTextColor: {
            type: 'Color',
            default: '#FFFFFF',
            range: '',
            tips: '',
            required: null,
            explain: '节点内文字颜色'
        },
        inlineTextSize: {
            type: 'Number',
            default: 12,
            range: [8, 20],
            tips: '',
            required: null,
            explain: '节点内文字尺寸'
        },
        inlineTwoline: {
            type: 'Boolean',
            default: false,
            range: '',
            tips: '',
            required: null,
            explain: '节点内文字是否两行显示'
        },
        appendText: {
            type: 'Text',
            default: '',
            range: '',
            tips: '',
            required: null,
            explain: '显示在媒体下的文字'
        },
        appendTextColor: {
            type: 'Color',
            default: '#FFFFFF',
            range: '',
            tips: '',
            required: null,
            explain: '显示在媒体下的文字颜色'
        },
        appendTextSize: {
            type: 'Number',
            default: 12,
            range: [8, 20],
            tips: '',
            required: null,
            explain: '显示在媒体下的文字尺寸'
        },
        textSize: {
            type: 'Number',
            default: 14,
            range: [8, 20],
            tips: '',
            required: null,
            explain: '节点名字尺寸'
        },
        textColor: {
            type: 'Color',
            default: '#000000',
            range: '',
            tips: '',
            required: null,
            explain: '节点名字颜色'
        },
        twoLine: {
            type: 'Boolean',
            default: false,
            range: '',
            tips: '',
            required: null,
            explain: '名字是否两行显示'
        }
    }
};

const noteSetting: SettingConf = {
    Base: {
        size: {
            type: 'Number',
            default: 300,
            range: [300, 600],
            tips: '如果为0则会根据综合指标体现大小',
            required: null,
            explain: '节点可视化尺寸'
        },
        scaleX: {
            type: 'Number',
            default: 1,
            range: [0.2, 5],
            tips: '',
            required: null,
            explain: '宽度与高度之比'
        },
        x: {
            type: 'Number',
            default: 0.3,
            range: [0, 1],
            tips: '',
            required: null,
            explain: '节点横向坐标'
        },
        y: {
            type: 'Number',
            default: 0.3,
            range: [0, 1],
            tips: '',
            required: null,
            explain: '节点纵向坐标'
        },
        color: {
            type: 'Color',
            default: '#000000',
            range: '',
            tips: '没有图片时才会呈现纯色',
            required: null,
            explain: '节点颜色'
        },
    }
};

const svgSetting: SettingConf = {
    Base: {
        size: {
            type: 'Number',
            default: 300,
            range: [300, 600],
            tips: '如果为0则会根据综合指标体现大小',
            required: null,
            explain: '节点可视化尺寸'
        },
        scaleX: {
            type: 'Number',
            default: 1,
            range: [0.2, 5],
            tips: '',
            required: null,
            explain: '宽度与高度之比'
        },
        x: {
            type: 'Number',
            default: 0.3,
            range: [0, 1],
            tips: '',
            required: null,
            explain: '节点横向坐标'
        },
        y: {
            type: 'Number',
            default: 0.3,
            range: [0, 1],
            tips: '',
            required: null,
            explain: '节点纵向坐标'
        },
    }

};

const textSetting = {

};

const fragmentSetting = {

};

export const typeSetting: Record<SourceType, SettingConf> = {
    'node': nodeSetting,
    'link': linkSetting,
    'document': documentSetting,
    'media': mediaSetting,
    'text': textSetting,
    'svg': svgSetting,
    'note': noteSetting,
    'fragment': fragmentSetting
};

export function settingTemplate(_type: SourceType) {
    let settingConf = typeSetting[_type];
    const specialDict: { [prop: string]: any } = {
        'x': randomNumberInRange(0.3, 0.7),
        'y': randomNumberInRange(0.3, 0.7)
    };
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

export function nodeSettingTemplate(_id: id, _type: string, _label: string, _name: string, _image: string) {
    let setting = <NodeSetting>{
        _id,
        _type,
        _label,
        _name,
        _image
    };
    Object.assign(setting, settingTemplate("node"));
    return setting;
}

export function linkSettingTemplate(_id: id, _label: string, _start: VisNodeSettingPart, _end: VisNodeSettingPart) {
    let setting = <LinkSetting>{
        _id,
        _type: "link",
        _label,
        _start,
        _end
    };
    Object.assign(setting, settingTemplate("link"));
    return setting;
}

export function mediaSettingTemplate(_id: id, _label: string, _name: string, _src: string) {
    let setting = <MediaSetting>{
        _id,
        _type: "media",
        _label,
        _name,
        _src
    };
    Object.assign(setting, settingTemplate("media"));
    if (_label === 'image') {
        let image = new Image();
        image.src = _src;
        let checkLoad = function () {
            if (image.width > 0 || image.height > 0) {
                setting.Base.size = image.width;
                setting.Base.scaleX = image.height / image.width;
                cancelAnimationFrame(query)
            }
        };
        let query = requestAnimationFrame(checkLoad);
        image.onload = function () {
            setting.Base.size = image.width;
            setting.Base.scaleX = image.height / image.width;
            cancelAnimationFrame(query)
        };
        checkLoad()
    }
    if (_label === 'pdf') {
        let loadingTask = PDFJS.getDocument(_src);
        loadingTask.promise.then(function(pdf:any) {
             pdf.getPage(1).then(function(page:any) {
                 let viewport = page.getViewport({scale: 1.5});
                 setting.Base.size = viewport.width;
                 setting.Base.scaleX = viewport.height / viewport.width;
             });
        })
    }
    return setting;
}

export function graphSettingTemplate(_id: id) {
    let setting = <GraphSetting>{
        _id,
        _type: "document",
        _label: "DocGraph"
    };
    Object.assign(setting, settingTemplate("document"));
    return setting;
}

export function noteSettingTemplate(_id: id, _label: string, _title: string, _content: string) {
    let setting = {
        _id,
        _type: 'note',
        _label,
        _title,
        _content
    } as NoteSetting;
    Object.assign(setting, settingTemplate('note'));
    return setting
}

export function nodeStateTemplate(...rest: Array<string>) {
    return {
        isSelected: false,
        isMouseOn: false,
        isDeleted: false,
        isAdd: rest.indexOf("isAdd") > -1,
        isSelf: rest.indexOf("isSelf") > -1
    } as NodeState;
}

export function linkStateTemplate(...rest: Array<string>) {
    return {
        isSelected: false,
        isMouseOn: false,
        isDeleted: false,
        isAdd: rest.indexOf("isAdd") > -1,
        isSelf: rest.indexOf("isSelf") > -1
    } as LinkState;
}

export function noteStateTemplate(...rest: Array<string>) {
    return {
        isSelected: false,
        isMouseOn: false,
        isAdd: rest.indexOf("isAdd") > -1,
        isLock: false,
        isDark: false,
        isDeleted: false,
        isSelf: true,
        isEditing: false
    } as NoteState
}

export function graphStateTemplate(...rest: Array<string>) {
    return <GraphState>{
        isDeleted: false,
        isChanged: false,
        isSavedIn5min: false,
        isExplode: false,
        isSelf: rest.indexOf("isSelf") > -1,
    };
}

export function userConcernTemplate() {
    return <UserConcern>{
        Imp: -1,
        HardLevel: -1,
        Useful: -1,
        isStar: false,
        isGood: false,
        isBad: false,
        isShared: false,
        Labels: []
    };
}

export function nodeInfoTemplate(_id: id, _type: 'node' | 'document', _label: string) {
    let commonProps: Record<string, ValueWithType<any>> = {};
    Object.entries(nodeLabelToProp(_label)).map(([key, value]) => {
        let {type, resolve} = value;
        commonProps[key] = {type, resolve, value: fieldDefaultValue[type]};
    });
    let info = <BaseNodeInfo>{
        _id: _id,
        type: _type,
        PrimaryLabel: _label,
        Name: 'NewNode' + _id,
        Alias: [],
        Language: 'auto',
        Labels: [],
        Topic: [],
        Text: {'auto': ''},
        Description: {},
        ExtraProps: {},
        CommonProps: commonProps,
        BaseImp: 0,
        BaseHardLevel: 0,
        BaseUseful: 0,
        $IsOpenSource: false,
        $IsCommon: true,
        $IsFree: true,
        IncludedMedia: [],
        MainPic: ''
    };
    // 特别定义
    if (_type === "document") {
        info.Name = 'NewDocument' + _id;
    }

    return info;
}

export function nodeCtrlTemplate(_type: 'node' | 'document', _label: string) {
    // Ctrl数据
    let ctrl = {
        $IsUserMade: true,
        CreateUser: getCookie("user_id"),
        Source: 'User',
        UpdateTime: currentTime(),
        PrimaryLabel: _label,
        Imp: 50,
        HardLevel: 50,
        Useful: 50,
        isStar: 0,
        isShared: 0,
        isGood: 0,
        isBad: 0,
        Contributor: {create: getCookie("user_name"), update: []},
        TotalTime: 50,
        Labels: [],
        CreateType: 'User'
    };
    if (_type === 'node') {
        return ctrl as BaseNodeCtrl
    } else {
        return Object.assign({
            Size: 1,
            Complete: 2,
            MainNodes: [],
        }, ctrl) as BaseGraphCtrl
    }
}

export function mediaInfoTemplate(_id: id, file: File) {
    return <BaseMediaInfo>{
        _id: _id,
        type: "media",
        PrimaryLabel: getMediaType(file),
        Name: file.name.split(".")[0],
        Labels: [],
        $IsCommon: true,
        $IsOpenSource: false,
        $IsFree: true,
        ExtraProps: {},
        Description: {}
    };
}

export function mediaCtrlTemplate(file: File) {
    const time = new Date();
    return <BaseMediaCtrl>{
        FileName: URL.createObjectURL(file),
        Format: file.name.split(".")[1],
        PrimaryLabel: getMediaType(file),
        Thumb: "",
        UpdateTime: currentTime(),
        CreateUser: getCookie("user_id"),
        $IsUserMade: true,
        Source: 'User',
        isStar: 0,
        isGood: 0,
        isBad: 0,
        isShared: 0,
        Labels: [],
        CreateType: 'User'
    };
}

export function linkInfoTemplate(_id: id, _label: string) {
    let commonProps: Record<string, ValueWithType<any>> = {};
    Object.entries(nodeLabelToProp(_label)).map(([key, value]) => {
        let {type, resolve} = value;
        commonProps[key] = {type, resolve, value: fieldDefaultValue[type]};
    });
    return <BaseLinkInfo>{
        _id: _id,
        type: "link",
        PrimaryLabel: _label,
        $IsCommon: true,
        $IsFree: true,
        $IsOpenSource: false,
        Name: '',
        Labels: [],
        ExtraProps: {},
        Confidence: 0.5,
        CommonProps: commonProps,
        Description: {}
    };
}

export function linkCtrlTemplate(_start: VisNodeSettingPart, _end: VisNodeSettingPart) {
    let time = new Date();
    return <BaseLinkCtrl>{
        UpdateTime: currentTime(),
        CreateUser: getCookie("user_id"),
        CreateType: 'User',
        Start: _start,
        End: _end
    };
}

const specialMedia: Record<string, string> = {
    'text/markdown': 'markdown'
};

export function getMediaType(file: File) {
    const mime = require("mime/lite");
    const mimeTypes = (file: File) => mime.getType(file.name.split(".")[1]);
    const mimeFile = mimeTypes(file);
    let result;
    if (mimeFile) {
        const mimeType = mimeFile.split("/");
        mimeType[0] === "application"
            ? (result = mimeType[1])
            : (result = mimeType[0]);
        // 特殊化的解析
        if (Object.keys(specialMedia).includes(mimeFile)) {
            result = specialMedia[mimeFile]
        }
    } else {
        result = file.name.split(".")[1];
    }
    return result;
    //todo 更加详细的mediaType
}
