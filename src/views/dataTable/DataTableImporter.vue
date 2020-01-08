<template>
    <div class="d-flex flex-row defaultToolbar" style="width: 100%">
        <v-col cols="2" class="pl-4">
            <v-menu open-on-hover offset>
                <template v-slot:activator="{ on }">
                    <v-btn outlined small color="secondary" v-on="on" tile>{{ importMethod }}</v-btn>
                </template>
                <v-list>
                    <v-list-item
                        v-for="(item, index) in importMethodList"
                        :key="index"
                        @click="setImportMethod(index)"
                    >
                        <v-list-item-title>{{ item }}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-col>
        <v-col cols="10" class="pa-0 pt-3">
            <template v-if="fileUploadSetting.visible">
                <v-file-input
                    :disabled="disabled"
                    :label="fileUploadSetting.label"
                    :placeholder="fileUploadPlaceHolder"
                    :rule="fileUploadSetting.rules"
                    v-model="addFilePool"
                    autofocus
                    chips
                    dense
                    multiple
                >
                    <template v-slot:selection="{text, index}">
                        <v-chip close @click:close="delResolveFile(index)">
                            {{text}}
                        </v-chip>
                    </template>
                </v-file-input>
            </template>
        </v-col>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import XLSX from 'xlsx';
    import {fileCheck, MB} from '@/utils/utils'

    interface ResolvedFile extends File {
        warning: string[]
    }

    export default Vue.extend({
        name: "DataTableImporter",
        components: {},
        data() {
            return {
                importMethod: "选择解析方式",
                importMethodList: ['解析excel', '解析json', '修改已有的节点'],
                fileUploadSetting: {
                    visible: true,
                    label: "excel",
                    format: ['xlsx', 'xls', 'csv'],
                },
                filePool: [] as ResolvedFile[],
                addFilePool: [] as File[]
            }
        },
        props: {
            disabled: {
                type: Boolean,
                required: true
            }
        },
        computed: {
            //搜索框的占位符
            fileUploadPlaceHolder: function(): string {
                return this.disabled
                    ? "请先选择主标签"
                    : "点击解析" + this.fileUploadSetting.label + "文件(切换解析方式将清空已解析文件，但是不会清空数据)";
            },
        },
        methods: {
            //删除上传文件
            delResolveFile(index: number) {
                index >= 0 && this.filePool.splice(index, 1);
            },

            //解析文件
            resolveExcel(file: File) {
                let reader = new FileReader();
                let _this = this;
                reader.onload = function ($event) {
                    let target = $event.target;
                    if (target && target.result && typeof target.result !== 'string') {
                        const data = new Uint8Array(target.result);
                        let output = XLSX.read(data, {type: "array"});
                        let firstSheetName = output.SheetNames[0];
                        let workSheet = output.Sheets[firstSheetName];
                        _this.$emit("new-node-from-file", XLSX.utils.sheet_to_json(workSheet));
                    }
                };
                reader.readAsArrayBuffer(file);
            },
            //上传excel
            uploadExcel() {
                this.fileUploadSetting = {
                    format: ["xlsx", "xls", "csv"],
                    label: "excel",
                    visible: true
                }
            },

            //上传json
            uploadJson() {
                this.fileUploadSetting = {
                    format: ["json", "txt"],
                    label: "json",
                    visible: true
                }
            },

            //检查已有节点
            checkExistNode() {
                this.fileUploadSetting = {
                    format: ["$_any"],
                    label: "已有的",
                    visible: false
                }
            },

            setImportMethod(index: number) {
                this.importMethod = this.importMethodList[index];
                index === 0 && this.uploadExcel();
                index === 1 && this.uploadJson();
                index === 2 && this.checkExistNode();
            },

            updateFile(fileList: File[]) {
                this.filePool = fileList.map(file => {
                    let resolvedFile: ResolvedFile = Object.assign(file, {
                        warning: fileCheck(file, 20 * MB, this.fileUploadSetting.format, this.addFilePool)
                    });
                    this.resolveExcel(file);
                    return resolvedFile
                })
            }
        },
        watch: {
            addFilePool() {
                this.updateFile(this.addFilePool)
            }
        },
        record: {
            status: 'done',
            description: 'DataTable的输入栏',
            //todo 从别的数据类型解析
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/1
* Updated by []
*/
