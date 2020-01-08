<template>
    <rect-container
        :container="containerRect"
        :is-selected="setting.State.isSelected"
        expand-able
        @update-size="updateSizeByBorder"
        class="media"
    >
        <template v-slot:content>
            <card-page-media-info
                :media="mediaInfo"
                :width="containerRect.width"
                :height="containerRect.height"
                @media-resize="updateSizeByNumber"
                @add-link="addLink"
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
    import {
        Point,
        RectByPoint
    } from "@/utils/geoMetric";
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
                type: Object as () => RectByPoint,
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
            viewBox: {
                type: Object as () => AreaRect,
                required: true
            }
        },
        computed: {
            containerRect: function (): AreaRect {
                return this.container.positiveRect()
            },
            containerStyle: function (): CSSProp {
                return {
                    'width': this.containerRect.width + 'px',
                    'height': this.containerRect.height + 'px',
                    'position': 'absolute',
                    'left': this.containerRect.x + 'px',
                    'top': this.containerRect.y + 'px',
                }
            },
            mediaInfo: function (): MediaInfoPart {
                return this.$store.state.dataManager.mediaManager[this.setting.Setting._id]
            }
        },
        methods: {
            updateSize(start: Point, end: Point) {
                // 视觉上的更新尺寸start, end
                let setting = this.setting.Setting;
                let scale = this.scale;
                // 更新起始点
                setting.Base.x += start.x / (this.viewBox.width * scale);
                setting.Base.y += start.y / (this.viewBox.height * scale);
                //更新长宽
                let width = setting.Base.size;
                let height = setting.Base.scaleX * width;
                let delta = end.copy().decrease(start).divide(this.scale);
                width += delta.x;
                height += delta.y;
                setting.Base.scaleX = height / width;
                setting.Base.size = width;
            },

            updateSizeByBorder(delta: Point, resizeType: string) {
                if (['bottom', 'right', 'proportion'].includes(resizeType)) {
                    this.updateSize(new Point(0, 0), delta)
                } else {
                    this.updateSize(delta, new Point(0, 0))
                }
            },

            updateSizeByNumber(newWidth: number): void {
                let {width, height} = this.containerRect;
                // 成比例更新
                let x = newWidth - width;
                let y = this.setting.Setting.Base.scaleX * newWidth - height;
                let delta = new Point(x, y).multi(0.5);
                this.updateSize(delta.copy().multi(-1), delta);
            },

            addLink() {
                this.$emit('add-link')
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
