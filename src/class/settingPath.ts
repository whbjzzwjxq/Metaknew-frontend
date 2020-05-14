import {
    nodeCtrlTemplate,
    nodeInfoTemplate,
} from "@/utils/template";
import {getIndex} from "@/utils/utils";
import {NodeInfoPart} from "@/class/info";
import {TreeNode} from "@/interface/interfaceTree";
import {DocumentSelfPart, SettingPart} from "@/class/settingBase";

interface PathMetaData {
    isRemoteModel: boolean
}

interface PathSetting extends Setting {
    _type: 'path',
    _label: 'path',
}

interface PathState extends BaseState {

}

interface PathNodeBackend {

}

interface PathLinkBackend {

}

interface PathContentBackend {
    nodes: PathNodeBackend[]
    links: PathLinkBackend[]
}

export class PathSelfPart extends SettingPart {
    //元数据
    readonly MetaData: PathMetaData
    //构成的树根
    protected _treeNodeRoot?: TreeNode<DocumentSelfPart>
    Setting: PathSetting
    State: PathState

    protected constructor(setting: PathSetting, state: PathState, meta: PathMetaData, treeNode?: TreeNode<DocumentSelfPart>) {
        super(setting, state)
        this.Setting = setting
        this.State = state
        this.MetaData = meta
        this._treeNodeRoot = treeNode
    }

    static pathSettingDefault(_id: id): PathSetting {
        return {
            _id,
            _type: "path",
            _label: "path"
        }
    }

    static initEmpty() {

    }
}

export class PathInfoPart extends NodeInfoPart {
    Info: BasePathInfo;
    Ctrl: BaseNodeCtrl;

    protected constructor(info: BasePathInfo, ctrl: BaseNodeCtrl, isRemote: boolean) {
        super(info, ctrl, isRemote);
        this.Info = info;
        this.Ctrl = ctrl;
    }

    static initEmpty() {
        let _id = getIndex();
        let info = nodeInfoTemplate(_id, "document", "path") as BasePathInfo;
        let ctrl = nodeCtrlTemplate();
        return new PathInfoPart(info, ctrl, false)
    }
}

enum PathItemLabel {
    'text' = 'TEXT',
    'document' = 'DOC',
    'path' = 'PATH',
}

interface PathNodeSetting extends Setting {
    _type: 'path'
    _label: PathItemLabel
    InPath: {
        Base: {
            x: number,
            y: number,
            width: number,
            height: number
        }
    }
}

interface PathNodeState extends BaseState {

}

export class PathNodeSettingPart extends SettingPart {
    Setting: PathNodeSetting
    State: PathNodeState
    boundDocument?: DocumentSelfPart
    boundPath?: PathSelfPart
    boundText?: string
    protected constructor(setting: PathNodeSetting, state: PathNodeState) {
        super(setting, state);
        this.Setting = setting;
        this.State = state;
    }
}
