import {mainNationRegionEn} from '@/utils/nation';

export type FieldType = 'TextField' | 'ArrayField' | 'NumberField' | 'StringField' |
    'JsonField' | 'FileField' | 'ImageField' | 'BooleanField' // 不同种类的属性

export type ResolveType = 'name' | 'time' | 'location' | 'normal' // 属性不同的resolve方式

export let fieldDefaultValue: Record<FieldType, string | number | Object | boolean> = {
    'TextField': {},
    'ArrayField': [],
    'NumberField': 1,
    'StringField': '',
    'JsonField': {},
    'FileField': [],
    'ImageField': '',
    'BooleanField': true
}; // 默认值

export interface PropDescription {
    type: FieldType,
    resolve: ResolveType,
} // 描述属性的方式

export interface ValueWithType<T> extends PropDescription {
    value: T,
} // 将已有value转化为描述形式

interface PLabelProps {
    [propName: string]: PropDescription
} //描述已有属性

interface pLabelPropsDict {
    [pLabel: string]: PLabelProps
} //描述一个标签对应的一组属性

export type ExtraProps = Record<string, ValueWithType<any>> // 额外的属性

export type EditProps = {
    ExtraProps: ValueWithType<ExtraProps>,
    [prop: string]: ValueWithType<any>
} // 一个Source的属性由两部分组成：一部分是标准属性 系统定义 一部分是额外属性 用户定义

// node的属性
export const nodePropType: pLabelPropsDict = {
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
    $Fragment: {}
};

// link的属性
export const linkPropType: pLabelPropsDict = {
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

export const mediaPropType: pLabelPropsDict = {
    // todo 媒体属性获取
};

export function nodeLabelToProp(pLabel: string) {
    return nodePropType[pLabel]
        ? Object.assign({}, nodePropType[pLabel])
        : {};
}

export const availableLabel = Object.keys(nodePropType)
    .filter(label => label !== 'DocGraph');

// 以下是预设 测试用
export const topicItems = {
    recommend: ['Architecture', 'History', 'Modernism']
};

export const labelItems = {
    recommend: ['20century', 'important'],
    public: ['Todo', 'Done', 'Test', 'Draft', 'QuickServe']
};

export const fieldSetting: Record<string, any> = {
    Name: {},
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
