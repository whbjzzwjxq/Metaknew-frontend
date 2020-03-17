import {instance} from "@/api/main";

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
