import {BASE, baseService} from './main';
import {
  BaseMediaInfo,
  BaseNodeInfo, GraphBackend,
  GraphSelfPart,
  id, LinkInfoPartBackend,
  MediaInfoPart, MediaInfoPartBackend,
  NodeInfoPart, NodeInfoPartBackend,
  QueryObject
} from "@/utils/graphClass";

export function createMedia(data: {name: string, Info: BaseMediaInfo}) {
  return baseService<id>()({
    url: BASE + '/subgraph/create/media/normal',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  })
}

export function updateMedia(data: MediaInfoPart) {
  return baseService()({
    url: BASE + '/subgraph/update/media/normal',
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

export function updateMediaToNode(node: QueryObject, mediaList: Array<id>) {
  return baseService<id[]>()({
    url: BASE + '/subgraph/update/node/media',
    method: 'post',
    data: {
      node: node,
      media: mediaList
    }
  })
}

export function updateNode(data: NodeInfoPart) {
  return baseService()({
    url: BASE + '/subgraph/update/node/normal',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  })
}

export function createNodeMulti(pLabel: string, nodes: BaseNodeInfo[]) {
  return baseService()({
    url: BASE + '/subgraph/create/node/bulk_create',
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

export function queryDocGraph(id: id) {
  return baseService<GraphBackend>()({
    url: BASE + '/document/query/graph',
    method: 'get',
    params: {
      _id: id
    }
  })
}

export function querySingleNode(payload: QueryObject) {
  return baseService()({
    url: BASE + '/subgraph/query/',
    method: 'get',
    params: payload
  })
}

export function queryMultiSource(list: Array<QueryObject>) {
  return baseService<(NodeInfoPartBackend | LinkInfoPartBackend)[]>()({
    url: BASE + '/subgraph/query/multi',
    method: 'post',
    data: list.map(query => [query._id, query._type, query._label])
  })
}

export function saveDocGraph(document: GraphSelfPart, isDraft: boolean, isAuto: boolean) {
  return baseService()({
    url: BASE + '/document/create/graph/normal',
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

export function queryMultiMedia(queryList: Array<id>) {
  return baseService<MediaInfoPartBackend[]>()({
    url: BASE + '/subgraph/query/media/multi',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: queryList
  })
}

export function queryAutoSave(start: number) {
  return baseService()({
    url: BASE + '/document/query/auto_save',
    method: 'get',
    params: {
      start: start
    }
  })
}

export function deleteAutoSave(SourceId: id, VersionId: number) {
  return baseService()({
    url: BASE + '/document/delete/auto_save',
    method: 'get',
    params: {
      source: SourceId,
      version: VersionId
    }
  })
}
