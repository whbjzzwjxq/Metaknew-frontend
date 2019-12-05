<template>
  <div class="d-flex flex-row" style="width: 720px; height: 64px">
    <v-row style="height: 64px">
      <v-col cols="10" class="pa-0 pt-3">
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
              <v-list-item-content v-html="getHeaderNameHtml(item.name, item.length)"></v-list-item-content>
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
                <v-list-item-title v-html="getItemTitle(item.Name_auto, item.PrimaryLabel)"></v-list-item-title>
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
      <v-col class="pa-0 pt-4 pl-1">
        <div>
          <v-btn :small="editMode" icon @click="addItemToGraph">
            <v-icon>{{editMode ? 'mdi-plus' : 'mdi-magnify'}}</v-icon>
          </v-btn>
          <v-btn :small="editMode" icon @click="clear">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {DataManagerState} from '@/store/modules/dataManager'
    import {IndexedInfo, IndexedText, queryHomePage, SearchBackObject, SearchQueryObject} from '@/api/search'
    import {GraphSelfPart, InfoToSetting, MediaSettingPart, NodeSettingPart} from '@/utils/graphClass'
    import {commitSettingPush} from '@/store/modules/_mutations'

    interface ListInfoItem extends IndexedInfo {
        isTitle: boolean,
        isInfo: boolean,
        disabled: boolean
    }

    interface ListTextItem extends IndexedText {
        isTitle: boolean,
        isInfo: boolean,
        disabled: boolean
    }

    interface ListTitle {
        isTitle: boolean,
        isInfo: boolean,
        isCollapse: boolean,
        length: number,
        name: string,
        disabled: boolean
    }

    type ListItem = AvailableListItem | ListTitle
    type AvailableListItem = ListInfoItem | ListTextItem
    type ArrayListItem = Array<ListItem>

    export default Vue.extend({
        name: "SearchBar",
        components: {},
        data() {
            return {
                keyword: '',
                isLoading: false,
                selection: [] as AvailableListItem[],
                searchResult: {
                    recent: [],
                    info: [],
                    text: []
                } as SearchBackObject,
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
            }
        },
        computed: {
            dataManager(): DataManagerState {
                return this.$store.state.dataManager
            },
            currentGraph(): GraphSelfPart {
                return this.dataManager.currentGraph
            },
            buildQueryObject(): SearchQueryObject {
                let vm = this;
                let index = vm.keyword.search(vm.regexSymbol);
                let append;
                let words: Array<string>;
                if (index === -1) {
                    index = vm.keyword.length;
                    append = "";
                    words = [];
                } else {
                    append = vm.keyword.substring(index + 1, vm.keyword.length);
                    words = append.split(" ");
                }
                let labels: Array<string> = words.map(word =>
                    vm.regexLabel.test(word)
                        ? word.substring(1, word.length)
                        : ''
                ).filter(word => word !== '');
                return {
                    language: "auto",
                    labels: labels.filter(label => label),
                    props: {},
                    keyword: vm.keyword.substring(0, index)
                };
            },

            recentList(): ListInfoItem[] {
                return this.searchResult.recent.map(item => {
                        let info = Object.assign({} as ListInfoItem, item);
                        info.isTitle = false;
                        info.isInfo = true;
                        info.disabled = false;
                        return info
                    }
                )
            },

            textList(): ListTextItem[] {
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

            infoList(): ListInfoItem[] {
                return this.searchResult.info.map(item => {
                        let info = Object.assign({} as ListInfoItem, item);
                        info.isTitle = false;
                        info.isInfo = true;
                        info.disabled = false;
                        return info
                    }
                )
            },
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
                        .catch(err => {
                            console.log(err);
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
                let result: string;
                src
                    ? result = 'https://metaknew.oss-cn-beijing.aliyuncs.com/' + src
                    : result = "";
                return result
            },

            clear() {
                this.selection = [];
            },

            addItemToGraph() {
                let unDuplicateItems = this.selection.filter(item => this.currentGraph.checkExist(item.id, item.type));
                let nodes = unDuplicateItems.filter(item => item.type !== 'media');
                let medias = unDuplicateItems.filter(item => item.type === 'media');
                let queryObjectList = this.selection.filter(item => !this.dataManager.nodeManager[item.id]);
                this.$store.dispatch('nodeQuery', queryObjectList.filter(item => item.type !== 'media').map(
                    item => InfoToSetting(item))
                );
                this.$store.dispatch('mediaQuery', queryObjectList.filter(item => item.type === 'media').map(
                    item => item.id)
                );
                let nodeSettingList = nodes.map(node => {
                    let {_id, _type, _label} = InfoToSetting(node);
                    return NodeSettingPart.emptyNodeSetting(_id, _type, _label, node.Name_auto, node.MainPic, this.currentGraph)
                });
                commitSettingPush(nodeSettingList);
                let mediaSettingList = medias.map(media => {
                    let {_id, _label} = InfoToSetting(media);
                    return MediaSettingPart.emptyMediaSetting(_id, _label, media.Name_auto, '', this.currentGraph)
                });
                commitSettingPush(mediaSettingList)
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

            getArrow: (item: ListTitle): string => item.isCollapse
                ? 'mdi-chevron-up'
                : 'mdi-chevron-down',

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
                                params: {id: this.selection[0].id.toString(), mode: 'normal'}
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
            status: 'done'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/11/25
* Updated by []
*/
