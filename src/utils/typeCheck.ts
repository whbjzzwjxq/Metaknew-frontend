import {DirectoryItemAll, DirectoryNode, ListText, ListTitle} from "@/interface/interfaceInComponent";
import {InfoPart, MediaInfoPart, NodeInfoPart} from "@/class/info";
import {
    DocumentItemSettingPart,
    LinkSettingPart,
    MediaSettingPart,
    NodeSettingPart,
    TextSettingPart
} from "@/class/settingBase";

export function isDocumentType(str: string): str is DocumentItemType {
    return (str as DocumentItemType) === 'node' ||
        (str as DocumentItemType) === 'link' ||
        (str as DocumentItemType) === 'media' ||
        (str as DocumentItemType) === 'document' ||
        (str as DocumentItemType) === 'text'
}

export function isNodeSetting(item: DocumentItemSetting): item is NodeSetting {
    return (item as NodeSetting)._type === 'node' || (item as NodeSetting)._type === 'document'
}

export function isMediaSetting(item: DocumentItemSetting): item is MediaSetting {
    return (item as MediaSetting)._type === 'media'
}

export function isTextSetting(item: DocumentItemSetting): item is TextSetting {
    return (item as TextSetting)._type === 'text'
}

export function isLinkSetting(item: DocumentItemSetting): item is LinkSetting {
    return (item as LinkSetting)._type === 'link'
}

export function isNodeSettingPart(item: DocumentItemSettingPart): item is NodeSettingPart {
    return (item as NodeSettingPart)._type === 'node' || (item as NodeSettingPart)._type === 'document'
}

export function isMediaSettingPart(item: DocumentItemSettingPart): item is MediaSettingPart {
    return (item as MediaSettingPart)._type === 'media'
}

export function isVisNodeSettingPart(item: DocumentItemSettingPart): item is VisNodeSettingPart {
    return isNodeSettingPart(item) || isMediaSettingPart(item)
}

export function isLinkSettingPart(item: DocumentItemSettingPart): item is LinkSettingPart {
    return (item as LinkSettingPart)._type === 'link'
}

export function isTextSettingPart(item: DocumentItemSettingPart): item is TextSettingPart {
    return (item as TextSettingPart)._type === 'text'
}

export function isVisAreaSettingPart(item: DocumentItemSettingPart): item is VisAreaSettingPart {
    return isVisNodeSettingPart(item as VisAreaSettingPart) || isTextSettingPart(item as VisAreaSettingPart)
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
