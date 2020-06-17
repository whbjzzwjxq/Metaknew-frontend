import {TextSettingPart} from "@/class/settingBase";
import {instance} from "@/api/main";

export async function textBulkCreate(texts: TextSettingPart[]) {
    let textList = texts.filter(text => !text.isRemote);
    let textIdList = textList.map(text => text._id);
    if (textIdList.length > 0) {
        let result = await instance.request<IdMap>({
            method: 'POST',
            url: '/item/text/bulk_create',
            data: {
                Texts: textIdList
            }
        });
        let idMap = result.data;
        textList.map(text => {
            text.updateCrucialProp('_id', idMap[text._id])
        })
        return result
    } else {
        return {}
    }
}
