import {BASE, baseService} from './main';

export function createMediaNode(data) {
  return baseService({
    url: BASE + '/subgraph/create/media/normal',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  })
}

export function updateMediaNode(data) {
  return baseService({
    url: BASE + '/subgraph/update/media/normal',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  })
}

export function updateMediaToNode(node, mediaList) {
  return baseService({
    url: BASE + '/subgraph/update/node/media',
    method: 'post',
    data: {
      node: node,
      media: mediaList
    }
  })
}

export function updateSingleNode(data) {
  return baseService({
    url: BASE + '/subgraph/update/node/normal',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  })
}

export function multiNodeCreate(pLabel, nodes) {
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

export function queryDocGraph(id) {
  return baseService({
    url: BASE + '/document/query/graph',
    method: 'get',
    params: {
      _id: id
    }
  })
}

export function querySingleNode(_id, _type, PrimaryLabel) {
  return baseService({
    url: BASE + '/subgraph/query/',
    method: 'get',
    params: {
      _id: _id,
      _type: _type,
      _label: PrimaryLabel
    }
  })
}

export function queryMultiSource(list) {
  return baseService({
    url: BASE + '/subgraph/query/multi',
    method: 'post',
    data: list
  })
}

export function saveDocGraph(document, isDraft, isAuto) {
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

export function queryMultiMedia(queryList) {
  return baseService({
    url: BASE + '/subgraph/query/media/multi',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: queryList
  })
}

export function queryAutoSave(start) {
  return baseService({
    url: BASE + '/document/query/auto_save',
    method: 'get',
    params: {
      start: start
    }
  })
}

export function deleteAutoSave(SourceId, VersionId) {
  return baseService({
    url: BASE + '/document/delete/auto_save',
    method: 'get',
    params: {
      source: SourceId,
      version: VersionId
    }
  })
}
