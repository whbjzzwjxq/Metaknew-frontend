import {crucialRegex, frontendIdRegex, getCookie, getIsSelf, getSrc, infoChangePLabel} from "@/utils/utils";
import {Draft, draftUpdate} from "@/api/subgraph/commonApi";
import Vue from "vue";
import {commitInfoAdd, commitSnackbarOn} from "@/store/modules/_mutations";
import {
    linkCtrlTemplate,
    linkInfoTemplate,
    mediaCtrlTemplate,
    mediaInfoTemplate,
    nodeCtrlTemplate,
    nodeInfoTemplate
} from "@/utils/template";
import {BackendNodeInfoPart} from "@/api/subgraph/node";
import {BackendMediaInfoPart} from "@/api/subgraph/media";
import {BackendLinkInfoPart} from "@/api/subgraph/link";
import {FragmentCtrl, FragmentInfo} from "@/interface/interfaceUser";
import {isMediaInfoPart} from "@/utils/typeCheck";
import {LinkSettingPart, MediaSettingPart, NodeSettingPart} from "@/class/settingBase";

export abstract class InfoPart {
    Info: BaseInfo;
    Ctrl: BaseCtrl;
    State: InfoState;

    get _id() {
        return this.Info.id
    }

    get _type() {
        return this.Info.type
    }

    get _label() {
        return this.Info.PrimaryLabel
    }

    get isRemote() {
        // 是否保存了模型
        return !frontendIdRegex.test(this._id.toString())
    }

    // get isUserMade() {
    //     return this.Ctrl.CreateType === 'USER'
    // }

    get isSelf() {
        return getIsSelf(this.Ctrl)
    }

    get isEdit() {
        return this.State.isEdit
    }

    set isEdit(value) {
        this.State.isEdit = value
    }

    get queryObject(): QueryObject {
        return {id: this._id, type: this._type, pLabel: this._label}
    }

    get userConcern() {
        return {}
    }

    get draftObject() {
        return {
            Query: this.queryObject,
            Name: this.Info.Name,
            Content: this.Info,
            VersionId: this.State.draftId
        } as Draft;
    }

    get allProps() {
        return Object.assign({}, this.Info.StandardProps, this.Info.ExtraProps)
    }

    protected constructor(info: BaseInfo, ctrl: BaseCtrl, remoteNotFound: boolean, draftId?: number) {
        this.Info = info;
        this.Ctrl = ctrl;
        this.State = {
            isEdit: false,
            remoteNotFound,
            draftId
        }
    }

    changeId(newId: id) {
        //先同步 再改info id
        this.synchronizationSource("_id", newId);
        this.Info.id = newId;
        this.isEdit = false;
    }

    synchronizationSource(prop: string, value: any) {
        //
    }

    // info修改值
    updateValue(prop: string, newValue: any, doItPassive?: boolean) {
        if (prop in this.Info) {
            if (this.Info[prop] !== newValue || doItPassive) {
                //Vue.set检查过
                Vue.set(this.Info, prop, newValue);
                this.State.isEdit = true
            } else {
                // 值没有变化
            }
        } else {
            // 不存在的属性
        }
    }

    draftSave(isAuto: boolean = false) {
        if (this.isRemote) {
            draftUpdate([this.draftObject], isAuto).then(res => {
                let {DraftIdMap} = res.data;
                this.State.draftId = DraftIdMap[this._id];
                let payload = {
                    actionName: this._type + `DraftUpdate`,
                    color: 'success',
                    once: false,
                    content: isAuto ? '自动保存成功' : '草稿保存成功'
                } as SnackBarStatePayload;
                commitSnackbarOn(payload)
            })
        } else {
            // error
        }
    }
}

export class NodeInfoPart extends InfoPart {
    Info: BaseNodeInfo;
    Ctrl: BaseNodeCtrl;

    get _type() {
        return this.Info.type
    }

    get allSettingItem() {
        let list = NodeSettingPart.list;
        return list.filter(node => node._id === this._id)
    }

    get description() {
        return this.Info.Description['auto']
    }

    protected constructor(info: BaseNodeInfo, ctrl: BaseNodeCtrl, isRemoteModel: boolean) {
        super(info, ctrl, isRemoteModel);
        this.Info = info;
        this.Ctrl = ctrl;
        this.synchronizationAll();
    }

    static emptyNodeInfoPart(payload: NodeQuery, commit: boolean = true) {
        let {id, type, pLabel} = payload;
        let item = new NodeInfoPart(nodeInfoTemplate(id, type, pLabel), nodeCtrlTemplate(), false);
        commit && commitInfoAdd({item, strict: false});
        return item
    }

    static resolveBackend(payload: BackendNodeInfoPart, commit: boolean = true) {
        let {Info, Ctrl} = payload;
        let item = new NodeInfoPart(Info, Ctrl, false);
        commit && commitInfoAdd({item, strict: true});
        item.synchronizationAll();
        item.isEdit = false;
        return item
    }

    changePrimaryLabel(newLabel: string) {
        infoChangePLabel(this.Info, newLabel);
        this.synchronizationSource("_label", newLabel);
    }

    changeName(newName: string) {
        this.Info.Name = newName;
        this.synchronizationSource("_name", newName);
    }

    changeImage(newImage: string) {
        this.Info.MainPic = newImage;
        this.synchronizationSource("_image", newImage);
    }

    synchronizationSource(prop: keyof NodeSetting, value: any) {
        crucialRegex.test(prop) &&
        this.allSettingItem.map(node => node.updateCrucialProp(prop, value));
        // 在同步这里完成isEdit改变
        this.isEdit = true
    }

    synchronizationAll() {
        // 同步所有属性到Setting
        this.allSettingItem.map(node => {
            node.updateCrucialProp('_id', this.Info.id);
            node.updateCrucialProp('_type', this.Info.type);
            node.updateCrucialProp("_label", this.Info.PrimaryLabel);
            node.updateCrucialProp("_name", this.Info.Name);
            node.updateCrucialProp("_image", this.Info.MainPic);
        });
    }
}

export class LinkInfoPart extends InfoPart {
    Info: BaseLinkInfo;
    Ctrl: BaseLinkCtrl;

    static get visualNodeSetting() {
        let result: VisNodeSettingPart[] = [];
        result.push(...NodeSettingPart.list);
        result.push(...MediaSettingPart.list);
        return result
    }

    get _type() {
        return this.Info.type
    }

    get allSettingItem() {
        let linkList = LinkSettingPart.list;
        return linkList.filter(link => link._id === this._id)
    }

    protected constructor(info: BaseLinkInfo, ctrl: BaseLinkCtrl, remoteNotFound: boolean) {
        super(info, ctrl, remoteNotFound);
        this.Info = info;
        this.Ctrl = ctrl;
        this.synchronizationAll();
    }

    static emptyLinkInfo(_id: id, _label: string, _start: VisNodeSettingPart, _end: VisNodeSettingPart, commit: boolean = true, remoteNotFound: boolean = true) {
        let item = new LinkInfoPart(linkInfoTemplate(_id, _label), linkCtrlTemplate(_start, _end), remoteNotFound);
        commit && commitInfoAdd({item, strict: false});
        return item
    }

    static resolveBackend(link: BackendLinkInfoPart, commit: boolean = true) {
        let {Info, Ctrl} = link;
        let ctrl = {
            ...Ctrl,
            Start: LinkInfoPart.visualNodeSetting.filter(item => item._id === Ctrl.Start.id)[0],
            End: LinkInfoPart.visualNodeSetting.filter(item => item._id === Ctrl.End.id)[0]
        } as BaseLinkCtrl;
        let item = new LinkInfoPart(Info, ctrl, false);
        commit && commitInfoAdd({item, strict: true});
        item.synchronizationAll();
        item.State.isEdit = false;
        return item
    }

    changeLabel(newLabel: string) {
        this.Info.PrimaryLabel = newLabel;
        this.synchronizationSource("_label", newLabel);
    }

    changeNode(start: VisNodeSettingPart | null, end: VisNodeSettingPart | null) {
        if (!this.isRemote) {
            if (start && this.Ctrl.Start._id !== start._id) {
                this.Ctrl.Start = start;
                this.allSettingItem.map(link => link.reBoundNode("_start", start))
            }

            if (end && this.Ctrl.End._id !== end._id) {
                this.Ctrl.End = end;
                this.allSettingItem.map(link => link.reBoundNode("_end", end))
            }
        } else {
            // "远端关系不能改变了"
        }
    }

    synchronizationSource(prop: '_label', value: string) {
        this.allSettingItem.map(link => link.updateCrucialProp(prop, value));
        this.isEdit = true
    }

    synchronizationAll() {
        this.allSettingItem.map(link => {
            link.reBoundNode("_start", this.Ctrl.Start);
            link.reBoundNode("_end", this.Ctrl.End);
            link.updateCrucialProp('_label', this.Info.PrimaryLabel);
        });
    }

    compress() {
        return {
            ...this.Info,
            Start: this.Ctrl.Start.queryObject,
            End: this.Ctrl.End.queryObject
        } as CompressLinkInfo
    }
}

export class MediaInfoPart extends InfoPart {
    file: File | Blob | undefined;
    status: MediaStatus;
    currentUrl: string;
    width?: number;
    height?: number;
    Info: BaseMediaInfo;
    Ctrl: BaseMediaCtrl;

    get allSettingItem() {
        let list = MediaSettingPart.list;
        return list.filter(media => media._id === this._id)
    }

    get _type() {
        return this.Info.type
    }

    get realSrc() {
        return getSrc(this.Ctrl.FileName)
    }

    get fileName() {
        return this.Ctrl.FileName
    }

    static statusDict: Record<MediaStatus, string> = {
        new: 'blue',
        error: 'red',
        success: 'green',
        uploading: 'purple',
        warning: 'yellow'
    };

    protected constructor(info: BaseMediaInfo, ctrl: BaseMediaCtrl, remoteNotFound: boolean, file?: File | Blob) {
        super(info, ctrl, remoteNotFound);
        this.file = file;
        this.status = 'new';
        this.Info = info;
        this.Ctrl = ctrl;
        this.currentUrl = file
            ? URL.createObjectURL(file)
            : '';
        this.synchronizationAll();
    }

    static emptyMediaInfo(_id: id, file?: File, commit: boolean = true, remoteNotFound: boolean = false) {
        let item = new MediaInfoPart(mediaInfoTemplate(_id, file), mediaCtrlTemplate(file), remoteNotFound, file);
        commit && commitInfoAdd({item, strict: false});
        return item
    }

    static resolveBackend(media: BackendMediaInfoPart, commit: boolean = true) {
        let {Info, Ctrl} = media;
        let item = new MediaInfoPart(Info, Ctrl, false);
        commit && commitInfoAdd({item, strict: true});
        item.synchronizationAll();
        item.State.isEdit = false;
        return item
    }

    changeStatus(status: MediaStatus) {
        this.status = status;
    }

    changeSource(newSource: string) {
        this.Ctrl.FileName = newSource;
        this.synchronizationSource("_src", newSource);
    }

    changeName(newName: string) {
        this.Info.Name = newName;
        this.synchronizationSource("_name", newName)
    }

    synchronizationSource(prop: "_src" | "_name" | "_label", value: any) {
        crucialRegex.test(prop) &&
        this.allSettingItem.map(node =>
            node.updateCrucialProp(prop, value)
        );
        this.State.isEdit = true;
    }

    synchronizationAll() {
        this.allSettingItem.map(node => {
            node.updateCrucialProp('_id', this.Info.id);
            node.updateCrucialProp("_src", this.Ctrl.FileName);
            node.updateCrucialProp("_name", this.Info.Name);
            node.updateCrucialProp('_label', this.Info.PrimaryLabel)
        });
    }
}

export class FragmentInfoPart extends InfoPart {
    Info: FragmentInfo;
    Ctrl: FragmentCtrl;

    get _id() {
        return this.Info._id
    }

    constructor(info: FragmentInfo, ctrl: FragmentCtrl, remoteNotFound: boolean) {
        super(info, ctrl, remoteNotFound);
        this.Info = info;
        this.Ctrl = ctrl
    }

    static fragmentFromItem(baseData: NodeInfoPart | MediaInfoPart | LinkInfoPart, _id: id, method: string) {
        let info = {
            id: _id,
            type: 'fragment',
            PrimaryLabel: isMediaInfoPart(baseData) ? 'image' : 'text',
            Name: baseData.Info.Name === '' ? baseData.Info.Name : 'NewFragment From ' + baseData._type + baseData._id,
            Labels: baseData.Info.Labels,
            Src: isMediaInfoPart(baseData) ? baseData.Ctrl.Thumb : '',
            Description: baseData.Info.Description
        } as FragmentInfo;

        let ctrl = {
            IsLinked: true,
            CreateType: 'System-' + method,
            CreateUser: getCookie('user_id'),
            SourceId: baseData._id,
            SourceType: baseData._type,
            SourceLabel: baseData._label,
        } as FragmentCtrl;

        return new FragmentInfoPart(info, ctrl, false)
    }
}
