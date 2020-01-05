<template>
    <rect-container
        :container="container"
        :is-selected="setting.State.isSelected"
        expand-able
        @update-size="updateSizeByBorder"
    >
        <template v-slot:content>
            <card-page-media-info
                :media="mediaInfo"
                :width="container.width"
                :height="container.height"
                @media-resize="updateSizeByNumber"
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
    import {AreaRect, PointObject, pointMultiple, pointNegative, pointUpdate} from "@/utils/geoMetric";
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

            //范围框
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
            },

            // GraphViewBox
            containerRect: {
                type: Object as () => AreaRect,
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
            updateSize(start: PointObject, size: PointObject) {
                // 更新尺寸
                let startDelta = pointMultiple(start, 1 / this.scale);
                let sizeDelta = pointMultiple(size, 1 / this.scale);
                let setting = this.setting.Setting;
                let width = setting.Base.size;
                let height = setting.Base.scaleX * width;
                width += sizeDelta.x;
                height += sizeDelta.y;
                setting.Base.scaleX = height / width;
                setting.Base.size = width;
                // 更新起始点
                setting.Base.x += startDelta.x / this.containerRect.width;
                setting.Base.y += startDelta.y / this.containerRect.height;
            },

            updateSizeByBorder(delta: PointObject, resizeType: string) {
                if (resizeType === 'bottom' || resizeType === 'right' || resizeType === 'proportion') {
                    this.updateSize({x: 0, y: 0}, delta)
                } else {
                    this.updateSize(delta, pointNegative(delta))
                }
            },

            updateSizeByNumber: function (newWidth: number) {
                let {width, height} = this.container;
                let x = newWidth - width;
                let delta = {x, y: this.setting.Setting.Base.scaleX * newWidth - height};
                this.updateSize(pointMultiple(delta, -0.5), delta)
            }
        },
        watch: {},
        record: {
            status: 'empty'
        },
        created(): void {

        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/31
* Updated by []
*/
