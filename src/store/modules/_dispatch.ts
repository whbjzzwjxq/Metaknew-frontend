import store from '../index';
import {GraphSelfPart, MediaInfoPart, NodeSettingPart} from "@/utils/graphClass";

export function dispatchUploadFile(payload: {
    item?: MediaInfoPart,
    realFile: File | Blob,
    storeName: string,
    uploadType: 'mainImage' | 'normal'
}) {
    return store.dispatch('fileUpload', payload)
}

export function dispatchGraphQuery(payload: { _id: id, parent: GraphSelfPart | null }) {
    return store.dispatch('graphQuery', payload)
}

export function dispatchNodeExplode(payload: {node: NodeSettingPart, document: GraphSelfPart}) {
    return store.dispatch('nodeExplode', payload)
}
