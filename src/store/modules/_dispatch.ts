import store from '../index';
import {GraphSelfPart} from "@/class/settingGraph";
import {NoteBook} from "@/store/modules/userDataManager";
import {FragmentInfoPart, MediaInfoPart} from "@/class/info";
import {NodeSettingPart, NoteSettingPart} from "@/class/settingBase";

export function dispatchUploadFile(payload: {
    item?: MediaInfoPart,
    realFile: File | Blob,
    storeName: string,
    uploadType: 'mainImage' | 'normal'
}) {
    return store.dispatch('fileUpload', payload)
}

export function dispatchGraphQuery(payload: { _id: id, parent: DocumentSelfPartAny | null }) {
    return store.dispatch('graphQuery', payload)
}

export function dispatchNodeExplode(payload: { node: NodeSettingPartAny, document: GraphSelfPart }) {
    return store.dispatch('nodeExplode', payload)
}

export function dispatchFragmentAdd(payload: FragmentInfoPart) {
    return store.dispatch('fragmentAdd', payload)
}

export function dispatchVisNodeCreate() {
    return store.dispatch('visNodeCreate')
}

export function dispatchAllInfoUpdate(payload: {isDraft: boolean, isAuto: boolean}) {
    return store.dispatch('allInfoUpdate', payload)
}

export function dispatchDocumentSave(payload: {isDraft: boolean, isAuto: boolean}) {
    return store.dispatch('documentSave', payload)
}

export function dispatchNodeQuery(payload: NodeSetting[]) {
    return store.dispatch('nodeQuery', payload)
}

export function dispatchLinkQuery(payload: LinkSetting<any>[]) {
    return store.dispatch('linkQuery', payload)
}

export function dispatchMediaQuery(payload: id[]) {
    return store.dispatch('mediaQuery', payload)
}

export function dispatchUserPropResolveChange(payload: PropDescriptionPayload) {
    return store.dispatch('userPropResolvePush', payload)
}

export function dispatchUserConcernQuery(payload: id[]) {
    return store.dispatch('userConcernQuery', payload)
}

export function dispatchInfoDraftSaveAll(payload: {isAuto: boolean}) {
    return store.dispatch('draftSaveAll', payload)
}

export const dispatchUserLabelProps = (payload: LabelProps) => {
    return store.dispatch('userLabelPropsPush', payload)
};

export function dispatchNoteInDocPush(payload: {note: NoteSettingPartAny }) {
    return store.dispatch('noteInDocPush', payload)
}

export function dispatchNoteBookPush(payload: {note: NoteBook}) {
    return store.dispatch('noteBookPush', payload)
}
