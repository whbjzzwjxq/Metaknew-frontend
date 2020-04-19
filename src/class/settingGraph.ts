import {
    DocumentConfigure,
    DocumentSelfPart,
    ItemSettingPart,
    LinkSettingPart,
    MediaSettingPart,
    NodeSettingPart,
    NoteSettingPart,
    TextSettingPart
} from "@/class/settingBase";
import {
    graphSettingTemplate,
    graphStateTemplate,
    linkStateTemplate,
    mediaSettingTemplate,
    nodeStateTemplate,
    settingTemplateGraph,
    textSettingTemplate,
    textStateTemplate
} from "@/utils/template";
import {BackendGraphWithNode} from "@/api/document/document";
import {emptyContent, getIndex} from "@/utils/utils";
import {LinkInfoPart, MediaInfoPart, NodeInfoPart} from "@/class/info";
import {commitDocumentAdd} from "@/store/modules/_mutations";

export class GraphConf extends DocumentConfigure<GraphSetting> {
    State: GraphState;
    Setting: GraphSetting;

    get _label() {
        return this.Setting._label
    }

    protected constructor(setting: GraphSetting, state: GraphState) {
        super(setting, state);
        this.State = state;
        this.Setting = setting;
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

export class GraphSelfPart extends DocumentSelfPart<GraphContent, GraphConf> {
    Content: GraphContent;
    Conf: GraphConf;
    static list: GraphSelfPart[] = [];
    static baseList: Array<BackendGraphWithNode> = []; // 原始数据

    get isExplode() {
        return this.Conf.State.isExplode
    }

    set isExplode(value) {
        this.Conf.State.isExplode = value
    }

    protected constructor(graph: GraphContent, conf: GraphConf, comps: DocumentComponents, parent: DocumentSelfPartAny | null, meta: DocumentMetaData) {
        // 自动保存id
        super(graph, conf, comps, parent, meta);
        // 设置
        this.Conf = conf;
        this.Content = graph;
        // 记录所有实例
        GraphSelfPart.list.push(this);
        // baseNode部分
        if (this.nodeSelf === undefined) {
            let {_id, _type, _label} = conf;
            let node = NodeSettingPartGraph.emptyNodeSetting({
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
    }

    static emptyGraphSelfPart(_id: id, parent: DocumentSelfPartAny | null, commitToVuex: boolean = true) {
        let graphContent = emptyContent() as GraphContent;
        let setting = GraphConf.emptyGraphConf(_id);
        let meta = {
            isTemporary: false,
            isRemoteModel: false,
        } as DocumentMetaData
        let comps = {
            SubGraph: []
        } as DocumentComponents
        let nodeQuery = {id: _id, type: 'document', pLabel: '_DocGraph'} as DocumentQuery;
        let info = NodeInfoPart.emptyNodeInfoPart(nodeQuery, commitToVuex);
        let graph = new GraphSelfPart(graphContent, setting, comps, parent, meta);
        let payload = {graph, info};
        commitToVuex && commitDocumentAdd({document: graph, strict: false});
        return payload
    }

    static resolveFromBackEnd(data: BackendGraphWithNode, parent: DocumentSelfPartAny | null, commitToVuex: boolean = true) {
        GraphSelfPart.baseList.push(data);
        let setting = GraphConf.resolveBackend(data.Conf);
        let graphContent = emptyContent() as GraphContent;
        let Comps = data.Comps;
        let meta = {
            isTemporary: false,
            isRemoteModel: true
        }
        let graph = new GraphSelfPart(graphContent, setting, Comps, parent, meta);
        let info = NodeInfoPart.resolveBackend(data.Base, commitToVuex);
        let {nodes, links, medias, texts} = data.Content;
        graph.Content.nodes = nodes.map(setting => NodeSettingPartGraph.resolveBackend(setting, graph));
        graph.Content.medias = medias.map(setting => MediaSettingPartGraph.resolveBackend(setting, graph));
        graph.Content.links = links.map(setting => LinkSettingPartGraph.resolveBackend(setting, graph))
            .filter(link => link.Setting._start && link.Setting._end);
        graph.Content.texts = texts.map(setting => TextSettingPartGraph.resolveBackend(setting, graph));
        commitToVuex && commitDocumentAdd({document: graph, strict: false});
        return {graph, info}
    }

    static collectNewGraph(payload: DocumentInitPayload, items: ItemSettingPart[], deleteSource: boolean = true) {
        let {_id, parent, commitToVuex} = payload;
        let newGraph = GraphSelfPart.emptyGraphSelfPart(_id, parent, commitToVuex).graph;
        newGraph.collectItems(items, deleteSource);
        return newGraph
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
        }
        let setting = NodeSettingPartGraph.emptyNodeSetting(payload, this);
        this.addItems([setting]);
        return {setting, info}
    }

    addEmptyLink(_start: VisNodeSettingPartGraph, _end: VisNodeSettingPartGraph, _label?: string, commitToVuex: boolean = true) {
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
        } as LinkSettingGraph
        let setting = LinkSettingPartGraph.emptyLinkSetting(payload, this);
        this.addItems([setting]);
        return {setting, info};
    }

    addEmptyGraph(commitToVuex: boolean = true) {
        let _id = getIndex();
        let {graph, info} = GraphSelfPart.emptyGraphSelfPart(_id, this, commitToVuex);
        return {graph, info}
    }
}

export class NodeSettingPartGraph extends NodeSettingPart<NodeSettingGraph> {
    get styleSetting() {
        return this.Setting.InGraph
    }

    static emptyNodeSetting(payload: NodeSetting, parent: DocumentSelfPartAny) {
        let setting = Object.assign(payload, {
            InGraph: settingTemplateGraph("node")
        });
        let state = nodeStateTemplate();
        return new NodeSettingPart(setting, state, parent) as NodeSettingPartGraph
    }

    static resolveBackend(setting: NodeSettingGraph, parent: DocumentSelfPartAny) {
        let state = nodeStateTemplate();
        return new NodeSettingPart(setting, state, parent) as NodeSettingPartGraph
    }
}

export class MediaSettingPartGraph extends MediaSettingPart<MediaSettingGraph> {
    get styleSetting() {
        return this.Setting.InGraph
    }

    static emptyMediaSetting(payload: MediaSetting, parent: DocumentSelfPartAny) {
        let setting = mediaSettingTemplate(payload);
        let state = nodeStateTemplate();
        return new MediaSettingPart(setting, state, parent) as MediaSettingPartGraph;
    }

    static emptyMediaSettingFromInfo(media: MediaInfoPart, parent: DocumentSelfPartAny) {
        let {_id, _type, _label} = media
        let payload = {_id, _type, _label, _name: media.Info.Name, _src: media.Ctrl.FileName} as MediaSetting
        return MediaSettingPartGraph.emptyMediaSetting(payload, parent)
    }

    static resolveBackend(setting: MediaSetting, parent: DocumentSelfPartAny) {
        let state = nodeStateTemplate();
        return new MediaSettingPart(setting, state, parent) as MediaSettingPartGraph
    }
}

//Graph下的视觉型节点
export type VisNodeSettingPartGraph = NodeSettingPartGraph | MediaSettingPartGraph;
export type ItemSettingPartGraph = VisNodeSettingPartGraph | LinkSettingPartGraph | TextSettingPartGraph

export class LinkSettingPartGraph extends LinkSettingPart<LinkSettingGraph> {
    get styleSetting() {
        return this.Setting.InGraph
    }

    static emptyLinkSetting(payload: LinkSetting<VisNodeSettingPartGraph>, parent: GraphSelfPart) {
        let setting = Object.assign(payload, settingTemplateGraph("link"));
        let state = linkStateTemplate();
        return new LinkSettingPart(setting, state, parent) as LinkSettingPartGraph
    }

    static resolveBackend(linkSetting: BackendLinkSettingGraph, parent: GraphSelfPart) {
        let setting = {
            ...linkSetting,
            _start: parent.getVisNodeById({_id: linkSetting._start.id, _type: linkSetting._start.type}),
            _end: parent.getVisNodeById({_id: linkSetting._end.id, _type: linkSetting._end.type})
        } as LinkSettingGraph;
        let state = linkStateTemplate();
        return new LinkSettingPart(setting, state, parent) as LinkSettingPartGraph;
    }
}

export class TextSettingPartGraph extends TextSettingPart<TextSettingGraph> {
    get styleSetting() {
        return this.Setting.InGraph
    }

    static emptyRect(_id: id, parent: GraphSelfPart) {
        let _points = [] as PointObject[];
        let setting = textSettingTemplate(_id, 'rect', _points);
        let state = textStateTemplate();
        return new TextSettingPart(setting, state, parent) as TextSettingPartGraph
    }

    static resolveBackend(setting: TextSetting, parent: GraphSelfPart) {
        let state = textStateTemplate();
        return new TextSettingPart(setting, state, parent) as TextSettingPartGraph
    }
}

export class NoteSettingPartGraph extends NoteSettingPart<NoteSettingGraph> {

}
