import {instance} from "@/api/main";
import {BackendGraph} from "@/api/commonSource";

export function documentBulkCreate(docList: BackendGraph[], createType: string = 'USER') {
    return instance.request<id[]>({
        url: 'document/bulk_create',
        method: 'POST',
        data: {
            GraphList: docList,
            CreateType: createType
        }
    })
}

export function documentBulkUpdate(docList: BackendGraph[], createType: string = 'USER') {
    return instance.request<id[]>({
        url: 'document/bulk_update',
        method: 'POST',
        data: {
            GraphList: docList,
            CreateType: createType
        }
    })
}
