import {GraphConf, LinkSettingPart, MediaSettingPart, NodeSettingPart, SvgSettingPart} from "@/class/graphItem";
import {NoteSettingPart} from "@/class/userConcern";

export type SettingGroup = Record<string, BaseSettingConf>
export type SettingAll = Record<string, SettingGroup>
export interface BaseSettingConf {
    type: 'Number' | 'Boolean' | 'Text' | 'Color' | 'String',
    default: any,
    range: Array<any> | '',
    tips: string,
    explain: string
}

const BaseSettingGroup = () => ({
    x: {
        type: 'Number',
        default: 0.3,
        range: [0, 1],
        tips: '',
        explain: '节点横向坐标'
    },
    y: {
        type: 'Number',
        default: 0.3,
        range: [0, 1],
        tips: '',
        explain: '节点纵向坐标'
    }
}) as SettingGroup;

const BorderSettingGroup = () => ({
    width: {
        type: 'Number',
        default: 3,
        range: [1, 8],
        tips: '',
        explain: '描边宽度'
    },
    color: {
        type: 'Color',
        default: '',
        range: '',
        tips: '如果不设置颜色则颜色会根据节点类型产生',
        explain: '描边颜色'
    },
    isDash: {
        type: 'Boolean',
        default: false,
        range: '',
        tips: '',
        explain: '描边是否是虚线'
    }
}) as SettingGroup;

const InlineTextSettingGroup = () => ({
    inlineText: {
        type: 'Text',
        default: '',
        range: '',
        tips: '',
        explain: '显示在节点内的文字'
    },
    inlineTextColor: {
        type: 'Color',
        default: '#FFFFFF',
        range: '',
        tips: '',
        explain: '节点内文字颜色'
    },
    inlineTextSize: {
        type: 'Number',
        default: 12,
        range: [8, 20],
        tips: '',
        explain: '节点内文字尺寸'
    },
    inlineTextBreak: {
        type: 'Boolean',
        default: false,
        range: '',
        tips: '',
        explain: '节点内文字是否换行显示'
    },
}) as SettingGroup;

const TextSettingGroup = () => ({
    textSize: {
        type: 'Number',
        default: 14,
        range: [8, 20],
        tips: '',
        explain: '节点名字尺寸'
    },
    textColor: {
        type: 'Color',
        default: '#000000',
        range: '',
        tips: '',
        explain: '节点名字颜色'
    },
    textBreak: {
        type: 'Boolean',
        default: false,
        range: '',
        tips: '',
        explain: '名字是否换行显示'
    }
}) as SettingGroup;

const ShowSettingGroup = () => ({
    showAll: {
        type: 'Boolean',
        default: true,
        range: '',
        tips: '',
        explain: '整体可视'
    },
    showName: {
        type: 'Boolean',
        default: true,
        range: '',
        tips: '',
        explain: '名字是否可视'
    },
    showBorder: {
        type: 'Boolean',
        default: true,
        range: '',
        tips: '',
        explain: '边框是否可视'
    },
    showInlineText: {
        type: 'Boolean',
        default: true,
        range: '',
        tips: '',
        explain: '内部文字是否可视'
    }
}) as SettingGroup;

const nodeSetting: SettingAll = {
    Base: Object.assign({
        size: {
            type: 'Number',
            default: 18,
            range: [6, 64],
            tips: '不能为0',
            explain: '节点可视化尺寸'
        },
        scaleX: {
            type: 'Number',
            default: 1,
            range: [0.2, 5],
            tips: '',
            explain: '宽度与高度之比'
        },
    }, BaseSettingGroup()),
    View: {
        color: {
            type: 'Color',
            default: '#000000',
            range: '',
            tips: '没有图片时才会呈现纯色',
            explain: '节点颜色'
        },
        opacity: {
            type: 'Number',
            default: 1,
            range: [0.2, 1],
            tips: '',
            explain: '节点透明度'
        },
        viewType: {
            type: 'String',
            default: 'rectangle',
            range: ['rectangle', 'rhombus', 'ellipse'],
            tips: '具体形状可以通过宽高比控制',
            explain: '节点形状'
        },
        isMain: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '合理地主要节点设置会提高内容可信度',
            explain: '是否是主要节点'
        }
    },
    Border: BorderSettingGroup(),
    Show: Object.assign(
        ShowSettingGroup(), {
            showImage: {
                type: 'Boolean',
                default: true,
                range: '',
                tips: '',
                explain: '图片是否可视'
            },
            showFill: {
                type: 'Boolean',
                default: true,
                range: '',
                tips: '如果关闭就以文字形式呈现',
                explain: '颜色填充是否可视'
            }
        }),
    Text: Object.assign(
        TextSettingGroup(),
        InlineTextSettingGroup()
    )
};

const linkSetting: SettingAll = {
    View: {
        width: {
            type: 'Number',
            default: 2,
            range: [1, 10],
            tips: '',
            explain: '线条宽度'
        },
        color: {
            type: 'Color',
            default: '#000000',
            range: '',
            tips: '',
            explain: '线条颜色'
        },
        type: {
            type: 'String',
            default: 'linear',
            range: ['linear', 'curve', 'polyline'],
            tips: '直线，曲线，折线',
            explain: '线条样式'
        },
        direct: {
            type: 'String',
            default: 'top',
            range: ['top', 'bottom'],
            tips: '线条控制点方向',
            explain: '线条方向'
        },
        isDash: {
            type: 'Boolean',
            default: false,
            range: '',
            tips: '',
            explain: '是否是虚线'
        },
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
        isMain: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '合理地主要节点设置会提高内容可信度',
            explain: '是否是主要节点'
        }
    },
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

const mediaSetting: SettingAll = {
    Base: Object.assign({
        size: {
            type: 'Number',
            default: 300,
            range: [50, 400],
            tips: '不能为0',
            explain: '节点可视化尺寸'
        },
        scaleX: {
            type: 'Number',
            default: 0.6,
            range: [0.2, 5],
            tips: '',
            explain: '宽度与高度之比'
        },
    }, BaseSettingGroup()),
    Border: BorderSettingGroup(),
    Show: Object.assign(ShowSettingGroup(), {
        showAppendText: {
            type: 'Boolean',
            default: true,
            range: '',
            tips: '',
            explain: '附加文字是否可视'
        }
    }),
    Text: Object.assign(
        TextSettingGroup(),
        InlineTextSettingGroup(),
        {
            appendText: {
                type: 'Text',
                default: '',
                range: '',
                tips: '',
                explain: '显示在媒体下的文字'
            },
            appendTextColor: {
                type: 'Color',
                default: '#FFFFFF',
                range: '',
                tips: '',
                explain: '显示在媒体下的文字颜色'
            },
            appendTextSize: {
                type: 'Number',
                default: 12,
                range: [8, 20],
                tips: '',
                explain: '显示在媒体下的文字尺寸'
            },
        })
};

const noteSetting: SettingAll = {
    Base: BaseSettingGroup()
};

const svgSetting: SettingAll = {
    Base: BaseSettingGroup(),
    Text: Object.assign(InlineTextSettingGroup(), {
        InlineTextWeight: {
            type: "String",
            range: ["Black", "Bold", "Medium", "Normal", "Light", "Thin"],
            default: "Normal",
            explain: "字重",

        }
    })
};

const fragmentSetting = {};

const pathSetting = {};

export const typeSetting: Record<SourceType, SettingAll> = {
    'node': nodeSetting,
    'link': linkSetting,
    'document': documentSetting,
    'media': mediaSetting,
    'svg': svgSetting,
    'note': noteSetting,
    'fragment': fragmentSetting,
    'path': pathSetting
};

declare global {
    // 从视觉上来说是Node的对象
    type VisNodeSettingPart = NodeSettingPart | MediaSettingPart;
    // 所有Item对象
    type GraphSubItemSettingPart = VisNodeSettingPart | LinkSettingPart | SvgSettingPart;
    // 所有Setting对象
    type AllSettingPart = GraphSubItemSettingPart | NoteSettingPart | GraphConf;

    //SettingPart相关

    interface Setting {
        _id: id;
        _type: SourceType;
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
            showFill: boolean;
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
    type LinkPointLocation = 'top'| 'bottom'| 'left'| 'right'| 'center'

    interface LinkStyleSetting {
        View: {
            width: number;
            color: Color;
            viewType: LinkViewType;
            direct: 'top' | 'bottom';
            startLoc: LinkPointLocation;
            endLoc: LinkPointLocation;
            isDash: boolean;
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
        Show:{
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

    interface compressLinkSetting extends GraphItemSetting, LinkStyleSetting {
        _start: GraphItemSetting;
        _end: GraphItemSetting;
    }

    interface GraphSetting extends GraphItemSetting {
        _type: 'document';
        Base: Record<string, any>
    }

    interface NoteSetting extends GraphItemSetting {
        _type: 'note';
        _title: string;
        _content: string;
        Base: BaseSize;
    }

    type SvgPolyGon = 'triangle' | 'rhombus' | 'pentagon' | 'hexagon' | 'octagon'
    type SvgLine = 'line' | 'curve' | 'polyline'
    type SvgStandard = 'rect' | 'ellipse'
    type SvgLabel = SvgPolyGon | SvgLine | SvgStandard

    interface SvgStyleSetting {
        Base: BaseSize;
        Border: {

        };
        Text: {

        }
    }

    interface SvgSetting extends GraphItemSetting {
        _type: 'svg';
        _label: SvgLabel;
        Base: {}
    }

    type GraphStateProp = 'isDeleted' | 'isSelf' | 'isAdd' | 'isSelected' | 'isMouseOn' | 'isEditing'
    type AllStateProp = 'isLock' | 'isDark' | 'isLoading' | 'isChanged' | 'isExplode' | 'isSavedIn5min' | GraphStateProp

    interface BaseState {
        isDeleted: boolean; // 是否被删除;
        isSelf: boolean; // 是否是自己的内容
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

    interface SvgState extends GraphItemState {
        isEditing: boolean;
    }

    interface TextState extends GraphItemState {

    }

    interface GraphState extends BaseState {
        isChanged: boolean; // 是否变化
        isSavedIn5min: boolean; // 5分钟内是否保存
        isExplode: boolean; // 是否爆炸
    }
}
