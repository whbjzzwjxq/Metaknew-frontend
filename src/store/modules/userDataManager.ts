import {FragmentInfoPart, NoteSettingPart} from "@/class/graphItem";
import {Commit} from "vuex";
import Vue from 'vue';

declare global {
    interface UserDataManagerState {
        userConcernDict: Record<GraphItemType, Record<id, UserConcern>>,
        fragments: Array<FragmentInfoPart>,
        userSetting: Record<string, Record<string, any>>,
        userNoteBook: NoteBook[],
        userNoteInDoc: NoteSettingPart[],
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
    State: NoteBookState
}

const state: UserDataManagerState = {
    userConcernDict: {
        node: {},
        link: {},
        media: {},
        document: {},
        text: {}
    },
    fragments: [],
    userSetting: {
        fragmentCollect: {}
    },
    userNoteBook: [],
    userNoteInDoc: [],
};

const mutations = {
    //todo 改写成为queue list
    userConcernAdd(state: UserDataManagerState, payload: { _id: id, _type: ItemType, userConcern: UserConcern }) {
        let {_id, _type, userConcern} = payload;
        Vue.set(state.userConcernDict[_type], _id, userConcern)
    },

    userConcernChangeId(state: UserDataManagerState, payload: { _type: ItemType, idMap: IdMap }) {
        let {_type, idMap} = payload;
        let dict = state.userConcernDict[_type];
        Object.entries(idMap).map(([key, value]) => {
            Vue.set(dict, key, dict[value]);
            delete dict[key]
        })
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

    noteInDocAdd(state: UserDataManagerState, payload: { note: NoteSettingPart }) {
        let {note} = payload;
        state.userNoteInDoc.push(note)
    }
};

const actions = {
    fragmentAdd(context: { commit: Commit, state: UserDataManagerState }, payload: FragmentInfoPart) {
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
