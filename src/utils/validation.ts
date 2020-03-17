import {checkDuplicate} from "@/utils/utils";
import {Rule} from "@/interface/interfaceInComponent";

export const validGroup = {
    'String': {
        'notNone': (slotName: string) => {
            return (v: string) => !!v || `${slotName} is required`
        },
        'emailCheck': () => {
            return (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid'
        },
        'phoneCheck': () => {
            return (v: string) => /[0-9]{11}/.test(v) || 'Phone should be 11 nums'
        },
        'messageCheck': () => {
            return (v: string) => /[0-9]{6}/.test(v) || 'Message should be 6 nums'
        },
        'minCheck': (slotName: string, min?: number) => {
            let activeMax: number;
            min === undefined
                ? (activeMax = -Infinity)
                : (activeMax = min);
            return (v: string) => (activeMax < v.length) || `${slotName} should more than ${activeMax}`
        },
        'maxCheck': (slotName: string, max?: number) => {
            let activeMax: number;
            max === undefined
                ? (activeMax = Infinity)
                : (activeMax = Math.trunc(max));
            return (v: string) => (activeMax > v.length) || `${slotName} should less than ${activeMax}`
        },

        'duplicate': (stringPool: string[]) => {
            return (v: string) => !checkDuplicate(stringPool, v) || `Duplicate String!`
        },

        'badChar': (reg?: RegExp) => {
            let regex: RegExp;
            reg === undefined
                ? (regex = /[\\:*?"<>|]/)
                : (regex = reg);
            return (v: string) => !regex.exec(v) || 'BadChar detected'
        }
    },

    'Number': {
        'minCheck': (slotName: string, min: number = -Infinity) => {
            return (v: number) => (min <= v) || `${slotName} should more than ${min}`
        },
        'maxCheck': (slotName: string, max: number = Infinity) => {
            return (v: number) => (v <= max) || `${slotName} should less than ${max}`
        },
        'int': () => {
            return (v: number) => v % 1 === 0 || 'Int required'
        }
    }
};

export function outputRuleCheck<T>(rules: Rule<T>[], value: T) {
    return rules.map(rule => rule(value)).filter(result => result !== true)
};
