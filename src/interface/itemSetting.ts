import {
    GraphConf,
    LinkSettingPart,
    MediaSettingPart,
    NodeSettingPart,
    NoteSettingPart,
    TextSettingPart
} from "@/class/graphItem";
import {mergeObject} from "@/utils/utils";

export type SettingGroup = Record<string, BaseSettingConf>
export type SettingAll = Record<string, SettingGroup>

export interface BaseSettingConf {
    type: 'Number' | 'Boolean' | 'Text' | 'Color' | 'String',
    default: any,
    range: Array<any> | '',
    tips: string,
    explain: string
}

const mergeSetting = (...settingList: SettingGroup[]) => {
    return Object.assign({}, ...settingList) as SettingGroup
};

const xSetting = () => {
    return {
        x: {
            type: 'Number',
            default: 0.3,
            range: [0, 1],
            tips: '',
            explain: '横向坐标'
        }
    } as SettingGroup
};
const ySetting = () => {
    return {
        y: {
            type: 'Number',
            default: 0.3,
            range: [0, 1],
            tips: '',
            explain: '纵向坐标'
        }
    } as SettingGroup
};
const width = () => {
    return {
        width: {
            type: 'Number',
            default: 2,
            range: [1, 10],
            tips: '',
            explain: '线条宽度'
        },
    } as SettingGroup
};
const size = () => {
    return {
        size: {
            type: 'Number',
            default: 0,
            range: [12, 128],
            tips: '不能为0',
            explain: '可视化尺寸'
        },
    } as SettingGroup
};
const scaleX = () => {
    return {
        scaleX: {
            type: 'Number',
            default: 1,
            range: [0.2, 5],
            tips: '',
            explain: '高度与宽度之比'
        },
    } as SettingGroup
};
const color = () => {
    return {
        color: {
            type: 'Color',
            default: '#000000',
            range: '',
            tips: '没有图片时才会呈现纯色',
            explain: '节点颜色'
        }
    } as SettingGroup
};
const opacity = () => {
    return {
        opacity: {
            type: 'Number',
            default: 1,
            range: [0.2, 1],
            tips: '',
            explain: '节点透明度'
        },
    } as SettingGroup
};
const rotate = () => {
    return {
        rotate: {
            type: 'Number',
            default: 0,
            range: [1, 360],
            tips: '旋转的角度',
            explain: '旋转的角度'
        },
    } as SettingGroup
};
const nodeViewType = () => {
    return {
        viewType: {
            type: 'String',
            default: 'rectangle',
            range: ['rectangle', 'rhombus', 'ellipse'],
            tips: '具体形状可以通过宽高比控制',
            explain: '节点形状'
        },
    } as SettingGroup
};
const linkViewType = () => {
    return {
        viewType: {
            type: 'String',
            default: 'linear',
            range: ['linear', 'curve', 'polyline'],
            tips: '直线，曲线，折线',
            explain: '线条样式'
        },
    } as SettingGroup
};
const isMain = () => {
    return {
        isMain: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '合理地主要节点设置会提高内容可信度',
            explain: '是否是主要节点'
        }
    } as SettingGroup
};
const linkLocation = () => {
    return {
        startLoc: {
            type: 'String',
            default: 'center',
            range: ['top', 'bottom', 'left', 'right', 'center'],
            tips: '起点节点的位置',
            explain: '起点位置'
        },
        endLoc: {
            type: 'String',
            default: 'center',
            range: ['top', 'bottom', 'left', 'right', 'center'],
            tips: '终点节点的位置',
            explain: '终点位置'
        },
    } as SettingGroup
};
const linkDirect = () => {
    return {
        direct: {
            type: 'String',
            default: 'top',
            range: ['top', 'bottom'],
            tips: '线条控制点方向',
            explain: '线条方向'
        },
    } as SettingGroup
};
const borderWidth = () => {
    return {
        width: {
            type: 'Number',
            default: 2,
            range: [1, 8],
            tips: '',
            explain: '描边宽度'
        },
    } as SettingGroup
};
const borderColor = () => {
    return {
        color: {
            type: 'Color',
            default: '',
            range: '',
            tips: '如果不设置颜色则颜色会根据节点类型产生',
            explain: '描边颜色'
        },
    } as SettingGroup
};
const borderDashArray = () => {
    return {
        dashArray: {
            type: 'String',
            default: '0, 0',
            range: ['0, 0', '2, 2', '2, 4', '4, 4', '8, 4', '12, 4'],
            tips: '',
            explain: '描边形状'
        }
    } as SettingGroup
};
const borderOpacity = () => {
    return {
        opacity: {
            type: "Number",
            default: 1,
            range: [0, 1],
            tips: '',
            explain: '边缘透明度'
        },
    } as SettingGroup
};
const showAll = () => {
    return {
        showAll: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            explain: '整体可视'
        }
    } as SettingGroup
};
const showBorder = () => {
    return {
        showBorder: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            explain: '边框是否可视'
        }
    } as SettingGroup
};
const showInlineText = () => {
    return {
        showInlineText: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            explain: '内部文字是否可视'
        }
    } as SettingGroup
};
const showName = () => {
    return {
        showName: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            explain: '名字是否可视'
        },
    } as SettingGroup
};
const showBackground = () => {
    return {
        showBackground: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            explain: '颜色填充是否可视'
        }
    } as SettingGroup
};
const showImage = () => {
    return {
        showImage: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            explain: '图片是否可视'
        },
    } as SettingGroup
};
const showAppendText = () => {
    return {
        showAppendText: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            explain: '附加文字是否可视'
        }
    } as SettingGroup
};
const inlineText = () => {
    return {
        inlineText: {
            type: 'Text',
            default: '',
            range: '',
            tips: '',
            explain: '显示在节点内的文字'
        },
    } as SettingGroup
};
const inlineTextColor = () => {
    return {
        inlineTextColor: {
            type: 'Color',
            default: '#FFFFFF',
            range: '',
            tips: '',
            explain: '节点内文字颜色'
        }
    } as SettingGroup
};
const inlineTextSize = () => {
    return {
        inlineTextSize: {
            type: 'Number',
            default: 12,
            range: [8, 20],
            tips: '',
            explain: '节点内文字尺寸'
        },
    } as SettingGroup
};
const inlineTextBreak = () => {
    return {
        inlineTextBreak: {
            type: 'Boolean',
            default: false,
            range: '',
            tips: '',
            explain: '节点内文字是否换行显示'
        },
    } as SettingGroup
};
const text = () => {
    return {
        text: {
            type: 'Text',
            default: '',
            range: '',
            tips: '',
            explain: '显示在节点内的文字'
        },
    } as SettingGroup
};
const textSize = () => {
    return {
        textSize: {
            type: 'Number',
            default: 14,
            range: [8, 20],
            tips: '',
            explain: '节点名字尺寸'
        },
    } as SettingGroup
};
const textColor = () => {
    return {
        textColor: {
            type: 'Color',
            default: '#000000',
            range: '',
            tips: '',
            explain: '节点名字颜色'
        },
    } as SettingGroup
};
const textBreak = () => {
    return {
        textBreak: {
            type: 'Boolean',
            default: false,
            range: '',
            tips: '',
            explain: '名字是否换行显示'
        }
    } as SettingGroup
};

const BaseSettingGroup = () => mergeSetting(xSetting(), ySetting(), size(), scaleX()) as SettingGroup;

const BorderSettingGroup = () => mergeSetting(borderColor(), borderOpacity(), borderWidth(), borderDashArray()) as SettingGroup;

const TextSettingGroup = () => mergeSetting(textSize(), textColor(), textBreak()) as SettingGroup;

const InlineTextSettingGroup = () => mergeSetting(inlineTextSize(), inlineTextColor(), inlineTextBreak()) as SettingGroup;

const nodeSetting = () => {
    let result = {
        Base: BaseSettingGroup(),
        View: mergeSetting(color(), opacity(), nodeViewType(), isMain()),
        Border: BorderSettingGroup(),
        Show: mergeSetting(showAll(), showBorder(), showName(), showBackground(), showInlineText(), showImage()),
        Text: mergeSetting(inlineText(), InlineTextSettingGroup(), text(), TextSettingGroup())
    };
    return result as SettingAll
};

const linkSetting: SettingAll = {
    View: mergeSetting(width(), color(), linkViewType(), linkDirect(), linkLocation(), isMain(), borderDashArray()),
    Arrow: {
        arrowLength: {
            type: 'Number',
            default: 14,
            range: [8, 24],
            tips: '',
            explain: '箭头长度'
        },
        arrowColor: {
            type: 'Color',
            default: '#000000',
            range: '',
            tips: '',
            explain: '箭头颜色'
        },
        arrowShow: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            explain: '是否显示箭头'
        }
    },
    Text: {
        textExtra: {
            type: 'Text',
            default: '',
            range: '',
            tips: '可以选择前置还是后置',
            explain: '额外显示的文字'
        },
        textPrefix: {
            type: 'String',
            default: '',
            range: ['append', 'prepend'],
            tips: '',
            explain: '额外文字的位置'
        },
        textLocationX: {
            type: 'Number',
            default: 0.5,
            range: [0.1, 0.9],
            tips: '值越小越靠近起始节点',
            explain: '标签的横向位置'
        },
        textLocationY: {
            type: 'Number',
            default: 0.5,
            range: [0.1, 0.9],
            tips: '值越小越靠近起始节点',
            explain: '标签的纵向位置'
        },
        textColor: {
            type: 'Color',
            default: '#000000',
            range: '',
            tips: '',
            explain: '标签颜色'
        }
    }
};

const documentSetting: SettingAll = {
    Base: {
        background: {
            type: 'String',
            default: '',
            range: ['galaxy-1', 'galaxy-2', 'galaxy-3'],
            tips: '暂未开放',
            explain: '背景图'
        },
        backgroundColor: {
            type: 'Color',
            default: '#eeeeee',
            range: '',
            tips: '暂未开放',
            explain: '背景颜色'
        },
        theme: {
            type: 'String',
            default: '',
            range: ['galaxy-1', 'galaxy-2', 'galaxy-3'],
            tips: '暂未开放',
            explain: '主题'
        },
        defaultMode: {
            type: 'String',
            default: '',
            range: ['normal', 'imp', 'geo', 'time'],
            tips: '暂未开放',
            explain: '默认模式'
        }
    }
};

const mediaSetting = () => {
    let result = {
        Base: BaseSettingGroup(),
        Border: BorderSettingGroup(),
        Show: mergeSetting(showAll(), showBorder(), showAppendText()),
        Text: mergeSetting(text(), TextSettingGroup(), inlineText(), InlineTextSettingGroup()),
        View: mergeSetting(isMain(), opacity())
    };
    let replace = {
        Base: {
            size: {
                default: 300,
                range: [50, 600]
            },
            scaleX: {
                default: 0.4
            }
        }
    }
    mergeObject(result, replace);
    return result as SettingAll
};

const noteSetting = () => {
    let result = {
        Base: BaseSettingGroup()
    };
    let replace = {
        Base: {
            size: {
                default: 300,
                range: [100, 600]
            },
            scaleX: {
                default: 1.5,
            }
        }
    };
    mergeObject(result, replace);
    return result as SettingAll
};

const textSetting = () => {
    let result = {
        Base: BaseSettingGroup(),
        Border: BorderSettingGroup(),
        Transition: mergeSetting(rotate()),
        Background: mergeSetting(color(), opacity()),
        Show: mergeSetting(showAll(), showBorder(), showInlineText(), showBackground()),
    };
    let replace = {
        Base: {
            size: {
                default: 100,
                range: [12, 400]
            },
        },
        Text: {
            inlineText: {
                default: 'Input Here'
            }
        },
        Background: {
            color: {
                default: '#FFFFFF'
            },
            opacity: {
                default: 0
            }
        },
        Border: {
            color: {
                default: '#000000'
            },
            width: {
                default: 2
            }
        }
    };
    mergeObject(result, replace);
    return result as SettingAll
};

const fragmentSetting = {};

const pathSetting = {};

export const typeSetting: Record<AllType, SettingAll> = {
    'node': nodeSetting(),
    'link': linkSetting,
    'document': documentSetting,
    'media': mediaSetting(),
    'text': textSetting(),
    'note': noteSetting(),
    'fragment': fragmentSetting,
    'path': pathSetting
};

declare global {
    // 从视觉上来说是Node的对象
    type VisNodeSettingPart = NodeSettingPart | MediaSettingPart;
    // 从视觉上是一个区域的对象
    type VisAreaSettingPart = VisNodeSettingPart | TextSettingPart;
    // 所有Item对象
    type GraphSubItemSettingPart = VisAreaSettingPart | LinkSettingPart;
    // 所有Setting对象
    type AllSettingPart = GraphSubItemSettingPart | NoteSettingPart | GraphConf;

    //SettingPart相关

    interface Setting {
        _id: id;
        _type: AllType;
        _label: string;

        [propName: string]: any;
    }

    interface GraphItemSetting extends Setting {
        _type: GraphItemType
    }

    type BaseStateKey = 'isSelected' | 'isDeleted' | 'isSelf'

    interface BaseSize {
        x: number;
        y: number;
        size: number;
        scaleX: number;
    }

    type Color = string;
    type NodeViewType = 'rectangle' | 'rhombus' | 'ellipse';

    interface NodeStyleSetting {
        Base: BaseSize;
        View: {
            color: Color;
            opacity: number;
            viewType: NodeViewType;
            isMain: boolean;
        };
        Border: {
            width: number;
            color: Color;
            isDash: boolean
        };
        Show: {
            showAll: boolean;
            showName: boolean;
            showImage: boolean;
            showBorder: boolean;
            showBackground: boolean;
            showInlineText: boolean;
        };
        Text: {
            inlineText: string;
            inlineTextColor: Color;
            inlineTextSize: number;
            inlineTextBreak: boolean;
            textColor: Color;
            textSize: number;
            textBreak: boolean;
        }
    }

    interface NodeSetting extends GraphItemSetting, NodeStyleSetting {
        _type: 'node' | 'document';
        _name: string;
        _image: string;
    }

    type LinkViewType = 'linear' | 'curve' | 'polyline'
    type LinkPointLocation = 'top' | 'bottom' | 'left' | 'right' | 'center'

    interface LinkStyleSetting {
        View: {
            width: number;
            color: Color;
            viewType: LinkViewType;
            direct: 'top' | 'bottom';
            startLoc: LinkPointLocation;
            endLoc: LinkPointLocation;
            dashArray: string;
            isMain: boolean;
        };
        Arrow: {
            arrowLength: number;
            arrowColor: Color;
            arrowShow: boolean;
        };
        Text: {
            textExtra: string;
            textPrefix: 'append' | 'prepend';
            textLocationX: number;
            textLocationY: number;
            textColor: Color
        }
    }

    interface LinkSetting extends GraphItemSetting, LinkStyleSetting {
        _type: 'link';
        _start: VisNodeSettingPart;
        _end: VisNodeSettingPart;
    }

    interface MediaStyleSetting {
        Base: BaseSize;
        View: {
            opacity: number,
            isMain: boolean,
        };
        Border: {
            width: number,
            color: Color,
            isDash: boolean,
        },
        Show: {
            showAll: boolean,
            showName: boolean,
            showBorder: boolean,
            showInlineText: boolean,
            showAppendText: boolean
        },
        Text: {
            inlineText: string,
            inlineTextColor: Color,
            inlineTextSize: number,
            inlineTextBreak: boolean,
            appendText: string,
            appendTextColor: Color,
            appendTextSize: number,
            appendTextBreak: string,
            textSize: number,
            textColor: Color,
            textBreak: boolean
        }
    }

    interface MediaSetting extends GraphItemSetting, MediaStyleSetting {
        _type: 'media';
        _name: string;
        _src: string; // url字符串或者 URL.createObjectUrl返回值
    }

    interface BackendLinkSetting extends GraphItemSetting, LinkStyleSetting {
        _start: VisNodeQuery;
        _end: VisNodeQuery;
    }

    interface GraphSetting extends GraphItemSetting {
        _type: 'document';
        Base: Record<string, any>
    }

    interface NoteSetting extends Setting {
        _type: 'note';
        _title: string;
        _content: string;
        _parent: id;
        Base: BaseSize;
    }

    type TextLabel = 'polygon' | 'polyline' | 'rect' | 'ellipse'

    interface SvgStyleSetting {
        Base: BaseSize;
        Border: {
            width: number,
            color: Color,
            isDash: boolean,
            opacity: number,
            dashArray: string
        };
        Show: {
            showAll: boolean,
            showBorder: boolean,
            showInlineText: boolean,
            showBackground: boolean
        };
        Background: {
            color: Color,
            opacity: number,
            // todo
        };
        Transition: {
            rotate: number,
        }
    }

    interface TextSetting extends GraphItemSetting, SvgStyleSetting {
        _type: 'text',
        _label: TextLabel,
        _points: PointObject[],
        _text: string
    }

    type GraphStateProp = 'isDeleted' | 'isSelf' | 'isAdd' | 'isSelected' | 'isMouseOn' | 'isEditing'
    type AllStateProp = 'isLock' | 'isDark' | 'isLoading' | 'isChanged' | 'isExplode' | 'isSavedIn5min' | GraphStateProp

    interface BaseState {
        isDeleted: boolean; // 是否被删除;
        [prop: string]: boolean;
    }

    interface GraphItemState extends BaseState {
        isAdd: boolean; // 是否是新建的
        isSelected: boolean; // 是否被选中
        isMouseOn: boolean; // 是否鼠标放置在上面
    }

    interface NodeState extends GraphItemState {

    }

    interface LinkState extends GraphItemState {
        // 暂时和Node一样
    }

    interface NoteState extends GraphItemState {
        isLock: boolean; //是否锁定
        isDark: boolean; //是否暗化
        isEditing: boolean; // 是否正在编辑
    }

    interface TextState extends GraphItemState {
        isEditing: boolean;
    }

    interface GraphState extends BaseState {
        isExplode: boolean; // 是否爆炸
    }
}
