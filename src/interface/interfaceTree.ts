// 拥有孩子的接口

//排序用函数
import {DocumentSelfPart} from "@/class/settingBase";

export type SortFunction<L> = (a: L, b: L) => number

//虚拟化函数
export type VirtualFunc<T, L extends VirtualNodeBase<T, L>, P> =
    (parent: ParentTreeNode<T>, node: TreeNode<T>, parentItem: VirtualNodeBase<T, L> | null, payload: P) => VirtualNodeContent<T, L>

//父亲节点的表示
export type ParentTreeNode<T> = TreeNode<T> | null

//虚拟化节点的表示
export interface VirtualNodeBase<T, L extends VirtualNodeBase<T, L>> {
    //T: TreeNode的源类型 L: 实际合并过后的类型
    _origin: TreeNode<T>,
    _children: L[],
    _parent: VirtualNodeBase<T, L> | null,
}

export type VirtualNodeContent<T, L extends VirtualNodeBase<T, L>> = Omit<L, keyof VirtualNodeBase<T, L>>

export class TreeNode<T> {
    static virtualTreeList: VirtualTree<any, any, any>[] = [] //虚拟tree
    boundObject: T //绑定的object
    children: TreeNode<T>[] // 孩子节点
    query: QueryObject // 身份标识
    _parent: ParentTreeNode<T> //父亲节点
    _isRoot: boolean // 是否是根节点
    _isDeleted: boolean // 是否被删除

    protected constructor(boundObject: T, query: QueryObject, _parent: ParentTreeNode<T>) {
        this.boundObject = boundObject
        this.children = []
        this.query = query
        this._parent = _parent
        this._isRoot = _parent === null
        this._isDeleted = false
    }

    static newNode<T>(boundObject: T, query: QueryObject, _parent: ParentTreeNode<T>) {
        return new TreeNode(boundObject, query, _parent)
    }

    get id(): id {
        return this.query.id
    }

    get parent(): ParentTreeNode<T> {
        return this._parent
    }

    set parent(value: ParentTreeNode<T>) {
        this._parent = value
    }

    get isRoot() {
        return this._isRoot
    }

    set isRoot(value: boolean) {
        this._isRoot = value
    }

    get rootNode() {
        return this.isRoot
            ? this
            : this.parentNodeList[0]
    }

    get duplicateItem(): TreeNode<T>[] {
        return this.parentNodeList.filter((item) => this.isEqualTo(item))
    }

    // 是否重复
    get isDuplicate(): boolean {
        return this.duplicateItem.length > 0
    }

    //是否被删除
    get isDeleted(): boolean {
        return this._isDeleted
    }

    get parentNodeList(): TreeNode<T>[] {
        // 不包含自身的节点
        return this._parent !== null && !this.isRoot
            ? [this._parent].concat(this._parent.parentNodeList)
            : []
    }

    get childrenAll() {
        let result: TreeNode<T>[] = this.children;
        this.children.map(child => {
            result.push(...child.childrenAll)
        })
        return result
    }

    get childrenActive(): TreeNode<T>[] {
        return this.children.filter(item => !item.isDeleted && !item.isDuplicate)
    }

    isEqualTo(item: TreeNode<T>, strict: boolean = false) {
        //两个node是否相同
        return this.queryNode(item.query, item.parent, strict)
    }

    //确认一个Node
    queryNode(query: QueryObject, parent: ParentTreeNode<T> = null, strict: boolean = false): boolean {
        //两种寻找的方式
        let {id, type, pLabel} = query
        let idEqual = this.query.id === id
        if (!strict) {
            return idEqual
        } else {
            let typeEqual = this.query.type === type
            let labelEqual = this.query.pLabel === pLabel
            let parentEqual = this.parent === null
                ? parent === null //如果都是根节点
                : parent === null
                    ? false
                    : (this.parent.isEqualTo(parent, false)) // 父亲id相同
            return idEqual && typeEqual && labelEqual && parentEqual
        }
    }

    checkNodeExist(query: QueryObject): TreeNode<T>[] {
        return this.children.filter(node => node.queryNode(query, this, false))
    }

    _addNode(nodeList: TreeNode<T>[]) {
        nodeList.map(node => {
            //直到根节点的所有id list
            let parentIdList = this.parentNodeList.map(parent => parent.id)
            parentIdList.push(this.id)
            //子节点和父亲节点都没有目标专题
            if (this.checkNodeExist(node.query).length === 0 && !parentIdList.includes(node.id)) {
                this.children.push(node)
                node.parent = this;
                //同步到virtualTree
                TreeNode.virtualTreeList.map(tree => {
                    let virtualNode = tree.queryNodeByOrigin(this) as VirtualNodeBase<any, any>
                    virtualNode._children.push(tree.buildNode(this, node, virtualNode))
                })
                return true
            } else {
                return false
            }
        })
    }

    _deleteNode(index: number) {
        if (index > -1) {
            this.children[index]._isDeleted = true
        }
    }

    _moveNode(nodeList: TreeNode<T>[]) {

    }
}

const updater = {
    set: function (object: any, prop: string | number, value: any) {
        object[prop] = value
        return true
    }
} as ProxyHandler<any>

export class VirtualTree<T, L extends VirtualNodeBase<T, L>, P> {
    //T: TreeNode S:子节点实际类型 P: payload类型
    readonly _name: string //名字 不能够重复
    _buildFunc: VirtualFunc<T, L, P> // 建构函数
    _root: L //转化后的虚拟根节点
    _nodeList: L[] // 虚拟节点集
    _payload: P // 函数需要的载荷
    constructor(_root: TreeNode<T>, _func: VirtualFunc<T, L, P>, payload: P, treeName: string = 'NewTree') {
        this._buildFunc = _func
        this._name = treeName
        this._payload = payload
        this._nodeList = []
        this._root = this.buildNode(null, _root, null)
        TreeNode.virtualTreeList.push(this)
    }

    get root() {
        return this._root
    }

    get activeNode() {
        return this._nodeList.filter(node => !node._origin.isDeleted)
    }

    update(nodeList: TreeNode<T>[]) {
        nodeList.map(node => {

        })
    }

    //节点初始化
    protected initNode(parent: ParentTreeNode<T>, node: TreeNode<T>, parentItem: VirtualNodeBase<T, L> | null): L {
        return {
            ...this._buildFunc(parent, node, parentItem, this._payload),
            _parent: parentItem,
            _origin: node,
            _children: []
        } as unknown as L
    }

    //节点构建
    buildNode(parent: ParentTreeNode<T>, node: TreeNode<T>, parentItem: VirtualNodeBase<T, L> | null): L {
        // 先用函数处理
        let virtualNode = this.initNode(parent, node, parentItem)
        virtualNode._children = node.children.filter(child => !child.isDuplicate).map(child =>
            this.buildNode(node, child, virtualNode)
        )
        this._nodeList.push(virtualNode)
        return virtualNode
    }

    //节点替换也就是不改变结构 只改变节点本身信息
    updateNode(targetItem: VirtualNodeBase<T, L>): VirtualNodeBase<T, L> {
        let node = targetItem._origin
        let children = targetItem._children
        targetItem = this.initNode(node.parent, node, targetItem._parent)
        targetItem._children = children
        return targetItem
    }

    //遍历节点
    searchNode() {

    }

    //查询节点
    queryNodeByOrigin(origin: TreeNode<T>): L {
        return this._nodeList.filter(item => item._origin.queryNode(origin.query, origin.parent, true))[0]
    }

    //排序节点
    sortNode(item: L, sortFunc?: SortFunction<L>) {
        sortFunc !== undefined && item._children.sort(sortFunc)
    }
}

export class TreeNodeDoc extends TreeNode<DocumentSelfPart> {
    get isDeleted() {
        return this.boundObject.isDeleted
    }

    constructor(doc: DocumentSelfPart, parent: DocumentSelfPart | null) {
        let _parent = parent === null
            ? null
            : parent.treeNode
        super(doc, doc.dataQueryObject, _parent);
    }
}
