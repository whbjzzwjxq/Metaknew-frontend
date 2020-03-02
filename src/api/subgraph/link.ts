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
