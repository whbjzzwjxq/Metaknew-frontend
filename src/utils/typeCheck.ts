import {DirectoryItemAll, DirectoryNode, ListText, ListTitle} from "@/interface/interfaceInComponent";
import {InfoPart, MediaInfoPart, NodeInfoPart} from "@/class/info";
import {
    ItemSettingPart,
    LinkSettingPart,
    MediaSettingPart,
    NodeSettingPart,
    TextSettingPart
} from "@/class/settingBase";

export function isNodeInfoPart(item: InfoPart): item is NodeInfoPart {
    return (item as NodeInfoPart)._type === 'node' ||
        (item as NodeInfoPart)._type === 'document'
}

export function isDocumentType(str: string): str is DocumentItemType {
    return (str as DocumentItemType) === 'node' ||
        (str as DocumentItemType) === 'link' ||
        (str as DocumentItemType) === 'media' ||
        (str as DocumentItemType) === 'document' ||
        (str as DocumentItemType) === 'text'
}

export function isNodeSettingPart(item: ItemSettingPart): item is NodeSettingPart {
    return (item as NodeSettingPart)._type === 'node' || (item as NodeSettingPart)._type === 'document'
}

export function isMediaSetting(item: ItemSettingPart): item is MediaSettingPart {
    return (item as MediaSettingPart)._type === 'media'
}

export function isVisNodeSetting(item: ItemSettingPart): item is VisNodeSettingPart {
    return isNodeSettingPart(item) || isMediaSetting(item)
}

export function isLinkSetting(item: ItemSettingPart): item is LinkSettingPart {
    return (item as LinkSettingPart)._type === 'link'
}

export function isTextSetting(item: ItemSettingPart): item is TextSettingPart {
    return (item as TextSettingPart)._type === 'text'
}

export function isVisAreaSetting(item: ItemSettingPart): item is VisAreaSettingPart {
    return isVisNodeSetting(item as VisAreaSettingPart) || isTextSetting(item as VisAreaSettingPart)
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

export function isListText(item: ListText | ListTitle): item is ListText {
    return !(item as ListText).isTitle
}

export function isDirectoryItemDocument(item: DirectoryItemAll): item is DirectoryNode {
    return (item as DirectoryNode).type === 'document'
}

export function isObjectCallable(obj: any): obj is Function {
    return typeof (obj as Function) === 'function'
}
