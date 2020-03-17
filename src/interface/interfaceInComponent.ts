import {Point, RectByPoint} from "@/class/geometric";
import {GraphSelfPart} from "@/class/graphItem";
import {IndexedInfo} from "@/api/search/search";

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
export type LabelViewDict = Record<GraphItemType, Record<string, boolean>>

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
    self: GraphSelfPart, // 对应的Graph
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
