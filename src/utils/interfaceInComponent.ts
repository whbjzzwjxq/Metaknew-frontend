import {FieldType, ResolveType} from "@/utils/labelField";
import {BaseType} from "@/utils/graphClass";

export type LabelExistProp = 'Info' | 'Ctrl' | 'UserConcern'

export interface LabelGroup {
    name: string,
    labels: string[],
    closeable: boolean,
    editable: boolean,
    prop?: LabelExistProp
}

export interface ExtraPropsItem {
    value: any,
    type: FieldType,
    resolve: ResolveType
}

export type ExtraProp = Record<string, ExtraPropsItem>

export interface IconItem {
    name: string,
    _func: Function | null,
    color?: string,
    render?: boolean
}

export type LabelViewDict = Record<string, Record<string, boolean>>

export type item = 'node' | 'media' | 'link'

export interface TabContent {
    icon: string,
    props?: Record<string, any>,
    name?: string | Record<string, string>
}

export interface VisualNodeSetting {
    height: number,
    width: number,
    x: number,
    y: number,
    show: boolean,
    isSelected: boolean,
    isDeleted: boolean
}
