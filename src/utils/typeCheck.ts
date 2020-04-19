import {PathNode, PathNodeExist} from "@/class/settingPath";
import {PaperSelfPart} from "@/class/settingPaper";
import {DirectoryItemAll, DirectoryNode, ListText, ListTitle} from "@/interface/interfaceInComponent";
import {BackendNodeInfoPart} from "@/api/subgraph/node";
import {BackendLinkInfoPart} from "@/api/subgraph/link";
import {InfoPart, MediaInfoPart} from "@/class/info";
import {ItemSettingPart} from "@/class/settingBase";
import {GraphSelfPart, NodeSettingPartGraph} from "@/class/settingGraph";

export function isNodeBackend(item: BackendNodeInfoPart | BackendLinkInfoPart): item is BackendNodeInfoPart {
    let type = (item as BackendNodeInfoPart).Info.type;
    return type === 'node' || type === 'document'
}

export function isNodeInfoPart(item: BaseNodeInfo | BaseMediaInfo | BaseLinkInfo): item is BaseNodeInfo {
    return (item as BaseNodeInfo).type === 'node' ||
        (item as BaseNodeInfo).type === 'document'
}

export function isDocumentType(str: string): str is DocumentItemType {
    return (str as DocumentItemType) === 'node' ||
        (str as DocumentItemType) === 'link' ||
        (str as DocumentItemType) === 'media' ||
        (str as DocumentItemType) === 'document' ||
        (str as DocumentItemType) === 'text'
}

export function isNodeSetting(item: ItemSettingPart): item is NodeSettingPartAny {
    return (item as NodeSettingPartAny)._type === 'node' || (item as NodeSettingPartAny)._type === 'document'
}

export function isMediaSetting(item: ItemSettingPart): item is MediaSettingPartAny {
    return (item as MediaSettingPartAny)._type === 'media'
}

export function isVisNodeSetting(item: ItemSettingPart): item is VisNodeSettingPart {
    return isNodeSetting(item) || isMediaSetting(item)
}

export function isLinkSetting(item: ItemSettingPart): item is LinkSettingPartAny {
    return (item as LinkSettingPartAny)._type === 'link'
}

export function isTextSetting(item: ItemSettingPart): item is TextSettingPartAny {
    return (item as TextSettingPartAny)._type === 'text'
}

export function isVisAreaSetting(item: ItemSettingPart): item is VisAreaSettingPart {
    return isVisNodeSetting(item as VisAreaSettingPart) || isTextSetting(item as VisAreaSettingPart)
}

export function isGraphSelfPart(item: DocumentSelfPartAny): item is GraphSelfPart {
    return (item as GraphSelfPart).Conf._label === '_DocGraph'
}

export function isPaperSelfPart(item: DocumentSelfPartAny): item is PaperSelfPart {
    return (item as PaperSelfPart).Conf._label === '_DocPaper'
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

export function isDirectoryItemDocument(item: DirectoryItemAll): item is DirectoryNode {
    return (item as DirectoryNode).type === 'document'
}
