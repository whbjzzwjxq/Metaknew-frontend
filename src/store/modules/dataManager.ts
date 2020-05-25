import Vue from 'vue'
import {filePutBlob} from '@/api/fileUpload';
import {DocumentSelfPart, NodeSettingPart, TextSettingPart} from "@/class/settingBase";
import {
    commitDocumentAdd,
    commitDocumentIdChange,
    commitDocumentRemove,
    commitFileTokenRefresh,
    commitInfoAdd,
    commitInfoIdChange,
    commitInfoRemove,
    commitItemChange,
    commitSnackbarOn, commitSubTabChange
} from "@/store/modules/_mutations";
import {Commit, Dispatch} from "vuex";
import {
    dispatchGraphQuery,
    dispatchInfoDraftSaveAll,
    dispatchLinkQuery,
    dispatchMediaQuery,
    dispatchNodeQuery,
    dispatchVisNodeCreate
} from "@/store/modules/_dispatch";
import {PathSelfPart} from "@/class/settingPath";
import {loginCookie} from "@/api/user/loginApi";
import {settingToQuery} from "@/utils/utils";
import {nodeBulkUpdate, nodeQueryBulk, visNodeBulkCreate} from "@/api/subgraph/node";
import {linkBulkCreate, linkBulkUpdate, linkQueryBulk} from "@/api/subgraph/link";
import {gateDocumentBulkCreate, gateDocumentBulkUpdate, gateDocumentQuery} from "@/api/document/document";
import {mediaCreate, mediaQueryMulti} from "@/api/subgraph/media";
import {draftUpdate} from "@/api/subgraph/commonApi";
import {LinkInfoPart, MediaInfoPart, NodeInfoPart} from "@/class/info";
import {textBulkCreate} from "@/api/subgraph/text";

export const getManager = (_type: ItemType) =>
    _type === 'link'
        ? state.linkManager
        : _type === 'media'
        ? state.mediaManager
        : state.nodeManager;

const initGraph = DocumentSelfPart.initEmpty('$_-1', null, false);

declare global {
    interface DataManagerState {
        currentDocument: DocumentSelfPart,
        currentItem: NodeInfoPart | LinkInfoPart,
        documentManager: Record<id, DocumentSelfPart>,
        nodeManager: Record<id, NodeInfoPart>,
        linkManager: Record<id, LinkInfoPart>,
        mediaManager: Record<id, MediaInfoPart>,
        pathManager: Record<id, PathSelfPart>,
        fileToken: FileToken,
        newIdRegex: RegExp,
        rootDocument: DocumentSelfPart[]
    }

    interface Context {
        state: DataManagerState,
        commit: Commit,
        dispatch: Dispatch,
        getters: DataManagerGetters
    }

    interface DataManagerGetters {
        nodes: NodeInfoPart[],
        links: LinkInfoPart[],
        medias: MediaInfoPart[],
        graphs: DocumentSelfPart[],
        papers: DocumentSelfPart[],
        currentGraphInfo: NodeInfoPart,
        documentList: DocumentSelfPart[],
        allInfoPart: InfoPartInDataManager[]
    }
}

const state: DataManagerState = {
    currentDocument: initGraph.graph,
    currentItem: initGraph.info,
    rootDocument: [],
    documentManager: {},
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
    nodes: (state: DataManagerState) => {
        return Object.values(state.nodeManager)
    },

    links: (state: DataManagerState) => {
        return Object.values(state.linkManager)
    },

    medias: (state: DataManagerState) => {
        return Object.values(state.mediaManager)
    },

    allInfoPart: (state: DataManagerState, getters: DataManagerGetters) => {
        let result = [] as InfoPartInDataManager[];
        result.push(...getters.nodes);
        result.push(...getters.links);
        result.push(...getters.medias);
        return result
    },
    documentList: (state: DataManagerState) => {
        return Object.values(state.documentManager)
    }
};
const mutations = {

    // ------------单纯的操作------------
    currentDocumentChange(state: DataManagerState, payload: { graph: DocumentSelfPart }) {
        let {graph} = payload;
        let _id = graph._id; // 这里payload是document
        graph.explode(true)
        state.currentDocument = graph;
        let node = state.nodeManager[_id];
        commitItemChange(node);
        commitSnackbarOn({
            color: 'info',
            once: false,
            content: `切换到专题${node.Info.Name}`,
            actionName: 'documentChange'
        })
    },

    rootDocumentPush(state: DataManagerState, payload: { document: DocumentSelfPart }) {
        let {document} = payload;
        document.isRoot = true
        let current = state.rootDocument.filter(doc => doc._id === document._id)[0]
        current === undefined && state.rootDocument.push(document)
    },

    currentItemChange(state: DataManagerState, payload: NodeInfoPart | LinkInfoPart) {
        state.currentItem = payload;
        commitSubTabChange('info')
    },

    // ------------Graph And Paper ------------
    // Push Graph
    documentAdd(state: DataManagerState, payload: { document: DocumentSelfPart, strict?: boolean }) {
        let {document, strict} = payload;
        let manager = state.documentManager;
        strict || (strict = true);
        strict
            //Vue.set检查过
            ? Vue.set(manager, document._id, document)
            : !manager[document._id] && Vue.set(manager, document._id, document)
    },

    documentRemove(state: DataManagerState, payload: id) {
        Vue.delete(state.documentManager, payload)
    },

    documentIdChange(state: DataManagerState, payload: { oldId: id, newId: id }) {
        let {oldId, newId} = payload;
        let oldGraph = state.documentManager[oldId];
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
            //Vue.set检查过
            ? Vue.set(manager, _id, item)
            : !manager[_id] && Vue.set(manager, _id, item);
    },

    infoRemove(state: DataManagerState, payload: { _id: id, _type: ItemType }) {
        let manager = getManager(payload._type);
        delete manager[payload._id]
    },

    infoIdChange(state: DataManagerState, payload: { _type: ItemType, idMap: IdMap }) {
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
            commitDocumentIdChange({oldId, newId})
        });
    },

    fileTokenRefresh(state: DataManagerState, payload: FileToken) {
        state.fileToken = payload
    }

};
const actions = {

    // 请求Graph
    async graphQuery(context: { commit: Commit, state: DataManagerState, dispatch: Dispatch },
                     payload: { _id: id, parent: DocumentSelfPart | null }) {
        let {_id, parent} = payload;
        // 先绘制Graph
        if (context.state.documentManager[_id] === undefined) {
            await gateDocumentQuery(_id).then(res => {
                let {data} = res;
                let {graph} = DocumentSelfPart.initBackend(data, parent);
                dispatchNodeQuery(graph.nodesWithoutSelf.map(item => item.Setting));
                dispatchLinkQuery(graph.links.map(item => item.Setting));
                dispatchMediaQuery(graph.medias.map(item => item._id));
            });
            return true
        } else {
            return true
        }
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
        let noCacheMedia = payload.filter(_id => !state.mediaManager[_id]);

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
                commitFileTokenRefresh(res.data.fileToken);
                fileToken = res.data.fileToken;
            })
                .catch(() => {

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

    async nodeExplode(context: Context, payload: { node: NodeSettingPart, document: DocumentSelfPart }) {
        let {node, document} = payload;
        let _id = node._id;
        let subGraph = state.documentManager[_id];
        if (subGraph === undefined) {
            dispatchGraphQuery({
                _id,
                parent: document,
            }).then(() => {
                let subGraph = state.documentManager[_id];
                subGraph.explode(true)
            });
        } else {
            subGraph.explode()
        }
    },

    async visNodeCreate(context: Context) {
        let {getters} = context;
        let nodeList = getters.nodes.filter(node => !node.isRemote).map(item => item.Info);
        let mediaList = getters.medias.filter(media => !media.isRemote).map(item => item.Info);
        if (nodeList.length + mediaList.length > 0) {
            return visNodeBulkCreate(nodeList, mediaList).then(res => {
                Object.entries(res.data).map(([_type, idMap]) => {
                    idMap && commitInfoIdChange({_type, idMap})
                })
            })
        } else {
            return true
        }
    },

    async linkCreate(context: Context, payload?: LinkInfoPart[]) {
        let {getters} = context;
        let links = payload === undefined
            ? getters.links
            : payload;
        let linkList = links.filter(link => !link.isRemote);
        let Links = linkList.map(link => link.compress());
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
        let {getters} = context;
        let {isDraft, isAuto} = payload;
        // 保存Link和Node
        await dispatchVisNodeCreate();
        await linkBulkCreate(getters.links);
        await textBulkCreate(TextSettingPart.list);
        //处理专题 分成需要update和需要create的内容
        let documentList: DocumentSelfPart[] = getters.documentList;
        let updateDataList = documentList.filter(document => document.isRemote);
        //
        if (isDraft) {
            dispatchInfoDraftSaveAll({isAuto}).then()
        } else {
            // todo 保存所有信息 重构 已经列入文档
        }
        if (updateDataList.length > 0) {
            if (isDraft) {
                let data = updateDataList.map(doc => doc.dataDraftObject);
                draftUpdate(data, isAuto).then(res => {
                    let {DraftIdMap} = res.data;
                    updateDataList.map(doc => {
                        let newDraftId = DraftIdMap[doc._id];
                        //todo 草稿保存
                        // doc.MetaData.draftId === undefined && (doc.MetaData.draftId = newDraftId);
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
                gateDocumentBulkUpdate(documentList)
            }
        }
        await gateDocumentBulkCreate(documentList)
    },

    async allInfoUpdate(context: Context, payload: { isDraft: boolean, isAuto: boolean }) {
        let {isDraft, isAuto} = payload;
        let {getters} = context;
        let draftUpdate = isDraft || isAuto; // 如果是自动保存 那么也是草稿
        let {nodes, links, medias} = getters;
        if (!draftUpdate) {
            nodeBulkUpdate(nodes).then();
            linkBulkUpdate(links).then();
        } else {
        }
    }
};

export default {
    state,
    mutations,
    actions,
    getters
}
