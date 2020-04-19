<template>
    <div class="d-flex flex-row" style="width: 100%; height: 100%">
        <div class="pa-0 pt-1 flex-grow-1">
            <v-autocomplete
                :dense="editMode"
                :items="activeItems"
                :loading="isLoading"
                @input="updateSelection"
                @update:search-input="keywordChange"
                background-color="white"
                chips
                color="grey"
                flat
                height="32px"
                hide-selected
                item-text="Name.auto"
                item-value="id"
                multiple
                no-filter
                outlined
                return-object
                three-line
                v-model="selection"
            >
                <template v-slot:item="{ item }">
                    <template v-if="item.isTitle">
                        <v-list-item-content v-html="getHeaderNameHtml(item.name, item.length)">

                        </v-list-item-content>
                        <v-btn icon @click="collapse(item)">
                            <v-icon>
                                {{ getArrow(item)}}
                            </v-icon>
                        </v-btn>
                    </template>

                    <template v-else-if="!item.isTitle">
                        <v-list-item-avatar>
                            <v-img :src="getSrc(item.MainPic)"></v-img>
                        </v-list-item-avatar>
                        <v-list-item-content>
                            <v-list-item-title
                                v-html="getItemTitle(item.Name.auto, item.PrimaryLabel)"></v-list-item-title>
                            <v-list-item-subtitle v-html="getItemSubTitle(item.Tags.Topic)"></v-list-item-subtitle>
                        </v-list-item-content>
                        <v-divider vertical light></v-divider>
                        <v-chip outlined label>
                            {{ item.UpdateTime }}
                        </v-chip>
                        <v-chip outlined label>
                            <v-icon color="yellow">mdi-star</v-icon>
                            <span class="font-weight-border">{{'\xa0\xa0\xa0' + item.Num.NumStar}}</span>
                        </v-chip>
                    </template>
                </template>
            </v-autocomplete>
        </div>
        <div class="pa-2 pt-3 px-sm-1 px-xs-1">
            <icon-group :icon-list="appendIconList" :small="editMode">

            </icon-group>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {HomePageSearchResponse, queryHomePage, SearchQueryObject} from '@/api/search/search'
    import {DocumentSelfPart, MediaSettingPart, NodeSettingPart} from '@/class/settingBase'
    import {getIcon} from "@/utils/icon";
    import {getSrc} from "@/utils/utils";
    import IconGroup from "@/components/IconGroup.vue";
    import {ListItem, ListText, ListTitle} from "@/interface/interfaceInComponent";
    import {isListText} from "@/utils/typeCheck";
    import {dispatchMediaQuery, dispatchNodeQuery} from "@/store/modules/_dispatch";

    export default Vue.extend({
        name: "SearchBar",
        components: {
            IconGroup
        },
        data() {
            return {
                keyword: '',
                isLoading: false,
                selection: [] as ListText[],
                searchResult: {
                    'Document': [],
                    'Meta': []
                } as HomePageSearchResponse,
                regexLabel: /:.{3,12}/,
                regexProps: /-.{3,12}/,
                regexType: /@.{3,12}/,
                regexSymbol: new RegExp('\\s[-\\\\:*?",;<>|]'),
                typeTimer: 0,
                titleDict: {} as Record<string, ListTitle>,
                listItems: [] as ListItem[],
                titleList: ['Document', 'Meta'] as string[]
            }
        },
        props: {
            editMode: {
                type: Boolean,
                default: false
            },
            singleSelect: {
                type: Boolean,
                default: false
            },
            rect: {
                type: Object as () => RectObject,
                default: () => ({
                    width: 720,
                    height: 48
                })
            }
        },
        computed: {
            dataManager: function (): DataManagerState {
                return this.$store.state.dataManager
            },

            currentDocument: function (): DocumentSelfPart {
                return this.dataManager.currentDocument
            },
            buildQueryObject: function (): SearchQueryObject {
                let index = this.keyword.search(this.regexSymbol);
                let append;
                let words: string[];
                if (index === -1) {
                    index = this.keyword.length;
                    append = "";
                    words = [];
                } else {
                    append = this.keyword.substring(index + 1, this.keyword.length);
                    words = append.split(" ");
                }
                let labels: Array<string> = words.map(word =>
                    this.regexLabel.test(word)
                        ? word.substring(1, word.length)
                        : ''
                ).filter(word => word !== '');
                return {
                    language: "auto",
                    labels: labels.filter(label => label) || [],
                    props: [],
                    keyword: this.keyword.substring(0, index),
                    type: ['node']
                };
            },

            appendIconList: function (): IconItem[] {
                return [
                    {
                        name: getIcon('i-edit', this.editMode ? 'add' : 'search'),
                        _func: this.addItemToGraph,
                        toolTip: '添加选中的内容到专题中'
                    },
                    {
                        name: getIcon('i-edit', 'close'),
                        _func: this.clear,
                        toolTip: '清除选择集'
                    }
                ]
            },

            activeItems: function (): ListItem[] {
                let result: ListItem[] = [];
                this.titleList.map(key => {
                    result.push(this.titleDict[key]);
                    if (!this.titleDict[key].isCollapse) {
                        let listItem = this.searchResult[key].map(item => {
                            return {
                                ...item,
                                isTitle: false,
                                isDocument: item['type'] === 'document',
                                disabled: false
                            } as ListItem
                        });
                        result = result.concat(listItem)
                    }
                });
                return result
            },
        },
        methods: {
            hint() {
                if (this.isLoading) {
                    //
                } else {
                    this.isLoading = true;
                    queryHomePage(this.buildQueryObject)
                        .then(res => {
                            this.searchResult = res.data
                        })
                        .catch(() => {
                            //
                        })
                        .finally(() => {
                            this.isLoading = false;
                        });
                }
            },

            keywordChange($event: string) {
                if ($event) {
                    this.keyword = $event;
                    clearTimeout(this.typeTimer);
                    this.typeTimer = setTimeout(this.hint, 1500);
                }
            },

            getSrc(src: string) {
                return getSrc(src)
            },

            clear() {
                this.selection = [];
            },

            addItemToGraph() {
                let unDuplicateItems = this.selection.filter(item => !this.currentDocument.checkExistByIdType({
                    _id: item.id,
                    _type: item.type
                }));
                let nodes = unDuplicateItems.filter(item => item.type === 'node' || item.type === 'document');
                let medias = unDuplicateItems.filter(item => item.type === 'media');
                let nodeSettingList = nodes.map(node => NodeSettingPart.emptyNodeSetting(
                        {
                            _id: node.id,
                            //@ts-ignore
                            _type: node.type,
                            _label: node.PrimaryLabel,
                            _name: node.Name['auto'],
                            _image: node.MainPic,
                        },
                        this.currentDocument)
                );
                this.currentDocument.addItems(nodeSettingList);
                dispatchNodeQuery(nodeSettingList.map(item => item.Setting));
                let mediaSettingList = medias.map(media => MediaSettingPart.emptyMediaSetting(
                    {
                        _id: media.id,
                        _type: 'media',
                        _label: media.PrimaryLabel,
                        _name: media.Name['auto'],
                        _src: '',
                    } as MediaInitPayload,
                    this.currentDocument
                ));
                dispatchMediaQuery(medias.map(media => media.id));
                this.currentDocument.addItems(mediaSettingList);
                this.selection = []
            },

            getHeaderNameHtml(name: string, length: number) {
                return name + '  ' + '<span class="blue-grey--text text--darken-2">' + length + '</span>'
            },

            getItemSubTitle(topic: Array<string>) {
                if (topic.length > 0) {
                    return '在' + '<span class="font-weight-bold blue-grey--text">' + topic.join(",") + '</span>' + '话题下'
                } else {
                    return ''
                }
            },

            getItemTitle(name: string, pLabel: string) {
                return '<span class="text--primary font-weight-bold">' + name +
                    '</span>' + ' ' + '<span class="grey--text text--secondary">' + pLabel + '</span>'
            },

            getArrow: (item: ListTitle): string => getIcon('i-arrow', item.isCollapse),

            collapse(item: ListTitle) {
                item.isCollapse = !item.isCollapse
            },
            getTitle() {
                let titleList = this.titleList;
                titleList.map((key, index) => {
                    this.titleDict[key] = {
                        id: -index,
                        name: key,
                        length: this.searchResult[key].length,
                        disabled: false,
                        isCollapse: false,
                        isInfo: false,
                        isTitle: true,
                    } as ListTitle
                });
            },
            updateSelection($event: ListItem[]) {
                //@ts-ignore
                this.selection = $event.filter(item => isListText(item))
            }

        },
        watch: {
            selection(): void {
                if (!this.editMode) {
                    if (this.singleSelect && this.selection.length > 0) {
                        if (this.selection[0].PrimaryLabel === '_DocGraph') {
                            this.$router.push({
                                name: "graph-normal",
                                path: "graph/id=:id/normal",
                                params: {id: this.selection[0].id.toString()}
                            })
                        }
                    }
                }
            },
            searchResult() {
                this.getTitle()
            }
        },
        created(): void {
            this.getTitle()
        },
        record: {
            status: 'done',
            description: '搜索栏'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/11/25
* Updated by []
*/
