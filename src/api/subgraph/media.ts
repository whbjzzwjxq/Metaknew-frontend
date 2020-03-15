import {MediaInfoPart} from "@/class/graphItem";
import {instance} from "@/api/main";

export interface BackendMediaInfoPart {
    Info: BaseMediaInfo;
    Ctrl: BaseMediaCtrl;
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
        url: '/item/media/update',
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
        url: '/item/node/update_media',
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
