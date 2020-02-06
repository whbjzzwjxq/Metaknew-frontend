import {
    InfoPart,
    LinkSettingPart, MediaInfoPart,
    MediaSettingPart,
    NodeSettingPart,
    NoteSettingPart,
    SettingPart, SvgSettingPart, TextSettingPart,
} from "@/utils/graphClass";
import {BackendLinkInfoPart, BackendNodeInfoPart} from "@/api/commonSource";
import {PathNode, PathNodeExist} from "@/utils/pathClass";

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
        (str as GraphItemType) === 'svg' ||
        (str as GraphItemType) === 'text'
}

export function isLinkSetting(item: SettingPart): item is LinkSettingPart {
    return (item as LinkSettingPart)._type === 'link'
}

export function isMediaSetting(item: SettingPart): item is MediaSettingPart {
    return (item as MediaSettingPart)._type === 'media'
}

export function isNodeSetting(item: SettingPart): item is NodeSettingPart {
    return (item as NodeSettingPart)._type === 'node' || (item as NodeSettingPart)._type === 'document'
}

export function isSvgSetting(item: SettingPart): item is SvgSettingPart {
    return (item as SvgSettingPart)._type === 'svg'
}

export function isTextSetting(item: SettingPart): item is TextSettingPart {
    return (item as TextSettingPart)._type === 'text'
}

export function isNoteSetting(item: SettingPart): item is NoteSettingPart {
    return (item as NoteSettingPart)._type === 'note'
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
