import {
    DocumentInfoPart,
    DocumentSettingPart,
    InfoPart, LinkInfoPart,
    LinkSettingPart, MediaInfoPart,
    MediaSettingPart, NodeInfoPart,
    NodeSettingPart,
    NoteSettingPart,
    SettingPart,
} from "@/utils/graphClass";
import {BackendLinkInfoPart, BackendNodeInfoPart} from "@/api/commonSource";

export function isNodeBackend(item: BackendNodeInfoPart | BackendLinkInfoPart): item is BackendNodeInfoPart {
    let type = (item as BackendNodeInfoPart).Info.type;
    return type === 'node' || type === 'document'
}

export function isNodeInfoPart(item: InfoPart): item is InfoPart {
    return (item as NodeInfoPart).type === 'node' || (item as NodeInfoPart).type === 'document'
}

export function isLinkInfoPart(item: InfoPart): item is InfoPart {
    return (item as LinkInfoPart).type === 'link'
}

export function isMediaInfoPart(item: InfoPart): item is MediaInfoPart {
    return (item as MediaInfoPart).type === 'media'
}

export function isDocumentInfoPart(item: InfoPart): item is DocumentInfoPart {
    return (item as DocumentInfoPart).type === 'document'
}

export function isBaseType(str: string): str is BaseType {
    return (str as BaseType) === 'node' ||
        (str as BaseType) === 'link' ||
        (str as BaseType) === 'media' ||
        (str as BaseType) === 'document' ||
        (str as BaseType) === 'note'
}

export function isLinkSetting(item: SettingPart): item is LinkSettingPart {
    return (item as LinkSettingPart)._type === 'link'
}

export function isMediaSetting(item: SettingPart): item is MediaSettingPart {
    return (item as MediaSettingPart)._type === 'media'
}

export function isNodeSetting(item: SettingPart): item is NodeSettingPart {
    return (item as NodeSettingPart)._type === 'node'
}

export function isDocumentSetting(item: SettingPart): item is DocumentSettingPart {
    return (item as DocumentSettingPart)._type === 'document'
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
