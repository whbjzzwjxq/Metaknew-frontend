declare global {
    type Color = string;
}
export type SettingConfGroup = Record<string, SettingConf>
export type SettingConfAll = Record<string, SettingConfGroup>

//String就是有选项
export interface SettingConf {
    type: 'Number' | 'Boolean' | 'Text' | 'Color' | 'String',
    default: any,
    range: Array<any> | '',
    tips: string,
    explain: string
}

export const mergeSetting = (...settingList: SettingConfGroup[]) => {
    return Object.assign({}, ...settingList) as SettingConfGroup
};

export function handleSettingConfAllToValue<T extends Record<string, Record<string, any>>>(settingGroup: Record<keyof T, SettingConfGroup>) {
    //@ts-ignore
    let result: T = {};
    Object.entries(settingGroup).map(([key, value]) => {
        let prop = key as keyof T
        let result2: Record<string, any> = {}
        Object.entries(settingGroup[prop]).map(([key2, value]) => {
            result2[key2] = value.default
        })
        result = {
            ...result,
            [prop]: result2,
        }
    })
    return result
}

export enum SizeName {
    XS = 'xSmall',
    SM = 'small',
    NO = 'normal',
    LA = 'large',
    XL = 'xLarge'
}
