import {BASE, baseService} from "./main";
import {baseType, id} from "@/utils/graphClass";

export interface SearchQueryObject {
  labels: Array<string>,
  props: Record<string, string>,
  keyword: string,
  language: string
}

export interface IndexedInfo {
  id: id,
  type: baseType,
  PrimaryLabel: string,
  Language: string,
  CreateUser: number,
  UpdateTime: string,
  MainPic: string,
  'Name_auto': string,
  'Name_zh': string,
  'Name_en': string,
  Alias: Array<string>,
  Tags: {
    Labels: Array<string>,
    Topic: Array<string>
  },
  Level: {
    Imp: number,
    HardLevel: number,
    Useful: number,
    Star: number,
    Hot: number,
    TotalTime: number
  },
  'Is_Used': boolean,
  'Is_Common': boolean,
  'Is_OpenSource': boolean
}

export interface IndexedText {
  id: id,
  type: baseType,
  PrimaryLabel: string,
  Language: string,
  Name: string,
  'Name_auto': string,
  MainPic: string,
  Text: Text,
  Tags: Array<string>,
  Star: number,
  Hot: number,
}

export interface SearchBackObject {
  recent: Array<IndexedInfo>,
  text: Array<IndexedText>,
  info: Array<IndexedInfo>,
  [index: string]: Array<any>
}

export function queryHomePage(queryObject: SearchQueryObject) {
  return baseService({
    url: BASE + '/es_query/query/home_page_search',
    method: "post",
    data: queryObject
  })
}
