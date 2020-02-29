import Vue from 'vue'
import {documentQuery, mediaCreate, mediaQueryMulti, sourceQueryMulti} from '@/api/commonSource';
import {filePutBlob} from '@/api/fileUpload';
import {
    DocumentSelfPart,
    GraphSelfPart,
    LinkInfoPart,
    MediaInfoPart,
    NodeInfoPart,
    NodeSettingPart
} from "@/class/graphItem";
import {
    commitDocumentAdd,
    commitDocumentChangeId,
    commitFileToken,
    commitInfoAdd,
    commitInfoRemove,
    commitItemChange,
    commitSnackbarOn,
    commitUserConcernChangeId
} from "@/store/modules/_mutations";
import {Commit, Dispatch} from "vuex";
import {isGraphSelfPart, isNodeBackend} from "@/utils/typeCheck";
import {dispatchGraphQuery} from "@/store/modules/_dispatch";
import {PathSelfPart} from "@/class/path";
import {PaperSelfPart} from "@/class/paperItem";
import {loginCookie} from "@/api/user/loginApi";
import {State} from "@/store/modules/userInfo";
import {settingToQuery} from "@/utils/utils";

const getManager = (_type: string) =>
    _type === 'link'
        ? state.linkManager
        : _type === 'media'
        ? state.mediaManager
        : state.nodeManager;

const getDocumentManager = (document: DocumentSelfPart) =>
    isGraphSelfPart(document)
        ? state.graphManager
        : state.paperManager;

declare global {
    interface DataManagerState {
        currentGraph: GraphSelfPart,
        currentItem: NodeInfoPart | LinkInfoPart,
        currentPaper: PaperSelfPart,
        graphManager: Record<id, GraphSelfPart>,
        paperManager: Record<id, PaperSelfPart>,
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
    currentGraph: GraphSelfPart.emptyGraphSelfPart('$_-1', null, false).graph,
    currentPaper: PaperSelfPart.emptyPaperSelfPart('$_-1', null, false).paper,
    currentItem: GraphSelfPart.emptyGraphSelfPart('$_-1', null, false).info,
    rootGraph: GraphSelfPart.emptyGraphSelfPart('$_-1', null, false).graph,
    graphManager: {},
    paperManager: {},
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
        return state.nodeManager[state.currentGraph._id]
    },

    documentList: (state: DataManagerState) => {
        let result = [] as DocumentSelfPart[];
        result.push(...Object.values(state.graphManager));
        result.push(...Object.values(state.paperManager));
        return result
    }
};
const mutations = {

    // ------------单纯的操作------------
    currentGraphChange(state: DataManagerState, payload: { graph: GraphSelfPart }) {
        let {graph} = payload;
        let _id = graph._id; // 这里payload是document
        Vue.set(graph.Conf.State, 'isExplode', true);
        state.currentGraph = graph;
        let node = state.nodeManager[_id];
        commitItemChange(node);
        commitSnackbarOn({
            color: 'info',
            once: false,
            content: `切换到专题${node.Info.Name}`,
            actionName: 'documentChange'
        })
    },

    rootGraphChange(state: DataManagerState, payload: { graph: GraphSelfPart }) {
        let {graph} = payload;
        Vue.set(graph.Conf.State, 'isExplode', true);
        state.rootGraph = graph
    },

    currentItemChange(state: DataManagerState, payload: NodeInfoPart | LinkInfoPart) {
        state.currentItem = payload;
    },

    currentPaperChange(state: DataManagerState, payload: { paper: PaperSelfPart }) {
        let {paper} = payload;
        let _id = paper._id;
        state.currentPaper = paper;
        commitItemChange(state.nodeManager[_id]);
    },

    // ------------Graph And Paper ------------
    // Push Graph
    documentAdd(state: DataManagerState, payload: { document: GraphSelfPart | PaperSelfPart, strict?: boolean }) {
        let {document, strict} = payload;
        let manager = getDocumentManager(document);
        strict || (strict = true);
        strict
            ? Vue.set(manager, document._id, document)
            : !manager[document._id] && Vue.set(manager, document._id, document)
    },

    documentRemove(state: DataManagerState, payload: id) {
        delete state.graphManager[payload]
    },

    documentChangeId(state: DataManagerState, payload: { oldId: id, newId: id }) {
        let {oldId, newId} = payload;
        let oldGraph = state.graphManager[oldId];
        if (oldGraph) {
            oldGraph._id = newId;
            commitDocumentAdd({document: oldGraph});
            // commitDocumentRemove(oldId);
        }
    },

    // ------------以下是Info部分的内容------------
    infoAdd(state: DataManagerState, payload: { item: InfoPartInDataManager, strict?: boolean }) {
        let {item, strict} = payload;
        let _id = item._id;
        let manager = getManager(item._type);
        strict || (strict = true);
        strict
            ? Vue.set(manager, _id, item)
            : !manager[_id] && Vue.set(manager, _id, item)
    },

    infoRemove(state: DataManagerState, payload: { _id: id, _type: string }) {
        let manager = getManager(payload._type);
        delete manager[payload._id]
    },

    infoChangeId(state: DataManagerState, payload: { _type: ItemType, idMap: IdMap }) {
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
            commitDocumentChangeId({oldId, newId})
        });
        commitUserConcernChangeId(payload);
    },

    updateFileToken(state: DataManagerState, payload: FileToken) {
        state.fileToken = payload
    }

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
                let query = settingToQuery<NodeQuery>(node);
                let item = NodeInfoPart.emptyNodeInfoPart(query);
                commitInfoAdd({item, strict: false});
                return item.queryObject
            });
            // 请求节点
            sourceQueryMulti(nodeQuery).then(res => {
                const {data} = res;
                data.map(node => {
                    if (isNodeBackend(node)) {
                        let nodeInfo = NodeInfoPart.resolveBackend(node);
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
                let item = LinkInfoPart.emptyLinkInfo(link._id, link._label, link._start, link._end);
                commitInfoAdd({
                    item: LinkInfoPart.emptyLinkInfo(link._id, link._label, link._start, link._end),
                    strict: false
                });
                return item.queryObject
            });
            // 请求关系
            sourceQueryMulti(linkQuery).then(res => {
                const {data} = res;
                data.map(link => {
                    if (!isNodeBackend(link)) {
                        let linkSetting = noCacheLink.filter(setting => setting._id === link.Info._id)[0];
                        let linkInfo = LinkInfoPart.resolveBackend(link);

                        commitInfoAdd({item: linkInfo})
                    }
                });
            });
        }
    },

    // 请求Media
    mediaQuery(context: Context, payload: Array<id>) {
        payload || (payload = []);
        let noCacheMedia = payload.filter(_id => !state.nodeManager[_id]);

        if (noCacheMedia.length > 0) {
            let defaultImage = require('@/assets/defaultImage.jpg');
            noCacheMedia.map(_id => {
                let item = MediaInfoPart.emptyMediaInfo(_id, defaultImage);
                return item.queryObject
            });

            return mediaQueryMulti(noCacheMedia).then(res => {
                res.data.map(media => {MediaInfoPart.resolveBackend(media);});
            })
        }
    },

    async fileUpload(context: Context, payload: {
        item?: MediaInfoPart, realFile: File,
        storeName: string, uploadType: 'mainImage' | 'normal'
    }) {
        let {item, realFile, storeName, uploadType} = payload;
        // checkFileToken
        let fileToken = context.state.fileToken;
        let now = (new Date()).valueOf();
        // 先判断Token情况
        if ((fileToken.Expiration * 1000 - now <= 0) || !fileToken.AccessKeyId) {
            await loginCookie().then(res => {
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
        let _id = node._id;
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
    },

    async graphSave(context: Context, payload: {graphList: GraphSelfPart[]}) {

    }
};

export default {
    state,
    mutations,
    actions,
    getters
}
