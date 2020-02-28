import {NodeInfoPart} from "@/class/graphItem";
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
    return instance.request({
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
