import {currentTime, getCookie, randomNumberInRange} from '@/utils/utils';
import {fieldDefaultValue, nodeLabelToStandardProps, PropDescription, ValueWithType} from "@/utils/fieldResolve";
import PDFJS from 'pdfjs-dist';
import store from '@/store/index';
import {typeSettingDictGraph} from "@/interface/style/templateStyleGraph";

export function settingTemplateGraph(_type: AllType) {
    let settingConf = typeSettingDictGraph[_type];
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

export function nodeSettingTemplate(_id: id, _type: string = 'node', _label: string = 'BaseNode', _name: string = '', _image: string = '') {
    let setting = <NodeSetting>{
        _id,
        _type,
        _label,
        _name,
        _image
    };
    Object.assign(setting, settingTemplateGraph("node"));
    return setting;
}

export function mediaSettingTemplate(payload: MediaInitPayload) {
    let {_src, _label} = payload;
    let setting = Object.assign(payload, {
        InGraph: settingTemplateGraph("media")
    }) as MediaSetting;
    if (_label === 'image') {
        let image = new Image();
        image.src = _src;
        let checkLoad = function () {
            if (image.width > 0 || image.height > 0) {
                setting.InGraph.Base.size = image.width;
                setting.InGraph.Base.scaleX = image.height / image.width;
                cancelAnimationFrame(query)
            }
        };
        let query = requestAnimationFrame(checkLoad);
        image.onload = function () {
            setting.InGraph.Base.size = image.width;
            setting.InGraph.Base.scaleX = image.height / image.width;
            cancelAnimationFrame(query)
        };
        checkLoad()
    }
    if (_label === 'pdf') {
        let loadingTask = PDFJS.getDocument(_src);
        loadingTask.promise.then(function (pdf: any) {
            pdf.getPage(1).then(function (page: any) {
                let viewport = page.getViewport({scale: 1.5});
                setting.InGraph.Base.size = viewport.width;
                setting.InGraph.Base.scaleX = viewport.height / viewport.width;
            });
        })
    }
    return setting;
}

export function documentSettingTemplate(_id: id) {
    let setting = <DocumentSetting>{
        _id,
        _type: "document",
        _label: "_DocGraph"
    };
    Object.assign(setting, settingTemplateGraph("document"));
    return setting;
}

export function pathSettingTemplate(_id: id) {
    let setting = <PathConf>{
        _id,
        _type: 'document',
        _label: "path"
    };
    Object.assign(setting, settingTemplateGraph('path'));
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
    Object.assign(setting, settingTemplateGraph('note'));
    return setting
}

export function textSettingTemplate(_id: id, _label: TextLabel, _points: PointObject[]) {
    let setting = {
        _id,
        _type: 'text',
        _label,
        _points,
        _text: ''
    } as TextSetting;
    return Object.assign(setting, settingTemplateGraph('text'));
}

export function nodeStateTemplate() {
    return {
        isSelected: false,
        isMouseOn: false,
        isDeleted: false,
        isAdd: false,
    } as NodeState;
}

export function linkStateTemplate() {
    return {
        isSelected: false,
        isMouseOn: false,
        isDeleted: false,
        isAdd: false,
    } as LinkState;
}

export function noteStateTemplate() {
    return {
        isSelected: false,
        isMouseOn: false,
        isAdd: false,
        isLock: false,
        isDark: false,
        isDeleted: false,
        isEditing: false
    } as NoteState
}

export function documentStateTemplate() {
    return <DocumentState>{
        isDeleted: false,
        isExplode: true,
        isSaved: false
    };
}

export function textStateTemplate() {
    return <TextState>{
        isDeleted: false,
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
        NumStar: false,
        NumGood: false,
        NumBad: false,
        NumShared: false,
        Labels: [],
        isModeled: false,
        isConfirm: false
    };
}

export function nodeInfoTemplate(_id: id, _type: 'node' | 'document', _label: string) {
    let StandardProps: Record<string, ValueWithType<any>> = {};
    let ExtraProps: Record<string, ValueWithType<any>> = {};
    Object.entries(nodeLabelToStandardProps(_label)).map(([key, value]) => {
        let {type, resolve} = value;
        StandardProps[key] = {type, resolve, value: fieldDefaultValue[type]};
    });
    if (store) {
        let editData = store.state.userDataManager.userEditData;
        editData.PLabelExtraProps[_label] as LabelProps | undefined
            ? editData.PLabelExtraProps[_label].map((prop: string) => {
                let value: PropDescription = editData.UserPropResolve[prop];
                if (value) {
                    let {type, resolve} = value;
                    ExtraProps[prop] = {type, resolve, value: fieldDefaultValue[type]};
                }
            })
            : ExtraProps = {};
    } else {
        //store 加载完毕
    }
    let info = <BaseNodeInfo>{
        id: _id,
        type: _type,
        PrimaryLabel: _label,
        Name: 'NewNode' + _id,
        Alias: [],
        Language: 'auto',
        Labels: [],
        Topic: [],
        Translate: {'auto': ''},
        Description: {'auto': ''},
        ExtraProps,
        StandardProps,
        BaseImp: 0,
        BaseHardLevel: 0,
        BaseUseful: 0,
        IsOpenSource: false,
        IsCommon: true,
        IncludedMedia: [],
        MainPic: ''
    };
    // 特别定义
    if (_type === "document") {
        info.Name = 'NewDocument' + _id;
    }
    return info;
}

export function nodeCtrlTemplate() {
    // Ctrl数据
    return {
        CreateUser: getCookie("user_id"),
        UpdateTime: currentTime(),
        Imp: 50,
        HardLevel: 50,
        Useful: 50,
        NumStar: 0,
        NumShared: 0,
        NumGood: 0,
        NumBad: 0,
        Contributor: {create: getCookie("user_name"), update: []},
        TotalTime: 50,
        Labels: [],
        CreateType: 'USER'
    } as BaseNodeCtrl
}

export function mediaInfoTemplate(_id: id, file?: File) {
    return <BaseMediaInfo>{
        id: _id,
        type: "media",
        PrimaryLabel: file ? getMediaType(file) : 'unknown',
        Name: file ? file.name.split(".")[0] : "NewMedia" + _id,
        Labels: [],
        IsCommon: true,
        IsOpenSource: false,
        IsFree: true,
        StandardProps: {},
        ExtraProps: {},
        Description: {},
        Translate: {'auto': ''}
    };
}

export function mediaCtrlTemplate(file?: File) {
    return <BaseMediaCtrl>{
        FileName: file ? URL.createObjectURL(file) : '',
        Format: file ? file.name.split(".")[1] : 'unknown',
        Thumb: "",
        UpdateTime: currentTime(),
        CreateUser: getCookie("user_id"),
        NumStar: 0,
        NumGood: 0,
        NumBad: 0,
        NumShared: 0,
        Labels: [],
        CreateType: 'USER'
    };
}

export function linkInfoTemplate(_id: id, _label: string) {
    let StandardProps: Record<string, ValueWithType<any>> = {};
    Object.entries(nodeLabelToStandardProps(_label)).map(([key, value]) => {
        let {type, resolve} = value;
        StandardProps[key] = {type, resolve, value: fieldDefaultValue[type]};
    });
    return {
        id: _id,
        type: "link",
        PrimaryLabel: _label,
        IsCommon: true,
        IsFree: true,
        IsOpenSource: false,
        Name: '',
        Labels: [],
        ExtraProps: {},
        StandardProps: StandardProps,
        Description: {},
        Translate: {'auto': ''}
    } as BaseLinkInfo;
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
}
