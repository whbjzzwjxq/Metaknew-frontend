<template>
    <div class="d-flex flex-row" style="width: 100%; height: 100%">
        <v-col cols="11" class="pa-0 pt-1 pl-4 pr-2">
            <v-autocomplete
                :dense="editMode"
                :items="activeItems()"
                :loading="isLoading"
                @input="updateSelection"
                @update:search-input="keywordChange"
                background-color="white"
                chips
                color="grey"
                flat
                height="32px"
                hide-selected
                item-text="Name_auto"
                multiple
                no-filter
                outlined
                return-object
                three-line
                v-model="selection"
            >
                <template v-slot:item="{ item }">
                    <template v-if="item.isTitle">
                        <v-list-item-content
                            v-html="getHeaderNameHtml(item.name, item.length)"></v-list-item-content>
                        <v-btn icon @click="collapse(item)">
                            <v-icon>
                                {{ getArrow(item)}}
                            </v-icon>
                        </v-btn>
                    </template>

                    <template v-else-if="item.isInfo">
                        <v-list-item-avatar>
                            <v-img :src="getSrc(item.MainPic)"></v-img>
                        </v-list-item-avatar>
                        <v-list-item-content>
                            <v-list-item-title
                                v-html="getItemTitle(item.Name_auto, item.PrimaryLabel)"></v-list-item-title>
                            <v-list-item-subtitle v-html="getItemSubTitle(item.Tags.Topic)"></v-list-item-subtitle>
                        </v-list-item-content>
                        <v-divider vertical light></v-divider>
                        <v-chip outlined label>
                            {{ item.UpdateTime }}
                        </v-chip>
                        <v-chip outlined label>
                            <v-icon color="yellow">mdi-star</v-icon>
                            <span class="font-weight-border">{{'\xa0\xa0\xa0' + item.Level.Star}}</span>
                        </v-chip>
                    </template>

                </template>
            </v-autocomplete>
        </v-col>
        <v-col class="pl-2 pr-2">
            <icon-group :icon-list="appendIconList" :small="editMode">

            </icon-group>
        </v-col>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {HomePageSearchResponse, queryHomePage, SearchQueryObject} from '@/api/search'
    import {GraphSelfPart, InfoToSetting, MediaSettingPart, NodeSettingPart} from '@/utils/graphClass'
    import {getIcon} from "@/utils/icon";
    import {getSrc} from "@/utils/utils";
    import IconGroup from "@/components/IconGroup.vue";
    import {
        ArrayListItem,
        AvailableListItem,
        ListInfoItem,
        ListItem,
        ListTextItem,
        ListTitle
    } from "@/utils/interfaceInComponent";

    export default Vue.extend({
        name: "SearchBar",
        components: {
            IconGroup
        },
        data() {
            return {
                keyword: '',
                isLoading: false,
                selection: [] as AvailableListItem[],
                searchResult: {
                    recent: [],
                    info: [],
                    text: []
                } as HomePageSearchResponse,
                regexLabel: new RegExp(':.{3,12}'),
                regexProps: new RegExp('-.{3,12}'),
                regexSymbol: new RegExp('\\s[-\\\\:*?",;<>|]'),
                typeTimer: 0,
                titleDict: {} as Record<string, ListTitle>,
                listItems: [] as ListItem[]
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
            currentGraph: function (): GraphSelfPart {
                return this.dataManager.currentGraph
            },
            buildQueryObject: function (): SearchQueryObject {
                let index = this.keyword.search(this.regexSymbol);
                let append;
                let words: Array<string>;
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
                    labels: labels.filter(label => label),
                    props: {},
                    keyword: this.keyword.substring(0, index)
                };
            },

            recentList: function (): ListInfoItem[] {
                return this.searchResult.recent.map(item => {
                        let info = Object.assign({} as ListInfoItem, item);
                        info.isTitle = false;
                        info.isInfo = true;
                        info.disabled = false;
                        return info
                    }
                )
            },

            textList: function (): ListTextItem[] {
                return this.searchResult.text.map(item => {
                        let info = Object.assign({MainPic: ''} as ListTextItem, item);
                        info.isTitle = false;
                        info.isInfo = true;
                        info.disabled = false;
                        info.Name_auto = info.Name;
                        return info
                    }
                )
            },

            infoList: function (): ListInfoItem[] {
                return this.searchResult.info.map(item => {
                        let info = Object.assign({} as ListInfoItem, item);
                        info.isTitle = false;
                        info.isInfo = true;
                        info.disabled = false;
                        return info
                    }
                )
            },

            appendIconList: function (): IconItem[] {
                return [
                    {name: getIcon('i-edit', this.editMode ? 'add' : 'search'), _func: this.addItemToGraph},
                    {name: getIcon('i-edit', 'close'), _func: this.clear}
                ]
            }
        },
        methods: {
            activeItems(): ArrayListItem {
                let dict: Record<string, ArrayListItem> = {
                    recent: this.recentList,
                    text: this.textList,
                    info: this.infoList
                };
                let result: ArrayListItem = [];
                Object.keys(this.titleDict).map(key => {
                    result.push(this.titleDict[key]);
                    if (!this.titleDict[key].isCollapse && dict[key]) {
                        (result = result.concat(dict[key]))
                    }
                });
                return result
            },
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

            getSrc: function (src: string) {
                return getSrc(src)
            },

            clear() {
                this.selection = [];
            },

            addItemToGraph() {
                let unDuplicateItems = this.selection.filter(item => this.currentGraph.checkExist(item._id, item.type));
                let nodes = unDuplicateItems.filter(item => item.type !== 'media');
                let medias = unDuplicateItems.filter(item => item.type === 'media');
                let queryObjectList = this.selection.filter(item => !this.dataManager.nodeManager[item._id]);
                this.$store.dispatch('nodeQuery', queryObjectList.filter(item => item.type !== 'media').map(
                    item => InfoToSetting(item))
                );
                this.$store.dispatch('mediaQuery', queryObjectList.filter(item => item.type === 'media').map(
                    item => item._id)
                );
                let nodeSettingList = nodes.map(node => {
                    let {_id, _type, _label} = InfoToSetting(node);
                    return NodeSettingPart.emptyNodeSetting(_id, _type, _label, node.Name_auto, node.MainPic, this.currentGraph)
                });
                this.currentGraph.addItems(nodeSettingList);
                let mediaSettingList = medias.map(media => {
                    let {_id, _label} = InfoToSetting(media);
                    return MediaSettingPart.emptyMediaSetting(_id, _label, media.Name_auto, '', this.currentGraph)
                });
                this.currentGraph.addItems(mediaSettingList)
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
                this.$set(item, 'isCollapse', !item.isCollapse)
            },
            getTitle() {
                let keys = Object.keys(this.searchResult);
                keys.map(key => {
                    this.titleDict[key] = {
                        name: key,
                        length: this.searchResult[key].length,
                        disabled: false,
                        isCollapse: false,
                        isInfo: false,
                        isTitle: true,
                    } as ListTitle
                });
            },
            updateSelection($event: AvailableListItem[]) {
                this.selection = $event.filter(item => !item.isTitle)
            }

        },
        watch: {
            selection(): void {
                if (!this.editMode) {
                    if (this.singleSelect && this.selection.length > 0) {
                        if (this.selection[0].PrimaryLabel === 'DocGraph') {
                            this.$router.push({
                                name: "graph",
                                path: "graph/id=:id/mode=:mode",
                                params: {id: this.selection[0]._id.toString(), mode: 'normal'}
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
