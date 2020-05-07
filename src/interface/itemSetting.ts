import {
    DocumentSelfPart, ItemSettingPart,
    LinkSettingPart,
    MediaSettingPart,
    NodeSettingPart,
    NoteSettingPart,
    TextSettingPart
} from "@/class/settingBase";

declare global {
    // 从视觉上来说是Node的对象
    type VisNodeSettingPart = NodeSettingPart | MediaSettingPart;
    // 从视觉上是一个区域的对象
    type VisAreaSettingPart = VisNodeSettingPart | TextSettingPart;
    // 所有Item对象
    type SubItemSettingPart = VisAreaSettingPart | LinkSettingPart;
    // 所有Setting对象
    type AllSettingPart = SubItemSettingPart | NoteSettingPart;

    type SettingGroupKey = 'InGraph' | 'InPaper'
    type SettingKey = SettingGroupKey | '_id' | '_type' | '_label' | '_name' | '_image' | '_src' | '_start' | '_end' |
        '_title' | '_content' | '_parent' | '_points' | '_text'
    //SettingPart相关
    type SettingKeyRecord = Record<SettingKey, any>

    interface Setting extends SettingKeyRecord {
        _id: id;
        _type: AllType;
        _label: string;
        InGraph: SettingGroup
        InPaper: {
            Base: BaseSizeInPaper,
            [prop: string]: SettingComponent
        }
    }

    interface DocumentSetting extends Setting {
        _id: id
        _type: 'document'
        _label: string
    }

    type SettingComponent = Record<string, number | string | boolean>
    type SettingGroup = Record<string, SettingComponent>;

    interface DocumentItemSetting extends Setting {
        _type: DocumentItemType
        InPaper: ItemStyleSettingPaper
    }

    type StateKeyBase = keyof DocumentItemState

    interface NodeInitPayload {
        _id: id,
        _type: 'node' | 'document',
        _label: string,
        _name: string,
        _image: string
    }

    interface NodeSetting extends DocumentItemSetting {
        _type: 'node' | 'document';
        _name: string;
        _image: string;
        InGraph: NodeStyleSettingGraph;
        InPaper: NodeStyleSettingPaper
    }

    interface LinkInitPayload {
        _id: id,
        _type: 'link',
        _label: string,
        _start: VisNodeSettingPart,
        _end: VisNodeSettingPart
    }

    interface LinkSetting extends DocumentItemSetting {
        _type: 'link';
        _start: VisNodeSettingPart;
        _end: VisNodeSettingPart;
        InGraph: LinkStyleSettingGraph;
        InPaper: LinkStyleSettingPaper;
    }

    interface BackendLinkSetting extends DocumentItemSetting {
        InGraph: LinkStyleSettingGraph;
        _start: VisNodeQuery;
        _end: VisNodeQuery;
    }

    interface MediaInitPayload extends Setting {
        _id: id,
        _type: 'media',
        _label: string,
        _name: string,
        _src: string
    }

    interface MediaSetting extends DocumentItemSetting {
        _type: 'media';
        _name: string;
        _src: string; // url字符串或者 URL.createObjectUrl返回值
        InGraph: MediaStyleSettingGraph
        InPaper: MediaStyleSettingPaper
    }

    interface NoteSetting extends Setting {
        _type: 'note';
        _title: string;
        _content: string;
        _user: id;
        InGraph: {
            Base: BaseSizeInGraph;
        }
        InPaper: {
            Base: BaseSizeInPaper,
            Card: CardStyleInPaper
        }
    }

    type TextLabel = 'polygon' | 'polyline' | 'rect' | 'ellipse'

    interface TextSetting extends DocumentItemSetting {
        _type: 'text',
        _label: TextLabel,
        _points: PointObject[],
        _text: string,
        InGraph: TextStyleSettingGraph,
        InPaper: TextStyleSettingPaper
    }

    type GraphStateProp = 'isDeleted' | 'isSelf' | 'isAdd' | 'isSelected' | 'isMouseOn' | 'isEditing' | 'isInRow'
    type AllStateProp = 'isLock' | 'isDark' | 'isLoading' | 'isChanged' | 'isExplode' | 'isSavedIn5min' | GraphStateProp
    type AllCrucialProp = '_id' | '_type' | '_label' | '_image' | '_name' | '_src' | '_start' | '_end'

    interface DocumentInitPayload {
        _id: id,
        parent: DocumentSelfPart | null,
        commitToVuex?: boolean
    }

    //Graph
    interface DocumentContent {
        nodes: NodeSettingPart[];
        links: LinkSettingPart[];
        medias: MediaSettingPart[];
        texts: TextSettingPart[];
    }

    interface DocumentMetaData {
        isTemporary: boolean //是否是暂时的模型
        isRemoteModel: boolean // 远端模型是否能访问
        isMergeTo?: id //合并到某个专题了
        draftId?: number //草稿数据
    }

    interface SubGraphSetting {
        id: id;
        width: number;
        height: number
    }

    interface PaperRowSetting {
        order: number //顺序
        width: number //限制宽度
        height: number //限制高度
        isOverflowX: boolean //是否限制宽度
        Items: ItemSettingPart[], //包含的内容
        isAlign: boolean //是否强制对齐高度
        isVirtual?: boolean //是否是视图以外的Queue
    }

    interface PaperSectionLeftSetting {
        info: string //左边栏文字
        color: Color //左边栏颜色
        show: boolean //是否显示
    }

    interface PaperSectionTitleSetting {
        text: string //标题内容
        color: Color //标题底色
        show: boolean //是否显示标题
    }

    interface PaperSectionSetting {
        Left: PaperSectionLeftSetting
        Title: PaperSectionTitleSetting
        Rows: PaperRowSetting[]
    }

    interface PaperSectionSettingPart {
        Setting: PaperSectionSetting
        State: {
            isSelected: boolean, //选中
            isDeleted: boolean, //被删除
        }
    }

    interface DocumentComponents {
        InGraph: {
            SubGraph: SubGraphSetting[]
        },
        InPaper: {
            SubSection: PaperSectionSettingPart[]
        }
    }
}
