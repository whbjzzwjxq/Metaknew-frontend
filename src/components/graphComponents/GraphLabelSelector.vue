<template>
    <div class="d-flex flex-column">
        <v-menu offset-y open-on-click top>
            <template v-slot:activator="{ on }">
                <v-chip v-on="on" :style="chipStyle">label selector</v-chip>
            </template>
            <v-list>
                <template v-for="(value, _type) in labelViewDict">
                    <v-subheader :key="_type">
                        {{ keyTrans[_type] }}
                    </v-subheader>
                    <v-list-item v-for="(bool, label, index) in value" :key="label">
                        <global-chip
                            :label="label"
                            :index="index"
                            :timeout="2000"
                            closeable
                            @close-chip="closeLabel(_type, label)">
                        </global-chip>
                        <v-btn icon @click="selectLabel(_type, label)" v-show="bool">
                            <v-icon>mdi-gesture-tap</v-icon>
                        </v-btn>
                    </v-list-item>
                </template>
            </v-list>
        </v-menu>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {LabelViewDict} from "@/interface/interfaceInComponent"
    import GlobalChip from '@/components/global/GlobalChip.vue';

    export default Vue.extend({
        name: "GraphLabelSelector",
        components: {
            GlobalChip
        },
        data() {
            return {
                chipStyle: {
                    "-moz-user-select": "none",
                    "user-select": "none",
                },
                keyTrans: {
                    'node': '节点',
                    'media': '媒体&文本',
                    'link': '关系',
                    'document': '专题',
                }
            }
        },
        props: {
            labelViewDict: {
                type: Object as () => LabelViewDict,
                required: true,
            }
        },
        computed: {},
        methods: {
            closeLabel(_type: GraphItemType, _label: string) {
                this.$set(this.labelViewDict[_type], _label, false)
            },

            resetLabel() {
                const typeList: GraphItemType[] = ['node', 'link', 'media', 'document'];
                typeList.map((_type) => {
                    Object.entries(this.labelViewDict[_type]).map(([key, value]) => {
                        this.$set(this.labelViewDict[_type], key, true)
                    });
                })
            },

            selectLabel(_type: GraphItemType, _label: string) {
                this.$emit('select-label', _type, _label)
            }
        },
        watch: {},
        record: {
            status: 'done',
            description: '标签选择器'
            //todo 优化标签选择的范围
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/6
* Updated by [whb on 2020年1月8日20:47:04]
*/
