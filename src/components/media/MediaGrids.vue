<template>
    <div class="d-flex no-gutters flex-wrap scene ml-1">
        <v-col
                v-for="n in length"
                :key="n"
                class="d-flex child-flex pa-1"
                style="height: 128px"
                cols="4">
            <v-card
                    @click="click(n-1)"
                    color="grey"
                    flat
                    tile>
                <v-img :src="realSrc(fileList[n-1].Ctrl.FileName)" contain width="120px" height="120px">

                </v-img>
                <v-icon v-show="getSelected(n-1) > -1" x-large class="select-icon">
                    mdi-check-circle-outline
                </v-icon>
            </v-card>

        </v-col>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {MediaInfoPart} from '@/class/graphItem'
    import {getSrc} from "@/utils/utils";

    export default Vue.extend({
        name: "MediaGrids",
        components: {},
        data() {
            return {
                selection: [] as number[]
            }
        },
        props: {
            fileList: {
                type: Array as () => MediaInfoPart[],
                required: true
            },
            singleChoose: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            // 第一页
            length: function (): number {
                return this.fileList.length > 9 ? 9 : this.fileList.length
            }
        },
        methods: {
            click(n: number) {
                let index = this.getSelected(n);
                index > -1
                    ? this.selection.splice(index, 1)
                    : this.singleChoose
                    ? this.selection = [n]
                    : this.selection.push(n);
                let fileSelection = this.selection.map(index => this.fileList[index]);
                this.$emit('upload-select', fileSelection)
            },
            getSelected(n: number) {
                return this.selection.indexOf(n)
            },
            realSrc: function (url: string): string {
                return getSrc(url)
            }
        },
        watch: {},
        record: {
            status: 'done',
            description: '图片九宫格'
        }
    })
</script>

<style scoped>
    .scene {
        width: 386px;
        border-style: dashed;
        border-width: 1px;
    }

    .select-icon {
        position: absolute;
        left: 40px;
        top: 40px;
        opacity: 0.7;
        color: white;
    }
</style>

/**
* Created by whb on 2019/11/25
* Updated by [whb on 2020年1月9日02:20:45]
*/
