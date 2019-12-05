import Vue from 'vue'

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
    start: Point;
    end: Point;
    border ?: number;

    constructor(start: Point, end: Point, border?: number) {
        this.start = start;
        this.end = end;
        this.border = border
    }

    getOriginAreaRect() {
        return {
            x: this.start.x,
            y: this.start.y,
            width: this.end.x - this.start.x,
            height: this.end.y - this.end.y
        } as AreaRect
    }

    getPositiveRect() {
        let {x, y, width, height} = this.getOriginAreaRect();
        return {
            x: x > 0 ? this.end.x : this.start.x,
            y: y > 0 ? this.end.y : this.start.y,
            width: Math.abs(width),
            height: Math.abs(height)
        } as AreaRect
    }

    checkInRect(point: Point) {
        return this.start.x <= point.x &&
            this.end.x >= point.x &&
            this.start.y <= point.y &&
            this.end.y >= point.y
    }

    getMidPoint() {
        return {
            x: (this.start.x + this.end.x) / 2,
            y: (this.start.y + this.start.y) / 2
        } as Point
    }
}

export const updatePoint = (point: Point, payload: Point) => {
    Vue.set(point, 'x', payload.x);
    Vue.set(point, 'y', payload.y)
};
