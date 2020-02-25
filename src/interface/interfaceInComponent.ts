import {IndexedInfo, IndexedText} from "@/api/search";
import {Point, RectByPoint} from "@/class/geometric";
import {GraphSelfPart} from "@/class/graphItem";

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
export type LabelViewDict = Record<string, Record<string, boolean>>

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

//DataTable使用
export interface FlatNodeInfo extends BaseInfo {
    Alias: Array<string>;
    BaseImp: number;
    BaseHardLevel: number;
    BaseUseful: number;
    Language: string;
    Topic: Array<string>;
    Labels: Array<string>;
    Description: Translate;
    IncludedMedia: Array<string | number>;
    MainPic: string;

    [prop: string]: any
}

export type SortProp = 'UpdateTime' | 'isStar' | 'PrimaryLabel' // 排序方式

// SearchBar

export interface ListInfoItem extends IndexedInfo {
    isTitle: boolean,
    isInfo: boolean,
    disabled: boolean
}

export interface ListTextItem extends IndexedText {
    isTitle: boolean,
    isInfo: boolean,
    disabled: boolean
}

export interface ListTitle {
    isTitle: boolean,
    isInfo: boolean,
    isCollapse: boolean,
    length: number,
    name: string,
    disabled: boolean
}

export type ListItem = AvailableListItem | ListTitle
export type AvailableListItem = ListInfoItem | ListTextItem
export type ArrayListItem = ListItem[]

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
