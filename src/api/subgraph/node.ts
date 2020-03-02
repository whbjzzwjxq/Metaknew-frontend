import {MediaInfoPart, NodeInfoPart} from "@/class/graphItem";
import {instance} from "@/api/main";

export function nodeUpdate(data: NodeInfoPart) {
    return instance.request({
        url: '/subgraph/update/node/normal',
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
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
