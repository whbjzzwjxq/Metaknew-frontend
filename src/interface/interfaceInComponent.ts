import {Point, RectByPoint} from "@/class/geometric";
import {IndexedInfo} from "@/api/search/search";
import {VirtualNodeBase} from "@/interface/interfaceTree";
import {DocumentSelfPart, LinkSettingPart, MediaSettingPart, NodeSettingPart} from "@/class/settingBase";
import {SizeName} from "@/interface/style/interfaceStyleBase";

export type LabelExistProp = 'Info' | 'Ctrl' | 'UserConcern'

// 描述Label系统的Group
export interface LabelGroup {
    name: string,
    labels: string[],
    closeable: boolean,
    editable: boolean,
    prop?: LabelExistProp // 属于哪个属性
}

// _type _label bool 控制标签是否可以显示
export type LabelViewDict = Record<DocumentItemType, Record<string, boolean>>

// v-tab 相关组件使用
export interface TabContent {
    icon: string,
    children?: TabContent[],
    name: string,
    key: string
}

// graph-viewBox graph-render相关组件使用
export type GraphMetaData = {
    absolute: Point, // 在视图中的绝对位置
    self: DocumentSelfPart, // 对应的Graph
    rect: RectByPoint, // 对应的矩形
    parent: GraphMetaData | null, //对应的上级MetaData
}

export type SortProp = 'UpdateTime' | 'NumStar' | 'PrimaryLabel' // 排序方式

// SearchBar

export interface ListText extends IndexedInfo {
    isTitle: false,
    isDocument: boolean,
    disabled: boolean
}

export interface ListDoc extends ListText {
    isDocument: true
}

export interface ListTitle {
    id: id,
    isTitle: true,
    isInfo: boolean,
    isCollapse: boolean,
    length: number,
    name: string,
    disabled: boolean
}

export type ListItem = ListText | ListTitle | ListDoc

export type Rule<T> = (v: T) => string | boolean
type InputType = 'text' | 'password'

export interface TextFieldSetting {
    rules: Rule<string>[],
    label: string,
    prop: string,
    type?: InputType,
    clearable?: boolean,
    appendIcon?: string,
    _func?: Function
}

export interface RegisterData extends FastRegisterData {
    Name: string,
    Password: string,
    ConfirmPassword: string,
    Email: string,
}

export interface FastRegisterData {
    Phone: string,
    Code: string
}

// 目录使用的内容
export interface DirectoryItem<T> {
    id: id,
    type: DocumentItemType,
    label: string,
    name: string,
    icon: string,
    deletable: boolean,
    editable: boolean,
    children?: DirectoryItemAll[],
    origin: T
}

export type DirectorySubItemAll =
    DirectoryItem<NodeSettingPart>
    | DirectoryItem<LinkSettingPart>
    | DirectoryItem<MediaSettingPart>

export interface DirectoryNode extends VirtualNodeBase<DocumentSelfPart, DirectoryNode>, DirectoryItem<DocumentSelfPart> {
    _children: DirectoryNode[],
    isCurrent: boolean
}

export type DirectoryItemAll = DirectorySubItemAll | DirectoryNode

export interface CardSize {
    height: number,
    width: number,
}

//card 标准尺寸 todo 转化为css
export function getCardSize(props: {large?: boolean, xLarge?: boolean, small?: boolean, xSmall?: boolean}): CardSize {
    if (props.large) {
        return {width: 360, height: 270}
    } else if (props.xLarge) {
        return {width: 600, height: 450}
    } else if (props.small) {
        return {width: 200, height: 150}
    } else if (props.xSmall) {
        return {width: 160, height: 120}
    } else {
        return {width: 240, height: 200}
    }
}

export function getSizeName(props: {large?: boolean, xLarge?: boolean, small?: boolean, xSmall?: boolean}): SizeName {
    if (props.large) {
        return SizeName.LA
    } else if (props.xLarge) {
        return SizeName.XL
    } else if (props.small) {
        return SizeName.SM
    } else if (props.xSmall) {
        return SizeName.XS
    } else {
        return SizeName.NO
    }
}

//node 标准尺寸 注意是半径 todo 转化为css
export function getNodeSize(props: {large?: boolean, xLarge?: boolean, small?: boolean, xSmall?: boolean}): CardSize {
    if (props.large) {
        return {width: 18, height: 18}
    } else if (props.xLarge) {
        return {width: 24, height: 24}
    } else if (props.small) {
        return {width: 9, height: 9}
    } else if (props.xSmall) {
        return {width: 6, height: 6}
    } else {
        return {width: 12, height: 12}
    }
}

export function getSizeByWidth(width: number) {
    return {
        xSmall: width <= 120,
        small: width > 120 && width <= 180,
        normal: width > 180 && width <= 240,
        large: width > 240 && width <= 360,
        xLarge: width > 360
    }
}

export interface DragEventWithTarget extends DragEvent {
    mouseOnTarget: Element | null
}

export const maxRow = 12
