declare global {
    type BooleanConcern = "NumStar" | "NumBad" | "NumGood" | "NumShared";
    type LevelConcern = "Imp" | "HardLevel" | "Useful";
    interface UserConcern {
        Imp: number;
        HardLevel: number;
        Useful: number;
        NumStar: boolean;
        NumShared: boolean;
        NumGood: boolean;
        NumBad: boolean;
        Labels: Array<string>;
        isModeled: boolean; // 远端是否有模型
        isConfirm: boolean; // 是否确认了状态
    }
}

export interface FragmentCtrl extends BaseCtrl {
    SourceId: id,
    SourceType: DocumentItemType,
    SourceLabel: string,
    IsLinked: boolean
}

export interface FragmentInfo extends BaseInfo {
    type: 'fragment',
    PrimaryLabel: 'text' | 'image',
    Src: id,
}
