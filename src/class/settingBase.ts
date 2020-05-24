import {TreeNodeDoc} from "@/interface/interfaceTree";
import store from "@/store";
import {BackendDocument, BackendGraphWithNode} from "@/api/document/document";
import {DocumentDraft} from "@/api/subgraph/commonApi";
import {
    isDocumentType,
    isLinkSettingPart,
    isMediaSettingPart,
    isNodeSettingPart,
    isTextSettingPart
} from "@/utils/typeCheck";
import {
    crucialRegex,
    deepClone,
    findItem,
    frontendIdRegex,
    getCookie,
    getIndex,
    getSrc,
    mergeObject
} from "@/utils/utils";
import {commitDocumentAdd, commitSnackbarOff, commitSnackbarOn} from "@/store/modules/_mutations";
import {linkStateTemplate, nodeStateTemplate, noteStateTemplate, textStateTemplate} from "@/utils/template";
import {dispatchNoteInDocPush} from "@/store/modules/_dispatch";
import {getManager} from "@/store/modules/dataManager";
import {LinkInfoPart, MediaInfoPart, NodeInfoPart} from "@/class/info";
import {nodeSettingGroupInPaper, settingTemplatePaper} from "@/interface/style/templateStylePaper";
import {PaperComponentSection} from "@/class/settingPaper";
import {
    linkSettingGroupInGraph,
    mediaSettingInGraph,
    nodeSettingGroupInGraph,
    noteSettingGroupInGraph,
    textSettingGroupInGraph
} from "@/interface/style/templateStyleGraph";
import {handleSettingConfAllToValue} from "@/interface/style/interfaceStyleBase";
import PDFJS from "pdfjs-dist";
import {GraphLayer} from "@/class/settingGraph";

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
        return !frontendIdRegex.test(this._id.toString())
    }

    updateState(prop: AllStateProp, value?: boolean) {
        value === undefined && (value = !this.State[prop]);
        this.State[prop] = value
    }

    updateCrucialProp(prop: keyof Setting, value: any) {
        crucialRegex.test(prop) && (this.Setting[prop] = value);
    }

    protected constructor(Setting: Setting, State: BaseState) {
        this.Setting = Setting;
        this.State = State;
    }
}

export class DocumentItemSettingPart extends SettingPart {
    Setting: DocumentItemSetting;
    State: DocumentItemState;
    _parent: DocumentSelfPart;

    protected constructor(Setting: DocumentItemSetting, State: DocumentItemState, parent: DocumentSelfPart) {
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

    set _type(value) {
        this.Setting._type = value
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
        return this.Setting._isMain
    }

    updateGraphSetting(propGroup: string, prop: string, value: any) {
        //Vue.set检查过
        this.Setting.InGraph[propGroup][prop] = value
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
        return new DocumentItemSettingPart(setting, state, this.parent)
    }
}

export class NodeSettingPart extends DocumentItemSettingPart {
    Setting: NodeSetting;
    State: NodeState;
    static list: NodeSettingPart[] = [];

    protected constructor(Setting: NodeSetting, State: NodeState, parent: DocumentSelfPart) {
        super(Setting, State, parent);
        this.Setting = Setting;
        this.State = State;
        this._parent = parent;
        NodeSettingPart.list.push(this);
    }

    static nodeSettingDefault(payload: NodeInitPayload): NodeSetting {
        return {
            ...payload,
            InGraph: handleSettingConfAllToValue(nodeSettingGroupInGraph()),
            InPaper: handleSettingConfAllToValue(nodeSettingGroupInPaper()),
        }
    }

    static initEmpty(payload: NodeInitPayload, parent: DocumentSelfPart) {
        let setting = this.nodeSettingDefault(payload)
        let state = nodeStateTemplate();
        return new NodeSettingPart(setting, state, parent) as NodeSettingPart
    }

    static initFromBackend(setting: NodeSetting, parent: DocumentSelfPart) {
        let state = nodeStateTemplate();
        return new NodeSettingPart(setting, state, parent) as NodeSettingPart
    }

    get _type() {
        return this.Setting._type
    }

    get _name() {
        return this.Setting._name
    }

    get boundDocument(): DocumentSelfPart | undefined {
        return this.parent._id === this._id
            ? this.parent
            : this.remoteDocument && this.remoteDocument.parent
                ? this.remoteDocument.parent._id === this.parent._id
                    ? this.remoteDocument
                    : undefined
                : undefined
    }

    get remoteDocument(): DocumentSelfPart | undefined {
        return store.state.dataManager.documentManager[this._id]
    }

    get StyleInGraph() {
        return this.Setting.InGraph
    }

    updateCrucialProp(prop: keyof NodeSetting, value: any) {
        //参数解构 覆盖顺序 后面覆盖前面
        crucialRegex.test(prop) && (this.Setting = {
            ...this.Setting,
            [prop]: value
        });
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

export class MediaSettingPart extends DocumentItemSettingPart {
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

    get _image() {
        return ''
    }

    protected constructor(Setting: MediaSetting, State: MediaState, parent: DocumentSelfPart) {
        super(Setting, State, parent);
        this.Setting = Setting;
        this.State = State;
        this._parent = parent;
        MediaSettingPart.list.push(this);
    }

    static mediaSettingDefault(payload: MediaInitPayload) {
        let {_src, _label} = payload;
        let setting = {
            ...payload,
            InGraph: handleSettingConfAllToValue(mediaSettingInGraph()),
            InPaper: settingTemplatePaper('media')
        } as MediaSetting;
        if (_label === 'image') {
            let image = new Image();
            image.addEventListener('load', function () {
                setting.InGraph.Base.scaleX = image.height / image.width;
            }, false)
            image.src = getSrc(_src);
        }
        if (_label === 'pdf') {
            let loadingTask = PDFJS.getDocument(_src);
            loadingTask.promise.then(function (pdf: any) {
                pdf.getPage(1).then(function (page: any) {
                    let viewport = page.getViewport({scale: 1.5});
                    setting.InGraph.Base.size = viewport.width;
                    setting.InGraph.Base.scaleX = viewport.height / viewport.width;
                });
            })
        }
        return setting
    }

    static initEmpty(payload: MediaInitPayload, parent: DocumentSelfPart) {
        let setting = this.mediaSettingDefault(payload);
        let state = nodeStateTemplate();
        return new MediaSettingPart(setting, state, parent);
    }

    static emptyMediaSettingFromInfo(media: MediaInfoPart, parent: DocumentSelfPart) {
        let {_id, _type, _label} = media
        let payload = {
            _id,
            _type,
            _label,
            _name: media.Info.Name,
            _src: media.Ctrl.FileName,
            _isMain: false
        } as MediaInitPayload
        return MediaSettingPart.initEmpty(payload, parent)
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

    updateCrucialProp(prop: keyof MediaSetting, value: any) {
        crucialRegex.test(prop) && (this.Setting = {
            ...this.Setting,
            [prop]: value
        });
    }
}

export class LinkSettingPart extends DocumentItemSettingPart {
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

    //是否是纯节点关系
    get isPureNodeLink() {
        return isNodeSettingPart(this._start) && isNodeSettingPart(this._end)
    }

    protected constructor(Setting: LinkSetting, State: LinkState, parent: DocumentSelfPart) {
        super(Setting, State, parent);
        this.Setting = Setting;
        this.State = State;
        this._parent = parent;
        LinkSettingPart.list.push(this);
    }

    updateCrucialProp(prop: keyof MediaSetting, value: any) {
        crucialRegex.test(prop) && (this.Setting = {
            ...this.Setting,
            [prop]: value
        });
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
            ...deepClone(this.Setting, ['_start', '_end']),
            _start: this.Setting._start,
            _end: this.Setting._end
        };
        return new LinkSettingPart(setting, state, this.parent)
    }

    static linkSettingDefault(payload: LinkInitPayload): LinkSetting {
        return {
            ...payload,
            InGraph: handleSettingConfAllToValue(linkSettingGroupInGraph),
            InPaper: handleSettingConfAllToValue(linkSettingGroupInGraph),
        }
    }

    static emptyLinkSetting(payload: LinkInitPayload, parent: DocumentSelfPart) {
        let setting = this.linkSettingDefault(payload);
        let state = linkStateTemplate();
        return new LinkSettingPart(setting, state, parent)
    }

    static resolveBackend(linkSetting: LinkSettingBackend, parent: DocumentSelfPart) {
        let setting = {
            ...linkSetting,
            _start: parent.getVisNodeById({_id: linkSetting._start.id, _type: linkSetting._start.type}),
            _end: parent.getVisNodeById({_id: linkSetting._end.id, _type: linkSetting._end.type})
        } as LinkSetting;
        let state = linkStateTemplate();
        return new LinkSettingPart(setting, state, parent)
    }
}

export class TextSettingPart extends DocumentItemSettingPart {
    Setting: TextSetting;
    State: TextState;
    static list: TextSettingPart[] = [];

    get _type() {
        return this.Setting._type
    }

    get _name() {
        return this.Setting._text
    }

    get StyleInGraph() {
        return this.Setting.InGraph
    }

    protected constructor(Setting: TextSetting, State: TextState, parent: DocumentSelfPart) {
        super(Setting, State, parent);
        this.Setting = Setting;
        this.State = State;
        this._parent = parent;
        TextSettingPart.list.push(this)
    }

    static textSettingDefault(payload: TextInitPayload) {
        return {
            ...payload,
            InGraph: handleSettingConfAllToValue(textSettingGroupInGraph()),
            InPaper: handleSettingConfAllToValue(nodeSettingGroupInPaper())
        } as TextSetting
    }

    static emptyRect(payload: TextInitPayload, parent: DocumentSelfPart) {
        let setting = this.textSettingDefault(payload)
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

export class NoteSettingPart extends SettingPart {
    Setting: NoteSetting;
    State: NoteState;
    _parent: DocumentSelfPart;
    static list: NoteSettingPart[] = [];

    get parent() {
        return this._parent
    }

    constructor(Setting: NoteSetting, State: NoteState, parent: DocumentSelfPart) {
        super(Setting, State);
        this.Setting = Setting;
        this.State = State;
        this._parent = parent;
        NoteSettingPart.list.push(this)
    }

    static noteSettingDefault(_id: id) {
        return {
            _id,
            _type: 'note',
            _label: 'text',
            _title: '',
            _content: '',
            _user: getCookie('user_id'),
            InGraph: handleSettingConfAllToValue(noteSettingGroupInGraph()),
            InPaper: handleSettingConfAllToValue(nodeSettingGroupInPaper())
        } as NoteSetting
    }

    static initEmpty(_id: id, parent: DocumentSelfPart, commitToVuex?: boolean) {
        let setting = this.noteSettingDefault(_id)
        let state = noteStateTemplate();
        let note = new NoteSettingPart(setting, state, parent);
        commitToVuex === undefined && (commitToVuex = true);
        commitToVuex && dispatchNoteInDocPush({note});
        return note
    }
}

export class DocumentSelfPart extends SettingPart {
    //节点 关系等各项内容
    Content: DocumentContent;
    //
    State: DocumentState;
    Setting: DocumentSetting;
    Components: DocumentComponent;
    //从后端读取
    protected MetaData: DocumentMetaData;
    //以下构建时定义
    protected _treeNode: TreeNodeDoc;
    static baseList: BackendGraphWithNode[] = []

    protected constructor(
        content: DocumentContent,
        comps: DocumentComponent,
        meta: DocumentMetaData,
        setting: DocumentSetting,
        state: DocumentState,
        parent: DocumentSelfPart | null,
    ) {
        super(setting, state);
        this.State = state;
        this.Setting = setting;
        this.Content = content;
        this.Components = comps;
        this.MetaData = meta;
        this._treeNode = new TreeNodeDoc(this, parent);
        if (this.nodeSelf === undefined) {
            let {_id, _type, _label} = setting;
            let node = NodeSettingPart.initEmpty({
                _id,
                _type,
                _label,
                _name: 'NewDoc' + _id,
                _image: '',
                _isMain: false,
            }, this);
            this.Content.nodes.push(node);
        } else {
            // 检查完成
        }
        // 专题已经添加到父亲中去了
        if (parent) {
            parent.addItems([this.nodeSelf.deepCloneSelf()]);
            parent.treeNode._addNode([this.treeNode])
        }
    }

    static documentStateDefault() {
        return {
            isSaved: false,
            isDeleted: false,
            isExplode: true
        } as DocumentState
    }

    static documentContentDefault() {
        return {
            nodes: [],
            links: [],
            medias: [],
            texts: []
        } as DocumentContent
    }

    static documentMetaDataDefault() {
        return {
            isTemporary: false,
            isRemoteModel: false,
        } as DocumentMetaData
    }

    static documentSettingDefault(_id: id) {
        return {
            _id,
            _type: 'document',
            _label: '_Document'
        } as DocumentSetting
    }

    static documentComponentsDefault() {
        return {
            InGraph: {
                SubGraph: [],
                Group: {
                    Dict: {},
                    Layer: []
                }
            },
            InPaper: {
                Sections: PaperComponentSection.initEmptyComponent()
            }
        } as DocumentComponent
    }

    static initEmpty(_id: id, parent: DocumentSelfPart | null, commitToVuex: boolean = true) {
        //default 部分
        let content = this.documentContentDefault();
        let setting = this.documentSettingDefault(_id);
        let state = this.documentStateDefault()
        let meta = this.documentMetaDataDefault()
        let comps = this.documentComponentsDefault();
        //info
        let nodeQuery = {id: _id, type: 'document', pLabel: '_Document'} as DocumentQuery;
        let info = NodeInfoPart.emptyNodeInfoPart(nodeQuery, commitToVuex);

        //构建
        let graph = new DocumentSelfPart(content, comps, meta, setting, state, parent);
        commitToVuex && commitDocumentAdd({document: graph, strict: false});
        return {graph, info}
    }

    static initBackend(data: BackendGraphWithNode, parent: DocumentSelfPart | null, commitToVuex: boolean = true) {
        DocumentSelfPart.baseList.push(data);
        let comps = mergeObject(this.documentComponentsDefault(), data.Components, {rewriteValue: true})
        let meta = data.MetaData;
        let setting = data.Setting;
        let content = this.documentContentDefault();
        let state = this.documentStateDefault();
        let graph = new DocumentSelfPart(content, comps, meta, setting, state, parent);
        let info = NodeInfoPart.resolveBackend(data.Base, commitToVuex);
        //comp-section
        graph.CompInPaper.Sections = PaperComponentSection.initFromBackend(graph.CompInPaper.Sections)
        //comp-graph-layer
        graph.GraphLayerList = graph.GraphLayerList.map(layer => GraphLayer.initBackend(graph, layer))

        let {nodes, links, medias, texts} = data.Content;
        graph.Content.nodes = nodes.map(setting => NodeSettingPart.initFromBackend(setting, graph));
        graph.Content.medias = medias.map(setting => MediaSettingPart.resolveBackend(setting, graph));
        graph.Content.links = links.map(setting => LinkSettingPart.resolveBackend(setting, graph))
            .filter(link => link.Setting._start && link.Setting._end);
        graph.Content.texts = texts.map(setting => TextSettingPart.resolveBackend(setting, graph));
        graph.CompInPaper.Sections.rowAll.map(row => row.injectItems(graph.itemsAll))
        //提交到vuex
        commitToVuex && commitDocumentAdd({document: graph, strict: false});
        return {graph, info}
    }

    static initCollect(payload: DocumentInitPayload, items: DocumentItemSettingPart[], deleteSource: boolean = true) {
        let {_id, parent, commitToVuex} = payload;
        let newGraph = DocumentSelfPart.initEmpty(_id, parent, commitToVuex).graph;
        newGraph.collectItems(items, deleteSource);
        return newGraph
    }

    get _name() {
        return this.nodeSelf._name
    }

    get _uniqueId() {
        return this.nodeSelf._uniqueId
    }

    get treeNode() {
        return this._treeNode
    }

    get isRemote() {
        return this.MetaData.isRemoteModel
    }

    set isRemote(value: boolean) {
        this.MetaData.isRemoteModel = value
    }

    get isRoot() {
        return this._treeNode.isRoot
    }

    set isRoot(value: boolean) {
        this._treeNode.isRoot = value
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
        return this.State.isExplode
    }

    explode(value?: boolean) {
        value === undefined && (value = !this.State.isExplode)
        !this.isRoot && (this.State.isExplode = value)
    }

    get parent() {
        return this._treeNode.parent
            ? this._treeNode.parent.boundObject
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

    get GraphLayerList() {
        return this.CompInGraph.Group.Layer
    }

    set GraphLayerList(value: GraphLayer[]) {
        this.CompInGraph.Group.Layer = value
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

    get itemsAll(): SubItemSettingPart[] {
        let {nodes, links, medias, texts} = this;
        let result: SubItemSettingPart[];
        result = [];
        return result.concat(nodes).concat(links).concat(medias).concat(texts)
    }

    //doc
    get docsRootList(): DocumentSelfPart[] {
        return this._treeNode.parentNodeList.map(node => node.boundObject)
    }

    get docsChildrenAll(): DocumentSelfPart[] {
        // 所有孩子doc
        return this._treeNode.childrenAll.map(node => node.boundObject)
    }

    get docsChildren(): DocumentSelfPart[] {
        return this._treeNode.childrenActive.map(node => node.boundObject)
    }

    get dataQueryObject() {
        return this.queryObject
    }

    get dataBackendDocument() {
        let {Content, Components, Setting, MetaData} = this;
        //压缩组件在前 隐含了Paper的序列信息
        let componentsCompressed = {
            InGraph: {
                SubGraph: Components.InGraph.SubGraph,
                Group: {
                    Layer: Components.InGraph.Group.Layer.filter(layer => !layer.isDeleted).map(layer => layer.compress())
                }
            },
            InPaper: {
                Sections: Components.InPaper.Sections.compress()
            }
        } as DocumentComponentBackend;

        //压缩Content
        let contentCompressed: Record<string, DocumentItemSetting[]> = {};
        Object.entries(Content).map(([key, items]) => {
            contentCompressed[key] = items.filter((item: DocumentItemSettingPart) => !item.isDeleted).map((item: DocumentItemSettingPart) => item.compress)
        });
        return {
            Content: contentCompressed,
            Components: componentsCompressed,
            Setting,
            MetaData
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

    updateStateUpdate() {
        this.State.isSaved = true
    }

    updateStateSave() {
        this.updateStateUpdate();
        this.isRemote = true
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

    checkExistByItem(item: DocumentItemSettingPart) {
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
                graph && graph.updateState('isDeleted', true)
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
                graph && graph.updateState('isDeleted', false)
            }
            commitSnackbarOff()
        }
    }

    addItems(items: DocumentItemSettingPart[]) {
        items.filter(item => !this.checkExistByItem(item)).map(item => {
            // 额外处理专题
            if (isNodeSettingPart(item)) {
                let graph = item.boundDocument;
                graph && this._treeNode._addNode([graph._treeNode])
                // 额外处理link
            } else if (isLinkSettingPart(item)) {
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

    collectItems(items: DocumentItemSettingPart[], deleteSource: boolean) {
        items.map(item => {
            //复制在前 要不然删除了
            let newItem = item.deepCloneSelf();
            this.addItems([newItem]);
            deleteSource && item.parent.deleteItem(item, false);
        })
    }

    protected pushItem(item: DocumentItemSettingPart) {
        item._parent = this;
        isMediaSettingPart(item)
            ? this.Content.medias.push(item)
            : isNodeSettingPart(item)
            ? this.Content.nodes.push(item)
            : isTextSettingPart(item)
                ? this.Content.texts.push(item)
                : isLinkSettingPart(item) && this.Content.links.push(item)
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
            _image: '',
            _isMain: false
        } as NodeInitPayload
        let setting = NodeSettingPart.initEmpty(payload, this);
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
            _end,
            _isMain: false
        } as LinkInitPayload
        let setting = LinkSettingPart.emptyLinkSetting(payload, this);
        this.addItems([setting]);
        return {setting, info};
    }

    addEmptyGraph(commitToVuex: boolean = true) {
        let _id = getIndex();
        let {graph, info} = DocumentSelfPart.initEmpty(_id, this, commitToVuex);
        return {graph, info}
    }

    addEmptyNote() {
        let id = getIndex();
        NoteSettingPart.initEmpty(id, this, true)
    }

    addEmptyText() {
        let _id = getIndex();
        let rect = TextSettingPart.emptyRect({
            _id,
            _type: 'text',
            _label: 'rect',
            _isMain: false,
            _text: '',
            _points: []
        }, this);
        this.addItems([rect])
    }

    addEmptyGraphLayer() {
        return GraphLayer.initEmpty(this)
    }

    addCollectGraphLayer(itemList: DocumentItemSettingPart[]) {
        return GraphLayer.initCollect(this, itemList)
    }

    queryItemLayer(item: DocumentItemSettingPart): GraphLayer[] | undefined {
        return this.CompInGraph.Group.Dict[item._id]
    }
}
