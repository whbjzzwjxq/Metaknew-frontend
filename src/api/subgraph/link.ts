import {instance} from "@/api/main";
import {commitInfoIdChange, commitSnackbarOn} from "@/store/modules/_mutations";
import {LinkInfoPart} from "@/class/graphItem";

export async function linkBulkCreate(links: LinkInfoPart[], createType: string = 'USER') {
    let linkList = links.filter(link => !link.isRemote);
    let Links = linkList.map(link => link.compress());
    if (linkList.length > 0) {
        let result = await instance.request<IdMap>({
            method: 'POST',
            url: '/item/link/bulk_create',
            data: {
                Links,
                CreateType: createType
            }
        });
        let idMap = result.data;
        idMap && commitInfoIdChange({_type: 'link', idMap});
        return result
    } else {
        return {}
    }
}

export async function linkBulkUpdate(links: LinkInfoPart[], createType: string = 'USER') {
    let linkList = links.filter(link => link.isRemote && link.isEdit);
    let Links = linkList.map(link => link.compress());
    if (Links.length > 0) {
        let result = await instance.request({
            method: 'POST',
            url: '/item/link/bulk_update',
            data: {
                Links,
                CreateType: createType
            }
        });
        let payload = {
            actionName: 'linkBulkUpdate',
            color: 'success',
            once: false,
            content: '更新关系成功'
        } as SnackBarStatePayload;
        commitSnackbarOn(payload);
        links.map(link => {
            link.isEdit = false
        });
        return result
    } else {
        return true
    }
}

export interface BackendLinkCtrl extends PublicCtrl {
    Start: QueryObject;
    End: QueryObject;
}

export interface BackendLinkInfoPart {
    Info: BaseLinkInfo;
    Ctrl: BackendLinkCtrl;
}

export function linkQueryBulk(list: Array<QueryObject>) {
    return instance.request<BackendLinkInfoPart[]>({
        url: '/item/link/query',
        method: 'post',
        data: {
            DataList: list
        }
    })
}
