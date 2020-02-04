import {FragmentInfoPart} from "@/utils/userConcern";
import {Commit} from "vuex";
import Vue from 'vue';
import {NoteSettingPart} from "@/utils/graphClass";

declare global {
    interface UserDataManagerState {
        userConcernDict: Record<ItemType, Record<id, UserConcern>>,
        fragments: Array<FragmentInfoPart>,
        userSetting: Record<string, Record<string, any>>,
        userNoteBook: NoteBook[],
        userNoteInDoc: Record<id, NoteSettingPart[]>
    }
}

interface NoteBookState extends BaseState {
    isEditing: boolean
}
export interface NoteBook extends BaseCtrl {
    Name: string,
    Text: string,
    Svg: any,
    _id: id,
    State: NoteBookState,
    $IsMarkdown: boolean
}

const state: UserDataManagerState = {
    userConcernDict: {
        node: {},
        link: {},
        media: {},
        document: {}
    },
    fragments: [],
    userSetting: {
        fragmentCollect: {}
    },
    userNoteBook: [],
    userNoteInDoc: {

    }
};

const mutations = {
    //todo 改写成为queue list
    userConcernAdd(state: UserDataManagerState, payload: { _id: id, _type: ItemType, userConcern: UserConcern }) {
        let {_id, _type, userConcern} = payload;
        Vue.set(state.userConcernDict[_type], _id, userConcern)
    },

    noteBookAdd(state: UserDataManagerState, payload: { note: NoteBook }) {
        let {note} = payload;
        state.userNoteBook.push(note)
    },

    noteBookRemove(state: UserDataManagerState, payload: { note: NoteBook }) {
        let {note} = payload;
        let index = state.userNoteBook.indexOf(note);
        state.userNoteBook.splice(index, 1);
    },

    noteInDocAdd(state: UserDataManagerState, payload: {_id: id, note: NoteSettingPart}) {
        let {_id, note} = payload;
        state.userNoteInDoc[_id]
            ? state.userNoteInDoc[_id].push(note)
            : state.userNoteInDoc[_id] = [note]
    },

    noteInDocInit(state: UserDataManagerState, payload: {_id: id}) {
        let {_id} = payload;
        state.userNoteInDoc[_id] = []
    }
};

const actions = {
    fragmentAdd(context: { commit: Commit, state: UserDataManagerState }, payload: FragmentInfoPart) {
        console.log(payload);
        state.fragments.push(payload)
        // todo
    }
};

const getters = {
    fragmentSourceIdList(state: UserDataManagerState) {
        return state.fragments.map(fragment => fragment.Ctrl.SourceId)
    }
};

export default {
    state,
    mutations,
    actions,
    getters
};
