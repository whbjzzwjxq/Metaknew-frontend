import {GraphSelfPart, MediaInfoPart, NodeInfoPart} from "@/class/graphItem";
import {instance} from './main'
import {FlatNodeInfo} from "@/interface/interfaceInComponent";

export interface SourceQueryObject {
    _id: id;
    _type: GraphItemType;
    _label: string;
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
    Start: SourceQueryObject;
    End: SourceQueryObject;
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
    Graph: {
        nodes: Array<NodeSetting>;
        links: Array<compressLinkSetting>;
        medias: Array<MediaSetting>;
        svgs: Array<SvgSetting>;
    };
    Conf: GraphSetting;
}

export function mediaCreate(data: { name: string, Info: BaseMediaInfo }) {
    return instance.request<id>({
        url: '/subgraph/create/media/normal',
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    });
}

export function mediaUpdate(data: MediaInfoPart) {
    return instance.request({
        url: '/subgraph/update/media/normal',
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

export function mediaAppendToNode(node: SourceQueryObject, mediaList: Array<id>) {
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

export function nodeUpdate(data: NodeInfoPart) {
    return instance.request({
        url: '/subgraph/update/node/normal',
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    })
}

export function nodeCreateMulti(pLabel: string, nodes: FlatNodeInfo[]) {
    return instance.request({
        url: '/subgraph/create/node/bulk_create',
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

export function nodeQuery(payload: SourceQueryObject) {
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

export function sourceQueryMulti(list: Array<SourceQueryObject>) {
    return instance.request<(BackendNodeInfoPart | BackendLinkInfoPart)[]>({
        url: '/subgraph/query/multi',
        method: 'post',
        data: list.map(query => [query._id, query._type, query._label])
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
