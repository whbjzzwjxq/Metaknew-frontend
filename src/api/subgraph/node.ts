import {instance} from "@/api/main";
export interface BackendNodeInfoPart {
    Info: BaseNodeInfo;
    Ctrl: BaseNodeCtrl;
}

export function nodeBulkUpdate(nodes: BaseNodeInfo[]) {
    return instance.request({
        url: '/item/node/bulk_update',
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            Data: nodes,
            CreateType: 'USER'
        }
    })
}

export function nodeBulkCreate(nodes: BaseNodeInfo[]) {
    return instance.request<IdMap>({
        url: '/item/node/bulk_create',
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            Data: nodes,
            CreateType: 'USER'
        }
    })
}

export function visNodeBulkCreate(nodeList: BaseNodeInfo[], mediaList: BaseMediaInfo[]) {
    return instance.request<{'node': IdMap | null, 'media': IdMap | null}>({
        url: '/item/vis_node_bulk_create',
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            Nodes: nodeList,
            Medias: mediaList,
            CreateType: 'USER'
        }
    })
}

export function nodeQueryBulk(list: Array<QueryObject>) {
    return instance.request<BackendNodeInfoPart[]>({
        url: '/item/node/query',
        method: 'post',
        data: {
            DataList: list
        }
    })
}
