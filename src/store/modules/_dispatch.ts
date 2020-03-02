import store from '../index';
import {FragmentInfoPart, GraphSelfPart, MediaInfoPart, NodeSettingPart} from "@/class/graphItem";

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

export function dispatchNodeExplode(payload: { node: NodeSettingPart, document: GraphSelfPart }) {
    return store.dispatch('nodeExplode', payload)
}

export function dispatchFragmentAdd(payload: FragmentInfoPart) {
    return store.dispatch('fragmentAdd', payload)
}

export function dispatchVisNodeCreate() {
    return store.dispatch('visNodeCreate')
}

export function dispatchDocumentSave(payload: 'current' | 'all') {
    return store.dispatch('documentSave', payload)
}

export function dispatchLinkBulkCreate(payload: CompressLinkInfo[]) {
    return store.dispatch('linkBulkCreate', payload)
}
