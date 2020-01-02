import {mainNationRegionEn} from '@/utils/nation';

export type FieldType = 'TextField' | 'ArrayField' | 'NumberField' | 'StringField' |
    'JsonField' | 'FileField' | 'ImageField' | 'BooleanField'

export const fieldTypes: FieldType[] = ['TextField', 'ArrayField', 'NumberField', 'StringField',
    'JsonField', 'FileField', 'ImageField', 'BooleanField'];

export type ResolveType = 'name' | 'time' | 'location' | 'normal'

export const resolveTypes: ResolveType[] = ['name', 'time', 'location', 'normal'];

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

export interface PropDescription {
    type: FieldType,
    resolve: ResolveType,
}

interface PLabelProps {
    [propName: string]: PropDescription
}

interface pLabelPropsDict {
    [pLabel: string]: PLabelProps
}

export const allPropType: pLabelPropsDict = {
    DocGraph:
        {
            MainNodes: {
                type: 'ArrayField',
                resolve: 'normal'
            },
            Size: {
                type: 'NumberField',
                resolve: 'normal'
            },
            Complete: {
                type: 'NumberField',
                resolve: 'normal'
            }
        },
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

export function neededProp(pLabel: string) {
    return allPropType[pLabel]
        ? Object.assign({}, allPropType[pLabel])
        : {};
}

export const availableLabel = Object.keys(allPropType)
    .filter(label => label !== 'link' && label !== 'DocGraph');

export const linkLabels = ['Include'];

export const topicItems = {
    recommend: ['Architecture', 'History', 'Modernism']
};

export const labelItems = {
    recommend: ['20century', 'important'],
    public: ['Todo', 'Done', 'Test', 'Draft', 'QuickServe']
};

// 不需要编辑的属性
export const unActivePropNode = [
    'PrimaryLabel', 'MainPic', 'IncludedMedia',
    'Name', 'Alias', 'Topic', 'Language',
    'Labels', 'Text', 'Translate',
    'MainNodes', 'Size', 'Complete',
    'BaseImp', 'BaseHardLevel', 'id', 'type',
    '$IsCommon', '$IsShared', '$IsOpenSource', 'isEdit',
    'dpiX', 'dpiY'
];

export const unActivePropLink = [
    'id', 'type', 'start',
    'end', 'Confidence', 'Text', 'PrimaryLabel',
    'Labels', '$_IsCommon', '$_IsShared', '$_IsOpenSource'
];

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
