import Vue from 'vue'
import {createMediaNode, queryDocGraph, queryMultiMedia, queryMultiSource} from '@/api/commonSource';
import {FileToken, getFileToken} from '@/api/user';
import {filePutBlob} from '@/api/fileUpload';
import {
  GraphBackend,
  GraphSelfPart,
  id,
  LinkInfoPart,
  LinkSettingPart,
  MediaInfoPart,
  NodeInfoPart,
  userConcernTemplate,
  NodeSetting,
  QueryObject,
  NodeInfoPartBackend,
  LinkSetting,
  LinkInfoPartBackend,
  BaseLinkCtrl, MediaInfoPartBackend, MediaSettingPart, NodeSettingPart, Setting
} from "@/utils/graphClass";
import {
  commitInfoRemove,
  commitInfoAdd,
  commitGraphAdd,
  commitGraphRemove,
  commitGraphChangeId, commitItemChange, commitFileToken
} from "@/store/modules/_mutations";
import {Commit, Dispatch} from "vuex";

export type InfoPart = NodeInfoPart | MediaInfoPart | LinkInfoPart;
export type idMap = Record<id, id>;
const getManager = (_type: string) =>
  _type === 'link'
    ? state.linkManager
    : _type === 'media'
      ? state.mediaManager
      : state.nodeManager;

export interface DataManagerState {
  currentGraph: GraphSelfPart,
  currentItem: InfoPart,
  graphManager: Record<id, GraphSelfPart>,
  nodeManager: Record<id, NodeInfoPart>,
  linkManager: Record<id, LinkInfoPart>,
  mediaManager: Record<id, MediaInfoPart>,
  userConcernManager: Object, // todo
  fileToken: FileToken,
  newIdRegex: RegExp
}

interface Context {
  state: DataManagerState,
  commit: Commit,
  dispatch: Dispatch,

}

const state: DataManagerState = {
  currentGraph: GraphSelfPart.emptyGraphSelfPart('$_-1', null),

  currentItem: NodeInfoPart.emptyNodeInfoPart('$_-1', 'node', 'BaseNode'),
  graphManager: {},
  nodeManager: {},
  linkManager: {},
  mediaManager: {},
  userConcernManager: {},
  fileToken: {
    'AccessKeySecret': '',
    'AccessKeyId': '',
    'Expiration': 1571219891,
    'SecurityToken': ''
  },
  newIdRegex: new RegExp('\\$_[0-9]*')
};

const getters = {
  currentGraphNodeIds: (state: DataManagerState) => {
    return state.currentGraph.Graph.nodes.map(node => node.Setting._id)
  },
  currentGraphIsRemote: (state: DataManagerState) => {
    return state.newIdRegex.test(state.currentGraph.id.toString())
  },

  graphList: (state: DataManagerState) => {
    return Object.entries(state.graphManager).map(([id, graph]) => graph)
  },

  currentGraphInfo: (state: DataManagerState) => {
    return state.nodeManager[state.currentGraph.id]
  }
};
const mutations = {

  // ------------单纯的操作------------
  currentGraphChange(state: DataManagerState, payload: GraphSelfPart) {
    let id = payload.id; // 这里payload是document
    state.currentGraph = payload;
    commitItemChange(state.nodeManager[id]);
  },

  currentItemChange(state: DataManagerState, payload: InfoPart) {
    state.currentItem = payload;
  },

  // ------------Graph------------
  // Push Graph
  graphAdd(state: DataManagerState, payload: { graph: GraphSelfPart, strict?: boolean }) {
    let {graph, strict} = payload;
    strict || (strict = true);
    strict
      ? Vue.set(state.graphManager, graph.id, graph)
      : !state.graphManager[graph.id] && Vue.set(state.graphManager, graph.id, graph)
  },

  graphRemove(state: DataManagerState, payload: id) {
    delete state.graphManager[payload]
  },

  graphChangeId(state: DataManagerState, payload: idMap) {
    let {oldId, newId} = payload;
    let oldGraph = state.graphManager[oldId];
    if (oldGraph) {
      oldGraph.changeId(newId);
      commitGraphAdd({graph: oldGraph});
      commitGraphRemove(oldId);
    }
  },

  // ------------以下是Info部分的内容------------
  infoAdd(state: DataManagerState, payload: { item: InfoPart, strict?: boolean }) {
    let {item, strict} = payload;
    let _id = item.Info.id;
    let manager = getManager(item.Info.type);
    strict || (strict = true);
    strict
      ? Vue.set(manager, _id, item)
      : !manager[_id] && Vue.set(manager, _id, item)
  },

  infoRemove(state: DataManagerState, payload: { _id: id, _type: string }) {
    let manager = getManager(payload._type);
    delete manager[payload._id]
  },

  infoChangeId(state: DataManagerState, payload: { _type: string, idMap: idMap }) {
    let {_type, idMap} = payload;
    let manager = getManager(_type);
    Object.keys(idMap).map(oldId => {
      let newId = idMap[oldId];
      let oldInfo = manager[oldId];
      if (oldInfo) {
        oldInfo.changeId(newId);
        commitInfoAdd({item: oldInfo});
        commitInfoRemove({_id: oldId, _type: _type});
      }
      // 额外检查一下Graph
      _type === 'document' &&
      commitGraphChangeId({oldId: newId})
    });
  },

  // ------------以下是Setting内容------------

  nodeSettingPush(state: DataManagerState, payload: Array<NodeSettingPart>) {
    state.currentGraph.addNodes(payload)
  },

  linkSettingPush(state: DataManagerState, payload: Array<LinkSettingPart>) {
    state.currentGraph.addLinks(payload)
  },

  mediaSettingPush(state: DataManagerState, payload: Array<MediaSettingPart>) {
    state.currentGraph.addMedias(payload)
  }

};
const actions = {

  // 请求Graph
  async graphQuery(context: { commit: Commit, state: DataManagerState, dispatch: Dispatch },
                   payload: { _id: id, parent: GraphSelfPart | null }) {
    let {_id, parent} = payload;
    // 先绘制Graph
    await queryDocGraph(_id).then(res => {
      let data: GraphBackend = res.data;
      let graphSelf = GraphSelfPart.resolveFromBackEnd(data, parent);
      let graphInfo = new NodeInfoPart(data.Base.Info, data.Base.Ctrl, userConcernTemplate());
      commitInfoAdd({item: graphInfo});
      commitGraphAdd({graph: graphSelf});
      // 请求节点
      let graph = graphSelf.Graph;
      context.dispatch('nodeQuery', graph.nodes.map(node => node.Setting));
      context.dispatch('linkQuery', graph.links.map(link => link.Setting));
      context.dispatch('mediaQuery', graph.medias.map(media => media.Setting._id))
    })
  },

  // 异步请求Node
  nodeQuery(context: { commit: Commit, state: DataManagerState }, payload: Array<Setting>) {
    // 未缓存的节点列表
    let noCacheNode = payload.filter(node => !state.nodeManager[node._id]);
    if (noCacheNode.length > 0) {
      // 请求体
      let nodeQuery = noCacheNode.map(node => {
        // 先使用假数据 然后再请求
        commitInfoAdd({item: NodeInfoPart.emptyNodeInfoPart(node._id, node._type, node._label), strict: false});
        return <QueryObject>node
      });
      // 请求节点
      queryMultiSource(nodeQuery).then(res => {
        let data: Array<NodeInfoPartBackend> = res.data;
        data.map(node => {
          let nodeInfo = new NodeInfoPart(node.Info, node.Ctrl, userConcernTemplate());
          nodeInfo.synchronizationAll();
          commitInfoAdd({item: nodeInfo})
        });
      });
    }
  },

  // 异步请求link
  linkQuery(context: Context, payload: Array<LinkSetting>) {
    // 未缓存的关系列表
    let noCacheLink = payload.filter(link => !state.linkManager[link._id]);
    if (noCacheLink.length > 0) {
      let linkQuery = noCacheLink.map(link => {
        commitInfoAdd({item: LinkInfoPart.emptyLinkInfo(link._id, link._label, link._start, link._end), strict: false});
        return <QueryObject>link
      });
      // 请求关系
      queryMultiSource(linkQuery).then(res => {
        let data: Array<LinkInfoPartBackend> = res.data;
        data.map(link => {
          let linkSetting = noCacheLink.filter(setting => setting._id === link.Info.id)[0];
          let linkInfo = new LinkInfoPart(link.Info, <BaseLinkCtrl>Object.assign(link.Ctrl, {
            Start: linkSetting._start,
            End: linkSetting._end,
          }));

          commitInfoAdd({item: linkInfo})
        });
      });
    }
  },

  // 请求Media
  mediaQuery(context: Context, payload: Array<id>) {
    payload || (payload = []);
    let noCacheMedia = payload.filter(id => !state.nodeManager[id]);

    if (noCacheMedia.length > 0) {
      let defaultImage = require('@/assets/defaultImage.jpg');
      noCacheMedia.map(id => {
        commitInfoAdd({item: MediaInfoPart.emptyMediaInfo(id, defaultImage)});
        return <QueryObject>{
          _id: id,
          _type: 'media',
          _label: 'unknown'
        }
      });

      return queryMultiMedia(noCacheMedia).then(res => {
        let data: Array<MediaInfoPartBackend> = res.data;
        data.map(media => {
          let mediaInfo = new MediaInfoPart(media.Info, media.Ctrl, userConcernTemplate(), 'remote', []);
          mediaInfo.synchronizationAll();
          commitInfoAdd({item: mediaInfo})
        });
      })
    }
  },

  async fileUpload(context: Context, payload: {
    item?: MediaInfoPart, realFile: File,
    storeName: string, uploadType: 'mainImage' | 'normal'
  }) {
    let {item, realFile, storeName, uploadType} = payload;
    // checkFileToken
    let fileToken = state.fileToken;
    let now = (new Date()).valueOf();
    // 先判断Token情况
    if ((fileToken.Expiration * 1000 - now <= 0) || !fileToken.AccessKeyId) {
      await getFileToken().then(res => {
        commitFileToken(res.data.fileToken);
        fileToken = res.data.fileToken;
      })
        .catch(() => {
          alert('暂时无法上传')
        })
    }

    // 开始上传
    let request;
    item && item.changeStatus('uploading');
    await filePutBlob(fileToken, realFile, storeName).then(returnObj => {
      if (uploadType === 'normal' && item) {
        let data = {name: storeName, item: item.Info};
        request = createMediaNode(data);
        return request
      } else if (uploadType === 'mainImage') {
        return new Promise(() => {
        })
      }
    });
  }

};

export default {
  state,
  mutations,
  actions,
  getters
}
