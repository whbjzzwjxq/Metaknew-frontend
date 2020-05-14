<template>
    <v-card :width="container.width" :height="container.height" style="overflow: hidden">
        <v-toolbar color="deep-purple accent-4" flat dense :extension-height="36">
            <v-icon> {{ noteIcon }}</v-icon>
            <v-toolbar-title style="font-weight: bolder" class="pl-2 unselected">
                NOTE BOOK
            </v-toolbar-title>

            <v-spacer></v-spacer>

            <v-text-field
                hide-details
                single-line
                color="white"
                dense
            ></v-text-field>

            <icon-group :icon-list="iconList" color="black" small>

            </icon-group>

            <template v-slot:extension>
                <v-tabs v-model="currentItem" slider-color="white" color="white" :height="36">
                    <v-tab
                        style="width: 100px"
                        v-for="note in showedNotes"
                        :key="note._id"
                        :href="'#tab-' + note._id"
                    >
                        {{ getName(note.Name) }}
                    </v-tab>

                    <v-menu
                        v-if="moreNotes.length > 0"
                        bottom
                        left
                    >
                        <template v-slot:activator="{ on }">
                            <v-btn text class="align-self-center" v-on="on">
                                more
                                {{ moreNotes.length }}
                                <v-icon right> {{ menuIcon }}</v-icon>
                            </v-btn>
                        </template>

                        <v-list class="grey lighten-3">
                            <v-list-item
                                v-for="note in moreNotes"
                                :key="note._id"
                                @click="chooseNote(note)"
                            >
                                {{ note.Name }}
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-tabs>
            </template>
        </v-toolbar>

        <template v-if="noteBooks.length > 0">
            <v-card flat tile height="520">
                <v-tabs-items v-model="currentItem">
                    <v-tab-item
                        v-for="note in reConcatNotes"
                        :key="note._id"
                        :value="'tab-' + note._id"
                    >
                        <v-card flat>
                            <v-card-title class="py-2 d-flex flex-row">
                                <div>
                                    <p class="title text-center ma-0 pr-2">Title: </p>
                                </div>
                                <div>
                                    <field-title
                                        :edit-mode="isEditing"
                                        :text="currentNote.Name"
                                        :div-css="titleStyle"
                                        @update-text="updateValue('Name', arguments[0])">

                                    </field-title>
                                </div>
                                <v-spacer></v-spacer>
                                <div>
                                    <time-render :time="currentNote.UpdateTime"></time-render>
                                </div>
                                <div>
                                    <icon-group small :icon-list="noteIconList">

                                    </icon-group>
                                </div>
                            </v-card-title>
                            <v-card-text class="py-2">
                                <markdown-render
                                    :div-style="textAreaStyle"
                                    :edit-base="isEditing"
                                    :rows="20"
                                    v-model="currentNote.Text"
                                >
                                </markdown-render>
                            </v-card-text>
                        </v-card>
                    </v-tab-item>
                </v-tabs-items>
            </v-card>
        </template>

        <template v-else>
            <v-card flat tile height="520">
                <v-card-title>
                    <p style="font-weight: bolder">暂时没有笔记 点击右上角"+"按钮新建笔记本</p>
                </v-card-title>
            </v-card>
        </template>
        <div style="height: 100%; width: 100%" class="pa-2">
            <markdown-toolbar>

            </markdown-toolbar>
        </div>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {getIcon} from "@/utils/icon";
    import {NoteBook} from "@/store/modules/userDataManager";
    import IconGroup from "@/components/IconGroup.vue";
    import {currentTime, getCookie, getIndex} from "@/utils/utils";
    import FieldTitle from "@/components/field/FieldTitle.vue";
    import TimeRender from "@/components/TimeRender.vue";
    import MarkdownRender from "@/components/markdown/MarkdownRender.vue";
    import MarkdownToolbar from "@/components/markdown/MarkdownToolbar.vue";
    import {dispatchNoteBookPush} from '@/store/modules/_dispatch';
    import {DocumentSelfPart} from "@/class/settingBase";

    export default Vue.extend({
        name: "PersonalNote",
        components: {
            IconGroup,
            FieldTitle,
            TimeRender,
            MarkdownRender,
            MarkdownToolbar
        },
        data: function () {
            return {
                noteIcon: getIcon('i-note-type', 'notebook'),
                deleteIcon: getIcon('i-edit', 'delete'),
                menuIcon: getIcon('i-arrow', false),
                currentItem: '',
                filterProp: 'Name',
                tabNum: 4,
                showedNotes: [] as NoteBook[],
                moreNotes: [] as NoteBook[],
                titleStyle: {
                    width: '240px',
                    fontSize: '28px',
                    fontWeight: "bold"
                } as CSSProp
            }
        },
        props: {},
        computed: {
            userDataManager: function (): UserDataManagerState {
                return this.$store.state.userDataManager
            },
            styleManager: function (): StyleManagerState {
                return this.$store.state.styleComponentSize
            },
            dataManager: function (): DataManagerState {
                return this.$store.state.dataManager
            },
            currentDocument: function(): DocumentSelfPart {
                return this.dataManager.currentDocument
            },
            container: function (): ComponentSize {
                return this.styleManager.noteBook
            },
            noteBooks: function (): NoteBook[] {
                return this.userDataManager.userNoteBook
            },
            reConcatNotes: function (): NoteBook[] {
                return this.showedNotes.concat(this.moreNotes)
            },
            iconList: function (): IconItem[] {
                return [
                    {name: getIcon('i-edit', 'search'), _func: this.search},
                    {name: getIcon('i-note-type', 'addNote'), _func: this.addNote},
                    {name: getIcon('i-edit', 'save'), _func: this.save},
                    {name: getIcon('i-arrow-double', 'right'), _func: this.addNoteToDocument, toolTip: '添加一个便签到图形内'}
                ]
            },
            noteIconList: function (): IconItem[] {
                return [
                    {
                        name: getIcon('i-media-type', 'markdown'),
                        color: 'blue',
                        toolTip: '支持Markdown解析'
                    },
                    {name: getIcon('i-edit', 'delete'), _func: this.deleteNote, color: 'black'}
                ]
            },
            currentNote: function (): NoteBook {
                let _id = this.currentItem.substring(4);
                let note = this.reConcatNotes.filter(note => note._id.toString() === _id)[0];
                return note || this.noteBooks[0]
            },
            isEditing: function (): boolean {
                return this.currentNote
                    ? this.currentNote.State.isEditing
                    : false
            },

            textAreaStyle: function (): CSSProp {
                return {
                    height: '572px',
                    width: '100%'
                }
            }
        },
        methods: {
            pushNoteInShowed: function (note: NoteBook) {
                let removed = [] as NoteBook[];
                if (this.noteBooks.length > this.tabNum) {
                    removed = this.showedNotes.splice(0, 1);
                    this.showedNotes.push(note);
                } else {
                    this.showedNotes.push(note);
                }
                this.currentItem = 'tab-' + note._id;
                return removed
            },
            pushNoteInMore: function (note: NoteBook[]) {
                this.moreNotes.push(...note)
            },

            removeNoteFromMore: function (note: NoteBook) {
                let index = this.moreNotes.indexOf(note);
                this.moreNotes.splice(index, 1);
                return index
            },

            removeNoteFromShow: function (note: NoteBook) {
                let index = this.moreNotes.indexOf(note);
                this.showedNotes.splice(index, 1);
                return index
            },

            chooseNote(note: NoteBook) {
                this.removeNoteFromMore(note);
                let removed = this.pushNoteInShowed(note);
                this.pushNoteInMore(removed)
            },

            reRankNotes: function (prop: 'Name' | 'UpdateTime'): NoteBook[] {
                let newNotes = this.noteBooks;
                this.filterProp = prop;
                newNotes.sort((a: NoteBook, b: NoteBook) => a[prop] > b[prop]
                    ? 1
                    : a[prop] === b[prop]
                        ? 0
                        : -1);
                return newNotes
            },

            addNote: function () {
                let _id = getIndex();
                let note = {
                    _id,
                    CreateUser: getCookie('user_id'),
                    CreateType: 'User',
                    Labels: [],
                    Name: 'New Note',
                    Text: '',
                    Svg: {},
                    UpdateTime: currentTime(),
                    IsMarkdown: false,
                    State: {
                        isDeleted: false,
                        isSelf: true,
                        isEditing: true
                    }
                } as NoteBook;
                //todo 添加笔记本 已经列入文档
                // 加入到现有note里面
                let removed = this.pushNoteInShowed(note);
                this.pushNoteInMore(removed);
                dispatchNoteBookPush({note})
            },

            deleteNote: function () {
                let note = this.currentNote;
                let index = this.removeNoteFromShow(note);
                index === -1 && (this.removeNoteFromMore(note));
                //todo 删除笔记 已经列入文档
            },

            addNoteToDocument: function () {
                this.currentDocument.addEmptyNote()
            },

            save: function () {

            },

            search: function () {

            },

            getName: function (text: string) {
                return text.length >= 8
                    ? text.substring(0, 5) + '...'
                    : text
            },

            updateValue: function (prop: string, value: string | string[] | Object) {
                this.currentNote && (this.currentNote[prop] = value)
            }

        },
        created(): void {
            this.showedNotes = this.reRankNotes('UpdateTime').slice(0, this.tabNum)
        },
        record: {
            status: 'empty',
            description: ''
        }
    })
</script>

<style scoped>

</style>
