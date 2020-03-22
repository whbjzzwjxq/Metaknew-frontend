import {instance} from "@/api/main";
import {PropDescriptionDict} from "@/utils/fieldResolve";
import {commitUserEditDataLoadDone} from "@/store/modules/_mutations";

export function fragmentQuery() {
    return instance.request({
        url: 'user/fragment/query'
    })
}

export function fragmentAdd() {
    return instance.request({
        url: 'user/fragment/add'
    })
}

export function fragmentDelete() {
    return instance.request({
        url: 'user/fragment/delete'
    })
}

export function fragmentUpdate() {
    return instance.request({
        url: 'user/fragment/update'
    })
}

export function userPropResolveUpdate(dataList: PropDescriptionPayload[]) {
    return instance.request({
        url: 'user/data/prop_resolve/update',
        method: 'POST',
        data: {
            DataList: dataList.map(data => {
                let {type, resolve} = data.resolve;
                return {Key: data.prop, FieldType: type, ResolveType: resolve}
            })
        }
    })
}

export function userPLabelPropsUpdate(dataList: LabelProps) {
    return instance.request({
        url: 'user/data/label/props/update',
        method: 'POST',
        data: {
            DataList: Object.entries(dataList).map(([Key, PropNames]) => {
                return {Key, PropNames}
            })
        }
    })
}

export function userEditDataQuery() {
    return instance.request<UserEditData>({
        url: 'user/data/query',
        method: 'GET'
    }).then(res => {
        commitUserEditDataLoadDone(res.data)
    })
}
