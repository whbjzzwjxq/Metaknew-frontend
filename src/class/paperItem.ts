import {NodeInfoPart, SettingPart} from "@/class/graphItem";
import {emptyPaper} from "@/utils/utils";
import {paperSettingTemplate} from "@/utils/template";

declare global {
    interface Paper {
        cards: [],
        links: []
    }
}

export class PaperConf extends SettingPart {
    State: PaperState;
    Setting: PaperSetting;

    constructor(Setting: PaperSetting, State: PaperState) {
        super(Setting, State);
        this.Setting = Setting;
        this.State = State
    }

    static emptyPaperConf(_id: id) {
        let state = {
            isSelf: true,
            isDeleted: false
        } as PaperState;
        let setting = paperSettingTemplate(_id);
        return new PaperConf(setting, state)
    }
}

export class PaperSelfPart {
    static list: PaperSelfPart[] = [];
    Paper: Paper;
    Conf: PaperConf;

    get _id() {
        return this.Conf._id
    }

    constructor(Paper: Paper, Conf: PaperConf) {
        this.Paper = Paper;
        this.Conf = Conf;
        PaperSelfPart.list.push(this)
    }

    static emptyPaperSelfPart(_id: id, commitToVuex?: boolean) {
        commitToVuex === undefined && (commitToVuex = true);
        let paperContent = emptyPaper();
        let setting = PaperConf.emptyPaperConf(_id);
        let paper = new PaperSelfPart(paperContent, setting);
        let info = NodeInfoPart.emptyNodeInfoPart(_id, 'document', 'DocPaper');
        let payload = {paper, info};
        return payload
    }
}
