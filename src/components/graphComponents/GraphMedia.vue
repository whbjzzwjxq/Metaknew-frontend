<template>
    <rect-container
        :container="container"
        expand-able
        @update-size="updateSize"
    >
        <template v-slot:content>
            <card-page-media-info
                :media="mediaInfo"
                :width="container.width"
                :height="container.height"
                in-view-box
            >

            </card-page-media-info>
        </template>
    </rect-container>
</template>

<script lang="ts">
    import Vue from 'vue'
    import * as CSS from "csstype";
    import {MediaInfoPart, MediaSettingPart} from "@/utils/graphClass";
    import CardPageMediaInfo from "@/components/card/page/CardPageMediaInfo.vue";
    import {AreaRect, Point, updatePoint} from "@/utils/geoMetric";
    import RectContainer from "@/components/container/RectContainer.vue";

    export default Vue.extend({
        name: "GraphMedia",
        components: {
            CardPageMediaInfo,
            RectContainer
        },
        data() {
            return {}
        },
        props: {
            //基础数据
            setting: {
                type: Object as () => MediaSettingPart,
                required: true,
            },

            container: {
                type: Object as () => AreaRect,
                required: true
            },

            //缩放情况
            scale: {
                type: Number as () => number,
                required: true
            },

            index: {
                type: Number as () => number,
                required: true
            }
        },
        computed: {
            containerStyle: function (): CSS.Properties {
                return {
                    'width': this.container.width + 'px',
                    'height': this.container.height + 'px',
                    'position': 'absolute',
                    'left': this.container.x + 'px',
                    'top': this.container.y + 'px',
                }
            },
            mediaInfo: function (): MediaInfoPart {
                return this.$store.state.dataManager.mediaManager[this.setting.Setting._id]
            }
        },
        methods: {
            updateSize(resizeType: string, newPoint: Point) {
                (resizeType === 'bottom' || resizeType === 'right' || resizeType === 'proportion')
                    ? updatePoint(this.container.end, newPoint)
                    : updatePoint(this.container.start, newPoint)
            }
        },
        watch: {},
        record: {
            status: 'empty'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/31
* Updated by []
*/
