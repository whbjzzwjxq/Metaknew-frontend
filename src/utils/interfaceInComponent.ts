import {FieldType, ResolveType} from "@/utils/labelField";

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

export interface iconItem {
  icon: string,
  _func: Function | null,
  color?: string,
  render: boolean
}
