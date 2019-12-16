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

    [props: string]: number
}

export class RectByPoint {
    protected _start: Point;
    get start(): Point {
        return this._start
    }

    set start(payload) {
        updatePoint(this._start, payload)
    }

    protected _end: Point;
    get end(): Point {
        return this._end
    }

    set end(payload) {
        updatePoint(this._end, payload)
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
        let {x, y, width, height} = this.getPositiveRect();
        return x <= point.x &&
            x + width >= point.x &&
            y <= point.y &&
            y + height >= point.y
    }

    getMidPoint() {
        return {
            x: (this.start.x + this.end.x) / 2,
            y: (this.start.y + this.start.y) / 2
        } as Point
    }

    getDivCSS(css?: CSS.Properties): CSS.Properties {
        css || (css = {});
        let rect = this.getPositiveRect();
        return Object.assign({
            position: "absolute",
            left: rect.x + 'px',
            top: rect.y + 'px',
            width: rect.width + 'px',
            height: rect.height + 'px',
            borderWidth: this.border + 'px',
            borderStyle: "solid"
        }, css)
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

export const updatePoint = (point: Point, payload: Point) => {
    Vue.set(point, 'x', payload.x);
    Vue.set(point, 'y', payload.y)
};

export const addPoint = (pointA: Point, ...rest: Point[]) => {
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

export const decreasePoint = (pointA: Point, ...rest: Point[]) => {
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
