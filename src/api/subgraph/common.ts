import {instance} from "@/api/main";

interface Draft {
    _id: id;
    type: ItemType;
    PrimaryLabel: string;
    Content: BaseInfo;
    Name: string
}
export const draftSave = (data: Draft[], isAuto: boolean) => {

};
