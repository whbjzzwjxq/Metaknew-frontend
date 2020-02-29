import {instance} from "@/api/main";

export interface TagRecommendation {
    [propName: string]: string[],
}

export const userConcernQuery = (keyList: ConcernKey[]) => {
    return instance.request<(ConcernPayload | {id: id, type: GraphItemType, userConcern: null})[]>(
        {}
    )
};
