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
        <slot name="subTool"></slot>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {getIcon} from "@/utils/icon";
    import FragmentList from "@/components/FragmentList.vue";
    import PersonalNote from "@/components/PersonalNote.vue";
    import {leftCardPadding} from "@/store/modules/styleComponentSize";
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
                    position: "absolute",
                    left: (this.styleManager.leftCard.width + 1) + 'px',
                    bottom: 0,
                    height: this.styleManager.bottomBar.height + 'px',
                    width: this.styleManager.bottomBar.width,
                    backgroundColor: 'white',
                    overflow: "hidden"
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
                this.$store.commit('resetBottomBar', height);
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
