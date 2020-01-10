import Vue from 'vue'
import * as CSS from 'csstype'

export interface PointObject {
    x: number,
    y: number,
}

export interface AreaRect extends PointObject {
    x: number,
    y: number,
    width: number,
    height: number,
}

export class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        return this;
    }

    update(point: PointMixed) {
        let {x, y} = point;
        this.x = x;
        this.y = y;
        return this
    }

    add(point: PointMixed) {
        this.x += point.x;
        this.y += point.y;
        return this
    }

    addRect(rect: { width: number, height: number }) {
        let {width, height} = rect;
        this.x += width;
        this.y += height;
        return this;
    }

    decrease(point: PointMixed) {
        this.x -= point.x;
        this.y -= point.y;
        return this
    }

    equal(point: PointMixed) {
        return this.x === point.x && this.y === point.y
    }

    multi(num: number) {
        this.x *= num;
        this.y *= num;
        return this;
    }

    multiRect(rect: { width: number, height: number }) {
        let {width, height} = rect;
        this.x *= width;
        this.y *= height;
        return this;
    }

    copy() {
        return new Point(this.x, this.y)
    }

    divide(num: number) {
        return this.multi(1 / num)
    }

    divideRect(rect: { width: number, height: number }) {
        let {width, height} = rect;
        this.x *= 1 / width;
        this.y *= 1 / height;
        return this
    }

    func(_func: Function) {
        this.x = _func(this.x);
        this.y = _func(this.y);
        return this
    }

    distance(point: PointMixed) {
        return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2))
    }

    commit() {
        Vue.set(this, 'x', this.x);
        Vue.set(this, 'y', this.y);
    }
}

export const getPoint = (point: PointMixed) => {
    return new Point(point.x, point.y)
};

export type PointMixed = Point | PointObject

export class RectByPoint {
    protected _start: Point;
    get start() {
        return this._start
    }

    protected _end: Point;
    get end() {
        return this._end
    }

    border: number;

    constructor(_start: PointMixed, _end: PointMixed, border?: number) {
        let {x, y} = _start;
        this._start = new Point(x, y);
        x = _end.x;
        y = _end.y;
        this._end = new Point(x, y);
        border
            ? this.border = border
            : this.border = 2;
    }

    originRect() {
        return getOriginRect(this._start, this._end)
    }

    positiveRect() {
        return getPositiveRect(this._start, this._end)
    }

    midPoint() {
        return getMidPoint(this._start, this._end)
    }

    checkInRect(point: PointObject) {
        return checkInRect(this.positiveRect(), point);
    }

    getDivCSS(css?: CSS.Properties): CSS.Properties {
        css || (css = {});
        css = Object.assign({
            borderWidth: this.border + 'px',
            borderColor: "black",
            borderStyle: "solid"
        }, css);
        return getDivCSS(this.positiveRect(), css);
    }

    updateFromArea(areaRect: AreaRect) {
        let {x, y, width, height} = areaRect;
        this._start.update({x, y});
        this._end.update({x: x + width, y: y + height});
        return this
    }

    static emptyRect() {
        return new RectByPoint({x: 0, y: 0}, {x: 0, y: 0}, 1)
    }
}

export const pointUpdate = (point: PointObject, payload: PointObject) => {
    Vue.set(point, 'x', payload.x);
    Vue.set(point, 'y', payload.y)
};

export const pointAdd = (pointA: PointObject, ...rest: PointObject[]) => {
    let delta = {x: 0, y: 0} as PointObject;
    rest.map(point => {
        delta.x += point.x;
        delta.y += point.y
    });
    return {
        x: pointA.x + delta.x,
        y: pointA.y + delta.y
    }
};

export const pointDecrease = (pointA: PointObject, ...rest: PointObject[]) => {
    let delta = {x: 0, y: 0} as PointObject;
    rest.map(point => {
        delta.x += point.x;
        delta.y += point.y
    });
    return {
        x: pointA.x - delta.x,
        y: pointA.y - delta.y
    }
};

export const pointNegative = (point: PointObject) => {
    return {
        x: -point.x,
        y: -point.y
    }
};

export const pointMultiple = (point: PointObject, ...rest: number[]) => {
    let delta = 1;
    rest.map(num => {
        delta *= num
    });
    return {
        x: point.x * delta,
        y: point.y * delta
    }
};

export const pointDistance = (pointA: PointObject, pointB: PointObject) => {
    return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2))
};

export type BorderType = 'top' | 'bottom' | 'left' | 'right' | 'proportion'

export const transformBorderToRect = (rect: AreaRect, border: number, inner: number) => {
    let {x, y, width, height} = rect;
    let result: Record<BorderType, AreaRect> = {
        'left': {x: 0, y: 0, width: border + inner, height: height + 2 * border},
        'right': {x: width + border - inner, y: 0, width: border + inner, height: height + 2 * border},
        'top': {x: 0, y: 0, width: width + 2 * border, height: border + inner},
        'bottom': {x: 0, y: height + border - inner, width: width + 2 * border, height: border + inner},
        'proportion': {x: width + border - inner, y: height + border - inner, width: border + inner, height: border + inner
        }
    };
    return result
};

export const getOriginRect = (pointA: PointMixed, pointB: PointMixed) => {
    return {
        x: pointA.x,
        y: pointA.y,
        width: pointB.x - pointA.x,
        height: pointB.y - pointA.y
    } as AreaRect
};

export const getPositiveRect = (pointA: PointMixed, pointB: PointMixed) => {
    let {x, y, width, height} = getOriginRect(pointA, pointB);
    return {
        x: width > 0 ? x : x + width,
        y: height > 0 ? y : y + height,
        width: Math.abs(width),
        height: Math.abs(height)
    } as AreaRect
};

export const getMidPoint = (pointA: PointMixed, pointB: PointMixed) => {
    return {
        x: (pointA.x + pointB.x) / 2,
        y: (pointA.y + pointB.y) / 2
    }
};

export const rectDiagonalDistance = (rect: AreaRect) => {
    return Math.sqrt(Math.pow(rect.width, 2) + Math.pow(rect.height, 2))
};

export const checkInRect = (rect: AreaRect, point: PointObject) => {
    let {x, y, width, height} = rect;
    return x <= point.x &&
        x + width >= point.x &&
        y <= point.y &&
        y + height >= point.y
};

export const getDivCSS = (rect: AreaRect, css?: CSS.Properties) => {
    css || (css = {});
    return Object.assign({
        position: "absolute",
        left: rect.x + 'px',
        top: rect.y + 'px',
        width: rect.width + 'px',
        height: rect.height + 'px',
    }, css)
};
