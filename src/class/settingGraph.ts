import {DocumentSelfPart} from "@/class/settingBase";

export interface GraphLayerState {
    isLock: boolean,
    isShow: boolean,
    isDeleted: boolean
}

export interface GraphLayerBackend {
    Content: DocumentItemSetting[],
}

export class GraphLayer {
    Content: DocumentItemSetting[]
    State: GraphLayerState
    _parent: DocumentSelfPart

    protected constructor(content: DocumentItemSetting[], state: GraphLayerState, parent: DocumentSelfPart) {
        this.State = state
        this.Content = content
        this._parent = parent
    }

    static graphLayerDefaultState(): GraphLayerState {
        return {
            isShow: true,
            isLock: false,
            isDeleted: false
        }
    }

    static initEmpty(parent: DocumentSelfPart) {
        let state = this.graphLayerDefaultState()
        let content = [] as DocumentItemSetting[]
        return new GraphLayer(content, state, parent)
    }

    static initCollect(parent: DocumentSelfPart, itemList: DocumentItemSetting[]) {
        let state = this.graphLayerDefaultState();
        return new GraphLayer(itemList, state, parent)
    }

    static initBackend(parent: DocumentSelfPart, layer: GraphLayerBackend) {
        let {Content} = layer;
        let state = this.graphLayerDefaultState()
        return new GraphLayer(Content, state, parent)
    }

    get parent() {
        return this._parent
    }

    changeState(prop: keyof GraphLayerState, value?: boolean) {
        value === undefined && (value = !this.State[prop])
        this.State[prop] = value
    }

    addLayerNext() {
        this.parent.CompInGraph.Layer.push(GraphLayer.initEmpty(this.parent))
    }

    addItem(itemList: DocumentItemSetting[]) {
        itemList.map(item => {
            let target = this.Content.filter(sub => sub._id === item._id)[0]
            target === undefined && (this.Content.push(item))
        })
    }

    removeItem(query: QueryObject) {
        let item = this.Content.filter(item => item._id === query.id)[0]
        if (item) {
            let index = this.Content.indexOf(item)
            this.Content.splice(index, 1)
        }
    }

    queryItemToState(query: QueryObject, prop: keyof GraphLayerState) {
        let item = this.Content.filter(item => item._id === query.id)[0]
        return item !== undefined
            ? this.State[prop]
            : undefined
    }

    compress(): GraphLayerBackend {
        return {
            Content: this.Content
        }
    }
}
