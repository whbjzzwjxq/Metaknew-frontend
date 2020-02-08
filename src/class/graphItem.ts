import {
    crucialRegex,
    ctrlPropRegex,
    deepClone,
    emptyGraph,
    findItem, getCookie,
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
    nodeStateTemplate, noteSettingTemplate, noteStateTemplate,
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
import {BackendGraph} from "@/api/commonSource";
import {commitGraphAdd, commitInfoAdd, commitNoteInDocAdd, commitUserConcernAdd} from "@/store/modules/_mutations";
import {FragmentCtrl, FragmentInfo} from "@/interface/interfaceUser";

export abstract class InfoPart {
    Info: BaseInfo;
    Ctrl: BaseCtrl;
    isEdit: boolean;

    get _id() {
        return this.Info._id
    }

    set _id(newId) {
        this.changeId(newId)
    }

    get type() {
        return this.Info.type
    }

    get isRemote() {
        return !localIdRegex.test(this._id.toString());
    }

    get isUserMade() {
        return this.Ctrl.CreateType === 'User'
    }

    get isSelf() {
        return getIsSelf(this.Ctrl)
    }

    get PrimaryLabel() {
        return this.Info.PrimaryLabel
    }

    protected constructor(info: BaseInfo, ctrl: BaseCtrl) {
        this.Info = info;
        this.Ctrl = ctrl;
        this.isEdit = false;
    }

    changeId(newId: id) {
        Vue.set(this.Info, "_id", newId);
        this.isEdit = false;
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
            if (this.Info[prop] !== newValue) {
                Vue.set(this.Info, prop, newValue);
                this.isEdit = true;
            } else {
                //空载的更新
            }
        }
    }
}

export class NodeInfoPart extends InfoPart {
    Info: BaseNodeInfo;
    Ctrl: BaseNodeCtrl;

    get type() {
        return this.Info.type
    }

    constructor(
        info: BaseNodeInfo,
        ctrl: BaseNodeCtrl,
    ) {
        super(info, ctrl);
        this.Info = info;
        this.Ctrl = ctrl;
    }

    static emptyNodeInfoPart(_id: id, _type: 'node' | 'document', _label: string) {
        return new NodeInfoPart(
            nodeInfoTemplate(_id, _type, _label),
            nodeCtrlTemplate(_type, _label),
        );
    }

    changeId(newId: id) {
        this._id = newId;
        Vue.set(this.Info, "_id", newId);
        this.isEdit = false;
        // node 重写
        this.synchronizationSource("_id", newId);
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
        findItem(nodeList, this._id, this.Info.type).map(node =>
            node.updateCrucialProp(prop, value)
        );
    }

    synchronizationAll() {
        // 同步所有属性到Setting
        let nodeList = NodeSettingPart.list;
        findItem(nodeList, this._id, this.Info.type).map(node => {
            node.updateCrucialProp("_label", this.Info.PrimaryLabel);
            node.updateCrucialProp("_name", this.Info.Name);
            node.updateCrucialProp("_image", this.Info.MainPic);
        });
    }

    save() {

    }
}

export class LinkInfoPart extends InfoPart {
    Info: BaseLinkInfo;
    Ctrl: BaseLinkCtrl;

    get type() {
        return this.Info.type
    }

    constructor(info: BaseLinkInfo, ctrl: BaseLinkCtrl) {
        super(info, ctrl);
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
        this.Info._id = newId;
        this.synchronizationSource("_id", newId);
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
        findItem(linkList, this._id, this.Info.type).map(link =>
            link.updateCrucialProp(prop, value)
        );
    }

    synchronizationAll() {
        let linkList = LinkSettingPart.list;
        findItem(linkList, this._id, this.Info.type).map(link => {
            link.updateCrucialProp("_start", this.Ctrl.Start);
            link.updateCrucialProp("_end", this.Ctrl.End);
        });
    }
}

export class MediaInfoPart extends InfoPart {
    file: File | Blob | null;
    status: MediaStatus;
    error: string[]; // file存在的错误
    Info: BaseMediaInfo;
    Ctrl: BaseMediaCtrl;

    get type() {
        return this.Info.type
    }

    get statusColor() {
        return MediaInfoPart.statusDict[this.status]
    }

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
        status: MediaStatus,
        error: string[],
        file?: File
    ) {
        super(info, ctrl);
        file ? (this.file = file) : (this.file = null);
        this.status = status;
        this.error = error;
        this.isEdit = false;
        this.Info = info;
        this.Ctrl = ctrl;
    }

    static emptyMediaInfo(_id: id, file: File) {
        return new MediaInfoPart(
            mediaInfoTemplate(_id, file),
            mediaCtrlTemplate(file),
            "new",
            [],
            file
        );
    }

    changeId(newId: id) {
        this.Info._id = newId;
        this.synchronizationSource("_id", newId);
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

    synchronizationSource(prop: string, value: any) {
        let mediaList = MediaSettingPart.list;
        crucialRegex.test(prop) &&
        findItem(mediaList, this._id, this.Info.type).map(node =>
            node.updateCrucialProp(prop, value)
        );
    }

    synchronizationAll() {
        let nodeList = MediaSettingPart.list;
        findItem(nodeList, this._id, this.Info.type).map(node => {
            node.updateCrucialProp("_src", this.Ctrl.FileName);
            node.updateCrucialProp("_name", this.Info.Name);
        });
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

export class GraphItemSettingPart {
    Setting: GraphItemSetting;
    State: BaseState;
    parent: GraphSelfPart | null;

    constructor(
        Setting: GraphItemSetting,
        State: BaseState,
        parent: GraphSelfPart | null
    ) {
        this.Setting = Setting;
        this.State = State;
        this.parent = parent;
    }

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
        crucialRegex.test(prop) && Vue.set(this.Setting, prop, value);
    }

    findRoot() {
        if (!this.parent) {
            return [];
        } else {
            let result: Array<GraphSelfPart>;
            this.parent
                ? (result = this.parent.rootList.concat(this.parent))
                : (result = [this.parent]);
            return result;
        }
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
        return MediaSettingPart.emptyMediaSetting(media._id, media.Info.PrimaryLabel, media.Info.Name, media.Ctrl.FileName, parent)
    }
}

export class LinkSettingPart extends GraphItemSettingPart {
    Setting: LinkSetting;
    State: LinkState;
    parent: GraphSelfPart;
    static list: Array<LinkSettingPart> = [];

    get _type() {
        return this.Setting._type
    }

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

export class SvgSettingPart extends GraphItemSettingPart {
    Setting: SvgSetting;
    State: SvgState;
    parent: GraphSelfPart;
    static list: Array<SvgSettingPart> = [];

    get _type() {
        return this.Setting._type
    }

    constructor(Setting: SvgSetting, State: SvgState, parent: GraphSelfPart) {
        super(Setting, State, parent);
        this.Setting = Setting;
        this.State = State;
        this.parent = parent;
        SvgSettingPart.list.push(this)
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

export class GraphConf extends GraphItemSettingPart {
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
        let state = graphStateTemplate("isSelf");
        return new GraphConf(setting, state, parent);
    }
}

export class GraphSelfPart {
    static list: Array<GraphSelfPart> = [];
    static baseList: Array<BackendGraph> = []; // 原始数据
    Graph: Graph;
    Conf: GraphConf;
    // 草稿保存
    draftId: number;
    // 图形尺寸
    rect: RectObject;
    protected _baseNode: NodeSettingPart;
    get baseNode() {
        return this._baseNode
    }

    get _id() {
        return this.Conf._id
    }

    set _id(newId) {
        this.Conf._id = newId
    }

    get rootList() {
        return this.Conf.findRoot()
    }

    get root() {
        return this.rootList ? this.rootList[0] : null;
    }

    constructor(graph: Graph, conf: GraphConf, baseNode?: NodeSetting, draftId?: number, rect?: RectObject) {
        // 自动保存id
        draftId || (draftId = -1);
        this.draftId = draftId;
        // 设置
        this.Conf = conf;
        // Graph
        this.Graph = graph;
        // rect默认值
        rect || (rect = {width: 600, height: 400});
        this.rect = rect;
        // 记录所有实例
        GraphSelfPart.list.push(this);
        // baseNode
        baseNode || (baseNode = nodeSettingTemplate(conf._id, conf._type, conf._label, 'NewDocument' + conf._id, ''));
        let state = nodeStateTemplate();
        this._baseNode = new NodeSettingPart(baseNode, state, this);
    }

    static emptyGraphSelfPart(_id: id, parent: GraphSelfPart | null, commitToVuex?: boolean) {
        commitToVuex === undefined && (commitToVuex = true);
        let graphContent = emptyGraph();
        let setting = GraphConf.emptyGraphSetting(_id, parent);
        let graph = new GraphSelfPart(graphContent, setting);
        graph.addItems([graph.baseNode]);
        let info = NodeInfoPart.emptyNodeInfoPart(_id, 'document', 'DocGraph');
        let payload = {graph, info};
        if (commitToVuex) {
            graph.commitGraphToVuex(payload);
        }
        return payload
    }

    static resolveFromBackEnd(baseData: BackendGraph, parent: GraphSelfPart | null) {
        GraphSelfPart.baseList.push(baseData);
        let args = [];
        getIsSelf(baseData.Base.Ctrl) && args.push("isSelf");
        let state = graphStateTemplate(...args);
        let setting = new GraphConf(baseData.Conf, state, parent);
        let graph = emptyGraph();
        let baseNodeSetting = baseData.Graph.nodes.filter(setting => setting._id === baseData.Conf._id)[0];
        let result = new GraphSelfPart(
            graph,
            setting,
            baseNodeSetting
        );
        result.Graph.nodes = baseData.Graph.nodes.map(
            setting => new NodeSettingPart(setting, nodeStateTemplate(), result)
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

        return result;
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
        return list.filter(item => item.Setting._id === _id)[0]
    }

    allItems(): GraphSubItemSettingPart[] {
        let {nodes, links, medias, svgs} = this.Graph;
        // @ts-ignore
        return nodes.concat(links).concat(medias).concat(svgs)
    }

    addItems(items: GraphItemSettingPart[]) {
        items.filter(item => !this.checkExistByItem(item)).map(
            item => {
                this.pushItem(item)
            }
        )
    }

    getItemListByName(name: GraphTypeS | GraphItemType): GraphSubItemSettingPart[] {
        let itemList;
        if (isGraphType(name)) {
            name === 'media'
                ? itemList = this.Graph.medias
                : name === 'link'
                ? itemList = this.Graph.links
                : name === 'svg'
                    ? itemList = this.Graph.svgs
                    : itemList = this.Graph.nodes //  name === 'document | 'node
        } else {
            itemList = this.Graph[name]
        }
        return itemList
    }

    checkExist(_id: id, _type: GraphItemType) {
        let itemList = this.getItemListByName(_type);
        return findItem(itemList, _id, _type).length > 0
    }

    checkExistByItem(item: GraphItemSettingPart) {
        return this.checkExist(item.Setting._id, item._type)
    }

    protected pushItem(item: GraphItemSettingPart) {
        item.parent = this;
        isMediaSetting(item)
            ? this.Graph.medias.push(item)
            : isNodeSetting(item)
            ? this.Graph.nodes.push(item)
            : isSvgSetting(item)
                ? this.Graph.svgs.push(item)
                : isLinkSetting(item) && this.Graph.links.push(item)
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
        let info = NodeInfoPart.emptyNodeInfoPart(_id, _type, _label);
        let setting = NodeSettingPart.emptyNodeSetting(_id, _type, _label, 'NewNode' + _id, '', this);
        setting.State.isSelf = true;
        this.addItems([setting]);
        let payload = {setting, info};
        commitToVuex && this.commitItemToVuex(payload);
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
        commitToVuex && this.commitItemToVuex(payload);
        return payload
    }

    addEmptyNote(commitToVuex?: boolean) {
        commitToVuex === undefined && (commitToVuex = true);
        let _id = getIndex();
        let note = NoteSettingPart.emptyNoteSetting(_id, 'note', '', '', this);
        commitToVuex && commitNoteInDocAdd({note});
        return note
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

    protected commitItemToVuex(payload: { setting: GraphItemSettingPart, info: InfoPart }) {
        // commit过程
        let {setting, info} = payload;
        commitInfoAdd({item: info, strict: false});
        let userConcern = userConcernTemplate();
        commitUserConcernAdd({_id: setting._id, _type: setting._type, userConcern});
        return setting
    }

    protected commitGraphToVuex(payload: { graph: GraphSelfPart, info: NodeInfoPart }) {
        let {graph, info} = payload;
        this.commitItemToVuex({setting: graph.baseNode, info});
        commitGraphAdd({graph});
    }
}