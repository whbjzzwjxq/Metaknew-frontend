export type ResolveType = 'name' | 'position' | 'time' | 'normal'

export interface ResolveItem {
    type: ResolveType,
    value: string
}

export interface RemoteResolvedItem {
    similarValue: string | number | null, // 推测值
    similarId: id | null, // 推测对象id
    valid: boolean // 是否合法
}

export type State = Record<ResolveType, Record<string, Array<RemoteResolvedItem>>>

const state: State = {
    "name": {
        "Rem Koolhaaas": [{
            "similarValue": "Rem Koolhaas",
            "similarId": "",
            "valid": true
        }]
    },
    "position": {
        "Beijing": [{
            "similarValue": "",
            "similarId": "",
            "valid": true
        }]
    },
    "time": {
        "1920s": [{
            "similarValue": "",
            "similarId": "",
            "valid": true
        }]
    },
    'normal': {
        'unknown': [{
            "similarValue": "",
            "similarId": "",
            "valid": true
        }]
    }
};

const getters = {};

const mutations = {};

const actions = {};

export default {
    state,
    mutations,
    actions,
    getters
}
