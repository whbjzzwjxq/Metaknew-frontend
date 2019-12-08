<template>
    <div :style="toolbarStyle" class="d-flex">
        <div class="empty"></div>
        <v-menu
            top offset-y
            :close-on-content-click="false"
            :close-delay="2000">
            <template v-slot:activator="{ on }">
                <v-btn depressed outlined tile v-on="on">新建节点</v-btn>
            </template>
            <v-list>
                <v-list-item>
                    <v-select
                        v-model="newNodeLabel"
                        label="PrimaryLabel"
                        :items="nodePLabel"
                        @input="addNode">
                    </v-select>
                </v-list-item>
            </v-list>
        </v-menu>
        <div class="empty"></div>
        <v-menu
            top offset-y
            :close-on-content-click="false"
            :close-delay="2000">
            <template v-slot:activator="{ on }">
                <v-btn depressed outlined tile v-on="on">新建媒体/文本</v-btn>
            </template>
            <v-list>
                <v-list-item>
                    <v-select
                        v-model="newMediaLabel"
                        label="MediaType"
                        :items="mediaPLabel"
                        @input="addMedia">
                    </v-select>
                </v-list-item>
            </v-list>
        </v-menu>
        <div class="empty"></div>
        <v-menu
            top offset-y
            :close-on-content-click="false"
            :close-delay="2000">
            <template v-slot:activator="{ on }">
                <v-btn depressed outlined tile v-on="on">新建关系</v-btn>
            </template>
            <link-start-end-selector
                :document="document"
                @add-link="addLink"
                edit-mode>

            </link-start-end-selector>
        </v-menu>
        <div class="empty"></div>
        <v-btn depressed outlined tile>新建路径</v-btn>
        <div class="empty"></div>
        <v-btn depressed outlined tile @click="addNote">添加便签</v-btn>
        <div class="empty"></div>
        <v-btn depressed outlined tile @click="saveDoc(false)">保存专题</v-btn>
        <div class="empty"></div>
        <v-btn depressed outlined tile @click="saveDoc(true)" :disabled="disableDraft">保存为草稿</v-btn>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {GraphSelfPart, newIdRegex, VisualNodeSettingPart} from "@/utils/graphClass";
    import LinkStartEndSelector from "@/components/LinkStartEndSelector.vue";
    import {availableLabel} from "@/utils/labelField";
    import * as CSS from 'csstype'
    import {ComponentSize, StyleManagerState} from "@/store/modules/styleComponentSize";

    export default Vue.extend({
        name: "ResultDocGraphToolbarEdit",
        components: {
            LinkStartEndSelector
        },
        data() {
            return {
                newNodeItems: [
                    {"title": "知识节点", "type": "node"},
                    {"title": "媒体内容", "type": "media"},
                ],
                newNodeLabel: null,
                newMediaLabel: null,
                mediaPLabel: ["Text", "Image", "Audio", "Pdf", "Video"]
            }
        },
        props: {
            document: {
                type: Object as () => GraphSelfPart,
                required: true
            },
            editMode: {
                type: Boolean as () => boolean,
                default: false
            }
        },
        computed: {
            nodePLabel() {
                return availableLabel
            },
            disableDraft(): boolean {
                return newIdRegex.test(this.document.id.toString())
            },
            styleManager(): StyleManagerState {
                return this.$store.state.styleComponentSize
            },
            toolbarStyle(): CSS.Properties {
                return {
                    position: "absolute",
                    left: '200px',
                    bottom: this.styleManager.bottomBar.height / 2 + 'px'
                }
            }
        },
        methods: {
            addNode() {
                this.$emit('add-empty-node', this.newNodeLabel);
            },

            addNote() {
                this.$emit('add-note');
            },

            addMedia() {

            },

            addLink(start: VisualNodeSettingPart | null, end: VisualNodeSettingPart | null) {
                this.$emit('add-link', start, end)
            },
            saveDoc(isDraft: boolean) {
                this.$emit('save-doc', isDraft)
            }
        },
        watch: {},
        record: {
            status: 'empty'
        }
    })
</script>

<style scoped>
    .empty {
        height: 36px;
        width: 12px;
    }
</style>

/**
* Created by whb on 2019/12/7
* Updated by []
*/
