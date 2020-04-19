import {TreeNodeDoc} from "@/interface/interfaceTree";
import store from "@/store";
import {BackendGraph} from "@/api/document/document";
import {DocumentDraft} from "@/api/subgraph/commonApi";
import {
    isDocumentType,
    isGraphSelfPart,
    isLinkSetting,
    isMediaSetting,
    isNodeSetting,
    isTextSetting
} from "@/utils/typeCheck";
import {crucialRegex, deepClone, findItem, frontendIdRegex, getIndex} from "@/utils/utils";
import {commitSnackbarOff, commitSnackbarOn} from "@/store/modules/_mutations";
import {noteSettingTemplate, noteStateTemplate} from "@/utils/template";
import {dispatchNoteInDocPush} from "@/store/modules/_dispatch";
import {getManager} from "@/store/modules/dataManager";
import Vue from "vue";
import {NodeSettingPartGraph} from "@/class/settingGraph";

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
    _parent: DocumentSelfPartAny;

    protected constructor(Setting: DocumentItemSetting, State: BaseState, parent: DocumentSelfPartAny) {
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
        return new ItemSettingPart(setting, state, this.parent)
    }
}

export class NodeSettingPart<Style extends NodeSetting> extends ItemSettingPart {
    Setting: Style;
    State: NodeState;
    static list: NodeSettingPartAny[] = [];

    get _type() {
        return this.Setting._type
    }

    get _name() {
        return this.Setting._name
    }

    get boundDocument(): DocumentSelfPartAny {
        return this.parent.docsChildren.filter(graph => graph._id === this._id)[0]
    }

    get remoteDocument() {
        if (this._label === '_DocGraph') {
            return store.state.dataManager.graphManager[this._id]
        } else {
            return store.state.dataManager.paperManager[this._id]
        }
    }

    protected constructor(Setting: Style, State: NodeState, parent: DocumentSelfPartAny) {
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

    deepCloneSelf(): NodeSettingPart<Style> {
        let setting = deepClone(this.Setting);
        let state = deepClone(this.State);
        return new NodeSettingPart(setting, state, this.parent)
    }
}

export class MediaSettingPart<Style extends MediaSetting> extends ItemSettingPart {
    Setting: Style;
    State: MediaState;
    static list: MediaSettingPartAny[] = [];

    get _type() {
        return this.Setting._type
    }

    get _name() {
        return this.Setting._name
    }

    protected constructor(Setting: Style, State: MediaState, parent: DocumentSelfPartAny) {
        super(Setting, State, parent);
        this.Setting = Setting;
        this.State = State;
        this._parent = parent;
        MediaSettingPart.list.push(this);
    }

    mouseOn(value: boolean) {
        this.State.isMouseOn = value;
        LinkSettingPart.list.filter(item => item.isBound && (item._start._id === this._id || item._end._id === this._id))
            .map(item => item.mouseOn(value))
    }

    deepCloneSelf(): MediaSettingPart<Style> {
        let setting = deepClone(this.Setting);
        let state = deepClone(this.State);
        return new MediaSettingPart(setting, state, this.parent)
    }
}

export class LinkSettingPart<Style extends LinkSetting<any>> extends ItemSettingPart {
    Setting: Style;
    State: LinkState;
    static list: LinkSettingPartAny[] = [];

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

    get isDeleted() {
        let {_start, _end} = this;
        return this.State.isDeleted || _start.isDeleted || _end.isDeleted
    }

    // 是否绑定正确
    get isBound() {
        return this._start !== undefined && this._end !== undefined
    }

    protected constructor(Setting: Style, State: LinkState, parent: DocumentSelfPartAny) {
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

    deepCloneSelf(): LinkSettingPart<Style> {
        let state = deepClone(this.State);
        let setting = {
            _start: this.Setting._start,
            _end: this.Setting._end,
            ...deepClone(this.Setting, ['_start', '_end'])
        };
        return new LinkSettingPart(setting, state, this.parent)
    }
}

export class TextSettingPart<Style extends TextSetting> extends ItemSettingPart {
    Setting: Style;
    State: TextState;
    static list: TextSettingPartAny[] = [];

    get _type() {
        return this.Setting._type
    }

    protected constructor(Setting: Style, State: TextState, parent: DocumentSelfPartAny) {
        super(Setting, State, parent);
        this.Setting = Setting;
        this.State = State;
        this._parent = parent;
        TextSettingPart.list.push(this)
    }

    deepCloneSelf(): TextSettingPart<Style> {
        let setting = deepClone(this.Setting);
        let state = deepClone(this.State);
        return new TextSettingPart(setting, state, this.parent)
    }
}

export class NoteSettingPart<Style extends NoteSetting> extends SettingPart {
    Setting: Style;
    State: NoteState;
    static list: NoteSettingPartAny[] = [];

    constructor(Setting: Style, State: NoteState) {
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

export class DocumentConfigure<T extends DocumentSetting> extends SettingPart {
    State: DocumentState;
    Setting: T;

    get _type() {
        return this.Setting._type
    }

    protected constructor(setting: T, state: DocumentState) {
        super(setting, state);
        this.State = state;
        this.Setting = setting;
    }
}

export class DocumentSelfPart<Content extends DocumentContentAny, Configure extends DocumentConfigureAny> {
    Content: Content;
    Conf: Configure;
    Components: DocumentComponents;
    //以下构建时定义
    treeNode: TreeNodeDoc;
    protected MetaData: DocumentMetaData;

    protected constructor(Content: Content, Conf: Configure, comps: DocumentComponents, parent: DocumentSelfPartAny | null, meta: DocumentMetaData) {
        this.Conf = Conf;
        this.Content = Content;
        this.Components = comps;
        this.MetaData = meta;
        this.treeNode = new TreeNodeDoc(this, parent);
    }

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

    get isExplode() {
        return this.Conf.State.isExplode
    }

    set isExplode(value) {
        this.Conf.State.isExplode = value
    }

    get rect() {
        if (this.parent) {
            let rect = this.parent.Components.SubGraph.filter(graph => graph.id === this._id)[0]
            if (rect === undefined) {
                rect = {id: this._id, width: 600, height: 400}
                this.parent.Components.SubGraph.push(rect)
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

    //node
    get nodesAll() {
        return this.Content.nodes
    }

    get nodes(): NodeSettingPartAny[] {
        return this.nodesAll.filter(item => !item.isDeleted)
    }

    get nodesWithoutSelf(): NodeSettingPartAny[] {
        return this.nodes.filter(node => node._id !== this._id)
    }

    get nodeSelf(): NodeSettingPartAny {
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
    get docsRootList(): DocumentSelfPartAny[] {
        return this.treeNode.parentNodeList.map(node => node.boundObject)
    }

    get docRoot() {
        return this.treeNode.rootNode.boundObject
    }

    get docsChildrenAll(): DocumentSelfPartAny[] {
        // 所有孩子doc
        return this.treeNode.childrenAll.map(node => node.boundObject)
    }

    get docsChildren(): DocumentSelfPartAny[] {
        return this.treeNode.childrenActive.map(node => node.boundObject)
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

    get allItems(): SubItemSettingPart[] {
        let {nodes, links, medias, texts} = this;
        let result: SubItemSettingPart[];
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
}

declare global {
    type DocumentConfigureAny = DocumentConfigure<any>
    type DocumentSelfPartAny = DocumentSelfPart<DocumentContentAny, DocumentConfigureAny>
    type NodeSettingPartAny = NodeSettingPart<any>
    type LinkSettingPartAny = LinkSettingPart<any>
    type MediaSettingPartAny = MediaSettingPart<any>
    type TextSettingPartAny = TextSettingPart<any>
    type NoteSettingPartAny = NoteSettingPart<any>
}
