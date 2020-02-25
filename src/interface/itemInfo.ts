import {ExtraProps, ValueWithType} from "@/utils/fieldResolve";
import {
    LinkInfoPart,
    LinkSettingPart,
    MediaInfoPart,
    MediaSettingPart,
    NodeInfoPart,
    NodeSettingPart,
    SvgSettingPart
} from "@/class/graphItem";
import {PathNodeSettingPart} from "@/class/path";

declare global {
    type id = number | string;
    type ItemType = "node" | "link" | "media" | "document" // 基础的type
    type GraphItemType = ItemType | "svg" | "note"; // Graph里使用的type
    type SourceType = GraphItemType | "fragment" | "path";
    type GraphTypeS = 'nodes' | 'medias' | 'links' | "svgs";
    type MediaStatus = "new" | "remote" | "uploading" | "error" | "success" | "warning";
    type idMap = Record<id, id>; // 新旧id的Map
    //带有翻译的格式
    type Translate = Record<string, string>

    //InfoPart相关
    interface BaseInfo {
        _id: id;
        type: SourceType;
        PrimaryLabel: string;
        Name: string,
        Description: Translate,
        Labels: string[], //统计后的标签
        ExtraProps: ExtraProps, //额外属性
        StandardProps: ExtraProps, // 标准属性
        IsCommon: boolean;
        IsFree: boolean;
        IsOpenSource: boolean;

        [prop: string]: any;
    }

    interface BaseCtrl {
        CreateUser: id; // 用户新建
        CreateType: string; // 用户新建或者自动或者之类的
        UpdateTime: number; // 时间戳
        Labels: Array<string>; // 用户自己的标签
        [prop: string]: any;
    }

    interface PublicCtrl extends BaseCtrl {
        isStar: number;
        isShared: number;
        isGood: number;
        isBad: number;
        // 向外发布的内容才有统计数据
    }

    interface BaseNodeInfo extends BaseInfo {
        type: "node" | "document";
        Alias: Array<string>;
        Topic: Array<string>;
        BaseImp: number;
        BaseHardLevel: number;
        BaseUseful: number;
        Language: string;
        Translate: Translate // 名字的翻译
        MainPic: string;
        IncludedMedia: Array<id>;
    }

    interface BaseNodeCtrl extends PublicCtrl {
        Imp: number;
        HardLevel: number;
        Useful: number;
        Contributor: Object;
        TotalTime: number;
    }

    //GraphInfo 和 NodeInfo一样
    interface BaseGraphCtrl extends BaseNodeCtrl {
        Size: number;
        MainNodes: Array<id>;
        Complete: number
    }

    interface BaseMediaInfo extends BaseInfo {
        type: "media";

        [propName: string]: any;
    }

    interface BaseMediaCtrl extends PublicCtrl {
        FileName: string; // URL
        Format: string; // 格式
        Thumb: string; // 缩略图
    }

    interface BaseLinkInfo extends BaseInfo {
        type: "link";

        [propName: string]: any;
    }

    interface BaseLinkCtrl extends PublicCtrl {
        Start: NodeSettingPart;
        End: NodeSettingPart;
    }

    //Graph
    interface DocumentContent {
        nodes: Array<NodeSettingPart>;
        links: Array<LinkSettingPart>;
        medias: Array<MediaSettingPart>;
        svgs: Array<SvgSettingPart>;
    }

    interface PathConf extends Setting {
        _type: 'document',
        _label: 'path'
    }

    interface BasePathInfo extends BaseNodeInfo {
        type: 'document',
        PrimaryLabel: 'path',
    }

    type PathArray = (PathNodeSettingPart | null)[][];

    type InfoPartInDataManager = NodeInfoPart | LinkInfoPart | MediaInfoPart
}
