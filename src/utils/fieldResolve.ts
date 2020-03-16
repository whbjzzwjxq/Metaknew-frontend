import {mainNationRegionEn} from '@/utils/nation';

// 不同种类的属性
export type FieldType = 'TextField' | 'ArrayField' | 'NumberField' | 'StringField' |
    'JsonField' | 'FileField' | 'ImageField' | 'BooleanField'

// 不同属性的resolve方式 名字 时间 地点 不resolve
export type ResolveType = 'name' | 'time' | 'location' | 'normal'

// 各种Field默认值
export let fieldDefaultValue: Record<FieldType, string | number | Object | boolean> = {
    'TextField': {},
    'ArrayField': [],
    'NumberField': 1,
    'StringField': '',
    'JsonField': {},
    'FileField': [],
    'ImageField': '',
    'BooleanField': true
};

// 描述属性的方式
export interface PropDescription {
    type: FieldType,
    resolve: ResolveType,
}

// 将已有value转化为描述形式
export interface ValueWithType<T> extends PropDescription {
    value: T
}

//描述已有属性 e.g. Name: {value: 'XXX', type: 'StringField', resolve: 'Name'}
export interface PropDescriptionDict {
    [propName: string]: PropDescription
}

//描述一个标签对应的一组属性
interface PLabelPropsDict {
    [pLabel: string]: PropDescriptionDict
}

// 额外的属性
export type ExtraProps = Record<string, ValueWithType<any>>

// 一个Source的属性由两部分组成：一部分是标准属性 系统定义 一部分是额外属性 用户定义
export type EditProps = {
    ExtraProps: ValueWithType<ExtraProps>,
    [prop: string]: ValueWithType<any>
}

// 每个node都有的属性
export const baseNodeProp: () => PropDescriptionDict = () => ({
    Name: {
        type: "StringField",
        resolve: "name"
    },
    Alias: {
        type: "ArrayField",
        resolve: "name"
    },
    Labels: {
        type: "ArrayField",
        resolve: "normal"
    },
    Topic: {
        type: "ArrayField",
        resolve: "normal"
    },
    Language: {
        type: "StringField",
        resolve: "normal"
    },
    Translate: {
        type: "TextField",
        resolve: "normal"
    },
    Description: {
        type: "TextField",
        resolve: "normal"
    },
    ExtraProps: {
        type: "JsonField",
        resolve: "normal"
    },
    BaseImp: {
        type: "NumberField",
        resolve: "normal"
    },
    BaseHardLevel: {
        type: "NumberField",
        resolve: "normal"
    },
    BaseUseful: {
        type: "NumberField",
        resolve: "normal"
    },
    IsOpenSource: {
        type: "BooleanField",
        resolve: "normal"
    },
    IsCommon: {
        type: "BooleanField",
        resolve: "normal"
    },
    IncludedMedia: {
        type: "FileField",
        resolve: 'normal'
    },
    MainPic: {
        type: "FileField",
        resolve: 'normal'
    }
});

// node的属性
export const nodePropType: PLabelPropsDict = {
    DocGraph:
        {},
    ArchProject:
        {
            PeriodStart: {
                type: 'StringField',
                resolve: 'time'
            },
            PeriodEnd: {
                type: 'StringField',
                resolve: 'time'
            },
            Nation: {
                type: 'StringField',
                resolve: 'location'
            },
            Leader: {
                type: 'ArrayField',
                resolve: 'name'
            },
            Location: {
                type: 'StringField',
                resolve: 'location'
            },
            WorkTeam: {
                type: 'ArrayField',
                resolve: 'name'
            }
        },
    Person:
        {
            DateOfBirth: {
                type: 'StringField',
                resolve: 'time'
            },
            DateOfDeath: {
                type: 'StringField',
                resolve: 'time'
            },
            BirthPlace: {
                type: 'StringField',
                resolve: 'location'
            },
            Nation: {
                type: 'StringField',
                resolve: 'location'
            },
            Job: {
                type: 'StringField',
                resolve: 'name'
            },
            Gender: {
                type: 'StringField',
                resolve: 'normal'
            }
        },
    Project:
        {
            PeriodStart: {
                type: 'StringField',
                resolve: 'time'
            },
            PeriodEnd: {
                type: 'StringField',
                resolve: 'time'
            },
            Nation: {
                type: 'StringField',
                resolve: 'location'
            },
            Leader: {
                type: 'ArrayField',
                resolve: 'name'
            }
        },
    BaseNode: {},
};

// link的属性
export const linkPropType: PLabelPropsDict = {
    Event: {
        Time: {
            type: "StringField",
            resolve: "time",
        },
        Location: {
            type: "StringField",
            resolve: "time"
        }
    },
};

export const mediaPropType: PLabelPropsDict = {
    // todo 媒体属性获取
};

export function nodeLabelToProp(pLabel: string) {
    return nodePropType[pLabel]
        ? Object.assign({}, nodePropType[pLabel])
        : {};
}

export var availableLabel = ['ArchProject', 'Person', 'Project', 'BaseNode', 'DocGraph', 'DocPaper'];

// 以下是预设 测试用
export const topicItems = {
    recommend: ['Architecture', 'History', 'Modernism']
};

export const labelItems = {
    recommend: ['20century', 'important'],
    public: ['Todo', 'Done', 'Test', 'Draft', 'QuickServe']
};

export type FieldSetting = Record<string, Record<string, any>>

// 属性的Setting DataTable用
export const fieldSetting: FieldSetting = {
    Name: {},
    Translate: {
        singleLine: true
    },
    Alias: {
        availableTags: {}
    },
    Topic: {
        availableTags: topicItems
    },
    Labels: {
        availableTags: labelItems
    },
    Nation: {
        selection: mainNationRegionEn,
        select: true,
        defaultValue: 'China'
    },
    Language: {
        selection: ['auto', 'zh', 'en'],
        select: true
    },
    Location: {
        defaultValue: 'Beijing'
    },
    PeriodStart: {
        defaultValue: '2000'
    },
    PeriodEnd: {
        defaultValue: '2010'
    },
    ExtraProps: {
        defaultValue: {
            $_new: {
                value: '',
                type: 'StringField',
                resolve: 'normal'
            }
        },
        width: '600'
    }
};
