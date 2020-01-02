import {
    BaseMediaInfo,
    BaseNodeInfo, GraphBackend,
    GraphSelfPart,
    id, LinkInfoPartBackend,
    MediaInfoPart, MediaInfoPartBackend,
    NodeInfoPart, NodeInfoPartBackend,
    QueryObject
} from "@/utils/graphClass";
import axios from 'axios'

export function mediaCreate(data: { name: string, Info: BaseMediaInfo }) {
    return axios.request<id>({
        url: '/subgraph/create/media/normal',
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    });
}

export function mediaUpdate(data: MediaInfoPart) {
    return axios.request({
        url: '/subgraph/update/media/normal',
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            name: data.Ctrl.FileName,
            data: data.Info
        }
    })
}

export function mediaAppendToNode(node: QueryObject, mediaList: Array<id>) {
    return axios.request<id[]>({
        url: '/subgraph/update/node/media',
        method: 'post',
        data: {
            node: node,
            media: mediaList
        }
    })
}

export function mediaQueryMulti(queryList: Array<id>) {
    return axios.request<MediaInfoPartBackend[]>({
        url: '/subgraph/query/media/multi',
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        data: queryList
    })
}

export function nodeUpdate(data: NodeInfoPart) {
    return axios.request({
        url: '/subgraph/update/node/normal',
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    })
}

export function nodeCreateMulti(pLabel: string, nodes: BaseNodeInfo[]) {
    return axios.request({
        url: '/subgraph/create/node/bulk_create',
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            data: nodes,
            pLabel: pLabel
        }
    })
}

export function nodeQuery(payload: QueryObject) {
    return axios.request({
        url: '/subgraph/query/',
        method: 'get',
        params: payload
    })
}

export function docGraphQuery(id: id) {
    return axios.request<GraphBackend>({
        url: '/document/query/graph',
        method: 'get',
        params: {
            _id: id
        }
    })
}

export function docGraphSave(document: GraphSelfPart, isDraft: boolean, isAuto: boolean) {
    return axios.request({
        url: '/document/create/graph/normal',
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            isDraft: isDraft,
            isAuto: isAuto,
            graph: document
        }
    })
}

export function sourceQueryMulti(list: Array<QueryObject>) {
    return axios.request<(NodeInfoPartBackend | LinkInfoPartBackend)[]>({
        url: '/subgraph/query/multi',
        method: 'post',
        data: list.map(query => [query._id, query._type, query._label])
    })
}

export function autoSaveQuery(start: number) {
    return axios.request({
        url: '/document/query/auto_save',
        method: 'get',
        params: {
            start: start
        }
    })
}

export function autoSaveDelete(SourceId: id, VersionId: number) {
    return axios.request({
        url: '/document/delete/auto_save',
        method: 'get',
        params: {
            source: SourceId,
            version: VersionId
        }
    })
}
