import Vue from 'vue'
import * as CSS from 'csstype'

export interface Point {
    x: number,
    y: number
}

export interface AreaRect extends Point {
    x: number,
    y: number,
    width: number,
    height: number,
}

export type BorderType = 'top' | 'bottom' | 'left' | 'right' | 'proportion'

export class RectByPoint {
    protected _start: Point;
    get start(): Point {
        return this._start
    }

    set start(payload) {
        pointUpdate(this._start, payload)
    }

    protected _end: Point;
    get end(): Point {
        return this._end
    }

    set end(payload) {
        pointUpdate(this._end, payload)
    }

    border ?: number;

    constructor(start: Point, end: Point, border?: number) {
        this._start = start;
        this._end = end;
        this.border = border
    }

    getOriginAreaRect() {
        return {
            x: this.start.x,
            y: this.start.y,
            width: this.end.x - this.start.x,
            height: this.end.y - this.start.y
        } as AreaRect
    }

    getPositiveRect() {
        let {x, y, width, height} = this.getOriginAreaRect();
        return {
            x: width < 0 ? this.end.x : this.start.x,
            y: height < 0 ? this.end.y : this.start.y,
            width: Math.abs(width),
            height: Math.abs(height)
        } as AreaRect
    }

    checkInRect(point: Point) {
        let rect = this.getPositiveRect();
        return checkInRect(rect, point);
    }

    getMidPoint() {
        return {
            x: (this.start.x + this.end.x) / 2,
            y: (this.start.y + this.start.y) / 2
        } as Point
    }

    getDivCSS(css?: CSS.Properties): CSS.Properties {
        css || (css = {});
        css = Object.assign({
            borderWidth: this.border + 'px',
            borderColor: "black",
            borderStyle: "solid"
        }, css);
        let rect = this.getPositiveRect();
        return getDivCSS(rect, css);
    }

    updateFromArea(areaRect: AreaRect) {
        let {x, y, width, height} = areaRect;
        this.start = {x, y};
        this.end = {x: x + width, y: y + height};
        return this
    }

    static emptyRect() {
        return new RectByPoint({x: 0, y: 0}, {x: 400, y: 600}, 1)
    }
}

export const pointUpdate = (point: Point, payload: Point) => {
    Vue.set(point, 'x', payload.x);
    Vue.set(point, 'y', payload.y)
};

export const pointAdd = (pointA: Point, ...rest: Point[]) => {
    let delta = {x: 0, y: 0} as Point;
    rest.map(point => {
        delta.x += point.x;
        delta.y += point.y
    });
    return {
        x: pointA.x + delta.x,
        y: pointA.y + delta.y
    }
};

export const pointDecrease = (pointA: Point, ...rest: Point[]) => {
    let delta = {x: 0, y: 0} as Point;
    rest.map(point => {
        delta.x += point.x;
        delta.y += point.y
    });
    return {
        x: pointA.x - delta.x,
        y: pointA.y - delta.y
    }
};

export const pointNegative = (point: Point) => {
    return {
        x: -point.x,
        y: -point.y
    }
};

export const pointMultiple = (point: Point, ...rest: number[]) => {
    let delta = 1;
    rest.map(num => {
        delta *= num
    });
    return {
        x: point.x * delta,
        y: point.y * delta
    }
};

export const pointDistance = (pointA: Point, pointB: Point) => {
    return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2))
};

export const rectDiagonalDistance = (rect: AreaRect) => {
    return Math.sqrt(Math.pow(rect.width, 2) + Math.pow(rect.height, 2))
};

export const pointFunction = (point: Point, _func: Function) => {
    return {x: _func(point.y), y: _func(point.y)}
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

export const checkInRect = (rect: AreaRect, point: Point) => {
    let {x, y, width, height} = rect;
    return x <= point.x &&
        x + width >= point.x &&
        y <= point.y &&
        y + height >= point.y
};

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
