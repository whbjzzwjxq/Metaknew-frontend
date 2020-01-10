import {GraphSelfPart} from "@/utils/graphClass";
import {Point, RectByPoint} from "@/utils/geoMetric";

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
    props?: Record<string, any>,
    name?: string | Record<string, string>
}

// graph-viewBox graph-render相关组件使用
export type GraphMetaData = {
    absolute: Point, // 在视图中的绝对位置
    self: GraphSelfPart, // 对应的Graph
    rect: RectByPoint, // 对应的矩形
    parent: GraphMetaData | null, //对应的上级MetaData
}
