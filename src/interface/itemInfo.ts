import {ExtraProps} from "@/utils/fieldResolve";
import {
    LinkInfoPart,
    LinkSettingPart,
    MediaInfoPart,
    MediaSettingPart,
    NodeInfoPart,
    NodeSettingPart,
    TextSettingPart
} from "@/class/graphItem";
import {PathNodeSettingPart} from "@/class/path";

declare global {
    type id = number | string;
    type ItemType = "node" | "link" | "media" | "document" // 基础的type
    type GraphItemType = ItemType | "text"; // Graph里使用的type
    type AllType = GraphItemType | "fragment" | "path" | "note";
    type GraphTypeS = 'nodes' | 'medias' | 'links' | "texts";
    type MediaStatus = "new" | "uploading" | "error" | "success" | "warning";
    type IdMap = Record<id, id>; // 新旧id的Map
    //带有翻译的格式
    type Translate = Record<string, string>
    interface InfoState {
        remoteNotFound: boolean // 远端模型是否被删除
        isEdit: boolean // 自上次保存后，是否编辑过
        draftId?: number // 对应草稿的versionId 如果没有那么就是undefined
    }
    //InfoPart相关
    interface BaseInfo {
        id: id;
        type: AllType;
        PrimaryLabel: string;
        Name: string,
        Description: Translate,
        Translate: Translate,
        Labels: string[], //统计后的标签
        ExtraProps: ExtraProps, //额外属性
        StandardProps: ExtraProps, // 标准属性

        [prop: string]: any;
    }

    interface PublicInfo extends BaseInfo {
        IsCommon: boolean;
        IsOpenSource: boolean;
    }

    interface BaseCtrl {
        CreateUser: id; // 用户新建
        CreateType: string; // 用户新建或者自动或者之类的
        UpdateTime: number; // 时间戳
        Labels: Array<string>; // 用户自己的标签
        [prop: string]: any;
    }

    interface PublicCtrl extends BaseCtrl {
        NumStar: number;
        NumShared: number;
        NumGood: number;
        NumBad: number;
        // 向外发布的内容才有统计数据
    }

    interface BaseNodeInfo extends PublicInfo {
        type: "node" | "document";
        Alias: Array<string>;
        Topic: Array<string>;
        BaseImp: number;
        BaseHardLevel: number;
        BaseUseful: number;
        Language: string;
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

    interface BaseMediaInfo extends PublicInfo {
        type: "media";

        [propName: string]: any;
    }

    interface BaseMediaCtrl extends PublicCtrl {
        FileName: string; // URL
        Format: string; // 格式
        Thumb: string; // 缩略图
    }

    interface BaseLinkInfo extends PublicInfo {
        type: "link";

        [propName: string]: any;
    }

    interface CompressLinkInfo extends BaseLinkInfo {
        Start: QueryObject;
        End: QueryObject;
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
        texts: Array<TextSettingPart>;
    }

    interface DocumentData {
        draftId?: number;
        isRemote: boolean;
        lastSave: number;
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

    interface QueryObject {
        id: id;
        type: AllType;
        pLabel: string;
    } // 用于Query

    interface NodeQuery extends QueryObject{
        type: 'node' | 'document'
    }

    type VisNodeQuery = NodeQuery | MediaQuery

    interface LinkQuery extends QueryObject{
        type: 'link'
    }

    interface MediaQuery extends QueryObject{
        type: 'media'
    }

    type DocumentLabel = 'DocPaper' | 'DocGraph' | 'Path'
    interface DocumentQuery extends NodeQuery{
        type: 'document'
        pLabel: DocumentLabel
    }
}
