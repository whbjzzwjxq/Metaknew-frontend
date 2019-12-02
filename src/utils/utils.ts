// 获取指定名称的cookie值
// (^| )name=([^;]*)(;|$),match[0]为与整个正则表达式匹配的字符串
// match[i]为正则表达式捕获数组相匹配的数组；

import {MediaInfoPart} from "@/utils/graphClass";

export function getCookie(name: string) {
    const arr = document.cookie.match(new RegExp(`(^| )${name}=([^;]*)(;|$)`));
    if (arr != null) {
        return unescape(arr[2])
    }
    return ''
}

// 设置cookie name为cookie的名字，value是值，expire为过期时间（天数）
export function setCookie(name: string, value: string, expire: number) {
    const expireDays = new Date();
    expireDays.setDate(expireDays.getDate() + expire);
    document.cookie = `${name}=${encodeURI(value)}${(expire == null) ? '' : `;expires=${expireDays.toUTCString()};path=/`}`
}

// 删除cookie
export function delCookie(name: string) {
    const exp = new Date();
    exp.setTime(exp.getTime() - 1);
    const currentCookie = getCookie(name);
    if (currentCookie != null) {
        document.cookie = `${name}=${currentCookie};expires=${exp.toUTCString()}; path=/`
    }
}

// 深拷贝
export default function deepClone(item: any) {
    // null, undefined values check
    if (!item) {
        return item;
    }
    const types = [Number, String, Boolean];
    let result: any;

    // normalizing primitives if someone did new String('aaa'), or new Number('444');
    types.forEach((type) => {
        if (item instanceof type) {
            result = type(item);
        }
    });

    if (typeof result === 'undefined') {
        if (Object.prototype.toString.call(item) === '[object Array]') {
            result = [];
            item.forEach((child: any, index: any) => {
                result[index] = deepClone(child);
            });
        } else if (typeof item === 'object') {
            // testing that this is DOM
            if (item.nodeType && typeof item.cloneNode === 'function') {
                result = item.cloneNode(true);
            } else if (!item.prototype) { // check that this is a literal
                if (item instanceof Date) {
                    result = new Date(item);
                } else {
                    // it is an object literal
                    result = {};
                    Object.entries(item)
                        .forEach(([prop, value]) => {
                            result[prop] = deepClone(value);
                        });
                }
            } else {
                // depending what you would like here,
                // just keep the reference, or create new object
                // item.constructor
                //   ? (result = new item.constructor())
                //   : (result = item);
            }
        } else {
            result = item;
        }
    }
    return result;
}

// PascalCase
export function ToPascalCase(str: string) {
    let output = str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g);
    if (output) {
        return output.map(x => x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase()).join('')
    } else {
        return ''
    }
}

export function toCamelCase(str: string) {
    let output = str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    if (output) {
        let s = output.map(x => x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase()).join('')
        return s.slice(0, 1).toLowerCase() + s.slice(1);
    } else {
        return ''
    }
}

export function guid() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16)
            .substring(1);
    }

    return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
}

export const randomNumberInRange = (min: number, max: number) => Math.random() * (max - min) + min;

export const indexToColor = (index: number) => rainBowColor[index % 7];

const rainBowColor = [
    'red darken-2',
    'orange darken-2',
    'yellow darken-2',
    'green darken-2',
    'blue darken-2',
    'deep-purple darken-2',
    'black darken-2'
];

export const checkDuplicate = (arr: Array<any>, checkItem: any) => arr.filter(item => item === checkItem).length >= 2;
export const randomIntegerInRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
export const darkColorScaleSet =
    ["#ed9baf", "#edb79b", "#ede79b",
        "#b7da77", "rgb(39,159,125)", "#bfe6f3",
        "#bfc1f3", "#c6b5f2", "#a5a5a5"];

export const checkExist = (arr: Array<any>, item: any) => arr.indexOf('$_any') > -1
    ? true
    : arr.indexOf('$_none') > -1
        ? false
        : arr.indexOf(item) > -1;

export const test = (list: (MediaInfoPart | undefined)[]) => {
    return list.filter(item => item instanceof MediaInfoPart)
};

export const MB = 1000000;
export function fileCheck(file: File, size?: number, formats?: string[], filePool?: File[]) {
    let nameSplit = file.name.split('.');
    let fileName: string;
    let fileFormat: string;
    let reg = new RegExp('[\\\\:*?"<>|]');
    nameSplit.length === 2
        ? [fileName, fileFormat] = nameSplit
        : [fileName, fileFormat] = ['unknown', 'unknown'];
    const rules = [
        () => !file ? '文件上传失败' : '',
        () => nameSplit.length !== 2 ? '文件名不合法，存在多个 .' : '',
        () => formats
            ? !checkExist(formats, fileFormat.toLowerCase()) ? '文件格式不符合要求' : ''
            : '',
        () => filePool
            ? checkExist(filePool.map(file => file.name), fileName)
                ? '已经有同名文件存在于文件集合中'
                : ''
            : '',
        () => fileName === '' || fileName === 'unknown'
            ? '文件名不能为空或者未识别'
            : '',
        () => reg.test(fileName)
            ? '文件名包含非法字符'
            : '',
        () => size && file.size > size
            ? '文件大小超过' + (size / MB) + 'MB'
            : ''
    ];
    return rules.map(rule => rule()).filter(result => result !== '')
}
