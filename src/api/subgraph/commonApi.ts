import {instance} from "@/api/main";

export interface Draft {
    Query: QueryObject;
    Content: BaseInfo;
    Name: string;
    VersionId?: number
}

export interface DraftResponse {
    IdMap: IdMap,
    DraftIdMap: IdMap
}

export const draftCreate = (data: Draft[], isAuto: boolean, isNode: boolean) =>
    instance.request<DraftResponse>({
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
    instance.request<DraftResponse>({
        method: 'POST',
        url: '/item/draft/bulk_update',
        data: {
            Data: data,
            IsAuto: isAuto,
            IsNode: isNode,
            CreateType: 'USER'
        }
    });
