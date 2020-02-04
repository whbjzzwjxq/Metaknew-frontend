import {InfoPart, LinkInfoPart, MediaInfoPart, NodeInfoPart} from "@/utils/graphClass";
import {isMediaInfoPart} from "@/utils/typeCheck";
import {getCookie} from "@/utils/utils";

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
