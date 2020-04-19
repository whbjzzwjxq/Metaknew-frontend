import {instance} from "@/api/main";
import {BackendNodeInfoPart} from "@/api/subgraph/node";
import {commitSnackbarOn} from "@/store/modules/_mutations";
import {DocumentSelfPart} from "@/class/settingBase";

export interface BackendDocument {
    Content: {
        nodes: Array<NodeSetting>;
        links: Array<BackendLinkSetting>;
        medias: Array<MediaSetting>;
        texts: Array<TextSetting>;
    };
    Conf: DocumentSetting;
    Comps: DocumentComponents
}

export interface BackendGraphWithNode extends BackendDocument {
    Base: BackendNodeInfoPart;
}

function documentQuery(id: id) {
    return instance.request<BackendGraphWithNode>({
        url: '/document/query/graph',
        method: 'get',
        params: {
            id
        }
    })
}

export function gateDocumentQuery(id: id) {
    return documentQuery(id)
}

function documentBulkCreate(docList: BackendDocument[], createType: string = 'USER') {
    return instance.request<id[]>({
        url: 'document/bulk_create',
        method: 'POST',
        data: {
            GraphList: docList,
            CreateType: createType
        }
    })
}

export function gateDocumentBulkCreate(documentList: DocumentSelfPart[]) {
    let dataList = documentList.filter(document => !document.isRemote)
        .map(document => document.dataBackendDocument)
    if (dataList.length > 0) {
        return documentBulkCreate(dataList).then(res => {
            let idList = res.data;
            idList.map(id => {
                let graph = documentList.filter(doc => doc._id === id)[0]
                graph && (graph.updateStateSave())
            });
            let payload: SnackBarStatePayload = {
                color: 'success',
                actionName: 'documentCreate',
                content: '专题保存成功',
            };
            commitSnackbarOn(payload)
        })
    } else {
        return []
    }
}

function documentBulkUpdate(docList: BackendDocument[], createType: string = 'USER') {
    return instance.request<id[]>({
        url: 'document/bulk_update',
        method: 'POST',
        data: {
            GraphList: docList,
            CreateType: createType
        }
    })
}

export function gateDocumentBulkUpdate(documentList: DocumentSelfPart[]) {
    let dataList = documentList.filter(document => document.isRemote)
        .map(document => document.dataBackendDocument)
    if (dataList.length > 0) {
        documentBulkUpdate(dataList).then(res => {
            let idList = res.data;
            idList.map(id => {
                let graph = documentList.filter(doc => doc._id === id)[0]
                graph && (graph.updateStateUpdate())
            });
            let payload: SnackBarStatePayload = {
                color: 'success',
                actionName: 'documentCreate',
                content: '专题更新成功',
            };
            commitSnackbarOn(payload)
        });
    } else {
        return []
    }
}

function documentSaveDraft(docList: BackendDocument[], isAuto: boolean) {
    return instance.request<Record<id, number>>({
        url: 'document/draft',
        method: 'POST',
        data: {
            GraphList: docList,
            IsAuto: isAuto
        }
    })
}
