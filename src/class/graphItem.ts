import {
    crucialRegex,
    currentTime,
    deepClone,
    emptyContent,
    findItem,
    frontendIdRegex,
    getCookie,
    getIndex,
    getIsSelf,
    getSrc,
    itemEqual,
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
    textSettingTemplate,
    textStateTemplate,
} from "@/utils/template";
import {
    isGraphType,
    isLinkSetting,
    isMediaInfoPart,
    isMediaSetting,
    isNodeSetting,
    isSvgSetting
} from "@/utils/typeCheck";
import {fieldDefaultValue, nodeLabelToProp} from "@/utils/fieldResolve";
import {commitDocumentAdd, commitInfoAdd, commitSnackbarOn} from "@/store/modules/_mutations";
import {FragmentCtrl, FragmentInfo} from "@/interface/interfaceUser";
import store from '@/store'
import {getManager} from "@/store/modules/dataManager";
import {BackendMediaInfoPart} from "@/api/subgraph/media";
import {BackendNodeInfoPart} from "@/api/subgraph/node";
import {BackendGraph, BackendGraphWithNode} from "@/api/document/document";
import {BackendLinkInfoPart} from "@/api/subgraph/link";
import {DocumentDraft, Draft, draftUpdate} from "@/api/subgraph/commonApi";
import {dispatchNoteInDocPush} from "@/store/modules/_dispatch";

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

    get isUserMade() {
        return this.Ctrl.CreateType === 'USER'
    }

    get isSelf() {
        return getIsSelf(this.Ctrl)
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

    protected constructor(info: BaseInfo, ctrl: BaseCtrl, remoteNotFound: boolean, draftId?: number) {
        this.Info = info;
        this.Ctrl = ctrl;
        this.State = {
            isEdit: false,
            remoteNotFound: remoteNotFound,
            draftId
        }
    }

    changeId(newId: id) {
        //先同步 再改info id
        this.synchronizationSource("_id", newId);
        this.Info.id = newId;
        this.State.isEdit = false;
    }

    synchronizationSource(prop: string, value: any) {
        //
    }

    // info修改值
    updateValue(prop: string, newValue: any, doItPassive?: boolean) {
        if (prop in this.Info) {
            if (this.Info[prop] !== newValue || doItPassive) {
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

    protected constructor(info: BaseNodeInfo, ctrl: BaseNodeCtrl, isDeleted: boolean) {
        super(info, ctrl, isDeleted);
        this.Info = info;
        this.Ctrl = ctrl;
    }

    static emptyNodeInfoPart(payload: NodeQuery, commit: boolean = true, isDeleted: boolean = false) {
        let {id, type, pLabel} = payload;
        let item = new NodeInfoPart(nodeInfoTemplate(id, type, pLabel), nodeCtrlTemplate(), isDeleted);
        commit && commitInfoAdd({item, strict: false});
        return item
    }

    static resolveBackend(payload: BackendNodeInfoPart, commit: boolean = true) {
        let {Info, Ctrl} = payload;
        let item = new NodeInfoPart(Info, Ctrl, false);
        commit && commitInfoAdd({item, strict: true});
        item.synchronizationAll();
        item.State.isEdit = false;
        return item
    }

    changePrimaryLabel(newLabel: string) {
        let StandardProps = this.Info.StandardProps;
        Object.entries(nodeLabelToProp(newLabel)).map(([prop, value]) => {
            let {resolve, type} = value;
            Object.keys(StandardProps).indexOf(prop) === -1
                ? (StandardProps[prop] = {resolve, type, value: fieldDefaultValue[type]})
                : (StandardProps[prop] = deepClone(StandardProps[prop]));
        });
        Vue.set(this.Info, "StandardProps", StandardProps);
        this.Info.PrimaryLabel = newLabel;
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
        this.allSettingItem.map(node =>
            node.updateCrucialProp(prop, value)
        );
        this.State.isEdit = true
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

    get _type() {
        return this.Info.type
    }

    get allSettingItem() {
        let linkList = LinkSettingPart.list;
        return linkList.filter(link => link._id === this._id)
    }

    protected constructor(info: BaseLinkInfo, ctrl: BaseLinkCtrl, isDeleted: boolean) {
        super(info, ctrl, isDeleted);
        this.Info = info;
        this.Ctrl = ctrl;
    }

    static emptyLinkInfo(_id: id, _label: string, _start: VisNodeSettingPart, _end: VisNodeSettingPart, commit: boolean = true, isDeleted: boolean = true) {
        let item = new LinkInfoPart(linkInfoTemplate(_id, _label), linkCtrlTemplate(_start, _end), isDeleted);
        commit && commitInfoAdd({item, strict: false});
        return item
    }

    static resolveBackend(link: BackendLinkInfoPart, commit: boolean = true) {
        let {Info, Ctrl} = link;
        let ctrl = {
            ...Ctrl,
            Start: LinkSettingPart.visualNodeList.filter(node => node._id === Ctrl.Start.id)[0],
            End: LinkSettingPart.visualNodeList.filter(node => node._id === Ctrl.End.id)[0]
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
            if (start && !itemEqual(this.Ctrl.Start.Setting, start.Setting)) {
                Vue.set(this.Ctrl, "Start", start);
                this.synchronizationSource("_start", start);
            }

            if (end && !itemEqual(this.Ctrl.End.Setting, end.Setting)) {
                Vue.set(this.Ctrl, "End", end);
                this.synchronizationSource("_end", end);
            }
        } else {
            // "远端关系不能改变了"
        }
    }

    synchronizationSource(prop: string, value: any) {
        crucialRegex.test(prop) &&
        this.allSettingItem.map(link =>
            link.updateCrucialProp(prop, value)
        );
        this.State.isEdit = true
    }

    synchronizationAll() {
        this.allSettingItem.map(link => {
            link.updateCrucialProp("_start", this.Ctrl.Start);
            link.updateCrucialProp("_end", this.Ctrl.End);
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
    Info: BaseMediaInfo;
    Ctrl: BaseMediaCtrl;

    get allSettingItem() {
        let list = MediaSettingPart.list;
        return list.filter(media => media._id === this._id)
    }

    get _type() {
        return this.Info.type
    }

    get statusColor() {
        return MediaInfoPart.statusDict[this.status]
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

    protected constructor(info: BaseMediaInfo, ctrl: BaseMediaCtrl, isDeleted: boolean, file?: File | Blob) {
        super(info, ctrl, isDeleted);
        this.file = file;
        this.status = 'new';
        this.Info = info;
        this.Ctrl = ctrl;
        this.currentUrl = file
            ? URL.createObjectURL(file)
            : ''
    }

    static emptyMediaInfo(_id: id, file?: File, commit: boolean = true, isDeleted: boolean = false) {
        let item = new MediaInfoPart(mediaInfoTemplate(_id, file), mediaCtrlTemplate(file), isDeleted, file);
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

    constructor(info: FragmentInfo, ctrl: FragmentCtrl, isDeleted: boolean) {
        super(info, ctrl, isDeleted);
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

    static newFragment(_label: 'image' | 'text') {

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
        Vue.set(this.State, prop, value);
    }

    updateSetting(propGroup: string, prop: string, value: any) {
        Vue.set(this.Setting[propGroup], prop, value);
    }

    updateCrucialProp(prop: string, value: any) {
        crucialRegex.test(prop) && (Vue.set(this.Setting, prop, value));
    }

    protected constructor(Setting: Setting, State: BaseState) {
        this.Setting = Setting;
        this.State = State;
    }
}

export class SubTagSettingPart extends SettingPart {

}

export abstract class ItemSettingPart extends SettingPart {
    Setting: Setting;
    State: BaseState;
    parent: DocumentSelfPart | null;

    protected constructor(Setting: Setting, State: BaseState, parent: DocumentSelfPart | null) {
        super(Setting, State);
        this.Setting = Setting;
        this.State = State;
        this.parent = parent;
    }

    findRoot() {
        if (!this.parent) {
            return [];
        } else {
            let result: Array<DocumentSelfPart>;
            this.parent
                ? (result = this.parent.rootList.concat(this.parent))
                : (result = [this.parent]);
            return result;
        }
    }

    get compress() {
        return this.Setting
    }
}

export class GraphItemSettingPart extends ItemSettingPart {
    Setting: GraphItemSetting;
    State: GraphItemState;
    parent: GraphSelfPart;

    constructor(Setting: GraphItemSetting, State: GraphItemState, parent: GraphSelfPart) {
        super(Setting, State, parent);
        this.Setting = Setting;
        this.State = State;
        this.parent = parent;
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
}

export class NodeSettingPart extends GraphItemSettingPart {
    Setting: NodeSetting;
    State: NodeState;
    parent: GraphSelfPart;
    static list: Array<NodeSettingPart> = [];

    get _type() {
        return this.Setting._type
    }

    protected constructor(Setting: NodeSetting, State: NodeState, parent: GraphSelfPart) {
        super(Setting, State, parent);
        this.Setting = Setting;
        this.State = State;
        this.parent = parent;
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

    static resolveBackend(setting: NodeSetting, parent: GraphSelfPart) {
        let state = nodeStateTemplate();
        return new NodeSettingPart(setting, state, parent)
    }

    deepCloneSelf() {
        let setting = deepClone(this.Setting);
        let state = deepClone(this.State);
        return new NodeSettingPart(setting, state, this.parent)
    }

    select(value?: boolean) {
        super.select(value);
    }
}

export class MediaSettingPart extends GraphItemSettingPart {
    Setting: MediaSetting;
    State: NodeState;
    parent: GraphSelfPart;
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
        this.parent = parent;
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
}

export class LinkSettingPart extends GraphItemSettingPart {
    Setting: LinkSetting;
    State: LinkState;
    parent: GraphSelfPart;
    static list: Array<LinkSettingPart> = [];

    static get visualNodeList() {
        let result: VisNodeSettingPart[] = [];
        result.push(...NodeSettingPart.list);
        result.push(...MediaSettingPart.list);
        return result
    }

    get _type() {
        return this.Setting._type
    }

    get compress() {
        return {
            ...this.Setting,
            _start: this.Setting._start.queryObject as VisNodeQuery,
            _end: this.Setting._end.queryObject as VisNodeQuery
        }
    }

    get isDeleted() {
        let {_start, _end} = this.Setting;
        return this.State.isDeleted && _start.isDeleted && _end.isDeleted
    }

    protected constructor(Setting: LinkSetting, State: LinkState, parent: GraphSelfPart) {
        super(Setting, State, parent);
        this.Setting = Setting;
        this.State = State;
        this.parent = parent;
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
            _start: parent.visualNodeList.filter(node => node._id === linkSetting._start.id)[0],
            _end: parent.visualNodeList.filter(node => node._id === linkSetting._end.id)[0]
        } as LinkSetting;
        let state = linkStateTemplate();
        return new LinkSettingPart(setting, state, parent);
    }
}

export class TextSettingPart extends GraphItemSettingPart {
    Setting: TextSetting;
    State: TextState;
    parent: GraphSelfPart;
    static list: Array<TextSettingPart> = [];

    get _type() {
        return this.Setting._type
    }

    constructor(Setting: TextSetting, State: TextState, parent: GraphSelfPart) {
        super(Setting, State, parent);
        this.Setting = Setting;
        this.State = State;
        this.parent = parent;
        TextSettingPart.list.push(this)
    }

    static emptyRect(_id: id, parent: GraphSelfPart) {
        let _points = [] as PointObject[];
        let setting = textSettingTemplate(_id, 'rect', _points);
        let state = textStateTemplate();
        return new TextSettingPart(setting, state, parent)
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

export class GraphConf extends ItemSettingPart {
    Setting: GraphSetting;
    State: GraphState;
    parent: DocumentSelfPart | null;

    protected constructor(
        Setting: GraphSetting,
        State: GraphState,
        parent: DocumentSelfPart | null
    ) {
        super(Setting, State, parent);
        this.Setting = Setting;
        this.State = State;
        this.parent = parent;
    }

    static emptyGraphSetting(_id: id, parent: DocumentSelfPart | null) {
        let setting = graphSettingTemplate(_id);
        let state = graphStateTemplate();
        return new GraphConf(setting, state, parent);
    }

    static resolveBackend(conf: GraphSetting, parent: DocumentSelfPart | null) {
        let state = graphStateTemplate();
        return new GraphConf(conf, graphStateTemplate(), parent);
    }
}

export abstract class DocumentSelfPart {
    static list: Array<DocumentSelfPart> = [];
    static baseList: Array<BackendGraphWithNode> = [];
    DocumentData: DocumentData;
    Content: DocumentContent;
    Conf: ItemSettingPart;

    get _id() {
        return this.Conf._id
    }

    get _name() {
        return this.Conf.Setting._name
    }

    set _id(newId) {
        this.Conf._id = newId
    }

    get rootList() {
        return this.Conf.findRoot()
    }

    get root(): DocumentSelfPart | null {
        return this.rootList ? this.rootList[0] : null;
    }

    get isSelf() {
        return store.state.dataManager.nodeManager[this._id].isSelf
    }

    get queryObject() {
        return {
            id: this._id,
            type: this.Conf._type,
            pLabel: this.Conf._label
        } as QueryObject
    }

    get backendDocument() {
        let Content: Record<string, GraphItemSetting[]> = {};
        Object.entries(this.Content).map(([key, items]) => {
            Content[key] = items.filter((item: GraphItemSettingPart) =>
                isLinkSetting(item)
                    ? !item.State.isDeleted
                    : !item.State.isDeleted)
                .map((item: GraphItemSettingPart) => item.compress)
        });
        return {
            Content,
            Conf: this.Conf.Setting,
        } as BackendGraph
    }

    get draftObject(): DocumentDraft {
        return {
            Query: this.queryObject,
            Name: this._name,
            VersionId: this.DocumentData.draftId,
            Content: this.backendDocument
        }
    }

    protected constructor(Content: DocumentContent, Conf: ItemSettingPart, isRemote: boolean, draftId?: number) {
        this.Conf = Conf;
        this.Content = Content;
        this.DocumentData = {
            draftId,
            isRemote,
            lastSave: currentTime()
        } as DocumentData
    }

    updateStateUpdate() {
        Vue.set(this.DocumentData, 'lastSave', currentTime())
    }

    updateStateSave() {
        this.updateStateUpdate();
        Vue.set(this.DocumentData, 'isRemote', true)
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

    getSubItemById(_id: id, _type: GraphItemType) {
        let list = this.getItemListByName(_type);
        return list.filter(item => item._id === _id)[0]
    }

    draftSave() {

    }
}

export class GraphSelfPart extends DocumentSelfPart {
    static list: Array<GraphSelfPart> = [];
    static baseList: Array<BackendGraphWithNode> = []; // 原始数据
    Content: DocumentContent;
    Conf: GraphConf;
    // 图形尺寸
    rect: RectObject;
    protected _baseNode: NodeSettingPart;
    get baseNode() {
        return this._baseNode
    }

    get rootList() {
        return this.Conf.findRoot()
    }

    get root(): DocumentSelfPart | null {
        return this.rootList ? this.rootList[0] : null;
    }

    get isExplode() {
        return this.Conf.State.isExplode
    }

    set isExplode(value) {
        this.Conf.State.isExplode = value
    }

    get visualNodeList() {
        let result: VisNodeSettingPart[] = [];
        result.push(...this.Content.nodes);
        result.push(...this.Content.medias);
        return result
    }

    protected constructor(
        graph: DocumentContent,
        conf: GraphConf,
        isRemote: boolean,
        baseNode?: NodeSetting,
        draftId?: number,
        rect: RectObject = {width: 600, height: 400}
    ) {
        // 自动保存id
        super(graph, conf, isRemote, draftId);
        // 设置
        this.Conf = conf;
        // Graph
        this.Content = graph;
        // rect默认值
        this.rect = rect;
        // 记录所有实例
        GraphSelfPart.list.push(this);
        // baseNode部分
        if (!baseNode) {
            let {_id, _type, _label} = conf;
            this._baseNode = NodeSettingPart.emptyNodeSetting(_id, _type, _label, 'NewDoc' + _id, '', this)
        } else {
            this._baseNode = NodeSettingPart.resolveBackend(baseNode, this)
        }
    }

    static emptyGraphSelfPart(_id: id, parent: DocumentSelfPart | null, commitToVuex: boolean = true) {
        let graphContent = emptyContent();
        let setting = GraphConf.emptyGraphSetting(_id, parent);
        let graph = new GraphSelfPart(graphContent, setting, false);
        graph.addItems([graph.baseNode.deepCloneSelf()]);
        let nodeQuery = {id: _id, type: 'document', pLabel: 'DocGraph'} as DocumentQuery;
        let info = NodeInfoPart.emptyNodeInfoPart(nodeQuery, commitToVuex);
        let payload = {graph, info};
        commitToVuex && commitDocumentAdd({document: graph, strict: false});
        return payload
    }

    static resolveFromBackEnd(data: BackendGraphWithNode, parent: GraphSelfPart | null, commitToVuex: boolean = true) {
        GraphSelfPart.baseList.push(data);
        let setting = GraphConf.resolveBackend(data.Conf, parent);
        let graphContent = emptyContent();
        let baseNodeSetting = data.Content.nodes.filter(setting => setting._id === data.Conf._id)[0];
        let graph = new GraphSelfPart(graphContent, setting, true, baseNodeSetting);
        let info = NodeInfoPart.resolveBackend(data.Base, commitToVuex);
        let {nodes, links, medias, texts} = data.Content;
        graph.Content.nodes = nodes.map(setting => NodeSettingPart.resolveBackend(setting, graph));
        graph.Content.medias = medias.map(setting => MediaSettingPart.resolveBackend(setting, graph));
        graph.Content.links = links.map(setting => LinkSettingPart.resolveBackend(setting, graph));
        graph.Content.texts = texts.map(setting => new TextSettingPart(setting, textStateTemplate(), graph));
        commitToVuex && commitDocumentAdd({document: graph, strict: false});
        return {graph, info}
    }

    getChildDocument() {
        let result: GraphSelfPart[] = [];
        GraphSelfPart.list.map(graph => {
            let root = graph.rootList;
            if (root && root.map(doc => doc._id).includes(this._id)) {
                result.push(graph)
            }
        });
        return result
    }

    allItems(): GraphSubItemSettingPart[] {
        let {nodes, links, medias, texts} = this.Content;
        // @ts-ignore
        return nodes.concat(links).concat(medias).concat(texts)
    }

    addItems(items: GraphItemSettingPart[]) {
        items.filter(item => !this.checkExistByItem(item)).map(item => {
            item.State.isAdd = true;
            this.pushItem(item)
        })
    }

    checkExist(_id: id, _type: GraphItemType) {
        let itemList = this.getItemListByName(_type);
        return findItem(itemList, _id, _type).length > 0
    }

    checkExistByItem(item: GraphItemSettingPart) {
        return this.checkExist(item._id, item._type)
    }

    protected pushItem(item: GraphItemSettingPart) {
        item.parent = this;
        isMediaSetting(item)
            ? this.Content.medias.push(item)
            : isNodeSetting(item)
            ? this.Content.nodes.push(item)
            : isSvgSetting(item)
                ? this.Content.texts.push(item)
                : isLinkSetting(item) && this.Content.links.push(item)
    }

    getItemByState(name: GraphTypeS | GraphItemType, state: BaseStateKey) {
        let list = this.getItemListByName(name);
        return list.filter(item => item.State[state])
    }

    explode(value: boolean = true) {
        this.Conf.updateState('isExplode', value)
    }

    selectAll(state: 'isSelected', value: boolean) {
        this.allItems().filter(item => item.State.isSelected !== value)
            .map(item => Vue.set(item.State, state, value));
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
        let info = LinkInfoPart.emptyLinkInfo(_id, _label, _start, _end);
        // setting
        let setting = LinkSettingPart.emptyLinkSetting(_id, _label, _start, _end, this);
        this.addItems([setting]);
        return {setting, info};
    }

    addSubGraph(commitToVuex: boolean = true) {
        let _id = getIndex();
        let {graph, info} = GraphSelfPart.emptyGraphSelfPart(_id, this, commitToVuex);
        let payload = {graph, info};
        this.addItems([graph.baseNode.deepCloneSelf()]);
        return payload
    }

    removeFromParent() {
        if (this.Conf.parent) {
            //@ts-ignore
            let node: NodeSettingPart = this.Conf.parent.getSubItemById(this._id, 'document');
            let index = this.Conf.parent.Content.nodes.indexOf(node);
            this.Conf.parent.Content.nodes.splice(index, 1)
        }
        Vue.set(this.Conf, 'parent', null)
    }

    addToDocument(target: GraphSelfPart) {
        target.addItems([this.baseNode.deepCloneSelf()]);
        Vue.set(this.Conf, 'parent', target)
    }
}
