import {
    DocumentSelfPart,
    ItemSettingPart,
    NodeInfoPart, PaperConf,
} from "@/class/graphItem";
import {paperSettingTemplate} from "@/utils/template";
import {emptyContent} from "@/utils/utils";
import {commitDocumentAdd} from "@/store/modules/_mutations";
import store from "@/store";

export class PaperSelfPart extends DocumentSelfPart {
    static list: PaperSelfPart[] = [];

    get _name() {
        return store.state.dataManager.paperManager[this._id].Info.Name
    }

    constructor(paper: DocumentContent, conf: PaperConf, parent: PaperSelfPart | null, meta: DocumentMetaData) {
        super(paper, conf, parent, meta);
        this.Content = paper;
        this.Conf = conf;
        PaperSelfPart.list.push(this)
    }

    static emptyPaperSelfPart(_id: id, parent: DocumentSelfPart | null, commitToVuex: boolean = true) {
        let query = {id: _id, type: 'document', pLabel: 'DocPaper'} as DocumentQuery;
        let paperContent = emptyContent();
        let setting = PaperConf.emptyPaperConf(_id);
        let meta = {
            isRemoteModel: false,
            isTemporary: false
        } as DocumentMetaData;
        let paper = new PaperSelfPart(paperContent, setting, parent, meta);
        let info = NodeInfoPart.emptyNodeInfoPart(query, commitToVuex);
        let payload = {paper, info};
        return payload
    }
}
