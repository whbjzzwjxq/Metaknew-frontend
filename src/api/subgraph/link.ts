import {instance} from "@/api/main";

export function linkBulkCreate(linkList: CompressLinkInfo[], createType: string = 'USER') {
    return instance.request<IdMap | null>({
        method: 'POST',
        url: '/item/link/bulk_create',
        data: {
            Links: linkList,
            CreateType: createType
        }
    })
}

export interface BackendLinkCtrl extends PublicCtrl {
    Start: QueryObject;
    End: QueryObject;
}

export interface BackendLinkInfoPart {
    Info: BaseLinkInfo;
    Ctrl: BackendLinkCtrl;
}

export function linkQueryBulk(list: Array<QueryObject>) {
    return instance.request<BackendLinkInfoPart[]>({
        url: '/item/link/query',
        method: 'post',
        data: {
            DataList: list
        }
    })
}
