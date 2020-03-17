<template>
    <div class="d-flex flex-column">
        <v-menu offset-y open-on-click top :close-on-content-click="false">
            <template v-slot:activator="{ on: menu }">
                <v-chip v-on="{...menu}" :style="chipStyle">label selector</v-chip>
            </template>
            <v-list dense>
                <v-list-group v-for="(value, _type) in labelViewDict" :key="_type">
                    <template v-slot:activator>
                        <v-list-item-icon>
                            <v-icon>{{ getIcon('i-item', _type)}}</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>
                            {{ keyTrans[_type] }}
                        </v-list-item-title>
                    </template>
                    <v-list-item v-for="(bool, label) in value" :key="label">
                        <v-list-item-action>
                            <v-tooltip bottom>
                                <template v-slot:activator="{on: tooltip}">
                                    <v-btn icon @click="setLabel(_type, label)" small v-on="{...tooltip}">
                                        <v-icon>{{ getIcon('i-eye', bool)}}</v-icon>
                                    </v-btn>
                                </template>
                            </v-tooltip>
                        </v-list-item-action>
                        <v-list-item-content>
                            <v-list-item-title v-text="label"></v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on:tooltip }">
                                    <v-btn icon @click="selectLabel(_type, label)" v-show="bool" small
                                           v-on="{...tooltip}">
                                        <v-icon>{{ getIcon('i-edit', 'select') }}</v-icon>
                                    </v-btn>
                                </template>
                                <span>
                                    选择同标签的所有内容
                                </span>
                            </v-tooltip>
                        </v-list-item-action>
                    </v-list-item>
                </v-list-group>
                <v-list-item>
                    <v-list-item-action>
                        <v-btn text @click="resetLabel">
                            Reset Label
                        </v-btn>
                    </v-list-item-action>
                </v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {LabelViewDict} from "@/interface/interfaceInComponent"
    import GlobalChip from '@/components/global/GlobalChip.vue';
    import {getIcon} from "@/utils/icon";

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
            setLabel(_type: string, _label: string) {
                this.$emit('set-label', _type, _label)
            },

            resetLabel() {
                this.$emit('reset-label')
            },

            selectLabel(_type: string, _label: string) {
                this.$emit('select-label', _type, _label)
            },

            getIcon(group: IconGroup, name: string | boolean) {
                return getIcon(group, name)
            }
        },
        watch: {},
        record: {
            status: 'done',
            description: '标签选择器'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/6
* Updated by [whb on 2020年1月8日20:47:04]
*/
