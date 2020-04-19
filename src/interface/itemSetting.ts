import {
    DocumentSelfPart,
    LinkSettingPart,
    MediaSettingPart,
    NodeSettingPart, NoteSettingPart,
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
    type SettingKey = SettingGroupKey | '_id' | '_type' | '_label' | '_name' | '_image'| '_src' | '_start' | '_end' |
        '_title' | '_content' | '_parent' | '_points' | '_text'
    //SettingPart相关
    type SettingKeyRecord = Record<SettingKey, any>
    interface Setting extends SettingKeyRecord {
        _id: id;
        _type: AllType;
        _label: string;
        InGraph: SettingGroup
        InPaper: SettingGroup
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
        InGraph: NodeStyleSetting;
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
        InGraph: LinkStyleSetting;
        InPaper: LinkStyleSettingPaper;
    }

    interface BackendLinkSetting extends DocumentItemSetting {
        InGraph: LinkStyleSetting;
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
        InGraph: MediaStyleSetting
        InPaper: MediaStyleSettingPaper
    }

    interface NoteSetting extends Setting {
        _type: 'note';
        _title: string;
        _content: string;
        _parent: id;
        InGraph: {
            Base: BaseSizeInGraph;
        }
        InPaper: {
            Base: BaseSizeInPaper
        }
    }

    type TextLabel = 'polygon' | 'polyline' | 'rect' | 'ellipse'

    interface TextSetting extends DocumentItemSetting {
        _type: 'text',
        _label: TextLabel,
        _points: PointObject[],
        _text: string,
        InGraph: TextStyleSetting,
        InPaper: TextStyleSettingPaper
    }

    type GraphStateProp = 'isDeleted' | 'isSelf' | 'isAdd' | 'isSelected' | 'isMouseOn' | 'isEditing'
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

    interface DocumentComponents {
        SubGraph: SubGraphSetting[]
    }
}
