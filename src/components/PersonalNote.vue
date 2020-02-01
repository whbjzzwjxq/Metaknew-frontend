<template>
    <v-card :width="width" :height="height" style="overflow: hidden">
        <v-toolbar color="deep-purple accent-4" flat dense :extension-height="36">
            <v-icon> {{ noteIcon }}</v-icon>
            <v-toolbar-title style="font-weight: bolder" class="pl-2">NOTE BOOK</v-toolbar-title>

            <v-spacer></v-spacer>

            <v-text-field
                hide-details
                single-line
                color="white"
                dense
            ></v-text-field>

            <icon-group :icon-list="iconList" color="black">

            </icon-group>

            <template v-slot:extension>
                <v-tabs v-model="currentItem" slider-color="white" color="white" :height="36">
                    <v-tab
                        style="width: 100px"
                        v-for="note in showedNotes"
                        :key="note.id"
                        :href="'#tab-' + note.id"
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
                                :key="note.id"
                                @click="chooseNote(note)"
                            >
                                {{ note.Name }}
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-tabs>
            </template>
        </v-toolbar>

        <template v-if="noteBooks.length">
            <v-tabs-items v-model="currentItem">
                <v-tab-item
                    v-for="note in reConcatNotes"
                    :key="note.id"
                    :value="'tab-' + note.id"
                >
                    <v-card flat>
                        <v-card-title>
                            <field-title
                                :edit-mode="isEditing"
                                :text="currentNote.Name"
                                :div-css="titleStyle"
                                @update-text="updateValue('Name', arguments[0])">

                            </field-title>
                            <v-spacer></v-spacer>
                            <time-render :time="currentNote.UpdateTime"></time-render>
                            <icon-group small :icon-list="noteIconList">

                            </icon-group>
                        </v-card-title>
                        <v-card-text class="pa-1">
                            <div style="height: 572px; width: 100%" class="cardItem">
                            <v-textarea
                                :disabled="!isEditing"
                                :value="currentNote.Text"
                                :rows="22"
                                auto-grow
                                filled
                                @input="updateValue('Text', arguments[0])"
                                counter>

                            </v-textarea>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-tab-item>
            </v-tabs-items>
        </template>

        <template v-else>
            <v-card flat tile>
                <v-card-title>
                    <p style="font-weight: bolder">暂时没有笔记 点击右上角"+"按钮新建笔记本</p>
                </v-card-title>
            </v-card>
        </template>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {getIcon} from "@/utils/icon";
    import {NoteBook} from "@/store/modules/userDataManager";
    import IconGroup from "@/components/IconGroup.vue";
    import {getIndex} from "@/utils/graphClass";
    import {currentTime, getCookie} from "@/utils/utils";
    import {commitNoteBookAdd, commitNoteBookRemove} from "@/store/modules/_mutations";
    import FieldTitle from "@/components/field/FieldTitle.vue";
    import TimeRender from "@/components/TimeRender.vue";

    export default Vue.extend({
        name: "PersonalNote",
        components: {
            IconGroup,
            FieldTitle,
            TimeRender
        },
        data: function () {
            return {
                width: 520,
                height: 720,
                noteIcon: getIcon('i-note-type', 'notebook'),
                deleteIcon: getIcon('i-edit', 'delete'),
                menuIcon: getIcon('i-arrow', false),
                currentItem: '',
                filterProp: 'Name',
                tabNum: 4,
                showedNotes: [] as NoteBook[],
                moreNotes: [] as NoteBook[],
                titleStyle: {
                    width: '240px'
                } as CSSProp
            }
        },
        props: {},
        computed: {
            userDataManager: function (): UserDataManagerState {
                return this.$store.state.userDataManager
            },
            noteBooks: function (): NoteBook[] {
                return this.userDataManager.userNotes
            },
            reConcatNotes: function (): NoteBook[] {
                return this.showedNotes.concat(this.moreNotes)
            },
            iconList: function (): IconItem[] {
                return [
                    {name: getIcon('i-edit', 'search'), _func: this.search},
                    {name: getIcon('i-note-type', 'addNote'), _func: this.addNote},
                    {name: getIcon('i-edit', 'save'), _func: this.save}
                ]
            },
            noteIconList: function (): IconItem[] {
                return [
                    {
                        name: getIcon('i-media-type', 'markdown'),
                        _func: this.markdownNote,
                        color: this.isMarkdown ? 'blue' : 'black',
                        toolTip: '是否按照Markdown解析'
                    },
                    {name: getIcon('i-edit-able', !this.isEditing), _func: this.editNote, color: 'black'},
                    {name: getIcon('i-edit', 'delete'), _func: this.deleteNote, color: 'black'}
                ]
            },
            currentNote: function (): NoteBook {
                let id = this.currentItem.substring(4);
                let note = this.reConcatNotes.filter(note => note.id.toString() === id)[0];
                return note || this.noteBooks[0]
            },
            isEditing: function (): boolean {
                return this.currentNote
                    ? this.currentNote.State.isEditing
                    : false
            },

            isMarkdown: function (): boolean {
                return this.currentNote
                    ? this.currentNote.$IsMarkdown
                    : false
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
                this.currentItem = 'tab-' + note.id;
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
                let id = getIndex();
                let note = {
                    id,
                    CreateUser: getCookie('user_id'),
                    CreateType: 'User',
                    Labels: [],
                    Name: 'New Note',
                    Text: '',
                    Svg: {},
                    UpdateTime: currentTime(),
                    $IsMarkdown: false,
                    State: {
                        isDeleted: false,
                        isSelf: true,
                        isEditing: true
                    }
                } as NoteBook;
                commitNoteBookAdd({note});
                let removed = this.pushNoteInShowed(note);
                this.pushNoteInMore(removed)
            },

            deleteNote: function () {
                let note = this.currentNote;
                let index = this.removeNoteFromShow(note);
                index === -1 && (this.removeNoteFromMore(note));
                commitNoteBookRemove({note});
            },

            editNote: function () {
                this.currentNote.State.isEditing = !this.isEditing
            },

            markdownNote: function () {
                this.currentNote.$IsMarkdown = !this.isMarkdown
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
