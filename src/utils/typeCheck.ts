import {
    GraphItemSettingPart,
    InfoPart,
    LinkSettingPart,
    MediaInfoPart,
    MediaSettingPart,
    NodeSettingPart,
    SvgSettingPart
} from "@/class/graphItem";
import {BackendLinkInfoPart, BackendNodeInfoPart} from "@/api/commonSource";
import {PathNode, PathNodeExist} from "@/class/path";

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
        (str as GraphItemType) === 'svg'
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

export function isSvgSetting(item: GraphItemSettingPart): item is SvgSettingPart {
    return (item as SvgSettingPart)._type === 'svg'
}

export function isBooleanConcern(prop: LevelConcern | BooleanConcern | "Labels"): prop is BooleanConcern {
    return (
        prop === "isStar" || prop === "isBad" || prop === "isGood" || prop === "isShared"
    );
}

export function isLevelConcern(prop: LevelConcern | BooleanConcern | "Labels"): prop is LevelConcern {
    return prop === "Imp" || prop === "HardLevel" || prop === "Useful";
}

export function isMediaInfoPart(info: InfoPart): info is MediaInfoPart {
    return info.Info.type === 'media'
}

export function isPathNodeExist(item: PathNode): item is PathNodeExist {
    return (item as PathNodeExist).node !== null
}
