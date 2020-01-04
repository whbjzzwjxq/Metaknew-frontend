<template>
    <div>
        <card-sub-row text="New Media">
            <template v-slot:content>
                <media-adder
                    :current-media-id-list="mediaIdList"
                    @update-media="addMediaToNode">

                </media-adder>
            </template>
        </card-sub-row>

        <card-sub-row text="Current Media">
            <template v-slot:content>
                <div v-for="(file, index) in reRankedList" :key="index">
                    <v-row class="ma-0 justify-content-between">
                        <keep-alive>
                            <card-page-media-info
                                :media="file"
                                :nodeIsSelf="nodeIsSelf"
                                :width="width"
                                @add-media-to-graph="addMediaToGraph">

                            </card-page-media-info>
                        </keep-alive>
                    </v-row>
                </div>
            </template>
        </card-sub-row>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import CardSubRow from "@/components/card/subComp/CardSubRow.vue";
    import CardPageMediaInfo from "@/components/card/page/CardPageMediaInfo.vue";
    import {mediaAppendToNode} from "@/api/commonSource";
    import {id, NodeInfoPart, MediaInfoPart, MediaSettingPart, QueryObject, getIsSelf} from "@/utils/graphClass";
    import {DataManagerState} from "@/store/modules/dataManager";
    import {FileToken, getFileToken} from '@/api/user'
    import {commitFileToken} from "@/store/modules/_mutations";
    import MediaAdder from "@/components/media/MediaAdder.vue";

    type SortProp = 'UpdateTime' | 'isStar' | 'PrimaryLabel'
    export default Vue.extend({
        name: "CardPageMediaList",
        components: {
            CardPageMediaInfo,
            CardSubRow,
            MediaAdder
        },
        data() {
            return {
                filterProp: 'UpdateTime' as SortProp,
                fileResolverProps: {
                    chips: true,
                    label: "File input",
                    placeholder: "Upload medias",
                    "prepend-icon": "mdi-paperclip",
                },
                loading: true,
                reRankedList: [] as MediaInfoPart[],
            }
        },
        props: {
            baseData: {
                type: Object as () => NodeInfoPart,
                required: true
            },
        },
        computed: {
            mediaIdList: function (): id[] {
                return this.baseData.Info.IncludedMedia
            },
            dataManager: function (): DataManagerState {
                return this.$store.state.dataManager
            },
            mediaList: function (): MediaInfoPart[] {
                return this.mediaIdList.map(id => this.dataManager.mediaManager[id]).filter(media => media)
            },
            fileToken: function (): FileToken {
                return this.dataManager.fileToken
            },
            nodeIsSelf(): boolean {
                return getIsSelf(this.baseData.Ctrl)
            },
            width: function() {
                return this.$store.state.styleComponentSize.leftCard.width - 24
            }
        },
        methods: {
            addMediaToNode(mediaIdList: id[]) {
                if (this.baseData.isRemote) {
                    let node = {
                        '_id': this.baseData.Info.id,
                        '_type': this.baseData.Info.type,
                        '_label': this.baseData.Info.PrimaryLabel,
                    } as QueryObject;
                    mediaAppendToNode(node, mediaIdList).then(res => {
                        let num = res.data.length;
                        num === 0
                            ? alert('保存成功')
                            : alert('有一些没有保存成功，自动重试');
                        this.baseData.updateValue('IncludedMedia', mediaIdList);
                    })
                } else {
                    this.baseData.updateValue('IncludedMedia', mediaIdList);
                }
            },
            addMediaToGraph(media: MediaInfoPart) {
                let graph = this.dataManager.currentGraph;
                let newMediaSetting = MediaSettingPart.emptyMediaSettingFromInfo(media, graph);
                this.dataManager.currentGraph.addItems([newMediaSetting])
            },
            reRankFile() {
                let type = this.filterProp;
                let sorter = (a: MediaInfoPart, b: MediaInfoPart): number => a.Ctrl[type] > b.Ctrl[type]
                    ? 1
                    : a.Ctrl[type] === b.Ctrl[type]
                        ? 0
                        : -1;
                this.reRankedList = this.mediaList;
                this.reRankedList.sort(sorter);
            }
        },
        watch: {
            mediaList() {
                this.reRankFile()
            }
        },
        record: {
            status: 'done'
        },
        created(): void {
            let fileToken = this.fileToken;
            let now = (new Date()).valueOf();
            //先判断Token情况
            if ((fileToken.Expiration * 1000 - now <= 0) || !fileToken.AccessKeyId) {
                getFileToken().then(res => {
                    if (res.status === 200) {
                        commitFileToken(res.data.fileToken);
                    } else {
                        alert("与图片服务器连接暂时中断")
                    }
                })
                    .catch()
            }
            this.reRankedList = this.mediaList;
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/11/30
* Updated by []
*/
