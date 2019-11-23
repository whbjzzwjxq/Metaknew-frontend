import {BASE, baseService} from './main';
import {BaseMediaInfo, GraphSelfPart, id, MediaInfoPart, NodeInfoPart, QueryObject} from "@/utils/graphClass";

export function createMediaNode(data: {name: string, item: BaseMediaInfo}) {
  return baseService({
    url: BASE + '/subgraph/create/media/normal',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  })
}

export function updateMediaNode(data: MediaInfoPart) {
  return baseService({
    url: BASE + '/subgraph/update/media/normal',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  })
}

export function updateMediaToNode(node: NodeInfoPart, mediaList: Array<id>) {
  return baseService({
    url: BASE + '/subgraph/update/node/media',
    method: 'post',
    data: {
      node: node,
      media: mediaList
    }
  })
}

export function updateSingleNode(data: NodeInfoPart) {
  return baseService({
    url: BASE + '/subgraph/update/node/normal',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  })
}

export function multiNodeCreate(pLabel: string, nodes: NodeInfoPart) {
  return baseService({
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
  return baseService({
    url: BASE + '/document/query/graph',
    method: 'get',
    params: {
      _id: id
    }
  })
}

export function querySingleNode(payload: QueryObject) {
  return baseService({
    url: BASE + '/subgraph/query/',
    method: 'get',
    params: payload
  })
}

export function queryMultiSource(list: Array<QueryObject>) {
  return baseService({
    url: BASE + '/subgraph/query/multi',
    method: 'post',
    data: list.map(query => [query._id, query._type, query._label])
  })
}

export function saveDocGraph(document: GraphSelfPart, isDraft: boolean, isAuto: boolean) {
  return baseService({
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
  return baseService({
    url: BASE + '/subgraph/query/media/multi',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: queryList
  })
}

export function queryAutoSave(start: number) {
  return baseService({
    url: BASE + '/document/query/auto_save',
    method: 'get',
    params: {
      start: start
    }
  })
}

export function deleteAutoSave(SourceId: id, VersionId: number) {
  return baseService({
    url: BASE + '/document/delete/auto_save',
    method: 'get',
    params: {
      source: SourceId,
      version: VersionId
    }
  })
}