export type BooleanConcern = "isStar" | "isBad" | "isGood" | "isShared";
export type LevelConcern = "Imp" | "HardLevel" | "Useful";

export interface UserConcern {
    Imp: number;
    HardLevel: number;
    Useful: number;
    isStar: boolean;
    isShared: boolean;
    isGood: boolean;
    isBad: boolean;
    Labels: Array<string>;
}
