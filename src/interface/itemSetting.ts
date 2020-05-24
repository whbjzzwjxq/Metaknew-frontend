import {
    DocumentSelfPart, DocumentItemSettingPart,
    LinkSettingPart,
    MediaSettingPart,
    NodeSettingPart,
    NoteSettingPart,
    TextSettingPart
} from "@/class/settingBase";
import {PaperComponentSection, PaperComponentBackend} from "@/class/settingPaper";
import {GraphLayer, GraphLayerBackend} from "@/class/settingGraph";

declare global {
    // 从视觉上来说是Node的对象
    type VisNodeSettingPart = NodeSettingPart | MediaSettingPart;
    // 从视觉上是一个区域的对象
    type VisAreaSettingPart = VisNodeSettingPart | TextSettingPart;
    // 所有Item对象
    type SubItemSettingPart = VisAreaSettingPart | LinkSettingPart;
    // 所有Setting对象
    type AllSettingPart = SubItemSettingPart | NoteSettingPart;

    interface Setting {
        _id: id;
        _type: AllType;
        _label: string;
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
        _isMain: boolean
        InGraph: SettingGroup
        InPaper: ItemStyleSettingPaper
    }

    type StateKeyBase = keyof DocumentItemState

    type NodeInitPayload = Omit<NodeSetting, 'InPaper' | 'InGraph'>

    interface NodeSetting extends DocumentItemSetting {
        _type: 'node' | 'document';
        _name: string;
        _image: string;
        InGraph: NodeStyleSettingGraph;
        InPaper: NodeStyleSettingPaper
    }

    type LinkInitPayload = Omit<LinkSetting, 'InPaper' | 'InGraph'>

    interface LinkSetting extends DocumentItemSetting {
        _type: 'link';
        _start: VisNodeSettingPart;
        _end: VisNodeSettingPart;
        InGraph: LinkStyleSettingGraph;
        InPaper: LinkStyleSettingPaper;
    }

    interface LinkSettingBackend extends DocumentItemSetting {
        InGraph: LinkStyleSettingGraph;
        _start: VisNodeQuery;
        _end: VisNodeQuery;
    }

    type MediaInitPayload = Omit<MediaSetting, 'InPaper' | 'InGraph'>

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

    type TextInitPayload = Omit<TextSetting, 'InPaper' | 'InGraph'>

    type GraphStateProp = 'isDeleted' | 'isSelf' | 'isAdd' | 'isSelected' | 'isMouseOn' | 'isEditing' | 'isInRow'
    type AllStateProp = 'isLock' | 'isDark' | 'isLoading' | 'isChanged' | 'isExplode' | 'isSavedIn5min' | GraphStateProp

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

    interface PaperItemPosition {
        width: number
        height: number
        order: number
    }

    interface DocumentComponent {
        InGraph: {
            SubGraph: SubGraphSetting[],
            Group: {
                Layer: GraphLayer[],
                Dict: Record<id, GraphLayer[]> //储存itemId 和 Layer的Dict
            }
        },
        InPaper: {
            Sections: PaperComponentSection
        }
    }

    interface DocumentComponentBackend {
        InGraph: {
            SubGraph: SubGraphSetting[],
            Group: {
                Layer: GraphLayerBackend[]
            }
        },
        InPaper: {
            Sections: PaperComponentBackend
        }
    }
}
