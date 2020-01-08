import {GraphSelfPart} from "@/utils/graphClass";
import {RectByPoint} from "@/utils/geoMetric";

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

// grpah-viewbox graph-render相关组件使用
export type GraphMetaData = {
    self: GraphSelfPart,
    rect: RectByPoint,
    parent: GraphMetaData | null,
}
