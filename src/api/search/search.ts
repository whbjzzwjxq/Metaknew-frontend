import {instance} from '../main'

export interface SearchQueryObject {
    labels: string[],
    props: string[],
    keyword: string,
    type: ItemType[],
    language: string
}

export interface IndexedInfo {
    id: id,
    type: GraphItemType,
    PrimaryLabel: string,
    Language: string,
    CreateUser: number,
    UpdateTime: string,
    Hot: number,
    MainPic: string,
    Alias: Array<string>,
    Tags: {
        UserLabels: string[]
        Labels: Array<string>,
        Topic: Array<string>
    },
    Name: Record<string, string>,
    Description: Record<string, string>,
    Num: {
        NumBad: number,
        NumGood: number,
        NumShared: number,
        NumStar: number
    },
    Auth: {
        IsUsed: boolean,
        IsCommon: boolean,
        IsOpenSource: boolean
    }
}

export interface HomePageSearchResponse {
    Document: IndexedInfo[],
    Meta: IndexedInfo[],
    [prop: string]: IndexedInfo[]
}

export interface NameQueryObject {
    id: id,
    type: AllType,
    name: string
}

export const queryHomePage = (queryObject: SearchQueryObject) =>
    instance.request<HomePageSearchResponse>({
        url: '/es/home_query',
        method: "GET",
        params: {
            ...queryObject
        }
    });

export function nameSimilar(nameList: NameQueryObject[]) {
    return instance.request({
        url: 'es/name_similar',
        method: 'POST',
        data: {
            NameList: nameList
        }
    })
}
