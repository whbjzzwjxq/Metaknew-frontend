import {NodeInfoPart} from "@/utils/graphClass";

export class PathSelfPart {
    Content: Path;
    Conf: PathSetting;

    constructor(_id: id, conf: PathSetting, content: Path) {
        this.Conf = conf;
        this.Content = content
    }

    static emptyPathSelfPart() {

    }
}

export class PathInfoPart extends NodeInfoPart {
    Info: BasePathInfo;
    Ctrl: BasePathCtrl;

    constructor(info: BasePathInfo, ctrl: BasePathCtrl) {
        super(info, ctrl);
        this.Info = info;
        this.Ctrl = ctrl;
    }
}

export class PathLinkSettingPart {
    State: LinkState;
    start: PathNodeSettingPart;
    end: PathNodeSettingPart;

    constructor(state: LinkState, start: PathNodeSettingPart, end: PathNodeSettingPart) {
        this.start = start;
        this.end = end;
        this.State = state;
    }
}

export class PathNodeSettingPart {
    State: NodeState;
    Setting: NodeSetting;
    depth: number;
    index: number;
    children: PathNodeSettingPart[];
    parent: PathNodeSettingPart;

    constructor(state: NodeState, setting: NodeSetting, depth: number, index: number, parent: PathNodeSettingPart) {
        this.State = state;
        this.Setting = setting;
        this.depth = depth;
        this.index = index;
        this.children = [];
        this.parent = parent;
    }
}
