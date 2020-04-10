import {
    DocumentSelfPart,
    ItemSettingPart,
    NodeInfoPart,
} from "@/class/graphItem";
import {paperSettingTemplate} from "@/utils/template";
import {emptyContent} from "@/utils/utils";
import {commitDocumentAdd} from "@/store/modules/_mutations";
import store from "@/store";

export class PaperConf extends ItemSettingPart {
    State: PaperState;
    Setting: PaperSetting;
    _parent: DocumentSelfPart | null;
    constructor(Setting: PaperSetting, State: PaperState, parent: DocumentSelfPart | null) {
        super(Setting, State, parent);
        this.Setting = Setting;
        this.State = State;
        this._parent = parent
    }

    static emptyPaperConf(_id: id, parent: DocumentSelfPart | null) {
        let state = {
            isSelf: true,
            isDeleted: false
        } as PaperState;
        let setting = paperSettingTemplate(_id);
        return new PaperConf(setting, state, parent)
    }
}

export class PaperSelfPart extends DocumentSelfPart {
    static list: PaperSelfPart[] = [];
    Content: DocumentContent;
    Conf: PaperConf;

    get _name() {
        return store.state.dataManager.paperManager[this._id].Info.Name
    }

    constructor(paper: DocumentContent, conf: PaperConf, isRemote: boolean, draftId?: number) {
        super(paper, conf, isRemote, draftId);
        this.Content = paper;
        this.Conf = conf;
        PaperSelfPart.list.push(this)
    }

    static emptyPaperSelfPart(_id: id, parent: DocumentSelfPart | null, commitToVuex: boolean = true) {
        let query = {id: _id, type: 'document', pLabel: 'DocPaper'} as DocumentQuery;
        let paperContent = emptyContent();
        let setting = PaperConf.emptyPaperConf(_id, parent);
        let paper = new PaperSelfPart(paperContent, setting, false);
        let info = NodeInfoPart.emptyNodeInfoPart(query, commitToVuex);
        let payload = {paper, info};
        return payload
    }
}
