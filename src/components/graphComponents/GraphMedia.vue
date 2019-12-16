<template>
    <div :style="containerStyle">
        <card-page-media-info
            in-view-box
            :file="mediaInfo"
            :index="index"
            :width="location.width"
            :height="location.height"
        >

        </card-page-media-info>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import CardPageMediaInfo from '../card/page/CardPageMediaInfo'
    import {AreaRect} from "@/utils/geoMetric";
    import {MediaInfoPart, MediaSettingPart} from "@/utils/graphClass";
    import * as CSS from 'csstype'
    export default Vue.extend({
        name: 'GraphMedia',
        components: {CardPageMediaInfo},
        props: {
            //基础数据
            media: {
                type: Object as () => MediaSettingPart,
                required: true,
            },

            location: {
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
            containerStyle(): CSS.Properties {
                return {
                    'width': this.location.width + 'px',
                    'height': this.location.height + 'px',
                    'position': 'absolute',
                    'left': this.location.x + 'px',
                    'top': this.location.y + 'px',
                }
            },
            mediaInfo(): MediaInfoPart {
                return this.$store.state.dataManager.mediaManager[this.media.Setting._id]
            }
        },
        record: {
            status: 'done-old'
        }
    })
</script>

<style scoped>

</style>
