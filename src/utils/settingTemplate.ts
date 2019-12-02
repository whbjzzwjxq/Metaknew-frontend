import {getCookie, randomNumberInRange} from '@/utils/utils';
import {NodeSettingPart, baseType} from '@/utils/graphClass';
let globalIndex = 0;
type settingConf = Record<string, Record<string, baseSettingConf>>

export interface baseSettingConf {
  type: string,
  default: any,
  range: Array<any> | '',
  tips: string,
  required: any,
  explain: string
}

export const nodeSetting: settingConf = {
  Base: {
    size: {
      type: 'Number',
      default: 0,
      range: [10, 48],
      tips: '如果为0则会根据综合指标体现大小',
      required: null,
      explain: '节点可视化尺寸'
    },
    scaleX: {
      type: 'Number',
      default: 1,
      range: [0.2, 5],
      tips: '',
      required: null,
      explain: '宽度与高度之比'
    },
    x: {
      type: 'Number',
      default: 0.3,
      range: [0, 1],
      tips: '',
      required: null,
      explain: '节点横向坐标'
    },
    y: {
      type: 'Number',
      default: 0.3,
      range: [0, 1],
      tips: '',
      required: null,
      explain: '节点纵向坐标'
    },
    color: {
      type: 'Color',
      default: '#000000',
      range: '',
      tips: '没有图片时才会呈现纯色',
      required: null,
      explain: '节点颜色'
    },
    opacity: {
      type: 'Number',
      default: 1,
      range: [0.2, 1],
      tips: '',
      required: null,
      explain: '节点透明度'
    },
    type: {
      type: 'String',
      default: 'rectangle',
      range: ['rectangle', 'rhombus', 'ellipse'],
      tips: '具体形状可以通过宽高比控制',
      required: null,
      explain: '节点形状'
    },
    isMain: {
      type: 'Boolean',
      default: true,
      range: '',
      tips: '合理地主要节点设置会提高内容可信度',
      required: null,
      explain: '是否是主要节点'
    }
  },
  Border: {
    width: {
      type: 'Number',
      default: 3,
      range: [1, 8],
      tips: '',
      required: null,
      explain: '描边宽度'
    },
    color: {
      type: 'Color',
      default: '',
      range: '',
      tips: '如果不设置颜色则颜色会根据节点类型产生',
      required: null,
      explain: '描边颜色'
    },
    isDash: {
      type: 'Boolean',
      default: false,
      range: '',
      tips: '',
      required: null,
      explain: '描边是否是虚线'
    }
  },
  Show: {
    showAll: {
      type: 'Boolean',
      default: true,
      range: '',
      tips: '',
      required: null,
      explain: '整体可视'
    },
    showName: {
      type: 'Boolean',
      default: true,
      range: '',
      tips: '',
      required: null,
      explain: '名字是否可视'
    },
    showPic: {
      type: 'Boolean',
      default: true,
      range: '',
      tips: '',
      required: null,
      explain: '图片是否可视'
    },
    showBorder: {
      type: 'Boolean',
      default: true,
      range: '',
      tips: '',
      required: null,
      explain: '边框是否可视'
    },
    showColor: {
      type: 'Boolean',
      default: true,
      range: '',
      tips: '如果关闭就以文字形式呈现',
      required: null,
      explain: '颜色填充是否可视'
    },
    showInlineText: {
      type: 'Boolean',
      default: true,
      range: '',
      tips: '',
      required: null,
      explain: '内部文字是否可视'
    }
  },
  Text: {
    inlineText: {
      type: 'Text',
      default: '',
      range: '',
      tips: '',
      required: null,
      explain: '显示在节点内的文字'
    },
    inlineTextColor: {
      type: 'Color',
      default: '#FFFFFF',
      range: '',
      tips: '',
      required: null,
      explain: '节点内文字颜色'
    },
    inlineTextSize: {
      type: 'Number',
      default: 12,
      range: [8, 20],
      tips: '',
      required: null,
      explain: '节点内文字尺寸'
    },
    inlineTwoline: {
      type: 'Boolean',
      default: false,
      range: '',
      tips: '',
      required: null,
      explain: '节点内文字是否两行显示'
    },
    textSize: {
      type: 'Number',
      default: 14,
      range: [8, 20],
      tips: '',
      required: null,
      explain: '节点名字尺寸'
    },
    textColor: {
      type: 'Color',
      default: '#000000',
      range: '',
      tips: '',
      required: null,
      explain: '节点名字颜色'
    },
    twoLine: {
      type: 'Boolean',
      default: false,
      range: '',
      tips: '',
      required: null,
      explain: '名字是否两行显示'
    }
  }
};

export const linkSetting: settingConf = {
  Base: {
    width: {
      type: 'Number',
      default: 5,
      range: [1, 10],
      tips: '',
      required: null,
      explain: '线条宽度'
    },
    color: {
      type: 'Color',
      default: '#000000',
      range: '',
      tips: '',
      required: null,
      explain: '线条颜色'
    },
    type: {
      type: 'String',
      default: 'linear',
      range: ['linear', 'curve', 'polyline'],
      tips: '直线，曲线，折线',
      required: null,
      explain: '线条样式'
    },
    direct: {
      type: 'String',
      default: 'top',
      range: ['top', 'bottom'],
      tips: '线条控制点方向',
      required: null,
      explain: '线条方向'
    },
    isDash: {
      type: 'Boolean',
      default: false,
      range: '',
      tips: '',
      required: null,
      explain: '是否是虚线'
    },
    startLoc: {
      type: 'String',
      default: 'top',
      range: ['top', 'bottom', 'left', 'right', 'center'],
      tips: '起点节点的位置',
      required: null,
      explain: '起点位置'
    },
    endLoc: {
      type: 'String',
      default: 'top',
      range: ['top', 'bottom', 'left', 'right', 'center'],
      tips: '终点节点的位置',
      required: null,
      explain: '终点位置'
    },
    isMain: {
      type: 'Boolean',
      default: true,
      range: '',
      tips: '合理地主要节点设置会提高内容可信度',
      required: null,
      explain: '是否是主要节点'
    }
  },
  Arrow: {
    arrowLength: {
      type: 'Number',
      default: 14,
      range: [8, 24],
      tips: '',
      required: null,
      explain: '箭头长度'
    },
    arrowColor: {
      type: 'Color',
      default: '#000000',
      range: '',
      tips: '',
      required: null,
      explain: '箭头颜色'
    },
    showArrow: {
      type: 'Boolean',
      default: false,
      range: '',
      tips: '',
      required: null,
      explain: '是否显示箭头'
    }
  },
  Text: {
    extraText: {
      type: 'Text',
      default: '',
      range: '',
      tips: '可以选择前置还是后置',
      required: null,
      explain: '额外显示的文字'
    },
    prefix: {
      type: 'String',
      default: '',
      range: ['append', 'prepend'],
      tips: '',
      required: null,
      explain: '额外文字的位置'
    },
    textLocationX: {
      type: 'Number',
      default: 0.5,
      range: [0.1, 0.9],
      tips: '值越小越靠近起始节点',
      required: null,
      explain: '标签的横向位置'
    },
    textLocationY: {
      type: 'Number',
      default: 0.5,
      range: [0.1, 0.9],
      tips: '值越小越靠近起始节点',
      required: null,
      explain: '标签的纵向位置'
    },
    textColor: {
      type: 'Color',
      default: '#000000',
      range: '',
      tips: '',
      required: null,
      explain: '标签颜色'
    }
  }
};

export const documentSetting: settingConf = {
  Base: {
    background: {
      type: 'String',
      default: '',
      range: ['galaxy-1', 'galaxy-2', 'galaxy-3'],
      tips: '暂未开放',
      required: null,
      explain: '背景图'
    },
    backgroundColor: {
      type: 'Color',
      default: '#eeeeee',
      range: '',
      tips: '暂未开放',
      required: null,
      explain: '背景颜色'
    },
    theme: {
      type: 'String',
      default: '',
      range: ['galaxy-1', 'galaxy-2', 'galaxy-3'],
      tips: '暂未开放',
      required: null,
      explain: '主题'
    },
    defaultMode: {
      type: 'String',
      default: '',
      range: ['normal', 'imp', 'geo', 'time'],
      tips: '暂未开放',
      required: null,
      explain: '默认模式'
    }
  }
};

export const mediaSetting: settingConf = {
  Base: {
    size: {
      type: 'Number',
      default: 300,
      range: [50, 400],
      tips: '不能为0',
      required: null,
      explain: '节点可视化尺寸'
    },
    scaleX: {
      type: 'Number',
      default: 0.6,
      range: [0.2, 5],
      tips: '',
      required: null,
      explain: '宽度与高度之比'
    },
    x: {
      type: 'Number',
      default: 0.3,
      range: [0, 1],
      tips: '',
      required: null,
      explain: '节点横向坐标'
    },
    y: {
      type: 'Number',
      default: 0.3,
      range: [0, 1],
      tips: '',
      required: null,
      explain: '节点纵向坐标'
    },
    opacity: {
      type: 'Number',
      default: 1,
      range: [0.2, 1],
      tips: '',
      required: null,
      explain: '节点透明度'
    },
    isMain: {
      type: 'Boolean',
      default: true,
      range: '',
      tips: '合理地主要节点设置会提高内容可信度',
      required: null,
      explain: '是否是主要节点'
    }
  },
  Border: {
    width: {
      type: 'Number',
      default: 3,
      range: [1, 8],
      tips: '',
      required: null,
      explain: '描边宽度'
    },
    color: {
      type: 'Color',
      default: '',
      range: '',
      tips: '如果不设置颜色则颜色会根据节点类型产生',
      required: null,
      explain: '描边颜色'
    },
    isDash: {
      type: 'Boolean',
      default: false,
      range: '',
      tips: '',
      required: null,
      explain: '描边是否是虚线'
    }
  },
  Show: {
    showAll: {
      type: 'Boolean',
      default: true,
      range: '',
      tips: '',
      required: null,
      explain: '整体可视'
    },
    showName: {
      type: 'Boolean',
      default: true,
      range: '',
      tips: '',
      required: null,
      explain: '名字是否可视'
    },
    showBorder: {
      type: 'Boolean',
      default: true,
      range: '',
      tips: '',
      required: null,
      explain: '边框是否可视'
    },
    showInlineText: {
      type: 'Boolean',
      default: true,
      range: '',
      tips: '',
      required: null,
      explain: '内部文字是否可视'
    },
    showAppendText: {
      type: 'Boolean',
      default: true,
      range: '',
      tips: '',
      required: null,
      explain: '附加文字是否可视'
    }
  },
  Text: {
    inlineText: {
      type: 'Text',
      default: '',
      range: '',
      tips: '',
      required: null,
      explain: '显示在节点内的文字'
    },
    inlineTextColor: {
      type: 'Color',
      default: '#FFFFFF',
      range: '',
      tips: '',
      required: null,
      explain: '节点内文字颜色'
    },
    inlineTextSize: {
      type: 'Number',
      default: 12,
      range: [8, 20],
      tips: '',
      required: null,
      explain: '节点内文字尺寸'
    },
    inlineTwoline: {
      type: 'Boolean',
      default: false,
      range: '',
      tips: '',
      required: null,
      explain: '节点内文字是否两行显示'
    },
    appendText: {
      type: 'Text',
      default: '',
      range: '',
      tips: '',
      required: null,
      explain: '显示在媒体下的文字'
    },
    appendTextColor: {
      type: 'Color',
      default: '#FFFFFF',
      range: '',
      tips: '',
      required: null,
      explain: '显示在媒体下的文字颜色'
    },
    appendTextSize: {
      type: 'Number',
      default: 12,
      range: [8, 20],
      tips: '',
      required: null,
      explain: '显示在媒体下的文字尺寸'
    },
    textSize: {
      type: 'Number',
      default: 14,
      range: [8, 20],
      tips: '',
      required: null,
      explain: '节点名字尺寸'
    },
    textColor: {
      type: 'Color',
      default: '#000000',
      range: '',
      tips: '',
      required: null,
      explain: '节点名字颜色'
    },
    twoLine: {
      type: 'Boolean',
      default: false,
      range: '',
      tips: '',
      required: null,
      explain: '名字是否两行显示'
    }
  }

};

export const typeSetting: Record<baseType, settingConf> = {
  'node': nodeSetting,
  'link': linkSetting,
  'document': documentSetting,
  'media': mediaSetting
};

export function settingTemplate(_type: baseType) {
  let settingConf = typeSetting[_type];
  const specialDict: { [prop: string]: any } = {
    'x': randomNumberInRange(0.3, 0.7),
    'y': randomNumberInRange(0.3, 0.7)
  };
  let result: { [prop: string]: Object } = {};
  Object.entries(settingConf).forEach(([key, value]) => {
    let settingInstance: { [prop: string]: any } = {};
    Object.entries(value).forEach(([settingName, settingConf]) => {
      const name = settingName;
      specialDict[name] === undefined
        ? (settingInstance[name] = settingConf.default)
        : (settingInstance[name] = specialDict[name]);
    });
    result[key] = settingInstance
  });
  return result
}

export function noteTemplate() {
  const id = `$_${globalIndex}`;
  globalIndex += 1;
  return {
    Setting: {
      _id: id,
      _type: 'note',
      Base: {
        x: randomNumberInRange(0.2, 0.8),
        y: randomNumberInRange(0.2, 0.8),
        opacity: 0.5,
        width: 300,
        height: 200,
        dark: true
      }
    },
    Info: {
      Content: '',
      DocumentId: '0'
    },
    isDeleted: false
  };
}
