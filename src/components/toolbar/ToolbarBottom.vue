<template>
    <v-card tile :style="toolbarStyle" elevation="0" outlined>
        <div :style="buttonGroupStyle" class="floatButton">
            <div class="button-normal pb-4">
                <v-menu top offset-x :close-on-content-click="false" nudge-bottom="100" nudge-right="12">
                    <template v-slot:activator="{ on }">
                        <v-btn fixed fab color="blue" large v-on="on" v-show="toolbarOn">
                            <v-icon color="#111111"> {{ noteIcon }}</v-icon>
                        </v-btn>
                    </template>
                    <personal-note @add-empty-note="addNoteToDocument"></personal-note>
                </v-menu>
            </div>
            <div class="button-normal pb-4">
                <v-menu top offset-x :close-on-content-click="false" nudge-bottom="100" nudge-right="12">
                    <template v-slot:activator="{ on }">
                        <v-btn fixed fab color="green" large v-on="on" v-show="toolbarOn">
                            <v-icon color="#111111"> {{ fragmentIcon }}</v-icon>
                        </v-btn>
                    </template>
                    <fragment-list></fragment-list>
                </v-menu>
            </div>
            <div class="button-normal pb-4">
                <v-btn fixed fab color="pink" @click="collapse" large>
                    <v-icon color="#111111"> {{ arrowIcon }}</v-icon>
                </v-btn>
            </div>
        </div>
        <div style="width: 100%; height: 100%" class="d-flex flex-row">
            <div style="width: 80px; height: 100%">
            </div>
            <div class="d-flex flex-row flex-grow-1">
            <slot name="subTool"></slot>
            </div>
        </div>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {getIcon} from "@/utils/icon";
    import FragmentList from "@/components/FragmentList.vue";
    import PersonalNote from "@/components/PersonalNote.vue";
    import {commitBottomBarCollapse} from "@/store/modules/_mutations";
    export default Vue.extend({
        name: "ToolbarBottom",
        components: {
            FragmentList,
            PersonalNote
        },
        data() {
            return {
                toolbarOn: true,
                fragmentIcon: getIcon('i-item', 'fragment'),
                noteIcon: getIcon('i-item', 'note')
            }
        },
        props: {},
        computed: {
            styleManager: function (): StyleManagerState {
                return this.$store.state.styleComponentSize
            },
            toolbarStyle: function (): CSSProp {
                return {
                    height: this.styleManager.bottomBar.height + 'px',
                    backgroundColor: 'white',
                    overflow: "hidden",
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    left: this.styleManager.leftCard.width + 'px'
                }
            },
            buttonGroupStyle: function (): CSSProp {
                return {
                    left: '10px',
                    bottom: (this.styleManager.bottomBar.height + 12) + 'px',
                    position: "absolute",
                    width: '56px',
                    height: '168px',
                    zIndex: 2
                }
            },
            arrowIcon: function (): string {
                return getIcon('i-arrow-double', !this.toolbarOn)
            }
        },
        methods: {
            collapse() {
                let height;
                this.toolbarOn
                    ? height = 8
                    : height = 108;
                commitBottomBarCollapse(height);
                this.toolbarOn = !this.toolbarOn
            },

            addNoteToDocument() {
                this.$emit('add-empty-note')
            }
        },
        watch: {},
        record: {
            status: 'done',
            description: '下方用的工具栏'
        }
    })
</script>

<style scoped>
    .button-normal {
        width: 64px;
        height: 72px;
    }
</style>

/**
* Created by whb on 2020/1/4
* Updated by []
*/
