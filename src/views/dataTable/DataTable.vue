<template>
    <v-container class="d-flex flex-column ma-0 pa-0 pt-2" fluid style="background-color: white">
        <v-row style="height: 64px">
            <data-table-importer @new-node-from-file="addNode" :disabled="!pLabel">

            </data-table-importer>
        </v-row>
        <v-divider class="ma-2 mb-0"></v-divider>
        <v-row dense class="justify-end">
            <v-col cols="1" class="pt-6">
                <div class="title">
                    <p>数据控制台</p>
                </div>
            </v-col>
            <v-col cols="3">
                <p-label-selector :label="pLabel" @update-label="choosePrimaryLabel"></p-label-selector>
            </v-col>
            <v-col class="col-xl-6 col-md-5 col-sm-5">
                <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="Search"
                    hide-details
                    class="pb-5">
                </v-text-field>
            </v-col>
            <v-col class="pt-6">
                <data-table-button-group
                    :rowNum="rowNum"
                    @add-empty-node="addEmptyNode"
                    @del-selected-node="delSelectedNode"
                    @save-all="saveNodes(nodes)"
                    @save-select-item="saveNodes(selected)">

                </data-table-button-group>
            </v-col>
        </v-row>
        <v-divider class="ma-2 mb-0"></v-divider>
        <v-row>
            <v-container fluid class="pa-0 ma-0">
                <v-data-table
                    v-model="selected"
                    :dense="isDense"
                    :items-per-page.sync="rowNum"
                    :page.sync="page"
                    :search="search"
                    :items="nodes"
                    :headers="allHeader"
                    :footer-props="footSetting"
                    item-key="id"
                    show-select
                    calculate-widths>

                    <template v-slot:item.$_action="{ item }">
                        <v-icon class="mr-2" small @click="copyItem(item)">mdi-content-copy</v-icon>
                        <v-icon class="mr-2" small @click="deleteItem(item)">mdi-delete</v-icon>
                    </template>

                    <template v-slot:item.id="{item}">
                        <span>{{item.id}}</span>
                    </template>

                    <template v-for="(setting, prop) in headerSlot" v-slot:[getName(prop)]="{ item }">
                        <data-table-field
                            :key="prop"
                            :prop-name="prop"
                            :base-value="item[prop]"
                            :setting="fieldSetting"
                            :p-label="pLabel"
                            :field-type="setting.type"
                            :resolve="setting.resolve"
                            @update="updateProp(item, prop, $event)">

                        </data-table-field>
                    </template>

                </v-data-table>

            </v-container>
        </v-row>
    </v-container>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {fieldDefaultValue, fieldSetting, FieldType, nodeLabelToProp} from "@/utils/labelField"
    import {deepClone} from "@/utils/utils"
    import DataTableImporter from '@/views/dataTable/DataTableImporter.vue';
    import PLabelSelector from '@/components/PLabelSelector.vue';
    import DataTableButtonGroup from '@/views/dataTable/DataTableButtonGroup.vue';
    import DataTableField from '@/views/dataTable/DataTableField.vue';
    import {BaseNodeInfo, ExtraProps, getIndex} from '@/utils/graphClass'
    import {nodeCreateMulti} from "@/api/commonSource"

    export default Vue.extend({
        name: "DataTable",
        components: {
            DataTableImporter,
            PLabelSelector,
            DataTableButtonGroup,
            DataTableField
        },
        data() {
            return {
                //页面语言
                lang: "en",
                //默认页面标号
                page: 0,
                //每页的行数
                rowNum: 10,
                //选中的标签
                pLabel: "",
                //属性简写
                propSimply: {
                    'IncludedMedia': "Medias",
                    'BaseImp': "Imp",
                    "BaseHardLevel": "Hard",
                    "$IsCommon": "Common",
                    "$IsShared": "Shared",
                    "$IsOpenSource": "OpenSource"
                } as Record<string, string>,
                //全部的节点
                nodes: [] as BaseNodeInfo[],
                //被选中的节点
                selected: [] as BaseNodeInfo[],
                //不需要编辑值的属性
                unShowProps: ["id", "type"],
                //数据表底部插槽
                footSetting: {
                    showFirstLastPage: true,
                    itemsPerPageOptions: [10, 25, 50, -1],
                    prevIcon: 'mdi-minus',
                    nextIcon: 'mdi-plus',
                    firstIcon: "mdi-page-first",
                    lastIcon: "mdi-page-last"
                },

                //搜索字段
                search: "",
                //字段-默认值对应dict
                defaultValue: fieldDefaultValue,

                //阻止插入节点
                unableCopy: false,

                actionHeader: {
                    text: "action",
                    align: "left",
                    sortable: false,
                    value: "$_action",
                    divider: true,
                    width: 50
                },

                reg: {
                    "trans": new RegExp(/Name_[a-zA-Z]{2}/),
                    "textTrans": new RegExp(/Text_[a-zA-Z]{2}/)
                },

                fieldHandler: {
                    "StringField": (value: any) => value.toString(),
                    "ArrayField": (value: any) => value.toString().split(";"),
                    "NumberField": (value: any) => parseFloat(value),
                    "JsonField": (value: any) => JSON.parse(value),
                    "TextField": (value: any) => ({"auto": value.toString()}),
                    "FileField": (value: any) => value.toString().split(";"),
                    "ImageField": (value: any) => value.toString()
                } as Record<FieldType, (value: any) => any>
            }
        },
        props: {},
        computed: {
            // 需要的标签--属性Dict
            labelDict() {
                return nodeLabelToProp(this.pLabel)
            },
            // 属性的keys
            propNames: vm => Object.keys(vm.labelDict),
            // 需要编辑的属性
            editProps: (vm: any): string[] => vm.propNames.filter((name: string) => vm.unShowProps.indexOf(name) === -1),
            //基本表头
            allHeader() {
                let result = [this.actionHeader];
                for (let prop of this.editProps) {
                    let text;
                    this.propSimply[prop]
                        ? text = this.propSimply[prop]
                        : text = prop;
                    let item = {
                        text: text,
                        align: "left",
                        sortable: false,
                        value: prop,
                        divider: true,
                        width: 20
                    };
                    result.push(item);
                }
                return result
            },

            //基本插槽
            headerSlot() {
                let result = Object.assign({}, this.labelDict);
                delete result.id;
                delete result.type;
                return result
            },

            //节点的模板
            nodeTemplate() {
                let object: Record<string, any> = {};
                Object.entries(this.labelDict).map(([key, value]) => {
                    let type: FieldType = value.type;
                    object[key] = this.defaultValue[type];
                });
                return object
            },

            //是否窄行距
            isDense: vm => vm.rowNum >= 20,

            //节点名字池
            nodeNamePool: vm => vm.nodes.map((node: BaseNodeInfo) => node.Name),

            fieldSetting() {
                let extraSetting: Record<string, any> = {
                    "Name": {
                        "textPool": this.nodeNamePool,
                        "checkDuplicate": true
                    },
                    "Alias": {
                        "textPool": this.nodeNamePool
                    }
                };
                let defaultSetting = deepClone(fieldSetting);
                // 这个设置是插槽的prop设置 具体可以看field组件
                let result: Record<string, any> = {};
                for (let prop of this.editProps) {
                    prop in defaultSetting
                        ? prop in extraSetting
                        ? result[prop] = Object.assign({}, defaultSetting[prop], extraSetting[prop])
                        : result[prop] = defaultSetting[prop]
                        : prop in extraSetting
                        ? result[prop] = extraSetting[prop]
                        : result[prop] = {}
                }
                return result
            },

            //现在的index
            idList: vm => vm.nodes.map((node: BaseNodeInfo) => node.id)
        },
        methods: {
            //添加新节点
            addNode(nodeList: Record<string, string>[]) {
                this.nodes = this.nodes.concat(nodeList.map(node => this.resolveProp(node)))
            },

            //添加已经解析好的节点 也可以是后端导入
            addResolvedNode(nodeList: BaseNodeInfo[]) {
                this.nodes = this.nodes.concat(nodeList);
            },

            //添加元素
            addEmptyNode(num: number) {
                let result = [];
                let base = this.nodes.length;
                for (let i = 0; i < num; i++) {
                    let newObj = deepClone(this.nodeTemplate);
                    newObj.Name = "***" + (i + base).toString();
                    newObj.id = this.getIndex();
                    result.push(newObj)
                }
                this.addResolvedNode(result);
            },

            //复制行元素
            copyItem(item: BaseNodeInfo) {
                let index = this.nodes.indexOf(item);
                let newItem = deepClone(item) as BaseNodeInfo;
                newItem.id = this.getIndex();
                this.nodes.splice(index + 1, 0, newItem);
            },

            //删除选中对象
            delSelectedNode() {
                if (confirm("确定删除这些节点吗？")) {
                    this.selected.map(node => {
                        let index = this.nodes.indexOf(node);
                        this.nodes.splice(index, 1);
                    });
                    this.selected = [];
                }
            },

            //删除行元素
            deleteItem(item: BaseNodeInfo) {
                if (confirm('确定要删除此项吗?')) {
                    let index = this.nodes.indexOf(item);
                    this.nodes.splice(index, 1);
                    index = this.selected.indexOf(item);
                    this.selected.splice(index, 1);
                }
            },

            //解析属性
            resolveProp(item: Record<string, string>): BaseNodeInfo {
                //注意这里resolve了item的所有属性
                let translate = {} as Record<string, string>;
                let text = {} as Record<string, string>;
                let extraProps = {} as ExtraProps;
                let node = {} as BaseNodeInfo;
                Object.entries(item).map(([key, value]) => {
                    if (this.editProps.indexOf(key) >= 0) {
                        let field = this.labelDict[key].type;
                        //注意这里源数据都是字符串
                        node[key] = this.fieldHandler[field](value)
                    } else {
                        let trans = this.reg.trans.test(key);
                        // key === Name_zh Text_zh ......
                        trans && (translate[key.substring(5, key.length)] = value);
                        let texts = this.reg.textTrans.test(key);
                        texts && (text[key.substring(5, key.length)] = value);
                        (!trans && !texts) && (extraProps[key] = {
                            value: value,
                            type: 'StringField',
                            resolve: 'normal'
                        });
                    }
                    // 补充那些没有的属性
                    for (let i of this.editProps) {
                        let hasNeededProp = Object.prototype.hasOwnProperty.call(node, i);
                        hasNeededProp || (node[i] = deepClone(this.nodeTemplate[i]));
                    }
                });
                node.id = this.getIndex();
                node.type = 'node';
                node.PrimaryLabel = this.pLabel;
                // 合并Prop
                this.mergeProp(node.Translate, translate);
                this.mergeProp(node.Text, text);
                this.mergeProp(node.ExtraProps, extraProps);
                return node
            },

            //这里是动态插槽名 其实是调用了的
            getName(prop: string) {
                return "item." + prop.toString()
            },

            //获取index
            getIndex() {
                return getIndex()
            },

            saveNodes(nodes: BaseNodeInfo[]) {
                let _this = this;
                nodeCreateMulti(this.pLabel, nodes).then(res => {
                    if (res.status === 200) {
                        alert(res.data);
                        for (let i in nodes) {
                            this.nodes.splice(_this.idList.indexOf(nodes[i].id), 1);
                            this.selected.splice(_this.idList.indexOf(nodes[i].id), 1)
                        }
                    }
                })
            },

            //更新值
            updateProp(item: BaseNodeInfo, prop: string, value: any) {
                this.$set(item, prop, value)
            },

            //更新节点
            updateNode(node: BaseNodeInfo, oldLabel: string, newLabel: string) {
                //参数解构使用for of
                for (let [prop, setting] of Object.entries(nodeLabelToProp(newLabel))) {
                    Object.prototype.hasOwnProperty.call(node, prop) ||
                    (this.updateProp(node, prop, fieldDefaultValue[setting.type]));
                    this.updateProp(node, 'PrimaryLabel', newLabel);
                }
            },

            choosePrimaryLabel(label: string) {
                this.nodes.map(node => this.updateNode(node, this.pLabel, label));
                this.pLabel = label;
            },

            // 合并两个Object
            mergeProp(propA: Record<string, any>, propB: Record<string, any>) {
                Object.keys(propB).length !== 0 && Object.assign(propA, propB)
            }
        },
        watch: {},
        record: {
            status: 'done-old'
        }
    })
</script>

<style scoped>
    .title {
        font-weight: bolder;
        text-align: center;
        text-justify: auto;
    }
</style>

/**
* Created by whb on 2019/11/28
* Updated by []
*/
