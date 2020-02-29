import {
    crucialRegex,
    currentTime,
    deepClone,
    emptyContent,
    findItem,
    getCookie,
    getIndex,
    getIsSelf,
    itemEqual,
    localIdRegex,
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
    userConcernTemplate,
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
import {BackendGraph, BackendLinkInfoPart, BackendMediaInfoPart, BackendNodeInfoPart} from "@/api/commonSource";
import {commitDocumentAdd, commitInfoAdd, commitNoteInDocAdd, commitUserConcernAdd} from "@/store/modules/_mutations";
import {FragmentCtrl, FragmentInfo} from "@/interface/interfaceUser";

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

    get isSaved() {
        // 是否保存了 草稿或者是模型
        return !localIdRegex.test(this._id.toString())
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

    protected constructor(info: BaseInfo, ctrl: BaseCtrl, isRemote: boolean, draftId?: number) {
        this.Info = info;
        this.Ctrl = ctrl;
        this.State = {
            isEdit: false,
            isRemote,
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

    draftSave() {

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

    protected constructor(info: BaseNodeInfo, ctrl: BaseNodeCtrl, isRemote: boolean) {
        super(info, ctrl, isRemote);
        this.Info = info;
        this.Ctrl = ctrl;
    }

    static emptyNodeInfoPart(payload: NodeQuery, commit: boolean = true) {
        let {id, type, pLabel} = payload;
        let item = new NodeInfoPart(nodeInfoTemplate(id, type, pLabel), nodeCtrlTemplate(), false);
        commit && commitInfoAdd({item, strict: false});
        return item
    }

    static resolveBackend(payload: BackendNodeInfoPart, commit: boolean = true) {
        let {Info, Ctrl} = payload;
        let item = new NodeInfoPart(Info, Ctrl, true);
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

    protected constructor(info: BaseLinkInfo, ctrl: BaseLinkCtrl, isRemote: boolean) {
        super(info, ctrl, isRemote);
        this.Info = info;
        this.Ctrl = ctrl;
    }

    static emptyLinkInfo(_id: id, _label: string, _start: VisNodeSettingPart, _end: VisNodeSettingPart, commit: boolean = true) {
        let item = new LinkInfoPart(linkInfoTemplate(_id, _label), linkCtrlTemplate(_start, _end), false);
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
        let item = new LinkInfoPart(Info, ctrl, true);
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
        if (!this.State.isRemote) {
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

    static statusDict: Record<MediaStatus, string> = {
        new: 'blue',
        error: 'red',
        success: 'green',
        uploading: 'purple',
        warning: 'yellow'
    };

    protected constructor(info: BaseMediaInfo, ctrl: BaseMediaCtrl, isRemote: boolean, file?: File | Blob) {
        super(info, ctrl, isRemote);
        this.file = file;
        this.status = 'new';
        this.Info = info;
        this.Ctrl = ctrl;
        this.State.isRemote = isRemote;
        this.currentUrl = file
            ? URL.createObjectURL(file)
            : ''
    }

    static emptyMediaInfo(_id: id, file: File, commit: boolean = true) {
        let item = new MediaInfoPart(mediaInfoTemplate(_id, file), mediaCtrlTemplate(file), false, file);
        commit && commitInfoAdd({item, strict: false});
        return item
    }

    static resolveBackend(media: BackendMediaInfoPart, commit: boolean = true) {
        let {Info, Ctrl} = media;
        let item = new MediaInfoPart(Info, Ctrl, true);
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

    constructor(info: FragmentInfo, ctrl: FragmentCtrl, isRemote: boolean) {
        super(info, ctrl, isRemote);
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

    updateState(prop: AllStateProp, value?: boolean) {
        value || (value = !this.State[prop]);
        Vue.set(this.State, prop, value);
    }

    updateSetting(propGroup: string, prop: string, value: any) {
        Vue.set(this.Setting[propGroup], prop, value);
    }

    updateCrucialProp(prop: string, value: any) {
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
}

export class GraphItemSettingPart extends ItemSettingPart {
    Setting: GraphItemSetting;
    State: BaseState;
    parent: GraphSelfPart;

    constructor(Setting: GraphItemSetting, State: BaseState, parent: GraphSelfPart) {
        super(Setting, State, parent);
        this.Setting = Setting;
        this.State = State;
        this.parent = parent;
    }

    get _type() {
        return this.Setting._type
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

    get isFatherExplode() {
        return this.parent.isExplode
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
            _start: parent.visualNodeList.filter(node => node._id === linkSetting._start._id)[0],
            _end: parent.visualNodeList.filter(node => node._id === linkSetting._end._id)[0]
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
        commitToVuex && commitNoteInDocAdd({note});
        return note
    }

    commitNoteToVuex() {

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
    static baseList: Array<BackendGraph> = [];
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

    protected constructor(Content: DocumentContent, Conf: ItemSettingPart, isRemote: boolean, draftId?: number) {
        this.Conf = Conf;
        this.Content = Content;
        this.DocumentData = {
            draftId,
            isRemote,
            lastSave: currentTime()
        } as DocumentData
    }

    protected commitItemToVuex(info: InfoPartInDataManager) {
        // commit过程
        commitInfoAdd({item: info, strict: false});
        let userConcern = userConcernTemplate();
        commitUserConcernAdd({_id: info._id, _type: info._type, userConcern});
    }
}

export class GraphSelfPart extends DocumentSelfPart {
    static list: Array<GraphSelfPart> = [];
    static baseList: Array<BackendGraph> = []; // 原始数据
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
        graph.addItems([graph.baseNode]);
        let nodeQuery = {id: _id, type: 'document', pLabel: 'DocGraph'} as DocumentQuery;
        let info = NodeInfoPart.emptyNodeInfoPart(nodeQuery, commitToVuex);
        let payload = {graph, info};
        commitToVuex && commitDocumentAdd({document: graph, strict: false});
        return payload
    }

    static resolveFromBackEnd(data: BackendGraph, parent: GraphSelfPart | null, commitToVuex: boolean = true) {
        GraphSelfPart.baseList.push(data);
        let setting = GraphConf.resolveBackend(data.Conf, parent);
        let graphContent = emptyContent();
        let baseNodeSetting = data.Content.nodes.filter(setting => setting._id === data.Conf._id)[0];
        let graph = new GraphSelfPart(
            graphContent,
            setting,
            true,
            baseNodeSetting
        );
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

    getSubItemById(_id: id, _type: GraphItemType) {
        let list = this.getItemListByName(_type);
        return list.filter(item => item._id === _id)[0]
    }

    allItems(): GraphSubItemSettingPart[] {
        let {nodes, links, medias, texts} = this.Content;
        // @ts-ignore
        return nodes.concat(links).concat(medias).concat(texts)
    }

    addItems(items: GraphItemSettingPart[]) {
        items.filter(item => !this.checkExistByItem(item)).map(item => {
            this.pushItem(item)
        })
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

    explode() {
        this.Conf.updateState('isExplode')
    }

    selectAll(state: 'isSelected', value: boolean) {
        this.allItems().filter(item => item.State.isSelected !== value)
            .map(item => Vue.set(item.State, state, value));
    }

    addEmptyNode(_type: 'node' | 'document', _label?: string, commitToVuex?: boolean) {
        _label || (_label = 'BaseNode');
        commitToVuex === undefined && (commitToVuex = true);
        let _id = getIndex();
        let nodeQuery = {id: _id, type: _type, pLabel: _label} as NodeQuery;
        let info = NodeInfoPart.emptyNodeInfoPart(nodeQuery);
        let setting = NodeSettingPart.emptyNodeSetting(_id, _type, _label, 'NewNode' + _id, '', this);
        setting.State.isSelf = true;
        this.addItems([setting]);
        let payload = {setting, info};
        commitToVuex && this.commitItemToVuex(info);
        return payload
    }

    addEmptyLink(_start: VisNodeSettingPart, _end: VisNodeSettingPart, _label?: string, commitToVuex?: boolean) {
        _label || (_label = 'Default');
        commitToVuex === undefined && (commitToVuex = true);
        let _id = getIndex();
        // info
        let info = LinkInfoPart.emptyLinkInfo(_id, _label, _start, _end);
        // setting
        let setting = LinkSettingPart.emptyLinkSetting(_id, _label, _start, _end, this);
        setting.State.isSelf = true;
        this.addItems([setting]);
        let payload = {setting, info};
        commitToVuex && this.commitItemToVuex(info);
        return payload
    }

    addSubGraph(commitToVuex?: boolean) {
        commitToVuex === undefined && (commitToVuex = true);
        let _id = getIndex();
        let {graph, info} = GraphSelfPart.emptyGraphSelfPart(_id, this);
        let payload = {graph, info};
        this.addItems([graph.baseNode.deepCloneSelf()]);
        if (commitToVuex) {
            this.commitGraphToVuex(payload)
        }
        return payload
    }

    protected commitGraphToVuex(payload: { graph: GraphSelfPart, info: NodeInfoPart }) {
        let {graph, info} = payload;
        this.commitItemToVuex(info);
        commitDocumentAdd({document: graph});
    }
}
