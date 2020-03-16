import {instance} from "@/api/main";
import {BackendGraph} from "@/api/document/document";

export interface Draft {
    Query: QueryObject;
    Content: Object;
    Name: string;
    VersionId?: number
}

export interface DocumentDraft extends Draft{
    Content: BackendGraph
}

export interface NodeDraft extends Draft {
    Content: BaseNodeInfo
}

export interface DraftResponse {
    DraftIdMap: Record<id, number> // key是 item id value 是draftId
}

export const draftUpdate = (data: Draft[], isAuto: boolean) =>
    instance.request<DraftResponse>({
        method: 'POST',
        url: '/item/draft/bulk_update',
        data: {
            Data: data,
            IsAuto: isAuto,
            CreateType: 'USER'
        }
    });
