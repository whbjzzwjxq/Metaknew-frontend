import {FieldType, ResolveType} from "@/utils/labelField";
import {AreaRect, PointObject} from "@/utils/geoMetric";

export type LabelExistProp = 'Info' | 'Ctrl' | 'UserConcern'

export interface LabelGroup {
    name: string,
    labels: string[],
    closeable: boolean,
    editable: boolean,
    prop?: LabelExistProp
}

export interface ValueWithType<T> {
    value: T,
    type: FieldType,
    resolve: ResolveType
}

export type ExtraProps = Record<string, ValueWithType<any>>

export type EditProps = {
    ExtraProps: ValueWithType<ExtraProps>,
    [prop: string]: ValueWithType<any>
}

export interface IconItem {
    name: string,
    _func: Function | null,
    color?: string,
    render?: boolean,
    disabled?: boolean
}

export type LabelViewDict = Record<string, Record<string, boolean>>

export type item = 'node' | 'media' | 'link'

export interface TabContent {
    icon: string,
    props?: Record<string, any>,
    name?: string | Record<string, string>
}

export interface VisualNodeSetting extends AreaRect {
    height: number,
    width: number,
    x: number,
    y: number,
    show: boolean,
    isSelected: boolean,
    isDeleted: boolean
}
