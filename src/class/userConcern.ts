import {
    GraphItemSettingPart,
    GraphSelfPart,
    InfoPart,
    LinkInfoPart,
    MediaInfoPart,
    NodeInfoPart
} from "@/class/graphItem";
import {isMediaInfoPart} from "@/utils/typeCheck";
import {getCookie} from "@/utils/utils";
import {noteSettingTemplate, noteStateTemplate} from "@/utils/template";

declare global {
    type BooleanConcern = "isStar" | "isBad" | "isGood" | "isShared";
    type LevelConcern = "Imp" | "HardLevel" | "Useful";

    interface UserConcern {
        Imp: number;
        HardLevel: number;
        Useful: number;
        isStar: boolean;
        isShared: boolean;
        isGood: boolean;
        isBad: boolean;
        Labels: Array<string>;
    }

    interface FragmentCtrl extends BaseCtrl {
        SourceId: id,
        SourceType: GraphItemType,
        SourceLabel: string,
        $IsLinked: boolean
    }

    interface FragmentInfo extends BaseInfo {
        type: 'fragment',
        PrimaryLabel: 'text' | 'image',
        Src: string,
    }
}

export class FragmentInfoPart extends InfoPart {
    Info: FragmentInfo;
    Ctrl: FragmentCtrl;

    get _id() {
        return this.Info._id
    }

    constructor(info: FragmentInfo, ctrl: FragmentCtrl) {
        super(info, ctrl);
        this.Info = info;
        this.Ctrl = ctrl
    }

    static fragmentFromItem(itemInfo: NodeInfoPart | MediaInfoPart | LinkInfoPart, _id: id, method: string) {
        let info = {
            _id,
            type: 'fragment',
            PrimaryLabel: isMediaInfoPart(itemInfo) ? 'image' : 'text',
            Name: itemInfo.Info.Name === '' ? itemInfo.Info.Name : 'NewFragment From ' + itemInfo.type + itemInfo._id,
            Labels: itemInfo.Info.Labels,
            Src: isMediaInfoPart(itemInfo) ? itemInfo.Ctrl.Thumb : '',
            Description: itemInfo.Info.Description
        } as FragmentInfo;

        let ctrl = {
            $IsLinked: true,
            CreateType: 'System-' + method,
            CreateUser: getCookie('user_id'),
            SourceId: itemInfo._id,
            SourceType: itemInfo.type,
            SourceLabel: itemInfo.Info.PrimaryLabel,
        } as FragmentCtrl;

        return new FragmentInfoPart(info, ctrl)
    }

    static newFragment(_label: 'image' | 'text') {

    }
}

export class NoteSettingPart extends GraphItemSettingPart {
    Setting: NoteSetting;
    State: NoteState;
    parent: GraphSelfPart;
    static list: Array<NoteSettingPart> = [];

    constructor(Setting: NoteSetting, State: NoteState, parent: GraphSelfPart) {
        super(Setting, State, parent);
        this.Setting = Setting;
        this.State = State;
        this.parent = parent;
        NoteSettingPart.list.push(this)
    }

    static emptyNoteSetting(
        _id: id,
        _label: string,
        _title: string,
        _content: string,
        parent: GraphSelfPart) {
        let setting = noteSettingTemplate(_id, _label, _title, _content);
        let state = noteStateTemplate('isAdd');
        return new NoteSettingPart(setting, state, parent)
    }
}
