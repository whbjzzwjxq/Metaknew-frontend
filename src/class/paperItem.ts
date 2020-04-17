import {DocumentSelfPart, NodeInfoPart, NodeSettingPart, PaperConf} from "@/class/graphItem";
import {emptyContent} from "@/utils/utils";

export class PaperSelfPart extends DocumentSelfPart {
    static list: PaperSelfPart[] = [];

    constructor(paper: DocumentContent, conf: PaperConf, parent: PaperSelfPart | null, meta: DocumentMetaData) {
        super(paper, conf, parent, meta);
        this.Content = paper;
        this.Conf = conf;
        PaperSelfPart.list.push(this);
        // baseNode部分
        if (this.nodeSelf === undefined) {
            // let {_id, _type, _label} = conf;
            // let node = NodeSettingPart.emptyNodeSetting(_id, _type, _label, 'NewDoc' + _id, '', this);
            // this.Content.nodes.push(node);
        } else {
            // 检查完成
        }
        // 专题已经添加到父亲中去了
        parent && parent.addItems([this.nodeSelf.deepCloneSelf()]);
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
        return {paper, info}
    }
}
