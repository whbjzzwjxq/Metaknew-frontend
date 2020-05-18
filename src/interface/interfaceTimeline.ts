import {MediaInfoPart, NodeInfoPart} from "@/class/info";

export type Time = number // 时间戳
export type Rate = number // 0-1

export interface TimelineItem {
    info: NodeInfoPart | MediaInfoPart,
    time: Time,
    key: string
}

export interface FakeNodeSettingPart {
    State: NodeState,
    Setting: NodeSetting
}
