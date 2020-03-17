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
    import {NodeInfoPart, MediaInfoPart, MediaSettingPart} from "@/class/graphItem";
    import {commitFileToken} from "@/store/modules/_mutations";
    import MediaAdder from "@/components/media/MediaAdder.vue";
    import {SortProp} from "@/interface/interfaceInComponent";
    import {sortCtrl} from "@/utils/utils";
    import {loginCookie} from "@/api/user/loginApi";
    import {mediaAppendToNode} from "@/api/subgraph/media";

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
                return this.mediaIdList.map(_id => this.dataManager.mediaManager[_id]).filter(media => media)
            },
            fileToken: function (): FileToken {
                return this.dataManager.fileToken
            },
            nodeIsSelf: function (): boolean {
                return this.baseData.isSelf
            },
            width: function (): number {
                return this.$store.state.styleComponentSize.leftCard.width - 40
            }
        },
        methods: {
            addMediaToNode: function (mediaIdList: id[]) {
                if (this.baseData.isRemote) {
                    let node = this.baseData.queryObject;
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
            addMediaToGraph: function (media: MediaInfoPart) {
                let graph = this.dataManager.currentGraph;
                let newMediaSetting = MediaSettingPart.emptyMediaSettingFromInfo(media, graph);
                this.dataManager.currentGraph.addItems([newMediaSetting])
            },
            reRankFile: function () {
                let sorter = sortCtrl(this.filterProp);
                this.reRankedList = this.mediaList;
                this.reRankedList.sort(sorter);
            }
        },
        watch: {
            mediaList() {
                this.reRankFile()
            }
        },
        created(): void {
            let fileToken = this.fileToken;
            let now = (new Date()).valueOf();
            //先判断Token情况
            if ((fileToken.Expiration * 1000 - now <= 0) || !fileToken.AccessKeyId) {
                loginCookie().then(res => {
                    if (res.status === 200) {
                        commitFileToken(res.data.fileToken);
                    } else {
                        alert("与图片服务器连接暂时中断")
                    }
                })
                    .catch()
            }
            this.reRankedList = this.mediaList;
        },
        record: {
            status: 'done',
            description: '媒体列表'
            //todo 还没有做排序按钮
        },
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/11/30
* Updated by [whb on 2020年1月8日19:33:40]
*/
