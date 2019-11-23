import {BASE, baseService} from "./main";

interface searchQueryObject {
  labels: Array<string>,
  props: Record<string, string>,
  keywords: string,
  language: string
}

export function queryHomePage(queryObject: searchQueryObject) {
    return baseService({
    url: BASE + '/es_query/query/home_page_search',
    method: "post",
    data: queryObject
  })
}
