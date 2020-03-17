import store from '../index';
import {
    FragmentInfoPart,
    GraphSelfPart,
    MediaInfoPart,
    GraphNodeSettingPart,
    NoteSettingPart
} from "@/class/graphItem";

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

export function dispatchNodeExplode(payload: { node: GraphNodeSettingPart, document: GraphSelfPart }) {
    return store.dispatch('nodeExplode', payload)
}

export function dispatchFragmentAdd(payload: FragmentInfoPart) {
    return store.dispatch('fragmentAdd', payload)
}

export function dispatchVisNodeCreate() {
    return store.dispatch('visNodeCreate')
}

export function dispatchDocumentSave(payload: {isDraft: boolean, isAuto: boolean}) {
    return store.dispatch('documentSave', payload)
}

export function dispatchLinkBulkCreate(payload: CompressLinkInfo[]) {
    return store.dispatch('linkBulkCreate', payload)
}

export function dispatchNodeQuery(payload: NodeSetting[]) {
    return store.dispatch('nodeQuery', payload)
}

export function dispatchLinkQuery(payload: LinkSetting[]) {
    return store.dispatch('linkQuery', payload)
}

export function dispatchMediaQuery(payload: id[]) {
    return store.dispatch('mediaQuery', payload)
}

export function dispatchUserPropResolveChange(payload: PropDescriptionPayload) {
    return store.dispatch('changeUserPropResolve', payload)
}

export function dispatchUserConcernQuery(payload: id[]) {
    return store.dispatch('userConcernQuery', payload)
}

export function dispatchInfoDraftSaveAll(payload: {isAuto: boolean}) {
    return store.dispatch('draftSaveAll', payload)
}

export function dispatchNoteInDocPush(payload: {note: NoteSettingPart}) {
    return store.dispatch('noteInDocPush', payload)
}
