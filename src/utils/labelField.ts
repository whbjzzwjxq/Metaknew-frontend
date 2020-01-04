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

export function nodeLabelToProp(pLabel: string) {
    return nodePropType[pLabel]
        ? Object.assign({}, nodePropType[pLabel])
        : {};
}

export const availableLabel = Object.keys(nodePropType)
    .filter(label => label !== 'DocGraph');

export const topicItems = {
    recommend: ['Architecture', 'History', 'Modernism']
};

export const labelItems = {
    recommend: ['20century', 'important'],
    public: ['Todo', 'Done', 'Test', 'Draft', 'QuickServe']
};

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
