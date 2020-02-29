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
        isRemote: boolean;
    }
}

export interface FragmentCtrl extends BaseCtrl {
    SourceId: id,
    SourceType: GraphItemType,
    SourceLabel: string,
    IsLinked: boolean
}

export interface FragmentInfo extends BaseInfo {
    type: 'fragment',
    PrimaryLabel: 'text' | 'image',
    Src: id,
}
