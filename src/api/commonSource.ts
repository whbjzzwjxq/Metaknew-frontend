import {instance} from './main'
import {GraphSelfPart, MediaInfoPart} from "@/class/graphItem";

export interface BackendNodeInfoPart {
    Info: BaseNodeInfo;
    Ctrl: BaseNodeCtrl;
}

export interface BackendMediaInfoPart {
    Info: BaseMediaInfo;
    Ctrl: BaseMediaCtrl;
}

export interface BackendLinkCtrl extends PublicCtrl {
    Start: QueryObject;
    End: QueryObject;
}

export interface BackendLinkInfoPart {
    Info: BaseLinkInfo;
    Ctrl: BackendLinkCtrl;
}

export interface BackendGraph {
    Content: {
        nodes: Array<NodeSetting>;
        links: Array<BackendLinkSetting>;
        medias: Array<MediaSetting>;
        texts: Array<TextSetting>;
    };
    Conf: GraphSetting;
}

export interface BackendGraphWithNode extends BackendGraph {
    Base: BackendNodeInfoPart;
}

export function mediaCreate(data: { name: string, Info: BaseMediaInfo }) {
    return instance.request<id>({
        url: '/item/media/create',
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            Info: Object.assign({FileName: data.name}, data.Info),
            CreateType: 'USER'
        }
    });
}

export function mediaUpdate(data: MediaInfoPart) {
    return instance.request({
        url: '/subgraph/media/update',
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
    return instance.request<id[]>({
        url: '/subgraph/update/node/media',
        method: 'post',
        data: {
            node: node,
            media: mediaList
        }
    })
}

export function mediaQueryMulti(queryList: Array<id>) {
    return instance.request<BackendMediaInfoPart[]>({
        url: '/item/media/query',
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            DataList: queryList
        }
    })
}

export function nodeQuery(payload: QueryObject) {
    return instance.request({
        url: '/subgraph/query/',
        method: 'get',
        params: payload
    })
}

export function documentQuery(id: id) {
    return instance.request<BackendGraphWithNode>({
        url: '/document/query/graph',
        method: 'get',
        params: {
            id
        }
    })
}

export function documentSave(document: GraphSelfPart, isDraft: boolean, isAuto: boolean) {
    return instance.request({
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

export function nodeQueryBulk(list: Array<QueryObject>) {
    return instance.request<BackendNodeInfoPart[]>({
        url: '/item/node/query',
        method: 'post',
        data: {
            DataList: list
        }
    })
}

export function linkQueryBulk(list: Array<QueryObject>) {
    return instance.request<BackendLinkInfoPart[]>({
        url: '/item/link/query',
        method: 'post',
        data: {
            DataList: list
        }
    })
}

export function autoSaveQuery(start: number) {
    return instance.request({
        url: '/document/query/auto_save',
        method: 'get',
        params: {
            start: start
        }
    })
}

export function autoSaveDelete(SourceId: id, VersionId: number) {
    return instance.request({
        url: '/document/delete/auto_save',
        method: 'get',
        params: {
            source: SourceId,
            version: VersionId
        }
    })
}
