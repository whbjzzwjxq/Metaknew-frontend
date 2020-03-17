import Vue from 'vue'
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
    commitDocumentRemove,
    commitFileToken,
    commitInfoAdd,
    commitInfoChangeId,
    commitInfoRemove,
    commitItemChange,
    commitSnackbarOn
} from "@/store/modules/_mutations";
import {Commit, Dispatch} from "vuex";
import {isGraphSelfPart} from "@/utils/typeCheck";
import {
    dispatchGraphQuery, dispatchInfoDraftSaveAll,
    dispatchLinkBulkCreate,
    dispatchLinkQuery,
    dispatchMediaQuery,
    dispatchNodeQuery,
    dispatchVisNodeCreate
} from "@/store/modules/_dispatch";
import {PathSelfPart} from "@/class/path";
import {PaperSelfPart} from "@/class/paperItem";
import {loginCookie} from "@/api/user/loginApi";
import {settingToQuery} from "@/utils/utils";
import {userConcernTemplate} from "@/utils/template";
import {nodeQueryBulk, visNodeBulkCreate} from "@/api/subgraph/node";
import {linkBulkCreate, linkQueryBulk} from "@/api/subgraph/link";
import {documentBulkCreate, documentBulkUpdate, documentQuery} from "@/api/document/document";
import {mediaCreate, mediaQueryMulti} from "@/api/subgraph/media";
import {draftUpdate} from "@/api/subgraph/commonApi";

export const getManager = (_type: ItemType) =>
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
        getters: any
    }
}

const state: DataManagerState = {
    currentGraph: GraphSelfPart.emptyGraphSelfPart('$_-1', null, false).graph,
    currentPaper: PaperSelfPart.emptyPaperSelfPart('$_-1', null, false).paper,
    currentItem: GraphSelfPart.emptyGraphSelfPart('$_-1', null, false).info,
    rootGraph: GraphSelfPart.emptyGraphSelfPart('$_-1', null, false).graph,
    graphManager: {},
    paperManager: {},
    pathManager: {},
    nodeManager: {},
    linkManager: {},
    mediaManager: {},
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
    },

    allInfoPart: (state: DataManagerState) => {
        let result = [] as InfoPartInDataManager[];
        result.push(...Object.values(state.nodeManager));
        result.push(...Object.values(state.linkManager));
        result.push(...Object.values(state.mediaManager));
        return result
    }
};
const mutations = {

    // ------------单纯的操作------------
    currentGraphChange(state: DataManagerState, payload: { graph: GraphSelfPart }) {
        let {graph} = payload;
        let _id = graph._id; // 这里payload是document
        graph.isExplode = true;
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
        graph.isExplode = true;
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
        Vue.delete(state.graphManager, payload)
    },

    documentChangeId(state: DataManagerState, payload: { oldId: id, newId: id }) {
        let {oldId, newId} = payload;
        let oldGraph = state.graphManager[oldId];
        if (oldGraph) {
            oldGraph._id = newId;
            commitDocumentAdd({document: oldGraph});
            commitDocumentRemove(oldId);
        } else {
            // 普通Node
        }
    },

    // ------------以下是Info部分的内容------------
    infoAdd(state: DataManagerState, payload: { item: InfoPartInDataManager, strict?: boolean }) {
        let {item, strict} = payload;
        let {_id, _type} = item;
        let manager = getManager(_type);
        strict || (strict = true);
        strict
            ? Vue.set(manager, _id, item)
            : !manager[_id] && Vue.set(manager, _id, item);
    },

    infoRemove(state: DataManagerState, payload: { _id: id, _type: ItemType }) {
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
            (_type === 'document' || _type === 'node') &&
            commitDocumentChangeId({oldId, newId})
        });
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
            let {graph} = GraphSelfPart.resolveFromBackEnd(data, parent);
            dispatchNodeQuery(graph.Content.nodes.map(item => item.Setting));
            dispatchLinkQuery(graph.Content.links.map(item => item.Setting));
            dispatchMediaQuery(graph.Content.medias.map(item => item._id));
        });
    },

    // 异步请求Node
    nodeQuery(context: { commit: Commit, state: DataManagerState }, payload: NodeSetting[]) {
        // 未缓存的节点列表
        let noCacheNode = payload.filter(node => !state.nodeManager[node._id]);
        if (noCacheNode.length > 0) {
            // 请求体
            let nodeQuery = noCacheNode.map(node => {
                // 先使用假数据 然后再请求
                let query = settingToQuery<NodeQuery>(node);
                let item = NodeInfoPart.emptyNodeInfoPart(query);
                return item.queryObject
            });
            // 请求节点
            nodeQueryBulk(nodeQuery).then(res => {
                res.data.map(node => {
                    NodeInfoPart.resolveBackend(node);
                });
            });
        }
    },

    // 异步请求link
    linkQuery(context: Context, payload: LinkSetting[]) {
        // 未缓存的关系列表
        let noCacheLink = payload.filter(link => !state.linkManager[link._id]);
        if (noCacheLink.length > 0) {
            let linkQuery = noCacheLink.map(link => {
                let item = LinkInfoPart.emptyLinkInfo(link._id, link._label, link._start, link._end);
                return item.queryObject
            });
            // 请求关系
            linkQueryBulk(linkQuery).then(res => {
                res.data.map(link => {
                    LinkInfoPart.resolveBackend(link);
                });
            });
        }
    },

    // 请求Media
    mediaQuery(context: Context, payload: Array<id>) {
        payload || (payload = []);
        let noCacheMedia = payload.filter(_id => !state.nodeManager[_id]);

        if (noCacheMedia.length > 0) {
            noCacheMedia.map(_id => {
                let item = MediaInfoPart.emptyMediaInfo(_id);
                return item.queryObject
            });

            return mediaQueryMulti(noCacheMedia).then(res => {
                res.data.map(media => {
                    MediaInfoPart.resolveBackend(media);
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

    async visNodeCreate(context: Context) {
        let nodeList = Object.values(state.nodeManager).filter(node => !node.isRemote).map(item => item.Info);
        let mediaList = Object.values(state.mediaManager).filter(media => !media.isRemote).map(item => item.Info);
        if (nodeList.length + mediaList.length > 0) {
            return visNodeBulkCreate(nodeList, mediaList).then(res => {
                Object.entries(res.data).map(([_type, idMap]) => {
                    idMap && commitInfoChangeId({_type, idMap})
                })
            })
        } else {
            return true
        }
    },

    async linkBulkCreate(context: Context, payload: CompressLinkInfo[]) {
        if (payload.length > 0) {
            return linkBulkCreate(payload, 'USER').then(res => {
                let idMap = res.data;
                idMap && commitInfoChangeId({_type: 'link', idMap})
            })
        } else {
            return true
        }
    },

    draftSaveAll(context: Context, payload: { isAuto: boolean }) {
        let infoList: InfoPartInDataManager[] = context.getters.allInfoPart;
        let data = infoList.filter(info => info.isRemote && info.State.isEdit).map(info => info.draftObject);
        let {isAuto} = payload;
        return draftUpdate(data, isAuto).then(res => {
            let {DraftIdMap} = res.data;
            infoList.map(info => {
                let newDraftId = DraftIdMap[info._id];
                info.State.draftId === undefined && (info.State.draftId = newDraftId);
                info.State.isEdit = false
            });
            let payload = {
                actionName: `DraftUpdateAll`,
                color: 'success',
                once: false,
                content: isAuto ? '自动保存成功' : '草稿保存成功'
            } as SnackBarStatePayload;
            commitSnackbarOn(payload)
        })
    },

    async documentSave(context: Context, payload: { isDraft: boolean, isAuto: boolean }) {
        let {isDraft, isAuto} = payload;
        await dispatchVisNodeCreate();
        await dispatchLinkBulkCreate(
            Object.values(state.linkManager).filter(link => !link.isRemote).map(item => item.compress())
        );
        let documentList: DocumentSelfPart[] = context.getters.documentList;
        let dataList = documentList.filter(document => !document.DocumentData.isRemote)
            .map(document => document.backendDocument);
        let updateDataList = documentList.filter(document => document.DocumentData.isRemote);
        if (isDraft) {
            dispatchInfoDraftSaveAll({isAuto}).then()
        } else {
            // todo
        }
        if (updateDataList.length > 0) {
            if (isDraft) {
                let data = updateDataList.map(doc => doc.draftObject);
                draftUpdate(data, isAuto).then(res => {
                    let {DraftIdMap} = res.data;
                    updateDataList.map(doc => {
                        let newDraftId = DraftIdMap[doc._id];
                        doc.DocumentData.draftId === undefined && (doc.DocumentData.draftId = newDraftId);
                    });
                    let payload = {
                        actionName: `DraftUpdateDocument`,
                        color: 'success',
                        once: false,
                        content: isAuto ? '专题自动保存成功' : '专题草稿保存成功'
                    } as SnackBarStatePayload;
                    commitSnackbarOn(payload)
                })
            } else {
                documentBulkUpdate(updateDataList.map(doc => doc.backendDocument)).then(res => {
                    let idList = res.data;
                    idList.map(id => {
                        let graph = state.graphManager[id];
                        graph && (graph.updateStateUpdate())
                    })
                });
            }
        }
        if (dataList.length > 0) {
            await documentBulkCreate(dataList).then(res => {
                let idList = res.data;
                idList.map(id => {
                    let graph = state.graphManager[id];
                    graph && (graph.updateStateSave())
                })
            })
        }
    }
};

export default {
    state,
    mutations,
    actions,
    getters
}
