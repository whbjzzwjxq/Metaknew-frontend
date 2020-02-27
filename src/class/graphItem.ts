import {
    crucialRegex,
    ctrlPropRegex,
    deepClone,
    emptyContent,
    findItem,
    getCookie,
    getIndex,
    getIsSelf,
    itemEqual, localIdRegex,
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
    svgSettingTemplate,
    svgStateTemplate,
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
import {BackendGraph, QueryObject} from "@/api/commonSource";
import {
    commitDocumentAdd,
    commitInfoAdd,
    commitInfoChangeId,
    commitNoteInDocAdd,
    commitUserConcernAdd
} from "@/store/modules/_mutations";
import {FragmentCtrl, FragmentInfo} from "@/interface/interfaceUser";
export abstract class InfoPart {
    Info: BaseInfo;
    Ctrl: BaseCtrl;
    State: InfoState;

    get _id() {
        return this.Info._id
    }

    get type() {
        return this.Info.type
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

    get PrimaryLabel() {
        return this.Info.PrimaryLabel
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
        Vue.set(this.Info, "_id", newId);
        this.State.isEdit = false;
    }

    synchronizationSource(prop: string, value: any) {
        //
    }
    // info修改值
    updateValue(prop: string, newValue: any, doItPassive?: boolean) {
        if (!doItPassive) {
            if (ctrlPropRegex.test(prop) || prop === "PrimaryLabel") {
                // "不要使用updateValue更新控制属性"
            } else {
                this.State.isEdit = true;
                Vue.set(this.Info, prop, newValue);
            }
        } else {
            if (this.Info[prop] !== newValue) {
                Vue.set(this.Info, prop, newValue);
                this.State.isEdit = true;
            } else {
                //空载的更新
            }
        }
    }

    get queryObject(): QueryObject {
        return {id: this._id, type: this.type, pLabel: this.PrimaryLabel}
    }
}

export class NodeInfoPart extends InfoPart {
    Info: BaseNodeInfo;
    Ctrl: BaseNodeCtrl;

    get type() {
        return this.Info.type
    }

    get allSettingItem() {
        let list = NodeSettingPart.list;
        return list.filter(node => node._id === this._id)
    }

    constructor(info: BaseNodeInfo, ctrl: BaseNodeCtrl, isRemote: boolean) {
        super(info, ctrl, isRemote);
        this.Info = info;
        this.Ctrl = ctrl;
    }

    static emptyNodeInfoPart(_id: id, _type: 'node' | 'document', _label: string) {
        return new NodeInfoPart(
            nodeInfoTemplate(_id, _type, _label),
            nodeCtrlTemplate(_type, _label),
            false
        );
    }

    changePrimaryLabel(newLabel: string) {
        if (this.State.isRemote) {
            // "如果是远端节点 那么PLabel不能修改"
        } else {
            let StandardProps = this.Info.StandardProps;
            Object.entries(nodeLabelToProp(newLabel)).map(([prop, value]) => {
                let {resolve, type} = value;
                Object.keys(StandardProps).indexOf(prop) === -1
                    ? (StandardProps[prop] = {resolve, type, value: fieldDefaultValue[type]})
                    : (StandardProps[prop] = deepClone(StandardProps[prop]));
            });
            Vue.set(this.Info, "StandardProps", StandardProps);
            Vue.set(this.Ctrl, "PrimaryLabel", newLabel);
            Vue.set(this.Info, "PrimaryLabel", newLabel);
            this.synchronizationSource("_label", newLabel);
            this.State.isEdit = true;
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
        crucialRegex.test(prop) &&
        this.allSettingItem.map(node =>
            node.updateCrucialProp(prop, value)
        );
    }

    synchronizationAll() {
        // 同步所有属性到Setting
        this.allSettingItem.map(node => {
            node.updateCrucialProp("_label", this.PrimaryLabel);
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

    get allSettingItem() {
        let linkList = LinkSettingPart.list;
        return linkList.filter(link => link._id === this._id)
    }

    constructor(info: BaseLinkInfo, ctrl: BaseLinkCtrl, isRemote: boolean) {
        super(info, ctrl, isRemote);
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
            linkCtrlTemplate(_start, _end),
            false
        );
    }

    changeLabel(newLabel: string) {
        this.updateValue("PrimaryLabel", newLabel);
        this.synchronizationSource("_label", newLabel);
    }

    changeNode(
        start: VisNodeSettingPart | null,
        end: VisNodeSettingPart | null
    ) {
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

    updateValue(prop: string, newValue: any) {
        if (ctrlPropRegex.test(prop)) {
            // "不要使用updateValue更新控制属性"
        } else {
            this.State.isEdit = true;
            Vue.set(this.Info, prop, newValue);
        }
    }

    synchronizationSource(prop: string, value: any) {
        crucialRegex.test(prop) &&
        this.allSettingItem.map(link =>
            link.updateCrucialProp(prop, value)
        );
    }

    synchronizationAll() {
        this.allSettingItem.map(link => {
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

    get allSettingItem() {
        let list = MediaSettingPart.list;
        return list.filter(media => media._id === this._id)
    }

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
        isRemote: boolean,
        status: MediaStatus,
        error: string[],
        file?: File,
    ) {
        super(info, ctrl, isRemote);
        file ? (this.file = file) : (this.file = null);
        this.status = status;
        this.error = error;
        this.State.isEdit = false;
        this.Info = info;
        this.Ctrl = ctrl;
    }

    static emptyMediaInfo(_id: id, file: File) {
        return new MediaInfoPart(
            mediaInfoTemplate(_id, file),
            mediaCtrlTemplate(file),
            false,
            "new",
            [],
            file
        );
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
        this.State.isEdit = true;
        this.synchronizationSource("_name", newName)
    }

    // info修改值
    updateValue(prop: string, newValue: any, doItPassive?: boolean) {
        if (!doItPassive) {
            if (ctrlPropRegex.test(prop) || prop === "PrimaryLabel") {
                // "不要使用updateValue更新控制属性"
            } else {
                this.State.isEdit = true;
                Vue.set(this.Info, prop, newValue);
            }
        } else {
            //空载的更新
            this.State.isEdit = true;
        }
    }

    synchronizationSource(prop: string, value: any) {
        crucialRegex.test(prop) &&
        this.allSettingItem.map(node =>
            node.updateCrucialProp(prop, value)
        );
    }

    synchronizationAll() {
        this.allSettingItem.map(node => {
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

    constructor(info: FragmentInfo, ctrl: FragmentCtrl, isRemote: boolean) {
        super(info, ctrl, isRemote);
        this.Info = info;
        this.Ctrl = ctrl
    }

    static fragmentFromItem(baseData: NodeInfoPart | MediaInfoPart | LinkInfoPart, _id: id, method: string) {
        let info = {
            _id,
            type: 'fragment',
            PrimaryLabel: isMediaInfoPart(baseData) ? 'image' : 'text',
            Name: baseData.Info.Name === '' ? baseData.Info.Name : 'NewFragment From ' + baseData.type + baseData._id,
            Labels: baseData.Info.Labels,
            Src: isMediaInfoPart(baseData) ? baseData.Ctrl.Thumb : '',
            Description: baseData.Info.Description
        } as FragmentInfo;

        let ctrl = {
            IsLinked: true,
            CreateType: 'System-' + method,
            CreateUser: getCookie('user_id'),
            SourceId: baseData._id,
            SourceType: baseData.type,
            SourceLabel: baseData.PrimaryLabel,
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
        crucialRegex.test(prop) && Vue.set(this.Setting, prop, value);
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
        return MediaSettingPart.emptyMediaSetting(media._id, media.PrimaryLabel, media.Info.Name, media.Ctrl.FileName, parent)
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

    static emptyRect(_id: id, parent: GraphSelfPart) {
        let _points = [] as PointObject[];
        let setting = svgSettingTemplate(_id, 'rect', _points);
        let state = svgStateTemplate();
        return new SvgSettingPart(setting, state, parent)
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
        let state = noteStateTemplate('isAdd');
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

    constructor(
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
        let state = graphStateTemplate("isSelf");
        return new GraphConf(setting, state, parent);
    }
}

export abstract class DocumentSelfPart {
    static list: Array<DocumentSelfPart> = [];
    static baseList: Array<BackendGraph> = [];
    draftId: number;
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

    protected constructor(Content: DocumentContent, Conf: ItemSettingPart, draftId?: number) {
        draftId || (draftId = 0);
        this.Conf = Conf;
        this.Content = Content;
        this.draftId = draftId;
    }

    protected commitItemToVuex(info: InfoPartInDataManager) {
        // commit过程
        commitInfoAdd({item: info, strict: false});
        let userConcern = userConcernTemplate();
        commitUserConcernAdd({_id: info._id, _type: info.type, userConcern});
    }
}

export class GraphSelfPart extends DocumentSelfPart {
    static list: Array<GraphSelfPart> = [];
    static baseList: Array<BackendGraph> = []; // 原始数据
    Content: DocumentContent;
    Conf: GraphConf;
    // 草稿保存
    draftId: number;
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

    constructor(graph: DocumentContent, conf: GraphConf, baseNode?: NodeSetting, draftId?: number, rect?: RectObject) {
        // 自动保存id
        super(graph, conf, draftId);
        draftId || (draftId = -1);
        this.draftId = draftId;
        // 设置
        this.Conf = conf;
        // Graph
        this.Content = graph;
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

    static emptyGraphSelfPart(_id: id, parent: DocumentSelfPart | null, commitToVuex?: boolean) {
        commitToVuex === undefined && (commitToVuex = true);
        let graphContent = emptyContent();
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
        let graph = emptyContent();
        let baseNodeSetting = baseData.Content.nodes.filter(setting => setting._id === baseData.Conf._id)[0];
        let result = new GraphSelfPart(
            graph,
            setting,
            baseNodeSetting
        );
        result.Content.nodes = baseData.Content.nodes.map(
            setting => new NodeSettingPart(setting, nodeStateTemplate(), result)
        );
        result.Content.medias = baseData.Content.medias.map(
            setting =>
                new MediaSettingPart(setting, nodeStateTemplate(), result)
        );
        result.Content.links = baseData.Content.links.map(setting => {
            let linkNode = {
                _start: result.Content.nodes.filter(node =>
                    itemEqual(setting._start, node.Setting)
                )[0],
                _end: result.Content.nodes.filter(node =>
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
        return list.filter(item => item._id === _id)[0]
    }

    allItems(): GraphSubItemSettingPart[] {
        let {nodes, links, medias, svgs} = this.Content;
        // @ts-ignore
        return nodes.concat(links).concat(medias).concat(svgs)
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
                : name === 'svg'
                    ? itemList = this.Content.svgs
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
                ? this.Content.svgs.push(item)
                : isLinkSetting(item) && this.Content.links.push(item)
    }

    getItemByState(name: GraphTypeS | GraphItemType, state: BaseStateKey) {
        let list = this.getItemListByName(name);
        return list.filter(item => item.State[state])
    }

    explode() {
        console.log('explode')
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
