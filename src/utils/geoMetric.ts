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

const handler = {};

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
        if (this._start.equal(this._startCache)) {
            return this._start
        } else {
            this.cacheUpdate();
            this._startCache = {x: this._start.x, y: this._start.y};
            return this._start
        }
    }

    protected _startCache: PointObject;

    protected _end: Point;
    get end() {
        if (this._end.equal(this._endCache)) {
            return this._end
        } else {
            this.cacheUpdate();
            this._endCache = {x: this._end.x, y: this._end.y};
            return this._end
        }
    }

    protected _endCache: PointObject;

    protected _originRect: AreaRect;
    get originRect() {
        return this._originRect
    }

    protected _positiveRect: AreaRect;
    get positiveRect() {
        return this._positiveRect
    }

    protected _midPoint: PointObject;
    get midPoint() {
        return this._midPoint
    }

    border: number;

    constructor(_start: PointMixed, _end: PointMixed, border?: number) {
        let {x, y} = _start;
        this._start = new Point(x, y);
        this._startCache = {x, y} as PointObject;
        x = _end.x;
        y = _end.y;
        this._end = new Point(x, y);
        this._endCache = {x, y} as PointObject;
        border
            ? this.border = border
            : this.border = 2;
        this._originRect = getOriginRect(this._start, this._end);
        this._positiveRect = getPositiveRect(this._originRect);
        this._midPoint = getMidPoint(this._start, this._end);
    }

    cacheUpdate() {
        this._originRect = getOriginRect(this._start, this._end);
        this._positiveRect = getPositiveRect(this._originRect);
        this._midPoint = getMidPoint(this._start, this._end);
    }

    checkInRect(point: PointObject) {
        return checkInRect(this.positiveRect, point);
    }

    getDivCSS(css?: CSS.Properties): CSS.Properties {
        css || (css = {});
        css = Object.assign({
            borderWidth: this.border + 'px',
            borderColor: "black",
            borderStyle: "solid"
        }, css);
        return getDivCSS(this.positiveRect, css);
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

export const pointFunction = (point: PointObject, _func: Function) => {
    return {x: _func(point.y), y: _func(point.y)}
};

export type BorderType = 'top' | 'bottom' | 'left' | 'right' | 'proportion'
export const transformBorderToRect = (rect: AreaRect, border: number) => {
    let {x, y, width, height} = rect;
    let inner = 4;
    let result: Record<BorderType, AreaRect> = {
        'left': {x: inner, y: border, width: border, height},
        'right': {x: width + border - inner, y: border, width: border, height},
        'top': {x: inner, y: inner, width: width + 2 * border - 2 * inner, height: border},
        'bottom': {x: inner, y: height + border - inner, width: width + border, height: border},
        'proportion': {x: width + border - inner, width: border, y: height + border - inner, height: border}
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

export const getPositiveRect = (rect: AreaRect) => {
    let {x, y, width, height} = rect;
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
