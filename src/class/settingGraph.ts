import {DocumentItemSettingPart, DocumentSelfPart} from "@/class/settingBase";
import Vue from 'vue'

export interface GraphLayerState {
    isLock: boolean,
    isShow: boolean,
    isDeleted: boolean
}

export interface GraphLayerBackend {
    Content: DocumentItemSetting[],
    Setting: GraphLayerSetting
}

export interface GraphLayerSetting {
    _id: id,
    _name: string
}

export class GraphLayer {
    Content: DocumentItemSetting[]
    State: GraphLayerState
    Setting: GraphLayerSetting
    _parent: DocumentSelfPart

    protected constructor(content: DocumentItemSetting[], state: GraphLayerState, setting: GraphLayerSetting, parent: DocumentSelfPart) {
        this.State = state
        this.Content = content
        this.Setting = setting
        this._parent = parent
    }

    static graphLayerDefaultSetting(): GraphLayerSetting {
        return {
            _id: '-1',
            _name: ''
        }
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
        let setting = this.graphLayerDefaultSetting()
        return new GraphLayer(content, state, setting, parent)
    }

    static initCollect(parent: DocumentSelfPart, itemList: DocumentItemSettingPart[]) {
        let state = this.graphLayerDefaultState();
        let setting = this.graphLayerDefaultSetting();
        let layer = new GraphLayer([], state, setting, parent);
        layer.addItem(itemList)
        return layer
    }

    static initBackend(parent: DocumentSelfPart, layerBackend: GraphLayerBackend) {
        let {Content, Setting} = layerBackend;
        let state = this.graphLayerDefaultState();
        let layer = new GraphLayer(Content, state, Setting, parent)
        Content.map(item => {
            Vue.set(parent.CompInGraph.Group.Dict, item._id, layer.index)
        })
        return layer
    }

    get parent() {
        return this._parent
    }

    get index() {
        return this.parent.CompInGraph.Group.Layer.indexOf(this)
    }

    changeState(prop: keyof GraphLayerState, value?: boolean) {
        value === undefined && (value = !this.State[prop])
        this.State[prop] = value
    }

    addItem(itemList: DocumentItemSettingPart[]) {
        itemList.map(item => {
            let target = this.Content.filter(sub => sub._id === item._id)[0]
            if (target === undefined && item.parent._id === this.parent._id) {
                this.Content.push(item.Setting)
                Vue.set(this.parent.CompInGraph.Group.Dict, item._id, this.index)
            }
        })
    }

    removeItem(query: QueryObject) {
        let item = this.Content.filter(item => item._id === query.id)[0]
        if (item) {
            let index = this.Content.indexOf(item)
            this.Content.splice(index, 1)
            Vue.delete(this.parent.CompInGraph.Group.Dict, query.id)
        }
    }

    compress(): GraphLayerBackend {
        return {
            Content: this.Content,
            Setting: this.Setting
        }
    }
}
