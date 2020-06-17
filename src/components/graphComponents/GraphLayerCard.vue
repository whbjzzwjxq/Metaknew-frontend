<template>
    <v-card width="240" height="200" @scroll.stop="doNothing">
        <div class="d-flex flex-column align-content-space-between">
            <div style="height: 54px" class="px-2 pt-4 pb-0">
                <field-title :text="layer.Setting._name" label="Layer Name" :edit-mode="editMode" @update-text="updateName">

                </field-title>
            </div>
            <div style="height: 110px" class="cardItem scrollY d-flex flex-column">
                <div class="d-flex flex-row" v-for="item in layer.Content" :key="item._id" style="height: 32px">
                    <v-icon small class="pa-2"> {{ getTypeIcon(item._type)}}</v-icon>
                    <p class="subtitle-1 text--secondary font-weight-medium ma-0" style="line-height: 200%"> {{getItemName(item) }}</p>
                    <icon-group :icon-list="deleteIconList" x-small @delete-item="deleteItem(item)" class-token="pl-2 pt-1"></icon-group>
                </div>
            </div>
            <div style="height: 36px" class="pa-2">
                <icon-group :icon-list="iconList" x-small></icon-group>
            </div>
        </div>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import FieldTitle from "@/components/field/FieldTitle.vue";
    import IconGroup from "@/components/IconGroup.vue";
    import {GraphLayer, GraphLayerStateProp} from "@/class/settingGraph";
    import {getIcon} from "@/utils/icon";
    import {isLinkSetting, isMediaSetting, isNodeSetting, isTextSetting} from "@/utils/typeCheck";
    import {DocumentSelfPart} from "@/class/settingBase";

    export default Vue.extend({
        name: "GraphLayerCard",
        components: {
            FieldTitle,
            IconGroup
        },
        data: function () {
            return {}
        },
        props: {
            layer: {
                type: Object as () => GraphLayer,
                required: true
            },
            editMode: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            iconList: function (): IconItem[] {
                return [
                    {
                        name: getIcon('i-eye', this.layer.State.isShow),
                        _func: this.changeState,
                        payload: 'isShow',
                        toolTip: this.layer.State.isShow ? '关闭图层' : '显示图层'
                    },
                    {
                        name: getIcon('i-is-locked', this.layer.State.isLock),
                        _func: this.changeState,
                        payload: 'isLock',
                        toolTip: this.layer.State.isLock ? '锁定图层' : '解锁图层'
                    },
                    {
                        name: getIcon('i-edit', 'collect'),
                        _func: this.collectItem,
                        toolTip: '把选中内容放入图层'
                    },
                    {
                        name: getIcon('i-edit', 'delete'),
                        _func: this.deleteLayer,
                        color: 'red',
                        toolTip: '删除图层'
                    },
                    {
                        name: getIcon('i-edit', 'copy'),
                        _func: this.copyLayer,
                        toolTip: '复制图层'
                    }
                ]
            },
            deleteIconList: function (): IconItem[] {
                return [
                    {
                        name: getIcon('i-edit', 'delete'),
                        _isTrigger: true,
                        _eventName: 'delete-item',
                        toolTip: '从图层中删除内容'
                    }
                ]
            },
            dataManager: function (): DataManagerState {
                return this.$store.state.dataManager
            },
            currentDocument: function (): DocumentSelfPart {
                return this.dataManager.currentDocument
            },
        },
        methods: {
            doNothing() {

            },
            getTypeIcon(type: string) {
                return getIcon('i-item', type)
            },
            getItemName(item: DocumentItemSetting) {
                if (isNodeSetting(item) || isMediaSetting(item)) {
                    return item._name.substring(0, 12)
                } else if (isTextSetting(item)) {
                    return 'Text:' + item._text.substring(0, 7)
                } else if (isLinkSetting(item)) {
                    return item._start._name.substring(0, 5) + '->' + item._end._name.substring(0, 5)
                } else {
                    return 'unknown'
                }
            },
            deleteItem(item: DocumentItemSetting) {
                this.layer.removeItem({
                    id: item._id,
                    type: item._type,
                    pLabel: item._label
                })
            },

            changeState(prop: GraphLayerStateProp) {
                this.layer.changeState(prop)
            },

            collectItem() {
                let document = this.currentDocument
                let items = document.itemsAllSubDoc.filter(item => item.isSelected);
                this.layer.addItem(items)
            },

            copyLayer() {
                this.layer.copySelf()
            },

            deleteLayer() {
                this.layer.deleteSelf()
            },

            updateName(value: string) {
                this.layer.Setting._name = value
            }
        },
        record: {
            status: 'empty',
            description: ''
        }
    })
</script>

<style scoped>

</style>
