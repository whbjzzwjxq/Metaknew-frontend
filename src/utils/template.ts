import {currentTime, getCookie, randomNumberInRange} from '@/utils/utils';
import {fieldDefaultValue, nodeLabelToProp, ValueWithType} from "@/utils/fieldResolve";
import PDFJS from 'pdfjs-dist';
import {typeSetting} from "@/interface/itemSetting";

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
        loadingTask.promise.then(function (pdf: any) {
            pdf.getPage(1).then(function (page: any) {
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

export function pathSettingTemplate(_id: id) {
    let setting = <PathConf>{
        _id,
        _type: 'document',
        _label: "path"
    };
    Object.assign(setting, settingTemplate('path'));
    return setting
}

export function noteSettingTemplate(_id: id, _label: string, _title: string, _content: string, _parent: id) {
    let setting = {
        _id,
        _type: 'note',
        _label,
        _title,
        _content,
        _parent
    } as NoteSetting;
    Object.assign(setting, settingTemplate('note'));
    return setting
}

export function svgSettingTemplate (_id: id, _label: SvgLabel, _points: PointObject[]) {
    let setting = {
        _id,
        _type: 'svg',
        _label,
        _points,
        _text: ''
    } as SvgSetting;
    return Object.assign(setting, settingTemplate('svg'));
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

export function svgStateTemplate(...rest: Array<string>) {
    return <SvgState>{
        isDeleted: false,
        isSelf: true,
        isAdd: true,
        isEditing: false,
        isMouseOn: false,
        isSelected: false
    }
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
    return <BaseLinkCtrl>{
        UpdateTime: currentTime(),
        CreateUser: getCookie("user_id"),
        CreateType: 'User',
        Start: _start,
        End: _end
    };
}

//media help
PDFJS.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.js';
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
