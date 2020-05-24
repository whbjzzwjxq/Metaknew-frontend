import {DocumentItemSettingPart, DocumentSelfPart} from "@/class/settingBase";
import Vue from 'vue'
import {commitSnackbarOn} from "@/store/modules/_mutations";

export interface GraphLayerState {
    isLock: boolean,
    isShow: boolean,
    isDeleted: boolean
}

export type GraphLayerStateProp = Exclude<keyof GraphLayerState, 'isDeleted'>

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
        let layer = new GraphLayer(content, state, setting, parent)
        layer.parent.CompInGraph.Group.Layer.push(layer)
        return layer
    }

    static initCollect(parent: DocumentSelfPart, itemList: DocumentItemSettingPart[]) {
        let state = this.graphLayerDefaultState();
        let setting = this.graphLayerDefaultSetting();
        let layer = new GraphLayer([], state, setting, parent);
        //先push
        layer.parent.CompInGraph.Group.Layer.push(layer)
        layer.addItem(itemList)
        return layer
    }

    static initBackend(parent: DocumentSelfPart, layerBackend: GraphLayerBackend) {
        let {Content, Setting} = layerBackend;
        let state = this.graphLayerDefaultState();
        let layer = new GraphLayer(Content, state, Setting, parent)
        Content.map(item => {
            let targetList = parent.CompInGraph.Group.Dict[item._id]
            if (targetList === undefined) {
                Vue.set(parent.CompInGraph.Group.Dict, item._id, [layer.index])
            } else {
                targetList.push(layer.index)
            }
        })
        return layer
    }

    get parent() {
        return this._parent
    }

    get index() {
        return this.parent.CompInGraph.Group.Layer.indexOf(this)
    }

    get isDeleted() {
        return this.State.isDeleted
    }

    changeState(prop: GraphLayerStateProp, value?: boolean) {
        value === undefined && (value = !this.State[prop])
        this.State[prop] = value
    }

    addItem(itemList: DocumentItemSettingPart[]) {
        itemList.map(item => {
            let target = this.Content.filter(sub => sub._id === item._id)[0]
            //如果图层中没有该内容 同时在一个document之下
            if (target === undefined && item.parent._id === this.parent._id) {
                this.Content.push(item.Setting)
                let targetList = this.parent.CompInGraph.Group.Dict[item._id]
                if (targetList === undefined) {
                    Vue.set(this.parent.CompInGraph.Group.Dict, item._id, [this.index])
                } else {
                    targetList.push(this.index)
                }
            }
        })
    }

    removeItem(query: QueryObject) {
        let item = this.Content.filter(item => item._id === query.id)[0]
        if (item) {
            let index = this.Content.indexOf(item)
            this.Content.splice(index, 1)
            let targetList = this.parent.CompInGraph.Group.Dict[query.id]
            let targetIndex = targetList.indexOf(index)
            targetList.splice(targetIndex, 1)
        }
    }

    compress(): GraphLayerBackend {
        return {
            Content: this.Content,
            Setting: this.Setting
        }
    }

    deleteSelf() {
        this.State.isDeleted = true
        let payload = {
            timeout: 3000,
            color: 'warning',
            content: '删除了图层',
            buttonText: '撤销',
            action: this.rollBackDelete,
            actionObject: this,
            actionName: 'deleteGraphLayer',
            once: false
        } as SnackBarStatePayload;
        commitSnackbarOn(payload)
    }

    rollBackDelete(self: GraphLayer) {
        self.State.isDeleted = false
    }

    copySelf() {
        let {Content, Setting} = this.compress()
        let newContent = []
        newContent.push(...Content)
        let newSetting = {
            ...Setting,
            _name: Setting._name + 'copy'
        }
        let newLayer = GraphLayer.initBackend(this.parent, {Content: newContent, Setting: newSetting})
        this.parent.CompInGraph.Group.Layer.splice(this.index + 1, 0, newLayer)
        return newLayer
    }
}
