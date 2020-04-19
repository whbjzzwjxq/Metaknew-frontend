import {
    LinkSettingPartGraph,
    MediaSettingPartGraph,
    NodeSettingPartGraph,
    TextSettingPartGraph
} from "@/class/settingGraph";
import {
    LinkSettingPartPaper,
    MediaSettingPartPaper,
    NodeSettingPartPaper,
    TextSettingPartPaper
} from "@/class/settingPaper";
import {SettingConfGroup} from "@/interface/style/interfaceStyleBase";

declare global {
    // 从视觉上来说是Node的对象
    type VisNodeSettingPart = NodeSettingPartAny | MediaSettingPartAny;
    // 从视觉上是一个区域的对象
    type VisAreaSettingPart = VisNodeSettingPart | TextSettingPartAny;
    // 所有Item对象
    type SubItemSettingPart = VisAreaSettingPart | LinkSettingPartAny;
    // 所有Setting对象
    type AllSettingPart = SubItemSettingPart | NoteSettingPartAny;

    //SettingPart相关
    interface Setting {
        _id: id;
        _type: AllType;
        _label: string;

        [prop: string]: any
    }

    interface DocumentSetting extends Setting {
        _id: id
        _type: 'document'
        _label: string
    }

    interface GraphSetting extends DocumentSetting, GraphConfigure {

    }
    type SettingGroup = Record<string, number | string | boolean>
    type SettingGroupInPage = Record<string, SettingGroup>;

    interface DocumentItemSetting extends Setting {
        _type: DocumentItemType
        InGraph?: SettingGroupInPage
        InPaper?: SettingGroupInPage
    }

    type SettingGroupKey = 'InGraph' | 'InPaper'
    type StateKeyBase = keyof DocumentItemState

    interface NodeSetting extends DocumentItemSetting {
        _type: 'node' | 'document';
        _name: string;
        _image: string;
        InGraph?: NodeStyleSettingGraph;
        InPaper?: NodeStyleSettingPaper
    }

    interface NodeSettingGraph extends NodeSetting {
        InGraph: NodeStyleSettingGraph
    }

    interface NodeSettingPaper extends NodeSetting {
        InPaper: NodeStyleSettingPaper
    }

    interface LinkSetting<Node extends VisNodeSettingPart> extends DocumentItemSetting {
        _type: 'link';
        _start: Node;
        _end: Node;
        InGraph?: LinkStyleSettingGraph;
        InPaper?: LinkStyleSettingPaper;
    }

    interface LinkSettingGraph extends LinkSetting<NodeSettingPartGraph> {
        InGraph: LinkStyleSettingGraph
    }

    interface LinkSettingPaper extends LinkSetting<NodeSettingPartPaper> {
        InPaper: LinkStyleSettingPaper
    }

    interface BackendLinkSettingGraph extends DocumentItemSetting {
        InGraph: LinkStyleSettingGraph;
        _start: VisNodeQuery;
        _end: VisNodeQuery;
    }

    interface BackendLinkSettingPaper extends DocumentItemSetting {
        InPaper: LinkStyleSettingPaper
    }

    interface MediaSetting extends DocumentItemSetting {
        _type: 'media';
        _name: string;
        _src: string; // url字符串或者 URL.createObjectUrl返回值
        InGraph?: MediaStyleSettingGraph
        InPaper?: MediaStyleSettingPaper
    }

    interface MediaSettingGraph extends MediaSetting {
        InGraph: MediaStyleSettingGraph
    }

    interface MediaSettingPaper extends MediaSetting {
        InPaper: MediaStyleSettingPaper
    }

    interface GraphSetting extends DocumentItemSetting {
        _type: 'document';
        Base: Record<string, any>
    }

    interface PaperSetting extends DocumentItemSetting {
        _type: 'document';
    }

    interface NoteSetting extends Setting {
        _type: 'note';
        _title: string;
        _content: string;
        _parent: id;
    }

    interface NoteSettingGraph extends NoteSetting {
        Base: BaseSizeInGraph;
    }

    interface NoteSettingPaper extends NoteSetting {
        Base: BaseSizeInPaper
    }

    type TextLabel = 'polygon' | 'polyline' | 'rect' | 'ellipse'

    interface TextSetting extends DocumentItemSetting {
        _type: 'text',
        _label: TextLabel,
        _points: PointObject[],
        _text: string,
        InGraph?: TextStyleSettingGraph,
        InPaper?: TextStyleSettingPaper
    }

    interface TextSettingGraph extends TextSetting {
        InGraph: TextStyleSettingGraph
    }

    interface TextSettingPaper extends TextSetting {
        InPaper: TextStyleSettingPaper
    }

    type GraphStateProp = 'isDeleted' | 'isSelf' | 'isAdd' | 'isSelected' | 'isMouseOn' | 'isEditing'
    type AllStateProp = 'isLock' | 'isDark' | 'isLoading' | 'isChanged' | 'isExplode' | 'isSavedIn5min' | GraphStateProp
    type AllCrucialProp = '_id' | '_type' | '_label' | '_image' | '_name' | '_src' | '_start' | '_end'

    interface DocumentInitPayload {
        _id: id,
        parent: DocumentSelfPartAny | null,
        commitToVuex?: boolean
    }

    //Graph
    interface DocumentContent<Node extends NodeSettingPartAny,
        Link extends LinkSettingPartAny,
        Media extends MediaSettingPartAny,
        Text extends TextSettingPartAny> {
        nodes: Node[];
        links: Link[];
        medias: Media[];
        texts: Text[];
    }

    type DocumentContentAny = DocumentContent<
        NodeSettingPartAny,
        LinkSettingPartAny,
        MediaSettingPartAny,
        TextSettingPartAny>

    interface GraphContent {
        nodes: Array<NodeSettingPartGraph>;
        links: Array<LinkSettingPartGraph>;
        medias: Array<MediaSettingPartGraph>;
        texts: Array<TextSettingPartGraph>;
    }

    interface PaperContent {
        nodes: Array<NodeSettingPartPaper>;
        links: Array<LinkSettingPartPaper>;
        medias: Array<MediaSettingPartPaper>;
        texts: Array<TextSettingPartPaper>;
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
