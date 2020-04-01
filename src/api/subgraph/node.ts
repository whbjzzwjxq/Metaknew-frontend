import {instance} from "@/api/main";
import {NodeInfoPart} from "@/class/graphItem";
import {commitInfoIdChange, commitSnackbarOn} from "@/store/modules/_mutations";

export interface BackendNodeInfoPart {
    Info: BaseNodeInfo;
    Ctrl: BaseNodeCtrl;
}

export async function nodeBulkUpdate(nodes: NodeInfoPart[]) {
    let updateNodes = nodes.filter(node => node.State.isEdit && node.isRemote);
    let result = await instance.request({
        url: '/item/node/bulk_update',
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            Data: updateNodes.map(node => node.Info),
            CreateType: 'USER'
        }
    });
    let payload = {
        actionName: 'nodeBulkUpdate',
        color: 'success',
        once: false,
        content: '更新节点成功'
    } as SnackBarStatePayload;
    commitSnackbarOn(payload);
    updateNodes.map(node => {
        node.State.isEdit = false
    });
    return result
}

export async function nodeBulkCreate(nodes: NodeInfoPart[]) {
    let createNodes = nodes.filter(node => !node.isRemote).map(node => node.Info);
    let result = await nodeBulkCreateInDataTable(createNodes);
    let idMap = result.data;
    commitInfoIdChange({_type: 'node', idMap});
    return result
}

export function nodeBulkCreateInDataTable(nodes: BaseNodeInfo[]) {
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
    });
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
