import {NodeInfoPart} from "@/class/graphItem";
import {
    nodeCtrlTemplate,
    nodeInfoTemplate,
    nodeStateTemplate,
    pathSettingTemplate,
} from "@/utils/template";
import {nodeTemplateTheme} from "@/utils/templateStandard";
import {getIndex} from "@/utils/utils";

export class PathSelfPart {
    Conf: PathConf;
    InfoPart: PathInfoPart;
    protected _array: PathArray;

    get depth() {
        let max = 0;
        this.array.map(array => {
            array.length > max && (max = array.length)
        });
        return max
    }

    get breadth() {
        return this.array.length
    }

    get array () {
        return this._array
    }

    get _id() {
        return this.Conf._id
    }

    get root() {
        return this.array[0][0]
    }

    constructor(conf: PathConf, _array: PathArray, info: PathInfoPart) {
        this.InfoPart = info;
        this.Conf = conf;
        this._array = _array;
    }

    static emptyPathSelfPart() {
        let _id = getIndex();
        let conf = pathSettingTemplate(_id);
        let subArray = [] as (PathNodeSettingPart | null)[];
        subArray.length = 12;
        subArray.fill(null);
        let _array = [] as PathArray;
        _array.length = 4;
        _array.fill(subArray);
        let info = PathInfoPart.emptyPathInfoPart();
        return new PathSelfPart(conf, _array, info)
    }

    depthFirstSearch() {
        let array = [] as PathNodeSettingPart[];
        let search = function (node: PathNodeSettingPart | null) {
            node !== null &&
            node.children.map((node, index) => {
                array.push(node);
                search(node);
            })
        };
        search(this.root);
        return array
    }

    addLayer() {
        this.array.push([])
    }

    decreaseLayer(index: number) {
        let array = this.array[index];
        let nodeList = array.filter(item => item !== null);
        nodeList.length === 0 && this.array.splice(index, 1);
    }
}

export class PathInfoPart extends NodeInfoPart {
    Info: BasePathInfo;
    Ctrl: BaseNodeCtrl;

    constructor(info: BasePathInfo, ctrl: BaseNodeCtrl, isRemote: boolean) {
        super(info, ctrl, isRemote);
        this.Info = info;
        this.Ctrl = ctrl;
    }

    static emptyPathInfoPart() {
        let _id = getIndex();
        let info = nodeInfoTemplate(_id, "document", "path") as BasePathInfo;
        let ctrl = nodeCtrlTemplate();
        return new PathInfoPart(info, ctrl, false)
    }
}

export class PathLinkSettingPart {
    State: LinkState;
    start: PathNodeSettingPart;
    end: PathNodeSettingPart;
    time: number;
    animate: object;

    constructor(state: LinkState, start: PathNodeSettingPart, end: PathNodeSettingPart, time: number, animate: object) {
        this.start = start;
        this.end = end;
        this.State = state;
        this.time = time;
        this.animate = animate
    }
}

export class PathNodeSettingPart {
    State: NodeState;
    Setting: NodeSetting;
    children: PathNodeSettingPart[];
    parent: PathNodeSettingPart | null;

    get _id() {
        return this.Setting._id
    }

    constructor(state: NodeState, setting: NodeSetting, parent: PathNodeSettingPart | null, children?:PathNodeSettingPart[]) {
        this.State = state;
        this.Setting = setting;
        children
            ? this.children = children
            : this.children = [];
        this.parent = parent;
    }

    static emptyPathNodeSSettingPart() {
        let _id = getIndex();
        let state = nodeStateTemplate();
        let setting = {
            _id,
            _type: 'node',
            _label: 'pathNode',
            _name: '',
            _image: ''
        } as NodeSetting;
        Object.assign(setting, nodeTemplateTheme.inPath());
        return new PathNodeSettingPart(state, setting, null)
    }
}

export interface IndexDouble {
    depth: number;
    breadth: number;
}

export interface PathNodeEmpty extends IndexDouble {
    node: null
}

export interface PathNodeExist extends IndexDouble {
    node: PathNodeSettingPart
}

export type PathNode = PathNodeEmpty | PathNodeExist;
