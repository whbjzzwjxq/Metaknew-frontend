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
