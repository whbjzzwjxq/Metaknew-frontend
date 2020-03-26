import {NodeInfoPart} from "@/class/graphItem";

export type Time = number // 时间戳
export type Rate = number // 0-1

export interface TimelineItem {
    info: NodeInfoPart,
    time: Time,
    key: string
}

export interface FakeNodeSettingPart {
    State: NodeState,
    Setting: NodeSettingGraph
}
