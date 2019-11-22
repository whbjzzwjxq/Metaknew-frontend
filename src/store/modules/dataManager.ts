import Vue from 'vue'
import {createMediaNode, queryDocGraph, queryMultiMedia, queryMultiSource} from '@/api/commonSource';
import {
  documentThemeTemplate,
  linkInfoTemplate,
  linkSettingTemp,
  mediaInfoTemplate,
  mediaSettingTemplate,
  nodeInfoTemplate,
  nodeSettingTemp,
  stateTemplate,
  userConcernTemplate
} from '@/utils/settingTemplate';
import {FileToken, fileToken} from '@/api/user';
import {filePutBlob} from '@/api/fileUpload';
import {GraphSelfPart, id, LinkInfoPart, MediaInfoPart, NodeInfoPart} from "@/utils/graphClass";

interface DataManagerState {
  currentGraph: GraphSelfPart,
  currentItem: NodeInfoPart | MediaInfoPart | LinkInfoPart,
  graphManager: Record<id, GraphSelfPart>,
  nodeManager: Record<id, NodeInfoPart | MediaInfoPart>,
  linkManager: Record<id, LinkInfoPart>,
  fileToken: FileToken,
  globalIndex: number,
  newIdRegex: RegExp
}

const state: DataManagerState = {
  'currentGraph': GraphSelfPart.emptyGraphSelfPart(),

  'currentItem': {
    'Info': {},
    'Ctrl': {},
    'isEdit': false,
    'isRemote': false
  },

  'graphManager': {},
  'nodeManager': {},
  'linkManager': {},
  'userConcernManager': {},

  'globalIndex': 0,
  fileToken: {
    'AccessKeySecret': '',
    'AccessKeyId': '',
    'Expiration': 1571219891,
    'SecurityToken': ''
  },

  newIdRegex: new RegExp('\\$_[0-9]*')
};

const getters = {
  currentGraphNodeIds: state => {
    return state.currentGraph.Graph.nodes.map(node => node.Setting._id)
  },
  currentGraphIsRemote: state => {
    return state.newIdRegex.test({ vm: state.currentGraph.id })
  },

  graphList: state => {
    return Object.entries(state.graphManager).map(([id, graph]) => graph)
  }
};
const mutations = {

  // ------------单纯的操作------------
  changeCurrentGraph(state, payload) {
    let id = payload.id; // 这里payload是document
    Vue.set(state, 'currentGraph', payload);
    this.commit('changeCurrentItem', state.nodeManager[id]);
  },

  changeCurrentItem(state, payload) {
    Vue.set(state, 'currentItem', payload)
  },

  newId(state) {
    state.globalIndex += 1
  },

  recoverGlobalIndex(state, payload) {
    state.globalIndex = payload + 1
  },

  changeIdInfo(state, payload) {
    // {oldId: newId}
    let {_type, idMap} = payload;
    let manager;
    _type === 'link'
      ? manager = state.linkManager
      : manager = state.nodeManager;
    Object.keys(idMap).map(oldId => {
      let newId = idMap[oldId];
      let oldInfo = manager[oldId];
      if (oldInfo) {
        oldInfo.Info.id = newId;
        this.commit('dataPushInfo', {item: oldInfo, _id: newId, _type: _type, strict: true});
        this.commit('dataRemoveInfo', {_id: oldId, _type: _type});
      }
      // 额外检查一下Graph
      oldId === state.currentGraph.id &&
      this.commit('changeIdGraph', {oldId: oldId, newId: newId})
    });
  },

  changeIdGraph(state, payload) {
    let {oldId, newId} = payload;
    let oldGraph = state.graphManager[oldId];
    if (oldGraph) {
      oldGraph.id = newId;
      this.commit('removeGraphGlobal', oldId);
      this.commit('dataPushGraph', {id: newId, graph: oldGraph, parent: oldGraph.parent});
    }
  },

  updateFileToken(state, token) {
    Vue.set(state, 'fileToken', token)
  },

  // ------------以下是Graph部分------------
  // 全新专题
  dataEmptyGraph(state, payload) {
    let {_id, parent} = payload;
    // 新建document
    let document = {
      id: _id,
      name: 'NewDocument' + _id,
      Graph: {
        'nodes': [],
        'links': [],
        'notes': []
      },
      Conf: documentThemeTemplate(),
      State: {
        isDeleted: false,
        isSelf: true,
        isSelected: false,
        isChanged: false,
        isLoading: false,
        isExplode: true
      },
      Path: []
    };
    // 新建Graph
    this.commit('dataPushGraph', {id: _id, graph: document, parent});

    // 新建Setting和Info
    let nodePayload = {
      _id: _id,
      _type: 'document',
      _label: 'DocGraph',
      _name: 'NewDocument' + _id,
      _image: '',
      isSelf: true,
      changed: false
    };
    this.commit('dataAddEmptyNodeInfo', nodePayload);
    // 切换Graph
    this.commit('changeCurrentGraph', document);
    // Push Setting
    this.commit('dataAddEmptyNodeSetting', nodePayload);
  },

  // Push Graph
  dataPushGraph(state, payload) {
    let {id, graph, strict, parent} = payload;
    let findRoot = (graph) => {
      let result = [];
      graph.parent
        ? result = result.concat(findRoot(state.graphManager[graph.parent]))
        : result.push(graph.id);
      return result
    };

    let baseState = () => ({
      isChanged: false,
      isDeleted: false,
      isSelected: false,
      isSelf: false,
      isLoading: false,
      isExplode: false
    });

    graph.parent = parent;
    graph.draftId = -1;
    graph.root = findRoot(graph);

    !graph.State
      ? graph.State = baseState()
      : graph.State = Object.assign(baseState(), graph.State);

    strict || (strict = true);
    strict
      ? Vue.set(state.graphManager, id, graph)
      : !state.graphManager[id] && Vue.set(state.graphManager, id, graph)
  },

  // remove
  removeGraphGlobal(payload) {
    delete state.graphManager[payload]
  },

  // ------------以下是Info部分的内容------------
  // PushInfo
  dataPushInfo(state, payload) {
    let {item, _id, _type, strict} = payload;

    let manager;
    _type === 'link'
      ? manager = state.linkManager
      : manager = state.nodeManager;

    item.isEdit = false;
    item.isRemote = !state.newIdRegex.test({ vm: item.Info.id });

    strict || (strict = true);
    strict
      ? Vue.set(manager, _id, item)
      : !manager[_id] && Vue.set(manager, _id, item)
  },

  dataRemoveInfo(state, payload) {
    let {_id, _type} = payload;
    let manager;
    _type === 'link'
      ? manager = state.linkManager
      : manager = state.nodeManager;
    delete manager[_id]
  },

  // 添加新NodeInfo
  dataAddEmptyNodeInfo(state, payload) {
    payload.item = nodeInfoTemplate(payload);
    payload.strict = false;
    this.commit('dataPushInfo', payload);
  },

  // 添加新的LinkInfo
  dataAddEmptyLinkInfo(state, payload) {
    payload.item = linkInfoTemplate(payload);
    payload.strict = false;
    this.commit('dataPushInfo', payload);
  },

  // ------------以下是Setting内容------------
  dataPushSetting(state, payload) {
    let {item, changed} = payload;
    let _type = item.Setting._type;
    let name;
    _type === 'link'
      ? name = 'links'
      : _type === 'note'
        ? name = 'notes'
        : name = 'nodes';
    state.currentGraph.Graph[name].push(item);
    changed && (state.currentGraph.State.isChanged = true)
  },

  dataAddEmptyNodeSetting(state, payload) {
    // changed:是否导致graph变化
    let {_id, _type, _label, _image, _name, isSelf, changed} = payload;
    let Setting;
    _type !== 'media'
      ? Setting = nodeSettingTemp({_id, _type, _label, _image, _name})
      : Setting = mediaSettingTemplate({_id, _label, _name});

    let parent = {id: state.currentGraph.id, isSelf: state.currentGraph.State.isSelf};

    let item = {Setting, State: stateTemplate(), parent};
    item.State.isSelf = isSelf;
    this.commit('dataPushSetting', {item, changed});
  },

  dataAddEmptyLinkSetting(state, payload) {
    let {_id, _label, _start, _end, isSelf, changed} = payload;
    let parent = {id: state.currentGraph.id, isSelf: state.currentGraph.State.isSelf};
    let setting = linkSettingTemp({_id, _label, _start, _end});

    let item = {Setting: setting, State: stateTemplate(), parent: parent};
    item.State.isSelf = isSelf;
    this.commit('dataPushSetting', {item, changed});
  },

  // 变化需要同步的数据 _id, _label, _start, _end, _name, _image
  dataChangeProp(state, payload) {
    let {_id, _type, prop, newValue} = payload;
    let name;
    _type === 'link'
      ? name = 'links'
      : _type === 'note'
        ? name = 'notes'
        : name = 'nodes';
    let item = state.currentGraph.Graph[name].filter(_item => _item.Setting._id === _id)[0];
    item && Vue.set(item['Setting'], prop, newValue);

    // 如果是graph额外更新
    if (_type === 'document' && prop === '_name') {
      let graph = state.graphManager[_id];
      graph && Vue.set(graph, 'name', newValue)
    }
  }

};
const actions = {

  // 请求Graph
  async dataQueryGraph({commit, state, dispatch}, payload) {
    let {_id, parent, currentNodes} = payload;
    // 先绘制Graph
    await queryDocGraph(_id).then(res => {
      let document = res.data.node;
      let id = document.Base.Info.id;
      let parentForNode = {id: id, isSelf: document.State.isSelf};
      document.id = id;
      document.name = document.Base.Info.Name;
      document.State = {
        isSelf: document.State.isSelf,
        isLoading: false,
        isDeleted: false,
        isChanged: false
      };

      // 把document的node信息存了 然后删除防止循环引用
      Object.assign(document.Base, userConcernTemplate());
      commit('dataPushInfo', {item: document.Base, _id: id, _type: 'document', strict: true});

      delete document.Base;
      let graph = document.Graph;
      // 生成节点/关系状态
      graph.nodes = graph.nodes.map(node => {
        let State = stateTemplate();
        State.isAdd = false;
        return {Setting: node, State: State, parent: parentForNode}
      });
      // 如果这些节点已经存在 那么就绑定上
      if (currentNodes) {
        currentNodes.map(node => {
          for (let i in graph.nodes) {
            graph.nodes[i].Setting._id === node.Setting._id &&
            (graph.nodes[i] = node)
          }
        })
      }

      graph.links = graph.links.map(link => {
        let State = stateTemplate();
        State.isAdd = false;
        link._start = graph.nodes.filter(node => node.Setting._id === link._start.Setting._id)[0];
        link._end = graph.nodes.filter(node => node.Setting._id === link._end.Setting._id)[0];
        return {Setting: link, State: State, parent: parentForNode}
      });

      commit('dataPushGraph', {id: id, graph: document, parent});
      // 请求节点
      dispatch('dataQueryNode', graph.nodes.map(node => node.Setting));
      dispatch('dataQueryLink', graph.links.map(link => link.Setting));
    })
  },

  // 异步请求Node
  dataQueryNode({commit, state}, payload) {
    // payload: [{Base:..., _id, _type, _label}]
    // 未缓存的节点列表
    let noCacheNode = payload.filter(node => !state.nodeManager[node._id]);
    // 请求体
    let nodeQuery = noCacheNode.map(node => {
      // 先使用假数据 然后再请求
      commit('dataAddEmptyNodeInfo', node);
      return [node._id, node._type, node._label]
    });
    // 请求节点
    if (nodeQuery.length > 0) {
      queryMultiSource(nodeQuery).then(res => {
        res.data.map(node => {
          // 暂时没有UserConcern功能
          Object.assign(node, userConcernTemplate());

          // 重新绑定
          let currentSetting = state.currentGraph.Graph.nodes
            .filter(setting => setting.Setting._id === node.Info.id);

          if (currentSetting.length > 0) {
            let nodeSetting = currentSetting[0];
            nodeSetting.Setting._name = node.Info.Name;
            nodeSetting.Setting._label = node.Info.PrimaryLabel;
            nodeSetting.Setting._image = node.Info.MainPic;
          }
          commit('dataPushInfo', {item: node, _id: node.Info.id, _type: node.Info.type, strict: true})
        });
      });
    }
  },

  // 异步请求link
  dataQueryLink({commit, state}, payload) {
    // 未缓存的关系列表
    let noCacheLink = payload.filter(link => !state.linkManager[link._id]);
    let linkQuery = noCacheLink.map(link => {
      commit('dataAddEmptyLinkInfo', link);
      return [link._id, link._type, link._label]
    });
    if (linkQuery.length > 0) {
      // 请求关系
      queryMultiSource(linkQuery).then(res => {
        res.data.map(link => {
          Object.assign(link, userConcernTemplate());

          let currentSetting = state.currentGraph.Graph.links
            .filter(setting => setting.Setting._id === link.Info.id);

          if (currentSetting.length > 0) {
            let linkSetting = currentSetting[0];
            linkSetting.Setting._label = link.Info.PrimaryLabel;
          }
          commit('dataPushInfo', {item: link, _id: link.Info.id, _type: link.Info.type, strict: true})
        });
      });
    }
  },

  // 请求Media
  dataQueryMedia({commit, state, rootState}, payload) {
    payload || (payload = [])
    let noCacheMedia = payload.filter(id => !state.nodeManager[id]);
    let defaultImage = new Image();
    defaultImage.src = require('../../../../assets/defaultImage.jpg');

    if (noCacheMedia.length > 0) {
      noCacheMedia.map(id => {
        let temp = mediaInfoTemplate(id, defaultImage, defaultImage.src, defaultImage);
        commit('dataPushInfo', {item: temp, _id: id, _type: 'media', strict: false});
      });

      return queryMultiMedia(noCacheMedia).then(res => {
        if (res.status === 200) {
          let mediaList = res.data;

          mediaList.map(media => {
            media.status = 'remote';
            media.isSelf = media.Ctrl.CreateUser === parseInt(rootState.userModule.userId);
            Object.assign(media, userConcernTemplate());
            let payload = {
              item: media,
              _id: media.Info.id,
              _type: 'media',
              strict: true
            };
            commit('dataPushInfo', payload)
          });
        }
      })
    }
  },

  async fileUpload({state, dispatch, commit}, payload) {
    let {file, saveType, storeName, realFile} = payload;
    // checkFileToken
    let fileToken = state.fileToken;
    let now = (new Date()).valueOf();
    // 先判断Token情况
    if ((fileToken.Expiration * 1000 - now <= 0) || !fileToken.AccessKeyId) {
      await file_token().then(res => {
        commit('updateFileToken', res.data.fileToken);
        fileToken = res.data.fileToken;
      })
        .catch(() => {
          alert('暂时无法上传')
        })
    }

    // 开始上传
    let request;
    Vue.set(file, 'status', 'uploading');
    await filePutBlob(fileToken, realFile, storeName).then(returnObj => {
      if (returnObj.res.status === 200) {
        if (saveType === 'noSetting') {
          let data = {'name': storeName, 'Info': file.Info};
          request = createMediaNode(data)
        }
        if (saveType === 'mainImage') {
          //
        }
        if (saveType === 'AsNode') {
          //
        }
      }
    });
    return request
  }

};

export default {
  state,
  mutations,
  actions,
  getters
}
