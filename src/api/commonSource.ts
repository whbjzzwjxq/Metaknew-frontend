import {instance} from './main'
import {GraphSelfPart, MediaInfoPart} from "@/class/graphItem";

export interface QueryObject {
    id: id;
    type: AllType;
    pLabel: string;
} // 用于Query

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
    Base: {
        Info: BaseNodeInfo;
        Ctrl: BaseNodeCtrl;
    };
    Content: {
        nodes: Array<NodeSetting>;
        links: Array<compressLinkSetting>;
        medias: Array<MediaSetting>;
        svgs: Array<SvgSetting>;
    };
    Conf: GraphSetting;
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
        url: '/subgraph/query/media/multi',
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        data: queryList
    })
}

export function nodeQuery(payload: QueryObject) {
    return instance.request({
        url: '/subgraph/query/',
        method: 'get',
        params: payload
    })
}

export function documentQuery(_id: id) {
    return instance.request<BackendGraph>({
        url: '/document/query/graph',
        method: 'get',
        params: {
            _id
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

export function sourceQueryMulti(list: Array<QueryObject>) {
    return instance.request<(BackendNodeInfoPart | BackendLinkInfoPart)[]>({
        url: '/subgraph/query/multi',
        method: 'post',
        data: list.map(query => [query.id, query.type, query.pLabel])
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
