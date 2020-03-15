import {
    DocumentSelfPart,
    GraphItemSettingPart, GraphSelfPart,
    InfoPart,
    LinkSettingPart,
    MediaInfoPart,
    MediaSettingPart,
    NodeSettingPart,
    TextSettingPart
} from "@/class/graphItem";
import {PathNode, PathNodeExist} from "@/class/path";
import {PaperSelfPart} from "@/class/paperItem";
import {ListItem, ListText, ListTitle} from "@/interface/interfaceInComponent";
import {BackendNodeInfoPart} from "@/api/subgraph/node";
import {BackendLinkInfoPart} from "@/api/subgraph/link";

export function isNodeBackend(item: BackendNodeInfoPart | BackendLinkInfoPart): item is BackendNodeInfoPart {
    let type = (item as BackendNodeInfoPart).Info.type;
    return type === 'node' || type === 'document'
}

export function isNodeInfoPart(item: BaseNodeInfo | BaseMediaInfo | BaseLinkInfo): item is BaseNodeInfo {
    return (item as BaseNodeInfo).type === 'node' ||
        (item as BaseNodeInfo).type === 'document'
}

export function isGraphType(str: string): str is GraphItemType {
    return (str as GraphItemType) === 'node' ||
        (str as GraphItemType) === 'link' ||
        (str as GraphItemType) === 'media' ||
        (str as GraphItemType) === 'document' ||
        (str as GraphItemType) === 'text'
}

export function isLinkSetting(item: GraphItemSettingPart): item is LinkSettingPart {
    return (item as LinkSettingPart)._type === 'link'
}

export function isMediaSetting(item: GraphItemSettingPart): item is MediaSettingPart {
    return (item as MediaSettingPart)._type === 'media'
}

export function isNodeSetting(item: GraphItemSettingPart): item is NodeSettingPart {
    return (item as NodeSettingPart)._type === 'node' || (item as NodeSettingPart)._type === 'document'
}

export function isVisNodeSetting(item: GraphItemSettingPart): item is VisNodeSettingPart {
    return isNodeSetting(item) || isMediaSetting(item)
}

export function isSvgSetting(item: GraphItemSettingPart): item is TextSettingPart {
    return (item as TextSettingPart)._type === 'text'
}

export function isGraphSelfPart(item: DocumentSelfPart): item is GraphSelfPart {
    return (item as GraphSelfPart).Conf._label === 'DocGraph'
}

export function isPaperSelfPart(item: DocumentSelfPart): item is PaperSelfPart {
    return (item as PaperSelfPart).Conf._label === 'DocPaper'
}

export function isBooleanConcern(prop: LevelConcern | BooleanConcern | "Labels"): prop is BooleanConcern {
    return (
        prop === "NumStar" || prop === "NumBad" || prop === "NumGood" || prop === "NumShared"
    );
}

export function isLevelConcern(prop: LevelConcern | BooleanConcern | "Labels"): prop is LevelConcern {
    return prop === "Imp" || prop === "HardLevel" || prop === "Useful";
}

export function isMediaInfoPart(info: InfoPart): info is MediaInfoPart {
    return info._type === 'media'
}

export function isPathNodeExist(item: PathNode): item is PathNodeExist {
    return (item as PathNodeExist).node !== null
}

export function isListText(item: ListText | ListTitle): item is ListText {
    return !(item as ListText).isTitle
}
