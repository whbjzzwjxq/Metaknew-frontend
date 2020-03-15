import {instance} from "@/api/main";
import {BackendNodeInfoPart} from "@/api/subgraph/node";

export interface BackendGraph {
    Content: {
        nodes: Array<NodeSetting>;
        links: Array<BackendLinkSetting>;
        medias: Array<MediaSetting>;
        texts: Array<TextSetting>;
    };
    Conf: GraphSetting;
}

export interface BackendGraphWithNode extends BackendGraph {
    Base: BackendNodeInfoPart;
}

export function documentQuery(id: id) {
    return instance.request<BackendGraphWithNode>({
        url: '/document/query/graph',
        method: 'get',
        params: {
            id
        }
    })
}

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

export function documentSaveDraft(docList: BackendGraph[], isAuto: boolean) {
    return instance.request<Record<id, number>>({
        url: 'document/draft',
        method: 'POST',
        data: {
            GraphList: docList,
            IsAuto: isAuto
        }
    })
}
