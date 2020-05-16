import {ItemSettingPart} from "@/class/settingBase";

const setNumberInRange = (num: number, min: number, max: number) =>
    num < min
    ? min
    : num > max
        ? max
        : num

abstract class PaperOrderObject<T, C> {
    _pos: PaperItemPosition
    _parent: T
    _children: C[]
    ['constructor']: typeof PaperOrderObject
    static minHeight: number = 0
    static maxHeight: number = 0
    static minWidth: number = 0
    static maxWidth: number = 0

    protected constructor(position: PaperItemPosition, parent: T, children: C[]) {
        this._pos = position
        this._parent = parent
        this._children = children
    }

    get len() {
        return this._children ? this._children.length : 0
    }

    get classSelf() {
        return this.constructor
    }

    get order() {
        return this._pos.order
    }

    set order(value: number) {
        //验证在父亲处做
        this._pos.order = value
    }

    get width() {
        return this._pos.width
    }

    set width(value: number) {
        this._pos.width = setNumberInRange(value, this.classSelf.minWidth, this.classSelf.maxWidth)
    }

    get height() {
        return this._pos.height
    }

    set height(value: number) {
        this._pos.height = setNumberInRange(value, this.classSelf.minHeight, this.classSelf.maxHeight)
    }

    get children(): C[] {
        return this._children
    }

    get parent(): T {
        return this._parent
    }
}
export interface PaperRowCtrlSetting {
    isOverflowX: boolean //是否限制宽度
    isAlign: boolean //是否强制对齐高度
    isVirtual?: boolean //是否是空内容
}

export interface PaperRowBackend {
    Setting: PaperRowCtrlSetting
    _pos: PaperItemPosition
}
//列级别
export class PaperRow extends PaperOrderObject<PaperSection, ItemSettingPart> {
    //列级别通过数组排序控制位置
    Setting: PaperRowCtrlSetting
    static minHeight: number = 120
    static maxHeight: number = 960
    static minWidth: number = 120
    static maxWidth: number = 1440

    get totalWidth() {
        return this.children.map(item => item.StyleInPaper.Base.width).reduce((pre, current) => pre + current)
    }

    get children() {
        return this._children
    }

    set children(value) {
        this._children = value
    }

    protected constructor(position: PaperItemPosition, setting: PaperRowCtrlSetting, parent: PaperSection, children: ItemSettingPart[]) {
        super(position, parent, children);
        this.Setting = setting
    }

    static rowSettingDefault(): PaperRowCtrlSetting {
        return {
            isOverflowX: false,
            isAlign: true,
            isVirtual: false
        }
    }

    static rowPositionDefault(order: number): PaperItemPosition {
        return {
            height: 360,
            width: 360,
            order
        }
    }

    static initEmptyRow(order: number, parent: PaperSection) {
        let position = this.rowPositionDefault(order)
        let setting = this.rowSettingDefault()
        return new PaperRow(position, setting, parent, [])
    }

    static initFromBackend(row: PaperRowBackend, parent: PaperSection, children: ItemSettingPart[]) {
        let {Setting, _pos} = row
        let _children = children.filter(item => item.StyleInPaper.Base.row === _pos.order)
        return new PaperRow(_pos, Setting, parent, _children)
    }

    exchangeItem(item: ItemSettingPart, targetRow: PaperRow, targetItem?: ItemSettingPart) {
        let index = this.children.indexOf(item)
        let targetIndex = targetItem !== undefined
            ? targetRow.children.indexOf(targetItem)
            : targetRow.len
        //交换
        targetRow.replaceItem(targetIndex, item)
        targetItem && this.replaceItem(index, targetItem)
    }

    replaceItem(index: number, item: ItemSettingPart) {
        if (this.itemIndexValid(index)) {
            this.children.splice(index, 1, item)
            //isVirtual false -> true true -> false undefined -> true
            let isInRow = this.Setting.isVirtual === undefined || !this.Setting.isVirtual
            item.updateState('isInRow', isInRow)
        } else {
            //doNothing
        }
    }

    deleteItem(item: ItemSettingPart) {
        let index = this.children.indexOf(item)
        if (this.itemIndexValid(index)) {
            this.children.splice(index, 1)
            item.updateState('isInRow', false)
        }
    }

    exchangeRowSoft(targetIndex: number) {
        if (this.rowIndexValid(targetIndex)) {
            let targetRow = this.parent.children.filter(row => row.order === targetIndex)[0]
            if (targetRow) {
                targetRow.order = this.order
                this.order = targetIndex
            }
        }
    }

    deleteSelf() {
        let index = this.parent.children.indexOf(this)
        if (this.rowIndexValid(index)) {
            this.children.map(item => item.updateState('isInRow', false))
            this.parent.children.splice(index, 1)
            //之后的所有row order 减一
            this.parent.children.map(row => row.order > this.order && (row.order -= 1))
        }
    }

    itemIndexValid(index: number) {
        return this.len >= index && index >= 0
    }

    rowIndexValid(index: number) {
        return this.parent.rowIndexValid(index)
    }

    addRowNext() {
        let {order} = this
        this.parent.addRow(order + 1)
    }

    injectItems(itemList: ItemSettingPart[]) {
        let matchedItem = itemList.filter(item =>
            item.StyleInPaper.Base.section === this.parent.order &&
            item.StyleInPaper.Base.row === this.order)
        this.children.push(...matchedItem)
    }

    compress(): PaperRowBackend {
        let {Setting, _pos, _children} = this
        //重新统计order
        _children.map(item => {
            item.StyleInPaper.Base = {
                ...item.StyleInPaper.Base,
                row: this.order,
                section: this.parent.order
            }
        })
        return {
            Setting,
            _pos,
        }
    }
}

export interface PaperSectionCtrlSetting {
    left: {
        text: string
        show: boolean
    }
    title: {
        text: string
        show: boolean
    }
}

export interface PaperSectionBackend {
    Setting: PaperSectionCtrlSetting
    _pos: PaperItemPosition
    _children: PaperRowBackend[]
}
//节级别
export class PaperSection extends PaperOrderObject<PaperComponent, PaperRow> {
    Setting: PaperSectionCtrlSetting
    State: PaperSectionState
    static minHeight: number = 120
    static maxHeight: number = 36000
    static minWidth: number = 120
    static maxWidth: number = 1600

    get children() {
        return this._children
    }

    protected constructor(position: PaperItemPosition, setting: PaperSectionCtrlSetting, state: PaperSectionState, parent: PaperComponent, children: PaperRow[]) {
        super(position, parent, children);
        this.Setting = setting
        this.State = state
    }
    static sectionStateDefault(): PaperSectionState {
        return {
            isDeleted: false,
            isSelected: false
        }
    }

    static sectionPositionDefault(order: number): PaperItemPosition {
        return {
            height: 1440,
            width: 360,
            order
        }
    }

    static sectionSettingDefault(): PaperSectionCtrlSetting {
        return {
            left: {
                text: '',
                show: true
            },
            title: {
                text: '',
                show: true
            }
        }
    }

    static initEmptySection(order: number, parent: PaperComponent) {
        let position = this.sectionPositionDefault(order)
        let setting = this.sectionSettingDefault()
        let state = this.sectionStateDefault()
        let sectionNew = new PaperSection(position, setting, state, parent, [])
        sectionNew.addRow(0)
        return sectionNew
    }

    static initFromBackend(section: PaperSectionBackend, parent: PaperComponent) {
        let {Setting, _children, _pos} = section
        let sectionNew = new PaperSection(_pos, Setting, this.sectionStateDefault(), parent, [])
        //匹配这一节的内容
        sectionNew._children = _children.map(row => PaperRow.initFromBackend(row, sectionNew, []))
        return sectionNew
    }

    rowIndexValid(index: number) {
        return this.len > index && index >= 0
    }

    compress() {
        let {Setting, _pos, _children} = this
        return {
            Setting,
            _pos,
            _children: _children.map(row => row.compress())
        } as PaperSectionBackend
    }

    addSectionNext() {
        let {order} = this
        this.parent.addSection(order + 1)
    }

    addRow(order: number) {
        let rowNew = PaperRow.initEmptyRow(order, this)
        this._children.push(rowNew)
    }

    deleteSelf() {
        let {order} = this
        let index = this.parent.children.indexOf(this)
        this.parent.children.splice(index, 1)
        this.parent.children.map(section => section.order > order && (section.order -= 1))
    }
}

export interface PaperComponentBackend {
    _pos: PaperItemPosition,
    _children: PaperSectionBackend[]
}
//组件级别
export class PaperComponent extends PaperOrderObject<null, PaperSection> {
    get children() {
        return this._children
    }
    get activeChildren() {
        return this.children.filter(section => !section.State.isDeleted)
    }

    get rowAll() {
        return this.children.map(section => section.children).flat(1)
    }
    protected constructor(position: PaperItemPosition, children: PaperSection[]) {
        super(position, null, children);
        //build 之后
    }
    static initEmptyComponent() {
        let defaultPosition = {
            width: 1440,
            height: 2880,
            order: 0
        } as PaperItemPosition
        return new PaperComponent(defaultPosition, [])
    }

    static initFromBackend(comp: PaperComponentBackend) {
        let {_children, _pos} = comp
        let compNew = new PaperComponent(_pos, [])
        compNew._children = _children.map(section => PaperSection.initFromBackend(section, compNew))
        return compNew
    }

    addSection(order: number) {
        //当前order添加一个内容
        let sectionNew = PaperSection.initEmptySection(order, this)
        this._children.map(section => section.order > order && (section.order += 1))
        this._children.push(sectionNew)
    }

    compress() {
        return {
            _children: this.children.map(section => section.compress())
        }
    }
}
