import {mergeObject} from "@/utils/utils";
import {mergeSetting, SettingConfAll, SettingConfGroup} from "@/interface/style/interfaceStyleBase";

const xSetting = () => {
    return {
        x: {
            type: 'Number',
            default: 0.3,
            range: [0, 1],
            tips: '',
            explain: '横向坐标'
        }
    } as SettingConfGroup
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
    } as SettingConfGroup
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
    } as SettingConfGroup
};
const size = () => {
    return {
        size: {
            type: 'Number',
            default: 12,
            range: [12, 128],
            tips: '不能为0',
            explain: '可视化尺寸'
        },
    } as SettingConfGroup
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
    } as SettingConfGroup
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
    } as SettingConfGroup
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
    } as SettingConfGroup
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
    } as SettingConfGroup
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
    } as SettingConfGroup
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
    } as SettingConfGroup
};
const isMain = () => {
    return {
        isMain: {
            type: 'Boolean',
            default: false,
            range: '',
            tips: '合理地主要节点设置会提高内容可信度',
            explain: '是否是主要节点'
        }
    } as SettingConfGroup
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
    } as SettingConfGroup
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
    } as SettingConfGroup
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
    } as SettingConfGroup
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
    } as SettingConfGroup
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
    } as SettingConfGroup
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
    } as SettingConfGroup
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
    } as SettingConfGroup
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
    } as SettingConfGroup
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
    } as SettingConfGroup
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
    } as SettingConfGroup
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
    } as SettingConfGroup
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
    } as SettingConfGroup
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
    } as SettingConfGroup
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
    } as SettingConfGroup
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
    } as SettingConfGroup
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
    } as SettingConfGroup
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
    } as SettingConfGroup
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
    } as SettingConfGroup
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
    } as SettingConfGroup
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
    } as SettingConfGroup
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
    } as SettingConfGroup
};

const BaseSettingGroup = () => mergeSetting(xSetting(), ySetting(), size(), scaleX()) as SettingConfGroup;

const BorderSettingGroup = () => mergeSetting(borderColor(), borderOpacity(), borderWidth(), borderDashArray()) as SettingConfGroup;

const TextSettingGroup = () => mergeSetting(textSize(), textColor(), textBreak()) as SettingConfGroup;

const InlineTextSettingGroup = () => mergeSetting(inlineTextSize(), inlineTextColor(), inlineTextBreak()) as SettingConfGroup;

const nodeSetting = () => {
    let result = {
        Base: BaseSettingGroup(),
        View: mergeSetting(color(), opacity(), nodeViewType(), isMain()),
        Border: BorderSettingGroup(),
        Show: mergeSetting(showAll(), showBorder(), showName(), showBackground(), showInlineText(), showImage()),
        Text: mergeSetting(inlineText(), InlineTextSettingGroup(), text(), TextSettingGroup())
    };
    return result as SettingConfAll
};

const linkSetting: SettingConfAll = {
    View: mergeSetting(width(), color(), linkViewType(), linkDirect(), linkLocation(), isMain(), borderDashArray()),
    Arrow: {
        arrowLength: {
            type: 'Number',
            default: 18,
            range: [12, 24],
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

const graphSetting = () => ({
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
} as SettingConfAll);

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
                default: 0.6
            }
        }
    };
    mergeObject(result, replace);
    return result as SettingConfAll
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
    return result as SettingConfAll
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
    return result as SettingConfAll
};

const fragmentSetting = () => ({});

const pathSetting = () => ({});

export const typeSettingDictGraph: Record<AllType, SettingConfAll> = {
    'node': nodeSetting(),
    'link': linkSetting,
    'document': graphSetting(),
    'media': mediaSetting(),
    'text': textSetting(),
    'note': noteSetting(),
    'fragment': fragmentSetting(),
    'path': pathSetting()
};
