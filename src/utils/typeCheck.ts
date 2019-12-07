import {
    BaseLinkInfo,
    BaseMediaInfo,
    BaseNodeInfo,
    BooleanConcern,
    LevelConcern, LinkInfoPartBackend,
    LinkSettingPart,
    MediaSettingPart, NodeInfoPartBackend,
    SettingPart,
    VisualNodeSettingPart
} from "@/utils/graphClass";

export function isNodeBackend(item: NodeInfoPartBackend | LinkInfoPartBackend): item is NodeInfoPartBackend {
    let type = (item as NodeInfoPartBackend).Info.type;
    return type === 'node' || type === 'document'
}

export function isNodeInfoPart(item: BaseNodeInfo | BaseMediaInfo | BaseLinkInfo): item is BaseNodeInfo {
    return (item as BaseNodeInfo).type === 'node' ||
        (item as BaseNodeInfo).type === 'document'
}

export function isLinkSetting(item: SettingPart): item is LinkSettingPart {
    return (item as LinkSettingPart).Setting._type === 'link'
}

export function isBooleanConcern(prop: LevelConcern | BooleanConcern | "Labels"): prop is BooleanConcern {
    return (
        prop === "isStar" || prop === "isBad" || prop === "isGood" || prop === "isShared"
    );
}

export function isLevelConcern(prop: LevelConcern | BooleanConcern | "Labels"): prop is LevelConcern {
    return prop === "Imp" || prop === "HardLevel" || prop === "Useful";
}

export function isMediaSetting(item: VisualNodeSettingPart): item is MediaSettingPart {
    return (item as MediaSettingPart).Setting._type === 'media'
}
