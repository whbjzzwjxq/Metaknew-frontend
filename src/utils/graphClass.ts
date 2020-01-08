import {deepClone, getCookie} from "@/utils/utils";
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
    userConcernTemplate
} from "@/utils/template";
import {
    isBaseType,
    isBooleanConcern,
    isLevelConcern,
    isLinkSetting,
    isMediaSetting,
    isNodeSetting,
    isNoteSetting
} from "@/utils/typeCheck";
import {ExtraProps, fieldDefaultValue, nodeLabelToProp, ValueWithType} from "@/utils/labelField";
import {BackendGraph} from "@/api/commonSource";
import {BooleanConcern, LevelConcern, UserConcern} from "@/utils/userConcern";

declare global {
    type id = number | string;
    type ItemType = "node" | "link" | "document" | "media"
    type BaseType = ItemType | "note";
    type BaseTypeList = 'nodes' | 'medias' | 'links' | "notes";
    type MediaStatus = "new" | "remote" | "uploading" | "error" | "success" | "warning";
    type idMap = Record<id, id>; // 新旧id的Map
    type InfoPart = NodeInfoPart | MediaInfoPart | LinkInfoPart;
    type VisNodeSettingPart = NodeSettingPart | MediaSettingPart; // 从视觉上来说是Node的对象
    type AllItemSettingPart = VisNodeSettingPart | LinkSettingPart | NoteSettingPart; // 所有Item对象
    type AllSettingPart = AllItemSettingPart | GraphSettingPart // 所有Setting对象

    //带有翻译的格式
    type Translate = Record<string, string>

    //InfoPart相关
    interface BaseInfo {
        id: id;
        type: BaseType;
        PrimaryLabel: string;
        $IsCommon: boolean;
        $IsShared: boolean;
        $IsOpenSource: boolean;
    }

    interface BaseCtrl {
        $IsUserMade: boolean;
        CreateUser: string | number;
        UpdateTime: string;
        Source: string
    }

    interface BaseNodeInfo extends BaseInfo {
        type: "node" | "document";
        Name: string;
        Alias: Array<string>;
        BaseImp: number;
        BaseHardLevel: number;
        Language: string;
        Topic: Array<string>;
        Labels: Array<string>;
        ExtraProps: ExtraProps;
        CommonProps: Record<string, ValueWithType<any>>;
        Text: Translate;
        Translate: Translate;
        IncludedMedia: Array<string | number>;
        MainPic: string;
    }

    interface BaseNodeCtrl extends BaseCtrl {
        PrimaryLabel: string;
        Imp: number;
        HardLevel: number;
        Useful: number;
        isStar: number;
        isShared: number;
        isGood: number;
        isBad: number;
        Labels: Array<string>;
        Contributor: Object;
        TotalTime: number;
    }

    //GraphInfo 和 NodeInfo一样
    interface BaseGraphCtrl extends BaseNodeCtrl {
        Size: number;
        MainNodes: Array<id>;
        Complete: number
    }

    interface BaseMediaInfo extends BaseInfo {
        type: "media";
        Name: string;
        Labels: Array<string>;
        Text: Translate;
        ExtraProps: ExtraProps;

        [propName: string]: any;
    }

    interface BaseMediaCtrl extends BaseCtrl {
        FileName: string; // URL
        Format: string; // 格式
        Thumb: string; // 缩略图
        PrimaryLabel: string;
        isStar: number;
        isShared: number;
        isGood: number;
        isBad: number;
        Labels: Array<string>;
    }

    interface BaseLinkInfo extends BaseInfo {
        type: "link";
        Labels: Array<string>;
        CommonProps: Record<string, ValueWithType<any>>;
        ExtraProps: ExtraProps;
        Text: Translate;
        Confidence: number;

        [propName: string]: any;
    }

    interface BaseLinkCtrl extends BaseCtrl {
        Start: NodeSettingPart;
        End: NodeSettingPart;
    }

    //SettingPart相关

    interface Setting {
        _id: id;
        _type: BaseType;
        _label: string;

        [propName: string]: any;
    }

    type BaseStateKey = 'isSelected' | 'isDeleted' | 'isSelf'

    interface BaseSize {
        x: number,
        y: number,
        size: number,
        scaleX: number,
        [prop: string]: any
    }

    interface NodeSetting extends Setting {
        _type: 'node' | 'document';
        _name: string;
        _image: string;
        Base: BaseSize
    }

    interface MediaSetting extends Setting {
        _type: 'media';
        _name: string;
        _src: string; // url字符串或者 URL.createObjectUrl返回值
    }

    interface LinkSetting extends Setting {
        _type: 'link';
        _start: VisNodeSettingPart;
        _end: VisNodeSettingPart;
    }

    interface compressLinkSetting extends Setting {
        _start: Setting;
        _end: Setting;
    }

    interface GraphSetting extends Setting {
        _type: 'document'
    }

    interface NoteContent {
        [prop: string]: any
    }

    interface NoteSetting extends Setting {
        _type: 'note';
        _title: string;
        _content: NoteContent
    }

    interface BaseState {
        isSelected: boolean; // 是否被选中
        isDeleted: boolean; // 是否被删除;
        isSelf: boolean; // 是否是自己的内容
    }

    interface NodeState extends BaseState {
        // 用于node media
        isMouseOn: boolean; // 是否鼠标放置在上面
        isAdd: boolean; // 是否是新建的
    }

    interface LinkState extends BaseState {
        // 暂时和Node一样
        isMouseOn: boolean; // 是否鼠标放置在上面
        isAdd: boolean; // 是否是新建的
    }

    interface NoteState extends BaseState {
        isMouseOn: boolean;
        isAdd: boolean;
        isLock: boolean;
    }

    interface GraphState extends BaseState {
        isLoading: boolean;
        isChanged: boolean;
        SavedIn5Min: boolean; // 5分钟内是否保存
        isExplode: boolean;
    }

    //Graph
    interface Graph {
        nodes: Array<NodeSettingPart>;
        links: Array<LinkSettingPart>;
        medias: Array<MediaSettingPart>;
        notes: Array<NoteSettingPart>;
    }
}

export class NodeInfoPart {
    id: id;
    isRemote: boolean;
    isEdit: boolean;
    Info: BaseNodeInfo;
    Ctrl: BaseNodeCtrl;
    UserConcern: UserConcern;

    constructor(
        info: BaseNodeInfo,
        ctrl: BaseNodeCtrl,
        userConcern: UserConcern
    ) {
        const id = info.id;
        this.isRemote = newIdRegex.test(id.toString());
        this.isEdit = false;
        this.id = id;
        this.Info = info;
        this.Ctrl = ctrl;
        this.UserConcern = userConcern;
    }

    static emptyNodeInfoPart(_id: id, _type: 'node' | 'document', _label: string) {
        return new NodeInfoPart(
            nodeInfoTemplate(_id, _type, _label),
            nodeCtrlTemplate(_type, _label),
            userConcernTemplate()
        );
    }

    // info修改值
    updateValue(prop: string, newValue: any, doItPassive?: boolean) {
        if (!doItPassive) {
            if (ctrlPropRegex.test(prop) || prop === "PrimaryLabel") {
                console.log("不要使用updateValue更新控制属性");
            } else {
                this.isEdit = true;
                Vue.set(this.Info, prop, newValue);
            }
        } else {
            //空载的更新
            this.isEdit = true;
        }
    }

    updateUserConcern(
        prop: LevelConcern | BooleanConcern | "Labels",
        value?: number | string[]
    ) {
        if (isBooleanConcern(prop)) {
            Vue.set(this.UserConcern, prop, !this.UserConcern[prop]);
            this.UserConcern[prop]
                ? (this.Ctrl[prop] += 1)
                : (this.Ctrl[prop] -= 1);
        } else if (isLevelConcern(prop)) {
            Vue.set(this.UserConcern, prop, value);
        } else {
            Vue.set(this.UserConcern, prop, value);
        }
    }

    changeId(newId: id) {
        this.id = newId;
        Vue.set(this.Info, "id", newId);
        this.synchronizationSource("_id", newId);
        this.isRemote = newIdRegex.test(newId.toString());
        this.isEdit = false;
    }

    changePrimaryLabel(newLabel: string) {
        if (this.isRemote) {
            console.log("如果是远端节点 那么PLabel不能修改");
        } else {
            let commonProps = this.Info.CommonProps;
            Object.entries(nodeLabelToProp(newLabel)).map(([prop, value]) => {
                let {resolve, type} = value;
                Object.keys(commonProps).indexOf(prop) === -1
                    ? (commonProps[prop] = {resolve, type, value: fieldDefaultValue[type]})
                    : (commonProps[prop] = deepClone(commonProps[prop]));
            });
            Vue.set(this.Info, "CommonProps", commonProps);
            Vue.set(this.Ctrl, "PrimaryLabel", newLabel);
            Vue.set(this.Info, "PrimaryLabel", newLabel);
            this.synchronizationSource("_label", newLabel);
            this.isEdit = true;
        }
    }

    changeName(newName: string) {
        Vue.set(this.Info, "Name", newName);
        this.synchronizationSource("_name", newName);
    }

    changeImage(newImage: string) {
        Vue.set(this.Info, "MainPic", newImage);
        this.synchronizationSource("_image", newImage);
    }

    synchronizationSource(prop: string, value: any) {
        let nodeList = NodeSettingPart.list;
        crucialRegex.test(prop) &&
        findItem(nodeList, this.id, this.Info.type).map(node =>
            node.updateCrucialProp(prop, value)
        );
    }

    synchronizationAll() {
        // 同步所有属性到Setting
        let nodeList = NodeSettingPart.list;
        findItem(nodeList, this.id, this.Info.type).map(node => {
            node.updateCrucialProp("_label", this.Info.PrimaryLabel);
            node.updateCrucialProp("_name", this.Info.Name);
            node.updateCrucialProp("_image", this.Info.MainPic);
        });
    }

    save() {
    }
}

export class LinkInfoPart {
    id: id;
    isRemote: boolean;
    isEdit: boolean;
    Info: BaseLinkInfo;
    Ctrl: BaseLinkCtrl;

    constructor(info: BaseLinkInfo, ctrl: BaseLinkCtrl) {
        const id = info.id;
        this.id = id;
        this.isRemote = newIdRegex.test(id.toString());
        this.isEdit = false;
        this.Info = info;
        this.Ctrl = ctrl;
    }

    static emptyLinkInfo(
        _id: id,
        _label: string,
        _start: VisNodeSettingPart,
        _end: VisNodeSettingPart
    ) {
        return new LinkInfoPart(
            linkInfoTemplate(_id, _label),
            linkCtrlTemplate(_start, _end)
        );
    }

    changeId(newId: id) {
        this.id = newId;
        this.updateValue("id", newId);
        this.synchronizationSource("_id", newId);
        this.isRemote = newIdRegex.test(newId.toString());
        this.isEdit = false;
    }

    changeLabel(newLabel: string) {
        this.updateValue("PrimaryLabel", newLabel);
        this.synchronizationSource("_label", newLabel);
    }

    changeNode(
        start: VisNodeSettingPart | null,
        end: VisNodeSettingPart | null
    ) {
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
            console.log("远端关系不能改变了");
        }
    }

    updateValue(prop: string, newValue: any) {
        if (ctrlPropRegex.test(prop)) {
            console.log("不要使用updateValue更新控制属性");
        } else {
            this.isEdit = true;
            Vue.set(this.Info, prop, newValue);
        }
    }

    synchronizationSource(prop: string, value: any) {
        let linkList = LinkSettingPart.list;
        crucialRegex.test(prop) &&
        findItem(linkList, this.id, this.Info.type).map(link =>
            link.updateCrucialProp(prop, value)
        );
    }

    synchronizationAll() {
        let linkList = LinkSettingPart.list;
        findItem(linkList, this.id, this.Info.type).map(link => {
            link.updateCrucialProp("_start", this.Ctrl.Start);
            link.updateCrucialProp("_end", this.Ctrl.End);
        });
    }
}

export class MediaInfoPart {
    id: id;
    file: File | Blob | null;
    status: MediaStatus;
    error: string[]; // file存在的错误
    isRemote: boolean;
    isEdit: boolean;
    Info: BaseMediaInfo;
    Ctrl: BaseMediaCtrl;
    UserConcern: UserConcern;
    static statusDict: Record<MediaStatus, string> = {
        new: 'blue',
        remote: 'yellow',
        error: 'red',
        success: 'green',
        uploading: 'purple',
        warning: 'yellow'
    };

    constructor(
        info: BaseMediaInfo,
        ctrl: BaseMediaCtrl,
        userConcern: UserConcern,
        status: MediaStatus,
        error: string[],
        file?: File
    ) {
        let id = info.id;
        file ? (this.file = file) : (this.file = null);
        // todo File详细定义
        this.status = status;
        this.error = error;
        this.id = id;
        this.isRemote = newIdRegex.test(id.toString());
        this.isEdit = false;
        this.Info = info;
        this.Ctrl = ctrl;
        this.UserConcern = userConcern;
    }

    static emptyMediaInfo(_id: id, file: File) {
        return new MediaInfoPart(
            mediaInfoTemplate(_id, file),
            mediaCtrlTemplate(file),
            userConcernTemplate(),
            "new",
            [],
            file
        );
    }

    changeId(newId: id) {
        this.id = newId;
        Vue.set(this.Info, "id", newId);
        this.synchronizationSource("_id", newId);
        this.isRemote = newIdRegex.test(newId.toString());
        this.isEdit = false;
    }

    changeStatus(status: MediaStatus) {
        Vue.set(this, "status", status);
    }

    changeSource(newSource: string) {
        Vue.set(this.Ctrl, "FileName", newSource);
        this.synchronizationSource("_src", newSource);
    }

    changeName(newName: string) {
        Vue.set(this.Info, 'Name', newName);
        this.isEdit = true;
        this.synchronizationSource("_name", newName)
    }

    // info修改值
    updateValue(prop: string, newValue: any, doItPassive?: boolean) {
        if (!doItPassive) {
            if (ctrlPropRegex.test(prop) || prop === "PrimaryLabel") {
                console.log("不要使用updateValue更新控制属性");
            } else {
                this.isEdit = true;
                Vue.set(this.Info, prop, newValue);
            }
        } else {
            //空载的更新
            this.isEdit = true;
        }
    }

    updateUserConcern(
        prop: LevelConcern | BooleanConcern | "Labels",
        value?: number | string[]
    ) {
        if (isBooleanConcern(prop)) {
            Vue.set(this.UserConcern, prop, !this.UserConcern[prop]);
            this.UserConcern[prop]
                ? (this.Ctrl[prop] += 1)
                : (this.Ctrl[prop] -= 1);
        } else if (isLevelConcern(prop)) {
            Vue.set(this.UserConcern, prop, value);
        } else {
            Vue.set(this.UserConcern, prop, value);
        }
    }

    synchronizationSource(prop: string, value: any) {
        let mediaList = MediaSettingPart.list;
        crucialRegex.test(prop) &&
        findItem(mediaList, this.id, this.Info.type).map(node =>
            node.updateCrucialProp(prop, value)
        );
    }

    synchronizationAll() {
        let nodeList = MediaSettingPart.list;
        findItem(nodeList, this.id, this.Info.type).map(node => {
            node.updateCrucialProp("_src", this.Ctrl.FileName);
            node.updateCrucialProp("_name", this.Info.Name);
        });
    }

    getStatusColor() {
        return MediaInfoPart.statusDict[this.status]
    }
}

export class SettingPart {
    Setting: Setting;
    State: BaseState;
    parent: GraphSelfPart | null;

    constructor(
        Setting: Setting,
        State: BaseState,
        parent: GraphSelfPart | null
    ) {
        this.Setting = Setting;
        this.State = State;
        this.parent = parent;
    }

    updateState(prop: string, value: boolean) {
        Vue.set(this.State, prop, value);
    }

    updateSetting(propGroup: string, prop: string, value: any) {
        Vue.set(this.Setting[propGroup], prop, value);
    }

    updateCrucialProp(prop: string, value: any) {
        crucialRegex.test(prop) && Vue.set(this.Setting, prop, value);
    }
}

export class NodeSettingPart extends SettingPart {
    Setting: NodeSetting;
    State: NodeState;
    parent: GraphSelfPart;
    static list: Array<NodeSettingPart> = [];

    constructor(Setting: NodeSetting, State: NodeState, parent: GraphSelfPart) {
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
        let state = nodeStateTemplate("isAdd");
        return new NodeSettingPart(setting, state, parent);
    }
}

export class MediaSettingPart extends SettingPart {
    Setting: MediaSetting;
    State: NodeState;
    parent: GraphSelfPart;
    static list: Array<MediaSettingPart> = [];

    constructor(
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
        let state = nodeStateTemplate("isAdd");
        return new MediaSettingPart(setting, state, parent);
    }

    static emptyMediaSettingFromInfo(media: MediaInfoPart, parent: GraphSelfPart) {
        return MediaSettingPart.emptyMediaSetting(media.id, media.Info.PrimaryLabel, media.Info.Name, media.Ctrl.FileName, parent)
    }
}

export class LinkSettingPart extends SettingPart {
    Setting: LinkSetting;
    State: LinkState;
    parent: GraphSelfPart;
    static list: Array<LinkSettingPart> = [];

    constructor(Setting: LinkSetting, State: LinkState, parent: GraphSelfPart) {
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
        let state = linkStateTemplate("isAdd");
        return new LinkSettingPart(setting, state, parent);
    }
}

export class NoteSettingPart extends SettingPart {
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
        _content: string,
        parent: GraphSelfPart) {
        let setting = noteSettingTemplate(_id, _label, _content);
        let state = noteStateTemplate('isAdd');
        return new NoteSettingPart(setting, state, parent)
    }
}

export class GraphSettingPart extends SettingPart {
    Setting: GraphSetting;
    State: GraphState;
    parent: GraphSelfPart | null;

    constructor(
        Setting: GraphSetting,
        State: GraphState,
        parent: GraphSelfPart | null
    ) {
        super(Setting, <NodeState>{}, parent);
        this.Setting = Setting;
        this.State = State;
        this.parent = parent;
    }

    static emptyGraphSetting(_id: id, parent: GraphSelfPart | null) {
        let setting = graphSettingTemplate(_id);
        let state = graphStateTemplate("isSelf", "isAdd");
        return new GraphSettingPart(setting, state, parent);
    }
}

export class GraphSelfPart {
    Graph: Graph;
    Conf: GraphSettingPart;
    Path: Array<Object>; // todo Path
    id: id;
    draftId: number;
    rootList: Array<GraphSelfPart>; // Graph的遍历链条
    root: GraphSelfPart | null;
    protected _baseNode: NodeSettingPart;
    get baseNode() {
        return this._baseNode
    }

    rect: AreaRect;
    static list: Array<GraphSelfPart>;
    static baseList: Array<BackendGraph>; // 原始数据
    constructor(
        graph: Graph,
        setting: GraphSettingPart,
        path: Array<Object>,
        _id: id,
    ) {
        this.draftId = -1;
        this.id = _id;
        this.rootList = findRoot(setting);
        this.root = this.getRoot();
        this.Conf = setting;
        this.Graph = graph;
        this.Path = path;
        this.rect = {x: 0, y: 0, width: 600, height: 400};
        if (GraphSelfPart.list === undefined) {
            GraphSelfPart.list = [this]
        } else {
            GraphSelfPart.list.push(this)
        }
        this._baseNode = NodeSettingPart.emptyNodeSetting(
            _id,
            "document",
            "DocGraph",
            "NewDocument" + _id,
            "",
            this
        );
    }

    updateBaseNode(node: NodeSettingPart) {
        this._baseNode = node
    }

    static emptyGraphSelfPart(_id: id, parent: GraphSelfPart | null) {
        let graph: Graph = {
            nodes: [],
            links: [],
            medias: [],
            notes: []
        };
        let setting = GraphSettingPart.emptyGraphSetting(_id, parent);
        let path = [{}]; // todo path
        let graphSelf = new GraphSelfPart(graph, setting, path, _id);
        graphSelf.Graph.nodes.push(graphSelf.baseNode);
        return graphSelf
    }

    static resolveFromBackEnd(
        baseData: BackendGraph,
        parent: GraphSelfPart | null
    ) {
        GraphSelfPart.baseList.push(baseData);
        let args = [];
        getIsSelf(baseData.Base.Ctrl) && args.push("isSelf");
        let state = graphStateTemplate(...args);
        let setting = new GraphSettingPart(baseData.Conf, state, parent);
        let graph = <Graph>{
            nodes: [],
            links: [],
            medias: [],
            notes: []
        };
        let result = new GraphSelfPart(
            graph,
            setting,
            baseData.Path,
            baseData.Base.Info.id
        );
        result.Graph.nodes = baseData.Graph.nodes.map(
            setting => {
                let node = new NodeSettingPart(setting, nodeStateTemplate(), result);
                setting._id === result.id && (result.updateBaseNode(node));
                return node
            }
        );
        result.Graph.medias = baseData.Graph.medias.map(
            setting =>
                new MediaSettingPart(setting, nodeStateTemplate(), result)
        );
        result.Graph.links = baseData.Graph.links.map(setting => {
            let linkNode = {
                _start: result.Graph.nodes.filter(node =>
                    itemEqual(setting._start, node.Setting)
                )[0],
                _end: result.Graph.nodes.filter(node =>
                    itemEqual(setting._end, node.Setting)
                )[0]
            };
            let link = Object.assign(deepClone(setting), linkNode) as LinkSetting;
            return new LinkSettingPart(link, linkStateTemplate(), result);
        });
        result.Graph.notes = baseData.Graph.notes.map(
            setting =>
                new NoteSettingPart(setting, noteStateTemplate(), result)
        );

        return result;
    }

    changeId(newId: id) {
        this.id = newId;
    }

    getRoot() {
        let length = this.rootList.length;
        if (length > 0) {
            return this.rootList[0]
        } else {
            return null
        }
    }

    getChildDocument() {
        let result: GraphSelfPart[] = [];
        GraphSelfPart.list.map(graph => {
            let root = graph.root;
            if (root && root.id === this.id) {
                result.push(graph)
            }
        });
        return result
    }

    getItemById(_id: id, _type: BaseType) {
        let list = this.getItemListByName(_type);
        return list.filter(item => item.Setting._id === _id)[0]
    }

    allItems(): AllItemSettingPart[] {
        let {nodes, links, medias, notes} = this.Graph;
        // @ts-ignore
        return nodes.concat(links).concat(medias).concat(notes)
    }

    addItems(items: AllItemSettingPart[]) {
        items.filter(item => !this.checkExistByItem(item)).map(
            item => {
                this.addItem(item)
            }
        )
    }

    getItemListByItem(item: AllItemSettingPart) {
        return this.getItemListByName(item.Setting._type)
    }

    getItemListByName(name: BaseTypeList | BaseType): AllItemSettingPart[] {
        let itemList;
        if (isBaseType(name)) {
            name === 'media'
                ? itemList = this.Graph.medias
                : name === 'link'
                ? itemList = this.Graph.links
                : itemList = this.Graph.nodes
        } else {
            itemList = this.Graph[name]
        }
        return itemList
    }

    checkExist(_id: id, _type: BaseType) {
        let itemList = this.getItemListByName(_type);
        return findItem(itemList, _id, _type).length > 0
    }

    checkExistByItem(item: AllItemSettingPart) {
        return this.checkExist(item.Setting._id, item.Setting._type)
    }

    protected addItem(item: AllItemSettingPart) {
        item.parent = this;
        isMediaSetting(item)
            ? this.Graph.medias.push(item)
            : isNodeSetting(item)
            ? this.Graph.nodes.push(item)
            : isNoteSetting(item)
                ? this.Graph.notes.push(item)
                : isLinkSetting(item) && this.Graph.links.push(item)
    }

    getItemByState(name: BaseTypeList | BaseType, state: BaseStateKey) {
        let list = this.getItemListByName(name);
        return list.filter(item => item.State[state])
    }

    explode() {
        let value = this.Conf.State.isExplode;
        let nodes = this.Graph.nodes;
        // 从baseNode里恢复
        if (value) {
            nodes.splice(0, 0, this.baseNode);
            Vue.set(this.Conf.State, 'isExplode', false)
        } else {
            // 删除掉this里已有的节点
            let index = 0;
            nodes.map(item => {
                if (item.Setting._id === this.id) {
                    index = nodes.indexOf(item)
                }
            });
            nodes.splice(index, 1);
            Vue.set(this.Conf.State, 'isExplode', true)
        }
    }

    allStateChange(value: boolean, state: 'isSelected' | 'isDeleted' | 'isSelf') {
        this.allItems().map(item => Vue.set(item.State, state, value));
        Vue.set(this.Conf.State, state, value)
    }
}

let globalIndex = 0;
export let newIdRegex = new RegExp("\\$_[0-9]*");
let ctrlPropRegex = new RegExp("\\$.*");
let crucialRegex = new RegExp("_.*");

export const getIndex = () => {
    globalIndex += 1;
    return '$_' + globalIndex
}; // 获取新内容索引

export const itemEqual = (itemA: Setting, itemB: Setting) =>
    itemA._id === itemB._id && itemA._type === itemB._type; // 两个Item是否一样

export const findItem = (list: Array<SettingPart>, _id: id, _type: BaseType) =>
    list.filter(
        item => item.Setting._id === _id && item.Setting._type === _type // 在一个List里找Item
    );
export const getIsSelf = (ctrl: BaseCtrl) =>
    ctrl.CreateUser.toString() === getCookie("user_id");

export const InfoToSetting = (payload: { id: id; type: BaseType; PrimaryLabel: string; }) =>
    ({_id: payload.id, _type: payload.type, _label: payload.PrimaryLabel} as Setting);

export const settingPartClassifier = (itemList: AllItemSettingPart[]) => {
    let result: Record<BaseTypeList, AllItemSettingPart[]> = {
        nodes: [] as NodeSettingPart[],
        medias: [] as MediaSettingPart[],
        links: [] as LinkSettingPart[],
        notes: [] as NoteSettingPart[]
    };
    itemList.map(item => {
        isMediaSetting(item)
            ? result.medias.push(item)
            : isNodeSetting(item)
            ? result.nodes.push(item)
            : result.links.push(item)
    });
    return result
};

export const findRoot = (item: SettingPart) => {
    if (!item.parent) {
        return [];
    } else {
        let result: Array<GraphSelfPart>;
        item.parent
            ? (result = item.parent.rootList.concat(item.parent))
            : (result = [item.parent]);
        return result;
    }
};
