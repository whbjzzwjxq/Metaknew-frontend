export interface MarkdownInsertItem {
    prefix: string;
    suffix: string;
}

export interface MarkdownHistory {
    start: number
    oldValue: string
    newValue: string
}

export interface MarkdownInputState {
    dom?: HTMLTextAreaElement //对应Dom
    history: MarkdownHistory[] //历史记录
    historyIndex: number //现在的历史记录位置
}

export abstract class HistoryStack<T> {
    //基础栈
    protected _stack: T[]
    //游标
    protected _cursor: number
    //最大状态数
    protected _maxState: number
    //状态压缩计时 以毫秒计时
    protected _mergeTime: number
    //状态压缩计时器
    protected _lastPush: number
    //时间实例
    protected _timer: Date

    protected constructor(_maxState: number, _mergeTime: number = 500) {
        this._stack = []
        this._cursor = 0
        this._maxState = _maxState
        this._mergeTime = _mergeTime
        this._timer = new Date()
        this._lastPush = this._timer.getTime()
    }

    get len() {
        return this._stack.length
    }

    get stack() {
        return this._stack
    }

    get cursor() {
        return this._cursor
    }

    undo() {
        if (this._cursor > 0) {
            this._undo()
            this._cursor -= 1
        }
    }

    protected _undo() {
        console.error('撤销需要重写')
    }

    redo() {
        if (this._cursor < this.len) {
            this._redo()
            this._cursor += 1
        }
    }

    _redo() {
        console.error('重做需要重写')
    }

    valid(index: number) {
        return index >= 0 && index <= this.len - 1
    }

    mergeState(start: number, end: number) {
        if (this._mergeAble(start, end)) {
            let stateList = this.stack.slice(start, end)
            let newState = stateList[0]
            stateList.splice(0, 1)
            stateList.forEach((state: T) => {
                this._merge(newState, state)
            })
            this.stack.splice(start, end - start, newState)
            this._cursor -= end - start
        } else {
            //doNothing
        }
    }

    protected _merge(stateA: T, stateB: T) {
        //stateA在前
        console.error('状态压缩需要重写')
    }

    protected _mergeAble(start: number, end: number): boolean {
        return this.valid(start) && this.valid(end) && start < end
    }

    push(state: T) {
        let now = this._timer.getTime()
        if (now - this._lastPush <= this._mergeTime) {
            this.stack.push(state)
            this.mergeState(this.len - 2, this.len - 1)
        } else {
            this.stack.push(state)
        }
        if (this.len > this._maxState) {
            this.stack.splice(0, 1)
            this._cursor -= 1
        }
    }
}
