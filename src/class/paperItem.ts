import {
    DocumentSelfPart,
    ItemSettingPart,
    NodeInfoPart,
} from "@/class/graphItem";
import {paperSettingTemplate} from "@/utils/template";
import {emptyContent} from "@/utils/utils";
import {commitDocumentAdd} from "@/store/modules/_mutations";

export class PaperConf extends ItemSettingPart {
    State: PaperState;
    Setting: PaperSetting;
    parent: DocumentSelfPart | null;
    constructor(Setting: PaperSetting, State: PaperState, parent: DocumentSelfPart | null) {
        super(Setting, State, parent);
        this.Setting = Setting;
        this.State = State;
        this.parent = parent
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

    constructor(paper: DocumentContent, conf: PaperConf, draftId?: number) {
        super(paper, conf, draftId);
        this.Content = paper;
        this.Conf = conf;
        PaperSelfPart.list.push(this)
    }

    static emptyPaperSelfPart(_id: id, parent: DocumentSelfPart | null, commitToVuex?: boolean) {
        commitToVuex === undefined && (commitToVuex = true);
        let paperContent = emptyContent();
        let setting = PaperConf.emptyPaperConf(_id, parent);
        let paper = new PaperSelfPart(paperContent, setting);
        let info = NodeInfoPart.emptyNodeInfoPart(_id, 'document', 'DocPaper');
        let payload = {paper, info};
        if (commitToVuex) {
            paper.commitPaperToVuex(payload)
        }
        return payload
    }

    commitPaperToVuex(payload: { paper: PaperSelfPart, info: NodeInfoPart }) {
        let {paper, info} = payload;
        this.commitItemToVuex(info);
        commitDocumentAdd({document: paper});
    }
}
