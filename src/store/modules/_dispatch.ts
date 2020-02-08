import store from '../index';
import {GraphSelfPart, MediaInfoPart, NodeSettingPart} from "@/class/graphItem";
import {FragmentInfoPart} from "@/class/userConcern";

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
