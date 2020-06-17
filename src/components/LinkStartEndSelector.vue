<template>
    <v-list dense class="pa-0">
        <v-list-item dense class="pa-0">
            <v-autocomplete
                v-model="addLinkStartModel"
                :items="nodeToLinkItems"
                :disabled="!editable"
                item-text="text"
                item-value="_id"
                :item-disabled="getItemDisabled"
                label="StartNode"
                dense
                return-object>
            </v-autocomplete>

        </v-list-item>
        <v-list-item dense class="pa-0">
            <v-autocomplete
                v-model="addLinkEndModel"
                :items="nodeToLinkItems"
                :disabled="!editable"
                item-text="text"
                item-value="_id"
                :item-disabled="getItemDisabled"
                label="EndNode"
                dense
                return-object>
            </v-autocomplete>
        </v-list-item>

        <v-list-item dense v-if="editMode" class="pa-0">
            <v-btn text small @click="editable = !editable">{{editable ? 'edit off' : 'edit on '}}</v-btn>
            <v-btn text small @click="addLinkSelect" :disabled="!addLinkDisable">Confirm</v-btn>
            <v-btn text small @click="clearSelect" :disabled="!editable">Clear</v-btn>
        </v-list-item>
    </v-list>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {DocumentSelfPart} from "@/class/settingBase";
    import {itemEqual} from "@/utils/utils";

    interface NodeAsSelectorItem {
        text: string,
        _id: id,
        _type: DocumentItemType
    }

    export default Vue.extend({
        name: "LinkStartEndSelector",
        components: {},
        data() {
            return {
                startCache: undefined as NodeAsSelectorItem | undefined,
                endCache: undefined as NodeAsSelectorItem | undefined,
                editable: false
            }
        },
        props: {
            editMode: {
                type: Boolean,
                default: false
            },
            document: {
                type: Object as () => DocumentSelfPart,
                required: true
            },
            currentStart: {
                type: Object as () => VisNodeSettingPart | undefined,
                default: undefined
            },
            currentEnd: {
                type: Object as () => VisNodeSettingPart | undefined,
                default: undefined
            }
        },
        computed: {
            dataManager: function (): DataManagerState {
                return this.$store.state.dataManager
            },
            nodes: function (): VisNodeSettingPart[] {
                return this.document.nodesVisual
            },
            nodeIdList: function (): id[] {
                return this.nodes.map(node => node._id)
            },
            nodeToLinkItems: function (): NodeAsSelectorItem[] {
                return this.nodes.map(node => ({
                    "text": node._name,
                    "_id": node._id,
                    "_type": node._type
                }))
            },

            //是否能够添加Link
            addLinkDisable: function (): boolean {
                return this.editable &&
                    (this.addLinkStartModel !== undefined) &&
                    (this.addLinkEndModel !== undefined)
            },

            addLinkStartModel: {
                get(): NodeAsSelectorItem | undefined {
                    return (!this.startCache && this.currentStart) // startCache 不存在而且有current
                        ? this.nodeToLinkItems[this.nodeIdList.indexOf(this.currentStart._id)]
                        : this.startCache;
                },
                set(value: NodeAsSelectorItem): void {
                    let start = this.nodes.filter(node => node._id === value._id)[0];
                    this.startCache = value;
                    this.$emit('select-item-link', start, undefined)
                }
            },

            addLinkEndModel: {
                get(): NodeAsSelectorItem | undefined {
                    return (!this.endCache && this.currentEnd)
                        ? this.nodeToLinkItems[this.nodes.indexOf(this.currentEnd)]
                        : this.endCache;
                },
                set(value: NodeAsSelectorItem): void {
                    let end = this.nodes.filter(node => node._id === value._id)[0];
                    this.endCache = value;
                    this.$emit('select-item-link', undefined, end)
                }
            },
        },
        methods: {
            addLinkSelect() {
                let result = this.clearSelect();
                this.$emit('add-link', result[0], result[1])
            },

            clearSelect() {
                let start;
                let end;
                if (this.addLinkStartModel !== undefined) {
                    let value = this.addLinkStartModel._id;
                    start = this.nodes.filter(node => node._id === value)[0];
                }
                if (this.addLinkEndModel !== undefined) {
                    let value = this.addLinkEndModel._id;
                    end = this.nodes.filter(node => node._id === value)[0];
                }
                if (start && end) {
                    return [start, end]
                } else {
                    return [undefined, undefined]
                }
            },

            getItemDisabled(item: NodeAsSelectorItem): boolean {
                let startUnDuplicate = !this.addLinkStartModel || !itemEqual(this.addLinkStartModel, item);
                // 没有开始节点 那么不重复 或者有但是不相等 也不重复
                let endUnDuplicate = !this.addLinkEndModel || !itemEqual(this.addLinkEndModel, item);
                return !(startUnDuplicate && endUnDuplicate)
            }
        },
        watch: {},
        record: {
            status: 'done',
            description: '关系的节点选择器'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/11/29
* Updated by []
*/
