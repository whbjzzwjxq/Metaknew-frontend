import * as CSS from 'csstype'

declare global {

    type CSSProp = CSS.Properties

    interface PointObject {
        x: number,
        y: number,
    }

    interface AreaRect extends PointObject {
        x: number,
        y: number,
        width: number,
        height: number,
    }

    interface VisualNodeSetting extends AreaRect {
        height: number,
        width: number,
        x: number,
        y: number,
        show: boolean,
        isSelected: boolean,
        isDeleted: boolean
    } // 视觉相关设置

    type PointMixed = Point | PointObject
}

export type BorderType = 'nw'| 'n'| 'ne'| 'w'| 'e'| 'sw'| 's'| 'se' // 方向的英文缩写

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

    decreaseMulti(...rest: PointMixed[]) {
        let delta = {x: 0, y: 0};
        rest.map(point => {
            delta.x += point.x;
            delta.y += point.y
        });
        this.decrease(delta);
        return this;
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
}

export const getPoint = (point: PointMixed) => {
    return new Point(point.x, point.y)
};

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

    getDivCSS(css?: CSSProp): CSSProp {
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

export const transformBorderToRect = (rect: RectByPoint, border: number, inner: number) => {
    let borderList = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'] as BorderType[];
    let {start, end} = rect;
    let result: Record<string, RectByPoint> = {};
    borderList.map(borderType => {
        let x1, x2, y1, y2;
        if (borderType.search('w') > -1) {
            x1 = start.x - border;
            x2 = start.x + inner;
        } else if (borderType.search('e') > -1) {
            x1 = end.x - inner;
            x2 = end.x + border;
        } else {
            x1 = start.x + inner;
            x2 = end.x - inner;
        }
        if (borderType.search('n') > -1) {
            y1 = start.y - border;
            y2 = start.y + inner;
        } else if (borderType.search('s') > -1) {
            y1 = end.y - inner;
            y2 = end.y + border;
        } else {
            y1 = start.y + inner;
            y2 = end.y - inner;
        }
        result[borderType] = new RectByPoint({x: x1, y: y1}, {x: x2, y: y2}, 0)
    });
    return result as Record<BorderType, RectByPoint>
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

export const getPointDistance = (pointA: PointObject, pointB: PointObject) => {
    return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2))
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

export const getDivCSS = (rect: AreaRect, css?: CSSProp) => {
    css || (css = {});
    return Object.assign({
        position: "absolute",
        left: rect.x + 'px',
        top: rect.y + 'px',
        width: rect.width + 'px',
        height: rect.height + 'px',
    }, css)
};
