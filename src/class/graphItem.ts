import {
    crucialRegex,
    deepClone,
    emptyContent,
    findItem,
    frontendIdRegex,
    getCookie,
    getIndex,
    getIsSelf,
    getSrc,
    infoChangePLabel,
} from "@/utils/utils";
import Vue from "vue";
import {
    graphSettingTemplate,
    graphStateTemplate,
    linkCtrlTemplate,
    linkInfoTemplate,
    linkSettingTemplate,
    linkStateTemplate,
    mediaCtrlTemplate,
    mediaInfoTemplate,
    mediaSettingTemplate,
    nodeCtrlTemplate,
    nodeInfoTemplate,
    nodeSettingTemplate,
    nodeStateTemplate,
    noteSettingTemplate,
    noteStateTemplate,
    paperSettingTemplate,
    textSettingTemplate,
    textStateTemplate,
} from "@/utils/template";
import {
    isGraphType,
    isLinkSetting,
    isMediaInfoPart,
    isMediaSetting,
    isNodeSetting,
    isTextSetting,
} from "@/utils/typeCheck";
import {commitDocumentAdd, commitInfoAdd, commitSnackbarOff, commitSnackbarOn} from "@/store/modules/_mutations";
import {FragmentCtrl, FragmentInfo} from "@/interface/interfaceUser";
import store from '@/store'
import {getManager} from "@/store/modules/dataManager";
import {BackendMediaInfoPart} from "@/api/subgraph/media";
import {BackendNodeInfoPart} from "@/api/subgraph/node";
import {BackendGraph, BackendGraphWithNode} from "@/api/document/document";
import {BackendLinkInfoPart} from "@/api/subgraph/link";
import {DocumentDraft, Draft, draftUpdate} from "@/api/subgraph/commonApi";
import {dispatchNoteInDocPush} from "@/store/modules/_dispatch";
import {TreeNodeDoc} from "@/interface/interfaceTree";

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

    protected constructor(info: BaseNodeInfo, ctrl: BaseNodeCtrl, isRemoteModel: boolean) {
        super(info, ctrl, isRemoteModel);
        this.Info = info;
        this.Ctrl = ctrl;
        this.synchronizationAll();
    }

    static emptyNodeInfoPart(payload: NodeQuery, commit: boolean = true, remoteNotFound: boolean = false) {
        let {id, type, pLabel} = payload;
        let item = new NodeInfoPart(nodeInfoTemplate(id, type, pLabel), nodeCtrlTemplate(), remoteNotFound);
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

    synchronizationSource(prop: '_name' | '_image' | '_label' | '_id', value: any) {
        crucialRegex.test(prop) &&
        this.allSettingItem.map(node => node.updateCrucialProp(prop, value));
        // 在同步这里完成isEdit改变
        this.isEdit = true
    }

    synchronizationAll() {
        // 同步所有属性到Setting
        this.allSettingItem.map(node => {
            node.updateCrucialProp("_label", this.Info.PrimaryLabel);
            node.updateCrucialProp("_name", this.Info.Name);
            node.updateCrucialProp("_image", this.Info.MainPic);
            node.updateCrucialProp('_id', this.Info.id);
        });
    }

    save() {

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

export abstract class SettingPart {
    Setting: Setting;
    State: BaseState;

    get _id() {
        return this.Setting._id
    }

    set _id(value) {
        this.Setting._id = value
    }

    get _type() {
        return this.Setting._type
    }

    get _label() {
        return this.Setting._label
    }

    get isDeleted() {
        return this.State.isDeleted
    }

    get queryObject() {
        return {
            id: this._id,
            type: this._type,
            pLabel: this._label
        } as QueryObject
    }

    updateState(prop: AllStateProp, value?: boolean) {
        value === undefined && (value = !this.State[prop]);
        this.State[prop] = value
    }

    updateSetting(propGroup: string, prop: string, value: any) {
        ////Vue.set检查过
        Vue.set(this.Setting[propGroup], prop, value);
    }

    updateCrucialProp(prop: AllCrucialProp, value: any) {
        crucialRegex.test(prop) && (this.Setting[prop] = value);
    }

    protected constructor(Setting: Setting, State: BaseState) {
        this.Setting = Setting;
        this.State = State;
    }
}

export abstract class ItemSettingPart extends SettingPart {
    Setting: Setting;
    State: BaseState;
    _parent: DocumentSelfPart | null;

    protected constructor(Setting: Setting, State: BaseState, parent: DocumentSelfPart | null) {
        super(Setting, State);
        this.Setting = Setting;
        this.State = State;
        this._parent = parent;
    }

    get parent() {
        return this._parent
    }

    get compress() {
        return this.Setting
    }

    get isRemote() {
        return frontendIdRegex.test(this._id.toString())
    }
}

export class GraphItemSettingPart extends ItemSettingPart {
    Setting: GraphItemSetting;
    State: GraphItemState;
    _parent: GraphSelfPart;

    get parent() {
        return this._parent
    }

    protected constructor(Setting: GraphItemSetting, State: GraphItemState, parent: GraphSelfPart) {
        super(Setting, State, parent);
        this.Setting = Setting;
        this.State = State;
        this._parent = parent;
    }

    get _type() {
        return this.Setting._type
    }

    get isFatherExplode() {
        return this.parent.isExplode
    }

    get isSelf() {
        if (this._type !== 'text') {
            return getManager(this._type)[this._id].isSelf
        } else {
            return this.parent.isSelf
        }
    }

    get isSelected(): boolean {
        return this.State.isSelected;
    }

    select(value?: boolean) {
        value === undefined && (value = !this.isSelected);
        this.updateState('isSelected', value)
    }

    mouseOn(value: boolean) {
        this.updateState('isMouseOn', value)
    }

    deepCloneSelf() {
        let setting = deepClone(this.Setting);
        let state = deepClone(this.State);
        return new GraphItemSettingPart(setting, state, this.parent)
    }
}

export class NodeSettingPart extends GraphItemSettingPart {
    Setting: NodeSettingGraph;
    State: NodeState;
    static list: Array<NodeSettingPart> = [];

    get _type() {
        return this.Setting._type
    }

    protected constructor(Setting: NodeSettingGraph, State: NodeState, parent: GraphSelfPart) {
        super(Setting, State, parent);
        this.Setting = Setting;
        this.State = State;
        this._parent = parent;
        NodeSettingPart.list.push(this);
    }

    static emptyNodeSetting(
        _id: id,
        _type: string,
        _label: string,
        _name: string,
        _image: string,
        parent: GraphSelfPart
    ) {
        let setting = nodeSettingTemplate(_id, _type, _label, _name, _image);
        let state = nodeStateTemplate();
        return new NodeSettingPart(setting, state, parent)
    }

    static resolveBackend(setting: NodeSettingGraph, parent: GraphSelfPart) {
        let state = nodeStateTemplate();
        return new NodeSettingPart(setting, state, parent)
    }

    mouseOn(value: boolean) {
        this.State.isMouseOn = value;
        LinkSettingPart.list.filter(item => item.isBound && (item._start._id === this._id || item._end._id === this._id))
            .map(item => item.mouseOn(value));
    }

    deepCloneSelf(): NodeSettingPart {
        let setting = deepClone(this.Setting);
        let state = deepClone(this.State);
        return new NodeSettingPart(setting, state, this.parent)
    }
}

export class MediaSettingPart extends GraphItemSettingPart {
    Setting: MediaSetting;
    State: NodeState;
    static list: Array<MediaSettingPart> = [];

    get _type() {
        return this.Setting._type
    }

    protected constructor(
        Setting: MediaSetting,
        State: NodeState,
        parent: GraphSelfPart
    ) {
        super(Setting, State, parent);
        this.Setting = Setting;
        this.State = State;
        this._parent = parent;
        MediaSettingPart.list.push(this);
    }

    static emptyMediaSetting(
        _id: id,
        _label: string,
        _name: string,
        _src: string,
        parent: GraphSelfPart
    ) {
        let setting = mediaSettingTemplate(_id, _label, _name, _src);
        let state = nodeStateTemplate();
        return new MediaSettingPart(setting, state, parent);
    }

    static emptyMediaSettingFromInfo(media: MediaInfoPart, parent: GraphSelfPart) {
        return MediaSettingPart.emptyMediaSetting(media._id, media._label, media.Info.Name, media.Ctrl.FileName, parent)
    }

    static resolveBackend(setting: MediaSetting, parent: GraphSelfPart) {
        let state = nodeStateTemplate();
        return new MediaSettingPart(setting, state, parent)
    }

    mouseOn(value: boolean) {
        this.State.isMouseOn = value;
        LinkSettingPart.list.filter(item => item.isBound && (item._start._id === this._id || item._end._id === this._id))
            .map(item => item.mouseOn(value))
    }

    deepCloneSelf(): MediaSettingPart {
        let setting = deepClone(this.Setting);
        let state = deepClone(this.State);
        return new MediaSettingPart(setting, state, this.parent)
    }
}

export class LinkSettingPart extends GraphItemSettingPart {
    Setting: LinkSetting;
    State: LinkState;
    static list: Array<LinkSettingPart> = [];

    get _type() {
        return this.Setting._type
    }

    get _start() {
        return this.Setting._start
    }

    set _start(value) {
        this.Setting._start = value
    }

    get _end() {
        return this.Setting._end
    }

    set _end(value) {
        this.Setting._end = value
    }

    get compress() {
        return {
            ...this.Setting,
            _start: this._start.queryObject as VisNodeQuery,
            _end: this._end.queryObject as VisNodeQuery
        }
    }

    get isDeleted() {
        let {_start, _end} = this;
        return this.State.isDeleted || _start.isDeleted || _end.isDeleted
    }

    // 是否绑定正确
    get isBound() {
        return this._start !== undefined && this._end !== undefined
    }

    protected constructor(Setting: LinkSetting, State: LinkState, parent: GraphSelfPart) {
        super(Setting, State, parent);
        this.Setting = Setting;
        this.State = State;
        this._parent = parent;
        LinkSettingPart.list.push(this);
    }

    static emptyLinkSetting(
        _id: id,
        _label: string,
        _start: VisNodeSettingPart,
        _end: VisNodeSettingPart,
        parent: GraphSelfPart
    ) {
        let setting = linkSettingTemplate(_id, _label, _start, _end);
        let state = linkStateTemplate();
        return new LinkSettingPart(setting, state, parent);
    }

    static resolveBackend(linkSetting: BackendLinkSetting, parent: GraphSelfPart) {
        let setting = {
            ...linkSetting,
            _start: parent.getVisNodeById({_id: linkSetting._start.id, _type: linkSetting._start.type}),
            _end: parent.getVisNodeById({_id: linkSetting._end.id, _type: linkSetting._end.type})
        } as LinkSetting;
        let state = linkStateTemplate();
        return new LinkSettingPart(setting, state, parent);
    }

    reBoundNode(target: '_start' | '_end', node: VisNodeSettingPart) {
        // 没有特别指定parent就是自己的父亲
        let parent = this.parent;
        let targetItem: VisNodeSettingPart;
        // 如果没有目标节点就添加进去
        let targetInParent: VisNodeSettingPart | undefined = parent.getVisNodeById(node);
        if (targetInParent === undefined) {
            //如果没有已有项目那么新增一个内容 并且target是新内容
            parent.addItems([node]);
            targetItem = node
        } else {
            // parent里已有该内容 那么就用该graph中的
            targetItem = targetInParent
        }
        //
        if (target === '_start') {
            this._start._id !== targetItem._id && (this._start = targetItem)
        } else {
            this._end._id !== targetItem._id && (this._end = targetItem)
        }
    }

    mouseOn(value: boolean) {
        if (this.isBound) {
            this._start.State.isMouseOn = value;
            this._end.State.isMouseOn = value;
            this.State.isMouseOn = value
        }
    }

    deepCloneSelf(): LinkSettingPart {
        let state = deepClone(this.State);
        let setting = {
            _start: this.Setting._start,
            _end: this.Setting._end,
            ...deepClone(this.Setting, ['_start', '_end'])
        };
        return new LinkSettingPart(setting, state, this.parent)
    }
}

export class TextSettingPart extends GraphItemSettingPart {
    Setting: TextSetting;
    State: TextState;
    static list: Array<TextSettingPart> = [];

    get _type() {
        return this.Setting._type
    }

    constructor(Setting: TextSetting, State: TextState, parent: GraphSelfPart) {
        super(Setting, State, parent);
        this.Setting = Setting;
        this.State = State;
        this._parent = parent;
        TextSettingPart.list.push(this)
    }

    static emptyRect(_id: id, parent: GraphSelfPart) {
        let _points = [] as PointObject[];
        let setting = textSettingTemplate(_id, 'rect', _points);
        let state = textStateTemplate();
        return new TextSettingPart(setting, state, parent)
    }

    deepCloneSelf(): TextSettingPart {
        let setting = deepClone(this.Setting);
        let state = deepClone(this.State);
        return new TextSettingPart(setting, state, this.parent)
    }
}

export class NoteSettingPart extends SettingPart {
    Setting: NoteSetting;
    State: NoteState;
    static list: Array<NoteSettingPart> = [];

    constructor(Setting: NoteSetting, State: NoteState) {
        super(Setting, State);
        this.Setting = Setting;
        this.State = State;
        NoteSettingPart.list.push(this)
    }

    static emptyNoteSetting(_label: string, _title: string, _content: string, _parent: id, commitToVuex?: boolean) {
        let _id = getIndex();
        commitToVuex === undefined && (commitToVuex = true);
        let setting = noteSettingTemplate(_id, _label, _title, _content, _parent);
        let state = noteStateTemplate();
        let note = new NoteSettingPart(setting, state);
        commitToVuex && dispatchNoteInDocPush({note});
        return note
    }
}

export class DocumentConfigure extends ItemSettingPart {
    State: DocumentState;
    Setting: DocumentSetting;
    _parent: null

    protected constructor(setting: DocumentSetting, state: DocumentState) {
        super(setting, state, null);
        this.State = state;
        this.Setting = setting;
        this._parent = null
    }
}

export class GraphConf extends DocumentConfigure {
    State: GraphState;
    Setting: GraphSetting;

    protected constructor(setting: GraphSetting, state: GraphState) {
        super(setting, state);
        this.State = state;
        this.Setting = setting;
        this._parent = null
    }

    static emptyGraphConf(_id: id) {
        let setting = graphSettingTemplate(_id)
        let state = graphStateTemplate()
        return new GraphConf(setting, state)
    }

    static resolveBackend(setting: GraphSetting) {
        let state = graphStateTemplate()
        return new GraphConf(setting, state)
    }
}

export class PaperConf extends DocumentConfigure {
    State: PaperState;
    Setting: PaperSetting;

    protected constructor(setting: PaperSetting, state: PaperState) {
        super(setting, state);
        this.State = state;
        this.Setting = setting;
        this._parent = null
    }

    static emptyPaperConf(_id: id) {
        let setting = paperSettingTemplate(_id)
        let state = graphStateTemplate()
        return new PaperConf(setting, state)
    }
}

export abstract class DocumentSelfPart {
    protected MetaData: DocumentMetaData;
    Content: DocumentContent;
    Conf: DocumentConfigure;
    treeNode: TreeNodeDoc;

    // prop
    get _id() {
        return this.Conf._id
    }

    get _name() {
        return this.nodeSelf.Setting._name
    }

    get isSelf() {
        return store.state.dataManager.nodeManager[this._id].isSelf
    }

    get parent() {
        return this.treeNode.parent
            ? this.treeNode.parent.boundObject
            : null
    }

    //node
    get nodesAll() {
        return this.Content.nodes
    }

    get nodes() {
        return this.nodesAll.filter(item => !item.isDeleted)
    }

    get nodesWithoutSelf() {
        return this.nodes.filter(node => node._id !== this._id)
    }

    get nodeSelf() {
        return this.nodes.filter(node => node._id === this._id)[0]
    }

    get nodesAllSubDoc() {
        // root Graph自己的节点显示
        let result = this.nodes as NodeSettingPart[];
        this.docsChildren.map(graph => {
            // 其他Graph用不包含baseNode的list
            result.push(...graph.nodesWithoutSelf)
        });
        return result
    }

    //media
    get mediasAll() {
        return this.Content.medias
    }

    get medias() {
        return this.mediasAll.filter(item => !item.isDeleted)
    }

    get nodesVisual() {
        let result: VisNodeSettingPart[] = [];
        result.push(...this.nodes);
        result.push(...this.medias);
        return result
    }

    //link
    get linksAll() {
        return this.Content.links
    }

    get links() {
        return this.linksAll.filter(link => link.isBound && !link.isDeleted)
    }

    get linksAllSubDoc() {
        let result: LinkSettingPart[] = this.links;
        this.docsChildren.map(graph => {
            result.push(...graph.links)
        });
        return result
    }

    //text
    get textsAll() {
        return this.Content.texts
    }

    get texts() {
        return this.textsAll.filter(item => !item.isDeleted)
    }

    //所有内容 包含子专题的节点和关系
    get itemsAllSubDoc() {
        let result = [] as GraphItemSettingPart[];
        result.push(...this.nodesAllSubDoc, ...this.linksAllSubDoc, ...this.medias, ...this.texts);
        return result
    }

    //doc
    get docsRootList() {
        return this.treeNode.parentNodeList
    }

    get docRoot() {
        return this.treeNode.rootNode.boundObject
    }

    get docsChildrenAll() {
        // 所有孩子doc
        return this.treeNode.childrenAll.map(node => node.boundObject)
    }

    get docsChildren() {
        return this.treeNode.childrenActive.map(node => node.boundObject)
    }

    get dataQueryObject() {
        return this.Conf.queryObject
    }

    get dataBackendDocument() {
        let Content: Record<string, GraphItemSetting[]> = {};
        Object.entries(this.Content).map(([key, items]) => {
            Content[key] = items.filter((item: GraphItemSettingPart) => !item.isDeleted).map((item: GraphItemSettingPart) => item.compress)
        });
        return {
            Content,
            Conf: this.Conf.Setting,
        } as BackendGraph
    }

    get dataDraftObject(): DocumentDraft {
        return {
            Query: this.dataQueryObject,
            Name: this._name,
            VersionId: this.MetaData.draftId,
            Content: this.dataBackendDocument
        }
    }

    get allItems(): GraphSubItemSettingPart[] {
        let {nodes, links, medias, texts} = this;
        let result: GraphSubItemSettingPart[];
        result = [];
        return result.concat(nodes).concat(links).concat(medias).concat(texts)
    }

    get isRemote() {
        return this.Conf.isRemote
    }

    get isRoot() {
        return this.treeNode.isRoot
    }

    set isRoot(value: boolean) {
        this.treeNode.isRoot = value
    }

    protected constructor(Content: DocumentContent, Conf: DocumentConfigure, parent: DocumentSelfPart | null, meta: DocumentMetaData) {
        this.Conf = Conf;
        this.Content = Content;
        this.MetaData = meta;
        this.treeNode = new TreeNodeDoc(this, parent)
    }

    updateStateUpdate() {
        this.Conf.State.isSaved = true
    }

    updateStateSave() {
        this.updateStateUpdate();
    }

    getItemListByName(name: GraphTypeS | GraphItemType): GraphSubItemSettingPart[] {
        let itemList;
        if (isGraphType(name)) {
            name === 'media'
                ? itemList = this.Content.medias
                : name === 'link'
                ? itemList = this.Content.links
                : name === 'text'
                    ? itemList = this.Content.texts
                    : itemList = this.Content.nodes //  name === 'document | 'node
        } else {
            itemList = this.Content[name]
        }
        return itemList
    }

    getItemById(payload: { _id: id, _type: GraphItemType }) {
        let {_id, _type} = payload;
        let list = this.getItemListByName(_type);
        return list.filter(item => item._id === _id)[0]
    }

    getVisNodeById(payload: { _id: id, _type: 'node' | 'document' | 'media' }) {
        let {_id, _type} = payload;
        let list = this.getItemListByName(_type);
        return list.filter(item => item._id === _id)[0] as VisNodeSettingPart
    }

    checkExistByIdType(payload: { _id: id, _type: GraphItemType }) {
        let {_id, _type} = payload;
        let itemList = this.getItemListByName(_type);
        return findItem(itemList, _id, _type).length > 0
    }

    checkExistByItem(item: GraphItemSettingPart) {
        return this.checkExistByIdType(item)
    }

    getItemByState(name: GraphTypeS | GraphItemType, state: BaseStateKey) {
        let list = this.getItemListByName(name);
        return list.filter(item => item.State[state])
    }

    deepCloneSelf() {

    }

    deleteItem(payload: { _id: id, _type: GraphItemType }, snackBarOn: boolean = true) {
        let {_id, _type} = payload;
        // 不删除与专题相同的内容
        if (_id !== this._id) {
            let item = this.getItemById(payload);
            item.updateState('isDeleted', true);
            if (_type === 'document') {
                let graph = this.docsChildrenAll.filter(item => item._id === _id)[0];
                graph && graph.Conf.updateState('isDeleted', true)
            }
            if (snackBarOn) {
                let payloadSnack = {
                    timeout: 3000,
                    color: 'warning',
                    content: '删除了' + _type,
                    buttonText: '撤销',
                    action: this.rollBackDelete(item),
                    actionName: 'deleteItemFromGraph',
                    once: false
                } as SnackBarStatePayload;
                commitSnackbarOn(payloadSnack)
            }
        } else {
            //
        }
    }

    rollBackDelete(payload: { _id: id, _type: GraphItemType }) {
        return () => {
            let {_id, _type} = payload;
            let item = this.getItemById(payload);
            item.updateState('isDeleted', false);
            if (_type === 'document') {
                let graph = this.docsChildrenAll.filter(item => item._id === _id)[0];
                graph && graph.Conf.updateState('isDeleted', false)
            }
            commitSnackbarOff()
        }
    }
}

export class GraphSelfPart extends DocumentSelfPart {
    static list: Array<GraphSelfPart> = [];
    static baseList: Array<BackendGraphWithNode> = []; // 原始数据
    // 图形尺寸
    Conf: GraphConf;
    _rect: RectObject;

    get isExplode() {
        return this.Conf.State.isExplode
    }

    get rect() {
        return this._rect
    }

    protected constructor(graph: DocumentContent, conf: GraphConf, parent: DocumentSelfPart | null, meta: DocumentMetaData) {
        // 自动保存id
        super(graph, conf, parent, meta);
        // 设置
        this.Conf = conf;
        // Graph
        this.Content = graph;
        this._rect = {width: 600, height: 400};
        // 记录所有实例
        GraphSelfPart.list.push(this);
        // baseNode部分
        if (this.nodeSelf === undefined) {
            let {_id, _type, _label} = conf;
            let node = NodeSettingPart.emptyNodeSetting(_id, _type, _label, 'NewDoc' + _id, '', this);
            this.Content.nodes.push(node);
        } else {
            // 检查完成
        }
    }

    static emptyGraphSelfPart(_id: id, parent: DocumentSelfPart | null, commitToVuex: boolean = true) {
        let graphContent = emptyContent();
        let setting = GraphConf.emptyGraphConf(_id);
        let meta = {
            isTemporary: false,
            isRemoteModel: false,
        } as DocumentMetaData
        let graph = new GraphSelfPart(graphContent, setting, parent, meta);
        let nodeQuery = {id: _id, type: 'document', pLabel: 'DocGraph'} as DocumentQuery;
        let info = NodeInfoPart.emptyNodeInfoPart(nodeQuery, commitToVuex);
        let payload = {graph, info};
        commitToVuex && commitDocumentAdd({document: graph, strict: false});
        return payload
    }

    static resolveFromBackEnd(data: BackendGraphWithNode, parent: GraphSelfPart | null, commitToVuex: boolean = true) {
        GraphSelfPart.baseList.push(data);
        let setting = GraphConf.resolveBackend(data.Conf);
        let graphContent = emptyContent();
        let meta = {
            isTemporary: false,
            isRemoteModel: true
        }
        let graph = new GraphSelfPart(graphContent, setting, parent, meta);
        let info = NodeInfoPart.resolveBackend(data.Base, commitToVuex);
        let {nodes, links, medias, texts} = data.Content;
        graph.Content.nodes = nodes.map(setting => NodeSettingPart.resolveBackend(setting, graph));
        graph.Content.medias = medias.map(setting => MediaSettingPart.resolveBackend(setting, graph));
        graph.Content.links = links.map(setting => LinkSettingPart.resolveBackend(setting, graph))
            .filter(link => link.Setting._start && link.Setting._end);
        graph.Content.texts = texts.map(setting => new TextSettingPart(setting, textStateTemplate(), graph));
        commitToVuex && commitDocumentAdd({document: graph, strict: false});
        return {graph, info}
    }

    static collectNewGraph(payload: GraphNewObject, items: GraphItemSettingPart[], deleteSource: boolean = true) {
        let {_id, parent, commitToVuex} = payload;
        let newGraph = GraphSelfPart.emptyGraphSelfPart(_id, parent, commitToVuex).graph;
        newGraph.collectItems(items, deleteSource);
        return newGraph
    }

    addItems(items: GraphItemSettingPart[]) {
        items.filter(item => !this.checkExistByItem(item)).map(item => {
            item.State.isAdd = true;
            // 额外处理专题
            if (item._type === 'document') {
                let graph = store.state.dataManager.graphManager[item._id] as GraphSelfPart;
                graph && this.treeNode._addNewNode([graph.treeNode])
                // 额外处理link
            } else if (isLinkSetting(item)) {
                let _start = this.getVisNodeById(item._start.Setting);
                if (_start === undefined) {
                    let newStart = item._start.deepCloneSelf();
                    this.pushItem(newStart);
                    item._start = newStart
                } else {
                    item._start = _start
                }
                let _end = this.getVisNodeById(item._end.Setting);
                if (_end === undefined) {
                    //如果没有就复制一个
                    let newEnd = item._end.deepCloneSelf();
                    this.pushItem(newEnd);
                    item._end = newEnd
                } else {
                    //如果有就直接绑定
                    item._end = _end
                }
            }
            this.pushItem(item);
        })
    }

    protected pushItem(item: GraphItemSettingPart) {
        item._parent = this;
        isMediaSetting(item)
            ? this.Content.medias.push(item)
            : isNodeSetting(item)
            ? this.Content.nodes.push(item)
            : isTextSetting(item)
                ? this.Content.texts.push(item)
                : isLinkSetting(item) && this.Content.links.push(item)
    }

    explode(value?: boolean) {
        this.Conf.updateState('isExplode', value)
    }

    addEmptyNode(_type: 'node' | 'document', _label?: string, commitToVuex: boolean = true) {
        _label || (_label = 'BaseNode');
        let _id = getIndex();
        let nodeQuery = {id: _id, type: _type, pLabel: _label} as NodeQuery;
        let info = NodeInfoPart.emptyNodeInfoPart(nodeQuery, commitToVuex);
        let setting = NodeSettingPart.emptyNodeSetting(_id, _type, _label, 'NewNode' + _id, '', this);
        this.addItems([setting]);
        return {setting, info}
    }

    addEmptyLink(_start: VisNodeSettingPart, _end: VisNodeSettingPart, _label?: string, commitToVuex: boolean = true) {
        _label || (_label = 'Default');
        let _id = getIndex();
        // info
        let info = LinkInfoPart.emptyLinkInfo(_id, _label, _start, _end, commitToVuex);
        // setting
        let setting = LinkSettingPart.emptyLinkSetting(_id, _label, _start, _end, this);
        this.addItems([setting]);
        return {setting, info};
    }

    addEmptyGraph(commitToVuex: boolean = true) {
        let _id = getIndex();
        let {graph, info} = GraphSelfPart.emptyGraphSelfPart(_id, this, commitToVuex);
        let payload = {graph, info};
        console.log(graph.nodeSelf === graph.nodeSelf.deepCloneSelf())
        this.addItems([graph.nodeSelf.deepCloneSelf()]);
        return payload
    }

    collectItems(items: GraphItemSettingPart[], deleteSource: boolean) {
        items.map(item => {
            //复制在前 要不然删除了
            let newItem = item.deepCloneSelf();
            this.addItems([newItem]);
            deleteSource && item.parent.deleteItem(item, false);
        })
    }
}
