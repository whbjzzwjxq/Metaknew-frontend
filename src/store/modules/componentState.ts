declare global {
    interface ComponentState {
        leftCardTab: {
            root: number,
            sub: number
        },
        loginDialogOn: boolean,
        loginTab: {
            root: number
        },
        bottomDynamicBarOn: boolean,
        bottomDynamicBarType: BottomDynamicBarType
    }

    type RootTabName = 'ecoSystem' | 'document' | 'metaKnowledge';
    type EcoTabName = 'knownMap' | 'community' | 'course';
    type DocumentTabName = 'directory' | 'historyBranch' | 'comments';
    type MetaKnowledgeTabName = 'info' | 'mediaList' | 'relative'
    type SubTabName = EcoTabName | DocumentTabName | MetaKnowledgeTabName
    type BottomDynamicBarType = 'path'
}

export const tabDict: Record<RootTabName, string[]> = {
    'ecoSystem': [
        "knownMap",
        "community",
        "course"
    ] as EcoTabName[],
    'document': [
        "directory",
        "historyBranch",
        "comments"
    ] as DocumentTabName[],
    "metaKnowledge": [
        "info",
        "mediaList",
        "relative"
    ] as MetaKnowledgeTabName[]
};

const rootTabIndex: RootTabName[] = ["ecoSystem", "document", "metaKnowledge"];

const state = {
    leftCardTab: {
        root: 1,
        sub: 0
    },
    loginDialogOn: false,
    loginTab: {
        root: 0
    },
    editMode: false,
    bottomDynamicBarOn: false,
    bottomDynamicBarType: 'path'
} as ComponentState;

const mutations = {
    rootTabChange: (state: ComponentState, payload: RootTabName | number) => {
        typeof payload === 'number'
            ? state.leftCardTab.root = payload
            : state.leftCardTab.root = rootTabIndex.indexOf(payload);
        state.leftCardTab.sub = 0
    },

    subTabChange: (state: ComponentState, payload: SubTabName) => {
        let root = 'document' as RootTabName;
        let sub = 0;
        Object.entries(tabDict).map(([key, nameList]) => {
            let index = nameList.indexOf(payload);
            if (index > -1) {
                sub = index;
                root = key as RootTabName
            } else {
                //
            }
        });
        state.leftCardTab.root = rootTabIndex.indexOf(root);
        state.leftCardTab.sub = sub
    },

    loginDialogChange: (state: ComponentState, payload: boolean) => {
        state.loginDialogOn = payload
    },

    loginDialogTabOn: (state: ComponentState, payload: 0 | 1) => {
        state.loginTab.root = payload;
        state.loginDialogOn = true;
    },

    bottomDynamicBarChange: (state: ComponentState, payload: {on?: boolean, type?: BottomDynamicBarType}) => {
        let {type, on} = payload;
        on !== undefined && (state.bottomDynamicBarOn = on);
        type !== undefined && (state.bottomDynamicBarType = type)
    }
};
const actions = {};
const getters = {};

export default {
    state,
    mutations,
    actions,
    getters
}
