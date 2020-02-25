declare global {
    type BooleanConcern = "isStar" | "isBad" | "isGood" | "isShared";
    type LevelConcern = "Imp" | "HardLevel" | "Useful";
    interface UserConcern {
        Imp: number;
        HardLevel: number;
        Useful: number;
        isStar: boolean;
        isShared: boolean;
        isGood: boolean;
        isBad: boolean;
        Labels: Array<string>;
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
