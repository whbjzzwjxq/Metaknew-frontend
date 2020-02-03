import {InfoPart, localIdRegex} from "@/utils/graphClass";
import {SortProp} from "@/utils/interfaceInComponent";

export type cookieName = 'user_name' | 'user_id' | 'token';

export function getCookie(name: cookieName) {
    const arr = document.cookie.match(new RegExp(`(^| )${name}=([^;]*)(;|$)`));
    if (arr != null) {
        return unescape(arr[2])
    }
    return ''
}

// 设置cookie name为cookie的名字，value是值，expire为过期时间（天数）
export function setCookie(name: cookieName, value: string, expire: number) {
    const expireDays = new Date();
    expireDays.setDate(expireDays.getDate() + expire);
    document.cookie = `${name}=${encodeURI(value)}${(expire == null) ? '' : `;expires=${expireDays.toUTCString()};path=/`}`
}

// 删除cookie
export function delCookie(name: cookieName) {
    const exp = new Date();
    exp.setTime(exp.getTime() - 1);
    const currentCookie = getCookie(name);
    if (currentCookie != null) {
        document.cookie = `${name}=${currentCookie};expires=${exp.toUTCString()}; path=/`
    }
}

// 深拷贝
export function deepClone<T>(item: T): T {
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

    if (result === undefined) {
        if (item instanceof Array) {
            result = [];
            item.forEach((child: any, index: any) => {
                result[index] = deepClone(child);
            });
        } else if (item instanceof Node) {
            // testing that this is DOM
            if (item.nodeType && typeof item.cloneNode === 'function') {
                result = item.cloneNode(true);
            }
        } else if (item instanceof Object) { // check that this is a literal
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
            result = item
        }
    } else {
        result = item;
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
    let output = str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g);
    if (output) {
        let s = output.map(x => x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase()).join('');
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

export const minN = (arr: number[], n = 1) => [...arr].sort((a, b) => a - b).slice(0, n);
export const maxN = (arr: number[], n = 1) => [...arr].sort((a, b) => b - a).slice(0, n);

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

export function getInfoPart(_id: id, _type: GraphType, dataManager: DataManagerState) {
    let manager;
    _type === 'link'
        ? manager = dataManager.linkManager
        : _type === 'media'
        ? manager = dataManager.mediaManager
        : manager = dataManager.nodeManager;
    return manager[_id]
}

const blobRegex = new RegExp('blob:.*');

export const getSrc = (src: string | undefined) => {
    return src
        ? blobRegex.test(src)
            ? src
            : 'https://metaknew.oss-cn-beijing.aliyuncs.com/' + src
        : ''
};

export function mergeList<T>(list: Array<T[]>) {
    let output: T[] = [];
    list.map(value => {
        value.map(item => {
            output.push(item)
        })
    });
    return output
}

// 区别远端id和客户端id
export function idSort(idList: id[]): id[] {
    let remoteId: number[] = [];
    let localId: string[] = [];
    idList.map(id => {
        if (typeof id === 'number') {
            remoteId.push(id)
        } else {
            localIdRegex.test(id)
                ? localId.push(id)
                : remoteId.push(parseInt(id))
        }
    });

    function idStringSort(a: string, b: string) {
        const num = (a: string) => {
            return parseInt(a.substring(2))
        };
        return num(a) - num(b)
    }

    remoteId.sort();
    localId.sort(idStringSort);
    let result: id[] = [];
    result = result.concat(remoteId);
    result = result.concat(localId);
    return result
}

export function sortCtrl(sortType: SortProp): (a: any, b: any) => number {
    return (a: InfoPart, b: InfoPart): number => a.Ctrl[sortType] > b.Ctrl[sortType]
        ? 1
        : a.Ctrl[sortType] === b.Ctrl[sortType]
            ? 0
            : -1
}

export const sortByTime = (a: InfoPart, b: InfoPart) => {
    return a.Ctrl.UpdateTime > b.Ctrl.UpdateTime
        ? 1
        : a.Ctrl.UpdateTime === b.Ctrl.UpdateTime
            ? 0
            : -1
};

export const sortByLabel = (a: InfoPart, b: InfoPart) => {
    return a.PrimaryLabel > b.PrimaryLabel
        ? 1
        : a.PrimaryLabel === b.PrimaryLabel
            ? 0
            : -1
};

export const sortByName = (a: InfoPart, b: InfoPart) => {
    return a.Info.Name > b.Info.Name
        ? 1
        : a.Info.Name === b.Info.Name
            ? 0
            : -1
};

export const sortByIsStar = (a: UserConcern, b: UserConcern) => {
    return a.isStar > b.isStar
        ? 1
        : a.isStar === b.isStar
            ? 0
            : -1
};

export const currentTime = () => {
    let time = new Date();
    return time.getTime();
};

export const emptyGraph = () => {
    return {
        nodes: [],
        links: [],
        medias: [],
        texts: [],
        svgs: []
    } as Graph
};
