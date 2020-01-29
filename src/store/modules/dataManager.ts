import Vue from 'vue'
import {documentQuery, mediaCreate, mediaQueryMulti, sourceQueryMulti, SourceQueryObject} from '@/api/commonSource';
import {getFileToken} from '@/api/user';
import {filePutBlob} from '@/api/fileUpload';
import {
    GraphSelfPart,
    LinkInfoPart,
    MediaInfoPart,
    NodeInfoPart,
    NodeSettingPart
} from "@/utils/graphClass";
import {
    commitFileToken,
    commitGraphAdd,
    commitGraphChangeId,
    commitGraphRemove,
    commitInfoAdd,
    commitInfoRemove,
    commitItemChange
} from "@/store/modules/_mutations";
import {Commit, Dispatch} from "vuex";
import {isNodeBackend} from "@/utils/typeCheck";
import {dispatchGraphQuery} from "@/store/modules/_dispatch";
import {PathSelfPart} from "@/utils/pathClass";

const getManager = (_type: string) =>
    _type === 'link'
        ? state.linkManager
        : _type === 'media'
        ? state.mediaManager
        : state.nodeManager;
declare global {
    interface DataManagerState {
        currentGraph: GraphSelfPart,
        currentItem: InfoPart,
        graphManager: Record<id, GraphSelfPart>,
        nodeManager: Record<id, NodeInfoPart>,
        linkManager: Record<id, LinkInfoPart>,
        mediaManager: Record<id, MediaInfoPart>,
        pathManager: Record<id, PathSelfPart>,
        fileToken: FileToken,
        newIdRegex: RegExp,
        rootGraph: GraphSelfPart
    }

    interface Context {
        state: DataManagerState,
        commit: Commit,
        dispatch: Dispatch,
    }
}

const state: DataManagerState = {
    currentGraph: GraphSelfPart.emptyGraphSelfPart('$_-1', null),
    currentItem: NodeInfoPart.emptyNodeInfoPart('$_-1', 'node', 'BaseNode'),
    rootGraph: GraphSelfPart.emptyGraphSelfPart('$_-1', null),
    graphManager: {},
    nodeManager: {},
    linkManager: {},
    mediaManager: {},
    pathManager: {},
    fileToken: {
        'AccessKeySecret': '',
        'AccessKeyId': '',
        'Expiration': 1571219891,
        'SecurityToken': ''
    },
    newIdRegex: new RegExp('\\$_[0-9]*')
};
const getters = {
    currentGraphInfo: (state: DataManagerState) => {
        return state.nodeManager[state.currentGraph.id]
    }
};
const mutations = {

    // ------------单纯的操作------------
    currentGraphChange(state: DataManagerState, payload: { graph: GraphSelfPart }) {
        let {graph} = payload;
        let id = graph.id; // 这里payload是document
        Vue.set(graph.Conf.State, 'isExplode', true);
        state.currentGraph = graph;
        commitItemChange(state.nodeManager[id]);
    },

    rootGraphChange(state: DataManagerState, payload: { graph: GraphSelfPart }) {
        let {graph} = payload;
        state.rootGraph = graph
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
            oldGraph.id = newId;
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

};
const actions = {

    // 请求Graph
    async graphQuery(context: { commit: Commit, state: DataManagerState, dispatch: Dispatch },
                     payload: { _id: id, parent: GraphSelfPart | null }) {
        let {_id, parent} = payload;
        // 先绘制Graph
        await documentQuery(_id).then(res => {
            let {data} = res;
            let graphSelf = GraphSelfPart.resolveFromBackEnd(data, parent);
            let graphInfo = new NodeInfoPart(data.Base.Info, data.Base.Ctrl);
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
    nodeQuery(context: { commit: Commit, state: DataManagerState }, payload: Array<NodeSetting>) {
        // 未缓存的节点列表
        let noCacheNode = payload.filter(node => !state.nodeManager[node._id]);
        if (noCacheNode.length > 0) {
            // 请求体
            let nodeQuery = noCacheNode.map(node => {
                // 先使用假数据 然后再请求
                commitInfoAdd({item: NodeInfoPart.emptyNodeInfoPart(node._id, node._type, node._label), strict: false});
                return <SourceQueryObject>node
            });
            // 请求节点
            sourceQueryMulti(nodeQuery).then(res => {
                const {data} = res;
                data.map(node => {
                    if (isNodeBackend(node)) {
                        let nodeInfo = new NodeInfoPart(node.Info, node.Ctrl);
                        nodeInfo.synchronizationAll();
                        commitInfoAdd({item: nodeInfo})
                    }
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
                commitInfoAdd({
                    item: LinkInfoPart.emptyLinkInfo(link._id, link._label, link._start, link._end),
                    strict: false
                });
                return <SourceQueryObject>link
            });
            // 请求关系
            sourceQueryMulti(linkQuery).then(res => {
                const {data} = res;
                data.map(link => {
                    if (!isNodeBackend(link)) {
                        let linkSetting = noCacheLink.filter(setting => setting._id === link.Info.id)[0];
                        let linkInfo = new LinkInfoPart(link.Info,
                            Object.assign(link.Ctrl, {
                                Start: linkSetting._start,
                                End: linkSetting._end,
                            }) as BaseLinkCtrl
                        );

                        commitInfoAdd({item: linkInfo})
                    }
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
                return <SourceQueryObject>{
                    _id: id,
                    _type: 'media',
                    _label: 'unknown'
                }
            });

            return mediaQueryMulti(noCacheMedia).then(res => {
                const {data} = res;
                data.map(media => {
                    let mediaInfo = new MediaInfoPart(media.Info, media.Ctrl, 'remote', []);
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
        let result;
        item && item.changeStatus('uploading');
        if (uploadType === 'normal') {
            await filePutBlob(fileToken, realFile, storeName).then(res => {
                if (item) {
                    let data = {name: storeName, Info: item.Info};
                    result = mediaCreate(data);
                } else {
                    result = undefined;
                }
            });
            return result
        } else return filePutBlob(fileToken, realFile, storeName);
    },

    async nodeExplode(context: Context, payload: { node: NodeSettingPart, document: GraphSelfPart }) {
        let {node, document} = payload;
        let _id = node.Setting._id;
        let subGraph = state.graphManager[_id];
        if (subGraph === undefined) {
            dispatchGraphQuery({
                _id,
                parent: document,
            }).then(() => {
                let subGraph = state.graphManager[_id];
                subGraph.explode()
            });
        } else {
            subGraph.explode()
        }
    }

};

export default {
    state,
    mutations,
    actions,
    getters
}
