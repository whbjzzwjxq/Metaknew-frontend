import {TreeNodeDoc} from "@/interface/interfaceTree";
import store from "@/store";
import {BackendDocument, BackendGraphWithNode} from "@/api/document/document";
import {DocumentDraft} from "@/api/subgraph/commonApi";
import {isDocumentType, isLinkSetting, isMediaSetting, isNodeSetting, isTextSetting} from "@/utils/typeCheck";
import {
    crucialRegex,
    deepClone,
    emptyContent,
    emptyDocumentComp,
    findItem,
    frontendIdRegex, getCookie,
    getIndex
} from "@/utils/utils";
import {commitDocumentAdd, commitSnackbarOff, commitSnackbarOn} from "@/store/modules/_mutations";
import {
    documentSettingTemplate,
    documentStateTemplate,
    linkStateTemplate,
    mediaSettingTemplate,
    nodeStateTemplate,
    noteSettingTemplate,
    noteStateTemplate,
    settingTemplateGraph,
    textSettingTemplate,
    textStateTemplate
} from "@/utils/template";
import {dispatchNoteInDocPush} from "@/store/modules/_dispatch";
import {getManager} from "@/store/modules/dataManager";
import {LinkInfoPart, MediaInfoPart, NodeInfoPart} from "@/class/info";
import {settingTemplatePaper} from "@/interface/style/templateStylePaper";

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

    get isRemote() {
        return frontendIdRegex.test(this._id.toString())
    }

    updateState(prop: AllStateProp, value?: boolean) {
        value === undefined && (value = !this.State[prop]);
        this.State[prop] = value
    }

    updateSetting(status: SettingGroupKey, propGroup: string, prop: string, value: any) {
        ////Vue.set检查过
        this.Setting[status][propGroup][prop] = value
    }

    updateCrucialProp(prop: AllCrucialProp, value: any) {
        crucialRegex.test(prop) && (this.Setting[prop] = value);
    }

    protected constructor(Setting: Setting, State: BaseState) {
        this.Setting = Setting;
        this.State = State;
    }
}

export class ItemSettingPart extends SettingPart {
    Setting: DocumentItemSetting;
    State: BaseState;
    _parent: DocumentSelfPart;

    protected constructor(Setting: DocumentItemSetting, State: BaseState, parent: DocumentSelfPart) {
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

    get _uniqueId() {
        return this.parent._id + '_' + this._id
    }

    get _type() {
        return this.Setting._type
    }

    get _name() {
        return this._type + this._id
    }

    get isFatherExplode() {
        return this.parent.isExplode
    }

    get isSelf() {
        if (this._type !== 'text' && this._type !== 'note') {
            return getManager(this._type)[this._id].isSelf
        } else {
            return this.parent.isSelf
        }
    }

    get isSelected(): boolean {
        return this.State.isSelected;
    }

    get StyleInGraph() {
        return this.Setting.InGraph
    }

    get StyleInPaper() {
        return this.Setting.InPaper
    }

    get isMain() {
        let main = this.StyleInGraph.View.isMain
        return typeof main === "boolean"
            ? main
            : false
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
        return new ItemSettingPart(setting, state, this.parent)
    }
}

export class NodeSettingPart extends ItemSettingPart {
    Setting: NodeSetting;
    State: NodeState;
    static list: NodeSettingPart[] = [];

    get _type() {
        return this.Setting._type
    }

    get _name() {
        return this.Setting._name
    }

    get boundDocument(): DocumentSelfPart {
        return this.parent.docsChildrenWithSelf.filter(graph => graph._id === this._id)[0]
    }

    get remoteDocument() {
        return store.state.dataManager.documentManager[this._id]
    }

    get StyleInGraph() {
        return this.Setting.InGraph
    }

    protected constructor(Setting: NodeSetting, State: NodeState, parent: DocumentSelfPart) {
        super(Setting, State, parent);
        this.Setting = Setting;
        this.State = State;
        this._parent = parent;
        NodeSettingPart.list.push(this);
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

    static emptyNodeSetting(payload: NodeInitPayload, parent: DocumentSelfPart) {
        let setting = Object.assign(payload, {
            InGraph: settingTemplateGraph("node"),
            InPaper: settingTemplatePaper('node')
        }) as NodeSetting;
        let state = nodeStateTemplate();
        return new NodeSettingPart(setting, state, parent) as NodeSettingPart
    }

    static resolveBackend(setting: NodeSetting, parent: DocumentSelfPart) {
        let state = nodeStateTemplate();
        return new NodeSettingPart(setting, state, parent) as NodeSettingPart
    }
}

export class MediaSettingPart extends ItemSettingPart {
    Setting: MediaSetting;
    State: MediaState;
    static list: MediaSettingPart[] = [];

    get _type() {
        return this.Setting._type
    }

    get _name() {
        return this.Setting._name
    }

    get StyleInGraph() {
        return this.Setting.InGraph
    }

    protected constructor(Setting: MediaSetting, State: MediaState, parent: DocumentSelfPart) {
        super(Setting, State, parent);
        this.Setting = Setting;
        this.State = State;
        this._parent = parent;
        MediaSettingPart.list.push(this);
    }

    static emptyMediaSetting(payload: MediaInitPayload, parent: DocumentSelfPart) {
        let setting = mediaSettingTemplate(payload);
        let state = nodeStateTemplate();
        return new MediaSettingPart(setting, state, parent);
    }

    static emptyMediaSettingFromInfo(media: MediaInfoPart, parent: DocumentSelfPart) {
        let {_id, _type, _label} = media
        let payload = {_id, _type, _label, _name: media.Info.Name, _src: media.Ctrl.FileName} as MediaSetting
        return MediaSettingPart.emptyMediaSetting(payload, parent)
    }

    static resolveBackend(setting: MediaSetting, parent: DocumentSelfPart) {
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

export class LinkSettingPart extends ItemSettingPart {
    Setting: LinkSetting;
    State: LinkState;
    static list: LinkSettingPart[] = [];

    get _type() {
        return this.Setting._type
    }

    get _name() {
        return this._start._name.substring(0, 4) + '->' + this._end._name.substring(0, 4)
    }

    get _start(): VisNodeSettingPart {
        return this.Setting._start
    }

    set _start(value) {
        this.Setting._start = value
    }

    get _end(): VisNodeSettingPart {
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

    get StyleInGraph() {
        return this.Setting.InGraph
    }

    get isDeleted() {
        let {_start, _end} = this;
        return this.State.isDeleted || _start.isDeleted || _end.isDeleted
    }

    // 是否绑定正确
    get isBound() {
        return this._start !== undefined && this._end !== undefined
    }

    protected constructor(Setting: LinkSetting, State: LinkState, parent: DocumentSelfPart) {
        super(Setting, State, parent);
        this.Setting = Setting;
        this.State = State;
        this._parent = parent;
        LinkSettingPart.list.push(this);
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

    static emptyLinkSetting(payload: LinkSetting, parent: DocumentSelfPart) {
        let setting = Object.assign(payload, {
            InGraph: settingTemplateGraph("link")
        });
        let state = linkStateTemplate();
        return new LinkSettingPart(setting, state, parent)
    }

    static resolveBackend(linkSetting: BackendLinkSetting, parent: DocumentSelfPart) {
        let setting = {
            ...linkSetting,
            _start: parent.getVisNodeById({_id: linkSetting._start.id, _type: linkSetting._start.type}),
            _end: parent.getVisNodeById({_id: linkSetting._end.id, _type: linkSetting._end.type})
        } as LinkSetting;
        let state = linkStateTemplate();
        return new LinkSettingPart(setting, state, parent)
    }
}

export class TextSettingPart extends ItemSettingPart {
    Setting: TextSetting;
    State: TextState;
    static list: TextSettingPart[] = [];

    get _type() {
        return this.Setting._type
    }

    get StyleInGraph() {
        return this.Setting.InGraph
    }

    get _name() {
        return this.Setting._text
    }

    protected constructor(Setting: TextSetting, State: TextState, parent: DocumentSelfPart) {
        super(Setting, State, parent);
        this.Setting = Setting;
        this.State = State;
        this._parent = parent;
        TextSettingPart.list.push(this)
    }

    static emptyRect(_id: id, parent: DocumentSelfPart) {
        let _points = [] as PointObject[];
        let setting = textSettingTemplate(_id, 'rect', _points);
        let state = textStateTemplate();
        return new TextSettingPart(setting, state, parent)
    }

    static resolveBackend(setting: TextSetting, parent: DocumentSelfPart) {
        let state = textStateTemplate();
        return new TextSettingPart(setting, state, parent)
    }

    deepCloneSelf(): TextSettingPart {
        let setting = deepClone(this.Setting);
        let state = deepClone(this.State);
        return new TextSettingPart(setting, state, this.parent)
    }
}

export class NoteSettingPart extends ItemSettingPart {
    Setting: NoteSetting;
    State: NoteState;
    static list: NoteSettingPart[] = [];

    constructor(Setting: NoteSetting, State: NoteState, parent: DocumentSelfPart) {
        super(Setting, State, parent);
        this.Setting = Setting;
        this.State = State;
        NoteSettingPart.list.push(this)
    }

    static emptyNoteSetting(_id: id, parent: DocumentSelfPart, commitToVuex?: boolean) {
        let setting = Object.assign({
            _id,
            _type: 'note',
            _label: 'text',
            _title: '',
            _content: '',
            _user: getCookie('user_id')
        }, {
            InGraph: settingTemplateGraph('note'),
            InPaper: {}
        }) as NoteSetting;
        let state = noteStateTemplate();
        let note = new NoteSettingPart(setting, state, parent);
        commitToVuex === undefined && (commitToVuex = true);
        commitToVuex && dispatchNoteInDocPush({note});
        return note
    }
}

export class DocumentConfigure extends SettingPart {
    State: DocumentState;
    Setting: DocumentSetting;

    get _type() {
        return this.Setting._type
    }

    protected constructor(setting: DocumentSetting, state: DocumentState) {
        super(setting, state);
        this.State = state;
        this.Setting = setting;
    }

    static emptyGraphConf(_id: id) {
        let setting = documentSettingTemplate(_id)
        let state = documentStateTemplate()
        return new DocumentConfigure(setting, state)
    }

    static resolveBackend(setting: DocumentSetting) {
        let state = documentStateTemplate()
        return new DocumentConfigure(setting, state)
    }
}

export class DocumentSelfPart {
    Content: DocumentContent;
    Conf: DocumentConfigure;
    Components: DocumentComponents;
    //以下构建时定义
    treeNode: TreeNodeDoc;
    protected MetaData: DocumentMetaData;
    static baseList: BackendGraphWithNode[] = []

    protected constructor(
        Content: DocumentContent,
        Conf: DocumentConfigure,
        comps: DocumentComponents,
        parent: DocumentSelfPart | null,
        meta: DocumentMetaData
    ) {
        this.Conf = Conf;
        this.Content = Content;
        this.Components = comps;
        this.MetaData = meta;
        this.treeNode = new TreeNodeDoc(this, parent);
        if (this.nodeSelf === undefined) {
            let {_id, _type, _label} = Conf;
            let node = NodeSettingPart.emptyNodeSetting({
                _id,
                _type,
                _label,
                _name: 'NewDoc' + _id,
                _image: ''
            }, this);
            this.Content.nodes.push(node);
        } else {
            // 检查完成
        }
        // 专题已经添加到父亲中去了
        parent && parent.addItems([this.nodeSelf.deepCloneSelf()]);
        this.addEmptyText()
    }

    static emptyInit(_id: id, parent: DocumentSelfPart | null, commitToVuex: boolean = true) {
        let graphContent = emptyContent();
        let setting = DocumentConfigure.emptyGraphConf(_id);
        let meta = {
            isTemporary: false,
            isRemoteModel: false,
        } as DocumentMetaData
        let comps = emptyDocumentComp();
        let nodeQuery = {id: _id, type: 'document', pLabel: '_DocGraph'} as DocumentQuery;
        let info = NodeInfoPart.emptyNodeInfoPart(nodeQuery, commitToVuex);
        let graph = new DocumentSelfPart(graphContent, setting, comps, parent, meta);
        let payload = {graph, info};
        commitToVuex && commitDocumentAdd({document: graph, strict: false});
        return payload
    }

    static backendInit(data: BackendGraphWithNode, parent: DocumentSelfPart | null, commitToVuex: boolean = true) {
        DocumentSelfPart.baseList.push(data);
        let setting = DocumentConfigure.resolveBackend(data.Conf);
        let graphContent = emptyContent();
        let Comps = data.Comps;
        let meta = {
            isTemporary: false,
            isRemoteModel: true
        }
        let graph = new DocumentSelfPart(graphContent, setting, Comps, parent, meta);
        let info = NodeInfoPart.resolveBackend(data.Base, commitToVuex);
        let {nodes, links, medias, texts} = data.Content;
        graph.Content.nodes = nodes.map(setting => NodeSettingPart.resolveBackend(setting, graph));
        graph.Content.medias = medias.map(setting => MediaSettingPart.resolveBackend(setting, graph));
        graph.Content.links = links.map(setting => LinkSettingPart.resolveBackend(setting, graph))
            .filter(link => link.Setting._start && link.Setting._end);
        graph.Content.texts = texts.map(setting => TextSettingPart.resolveBackend(setting, graph));
        commitToVuex && commitDocumentAdd({document: graph, strict: false});
        return {graph, info}
    }

    static collectInit(payload: DocumentInitPayload, items: ItemSettingPart[], deleteSource: boolean = true) {
        let {_id, parent, commitToVuex} = payload;
        let newGraph = DocumentSelfPart.emptyInit(_id, parent, commitToVuex).graph;
        newGraph.collectItems(items, deleteSource);
        return newGraph
    }

    // prop
    get _id() {
        return this.Conf._id
    }

    get _name() {
        return this.nodeSelf._name
    }

    get _label() {
        return this.Conf._label
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

    get isGraph() {
        return this._label === '_DocGraph'
    }

    get isPaper() {
        return this._label === '_DocPaper'
    }

    get isSelf() {
        return store.state.dataManager.nodeManager[this._id].isSelf
    }

    get isFatherExplode(): boolean {
        return this.parent === null || this.parent.isFatherExplode
    }

    get isExplode() {
        return this.isExplodeState && this.isFatherExplode
    }

    get isExplodeState() {
        return this.Conf.State.isExplode
    }

    explode(value?: boolean) {
        value === undefined && (value = !this.Conf.State.isExplode)
        !this.isRoot && (this.Conf.State.isExplode = value)
    }

    get isDeleted() {
        return this.treeNode.isDeleted
    }

    get parent() {
        return this.treeNode.parent
            ? this.treeNode.parent.boundObject
            : null
    }

    get rect() {
        if (this.parent) {
            let rect = this.parent.CompInGraph.SubGraph.filter(graph => graph.id === this._id)[0]
            if (rect === undefined) {
                rect = {id: this._id, width: 600, height: 400}
                this.parent.CompInGraph.SubGraph.push(rect)
                return rect
            } else {
                return rect
            }
        } else {
            return {id: this._id, width: 600, height: 400} as RectObject
        }
    }

    set rect(value: RectObject) {
        let {width, height} = value
        this.rect.width = width
        this.rect.height = height
    }

    get CompInGraph() {
        return this.Components.InGraph
    }

    get CompInPaper() {
        return this.Components.InPaper
    }

    get selfSettingInGraph() {
        return this.nodeSelf.Setting.InGraph
    }

    //node
    get nodesAll() {
        return this.Content.nodes
    }

    get nodes(): NodeSettingPart[] {
        return this.nodesAll.filter(item => !item.isDeleted)
    }

    get nodesWithoutSelf(): NodeSettingPart[] {
        return this.nodes.filter(node => node._id !== this._id)
    }

    get nodeSelf(): NodeSettingPart {
        return this.nodesAll.filter(node => node._id === this._id)[0]
    }

    get nodesAllSubDoc() {
        // root Graph自己的节点显示
        let result = this.nodes;
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
        let result = this.links;
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
        let result = [];
        result.push(...this.nodesAllSubDoc, ...this.linksAllSubDoc, ...this.medias, ...this.texts);
        return result
    }

    //doc
    get docsRootList(): DocumentSelfPart[] {
        return this.treeNode.parentNodeList.map(node => node.boundObject)
    }

    get docRoot() {
        return this.treeNode.rootNode.boundObject
    }

    get docsChildrenAll(): DocumentSelfPart[] {
        // 所有孩子doc
        return this.treeNode.childrenAll.map(node => node.boundObject)
    }

    get docsChildren(): DocumentSelfPart[] {
        return this.treeNode.childrenActive.map(node => node.boundObject)
    }

    get docsChildrenWithSelf() {
        let result = [] as DocumentSelfPart[]
        result.push(...this.docsChildren)
        result.push(this)
        return result
    }

    get dataQueryObject() {
        return this.Conf.queryObject
    }

    get dataBackendDocument() {
        let Content: Record<string, DocumentItemSetting[]> = {};
        Object.entries(this.Content).map(([key, items]) => {
            Content[key] = items.filter((item: ItemSettingPart) => !item.isDeleted).map((item: ItemSettingPart) => item.compress)
        });
        return {
            Content,
            Conf: this.Conf.Setting,
        } as BackendDocument
    }

    get dataDraftObject(): DocumentDraft {
        return {
            Query: this.dataQueryObject,
            Name: this._name,
            VersionId: this.MetaData.draftId,
            Content: this.dataBackendDocument
        }
    }

    get allItems(): SubItemSettingPart[] {
        let {nodes, links, medias, texts} = this;
        let result: SubItemSettingPart[];
        result = [];
        return result.concat(nodes).concat(links).concat(medias).concat(texts)
    }

    updateStateUpdate() {
        this.Conf.State.isSaved = true
    }

    updateStateSave() {
        this.updateStateUpdate();
    }

    getItemListByName(name: ContentTypeS | DocumentItemType): SubItemSettingPart[] {
        let itemList;
        if (isDocumentType(name)) {
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

    getItemById(payload: { _id: id, _type: DocumentItemType }) {
        let {_id, _type} = payload;
        let list = this.getItemListByName(_type);
        return list.filter(item => item._id === _id)[0]
    }

    getVisNodeById(payload: { _id: id, _type: 'node' | 'document' | 'media' }) {
        let {_id, _type} = payload;
        let list = this.getItemListByName(_type);
        return list.filter(item => item._id === _id)[0] as VisNodeSettingPart
    }

    checkExistByIdType(payload: { _id: id, _type: DocumentItemType }) {
        let {_id, _type} = payload;
        let itemList = this.getItemListByName(_type);
        return findItem(itemList, _id, _type).length > 0
    }

    checkExistByItem(item: ItemSettingPart) {
        return this.checkExistByIdType(item)
    }

    getItemByState(name: ContentTypeS | DocumentItemType, state: StateKeyBase) {
        let list = this.getItemListByName(name);
        return list.filter(item => item.State[state])
    }

    deleteItem(payload: { _id: id, _type: DocumentItemType }, snackBarOn: boolean = true) {
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

    rollBackDelete(payload: { _id: id, _type: DocumentItemType }) {
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

    addItems(items: ItemSettingPart[]) {
        items.filter(item => !this.checkExistByItem(item)).map(item => {
            item.State.isAdd = true;
            // 额外处理专题
            if (isNodeSetting(item)) {
                let graph = item.boundDocument;
                console.log(graph, item)
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

    collectItems(items: ItemSettingPart[], deleteSource: boolean) {
        items.map(item => {
            //复制在前 要不然删除了
            let newItem = item.deepCloneSelf();
            this.addItems([newItem]);
            deleteSource && item.parent.deleteItem(item, false);
        })
    }

    protected pushItem(item: ItemSettingPart) {
        item._parent = this;
        isMediaSetting(item)
            ? this.Content.medias.push(item)
            : isNodeSetting(item)
            ? this.Content.nodes.push(item)
            : isTextSetting(item)
                ? this.Content.texts.push(item)
                : isLinkSetting(item) && this.Content.links.push(item)
    }

    addEmptyNode(_type: 'node' | 'document', _label?: string, commitToVuex: boolean = true) {
        _label || (_label = 'BaseNode');
        let _id = getIndex();
        let nodeQuery = {id: _id, type: _type, pLabel: _label} as NodeQuery;
        let info = NodeInfoPart.emptyNodeInfoPart(nodeQuery, commitToVuex);
        let payload = {
            _id,
            _type,
            _label,
            _name: 'NewNode' + _id,
            _image: ''
        } as NodeInitPayload
        let setting = NodeSettingPart.emptyNodeSetting(payload, this);
        this.addItems([setting]);
        return {setting, info}
    }

    addEmptyLink(_start: VisNodeSettingPart, _end: VisNodeSettingPart, _label?: string, commitToVuex: boolean = true) {
        _label || (_label = 'Default');
        let _id = getIndex();
        // info
        let info = LinkInfoPart.emptyLinkInfo(_id, _label, _start, _end, commitToVuex);
        // setting
        let payload = {
            _id,
            _type: 'link',
            _label,
            _start,
            _end
        } as LinkSetting
        let setting = LinkSettingPart.emptyLinkSetting(payload, this);
        this.addItems([setting]);
        return {setting, info};
    }

    addEmptyGraph(commitToVuex: boolean = true) {
        let _id = getIndex();
        let {graph, info} = DocumentSelfPart.emptyInit(_id, this, commitToVuex);
        return {graph, info}
    }

    addEmptyNote() {
        let id = getIndex();
        NoteSettingPart.emptyNoteSetting(id, this, true)
    }

    addEmptyText() {
        let _id = getIndex();
        let rect = TextSettingPart.emptyRect(_id, this);
        this.addItems([rect])
    }
}
