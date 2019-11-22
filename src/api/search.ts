import {BASE, baseService} from "./main";

export function queryHomePage(queryObject) {
    return baseService({
    url: BASE + '/es_query/query/home_page_search',
    method: "post",
    data: queryObject
  })
}
