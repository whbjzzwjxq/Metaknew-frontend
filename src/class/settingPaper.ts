import {
    DocumentConfigure,
    DocumentSelfPart,
    LinkSettingPart,
    MediaSettingPart,
    NodeSettingPart, TextSettingPart
} from "@/class/settingBase";
import {graphStateTemplate, nodeStateTemplate, paperSettingTemplate} from "@/utils/template";
import store from "@/store";
import {deepClone, emptyContent} from "@/utils/utils";
import {NodeInfoPart} from "@/class/info";

export class PaperConf extends DocumentConfigure<PaperSetting> {
    State: PaperState;
    Setting: PaperSetting;

    get _label() {
        return this.Setting._label
    }

    protected constructor(setting: PaperSetting, state: PaperState) {
        super(setting, state);
        this.State = state;
        this.Setting = setting;
    }

    static emptyPaperConf(_id: id) {
        let setting = paperSettingTemplate(_id)
        let state = graphStateTemplate()
        return new PaperConf(setting, state)
    }
}

export class PaperSelfPart extends DocumentSelfPart<PaperContent, PaperConf> {
    Content: PaperContent;
    static list: PaperSelfPart[] = [];

    constructor(paper: PaperContent, conf: PaperConf, comps: DocumentComponents, parent: DocumentSelfPartAny | null, meta: DocumentMetaData) {
        super(paper, conf, comps, parent, meta);
        this.Content = paper;
        this.Conf = conf;
        PaperSelfPart.list.push(this);
        // baseNode部分
        if (this.nodeSelf === undefined) {
            let {_id, _type, _label} = conf;
            let node = NodeSettingPartPaper.emptyNodeSetting({
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

    static emptyPaperSelfPart(_id: id, parent: DocumentSelfPartAny | null, commitToVuex: boolean = true) {
        let query = {id: _id, type: 'document', pLabel: '_DocPaper'} as DocumentQuery;
        let paperContent = emptyContent();
        let setting = PaperConf.emptyPaperConf(_id);
        let meta = {
            isRemoteModel: false,
            isTemporary: false
        } as DocumentMetaData;
        let comps = {
            SubGraph: []
        } as DocumentComponents
        let paper = new PaperSelfPart(paperContent, setting, comps, parent, meta);
        let info = NodeInfoPart.emptyNodeInfoPart(query, commitToVuex);
        return {paper, info}
    }
}

export class NodeSettingPartPaper extends NodeSettingPart<NodeSettingPaper> {
    Setting: NodeSettingPaper;
    State: NodeState;
    static list: Array<NodeSettingPartPaper> = [];

    get _type() {
        return this.Setting._type
    }

    get parent() {
        return this._parent
    }

    get boundDocument() {
        return this.parent.docsChildren.filter(graph => graph._id === this._id)[0]
    }

    get remoteDocument() {
        if (this._label === '_DocGraph') {
            return store.state.dataManager.graphManager[this._id]
        } else {
            return store.state.dataManager.paperManager[this._id]
        }
    }

    protected constructor(Setting: NodeSettingPaper, State: NodeState, parent: PaperSelfPart) {
        super(Setting, State, parent);
        this.Setting = Setting;
        this.State = State;
        this._parent = parent;
        NodeSettingPartPaper.list.push(this);
    }

    static emptyNodeSetting(node: NodeSetting, parent: PaperSelfPart) {
        let setting = Object.assign(node) //todo
        let state = nodeStateTemplate();
        return new NodeSettingPartPaper(setting, state, parent)
    }

    mouseOn(value: boolean) {
        this.State.isMouseOn = value;
        LinkSettingPart.list.filter(item => item.isBound && (item._start._id === this._id || item._end._id === this._id))
            .map(item => item.mouseOn(value));
    }

    deepCloneSelf() {
        let setting = deepClone(this.Setting);
        let state = deepClone(this.State);
        return new NodeSettingPartPaper(setting, state, this.parent)
    }
}

export class LinkSettingPartPaper extends LinkSettingPart<LinkSettingPaper> {

}

export class MediaSettingPartPaper extends MediaSettingPart<MediaSettingPaper> {

}

export class TextSettingPartPaper extends TextSettingPart<TextSettingPaper> {

}
