import {instance} from "@/api/main";
import {QueryObject} from "@/api/commonSource";

export interface Draft {
    Query: QueryObject
    Content: BaseInfo;
    Name: string
}

export const draftCreate = (data: Draft[], isAuto: boolean, isNode: boolean) =>
    instance.request<IdMap>({
        method: 'POST',
        url: '/item/draft/bulk_create',
        data: {
            Data: data,
            IsAuto: isAuto,
            IsNode: isNode,
            CreateType: 'USER'
        }
    });

export const draftUpdate = (data: Draft[], isAuto: boolean, isNode: boolean) =>
    instance.request<IdMap>({
        method: 'POST',
        url: '/item/draft/bulk_create',
        data: {
            Data: data,
            IsAuto: isAuto,
            IsNode: isNode,
            CreateType: 'USER'
        }
    });
