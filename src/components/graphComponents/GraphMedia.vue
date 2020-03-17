<template>
    <rect-container
        :container="container"
        :is-selected="setting.isSelected"
        @update-size="updateSize"
        class="media"
        expand
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
    import {MediaInfoPart, MediaSettingPart} from "@/class/graphItem";
    import CardPageMediaInfo from "@/components/card/page/CardPageMediaInfo.vue";
    import {getPoint, Point, RectByPoint} from "@/class/geometric";
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
                return this.$store.state.dataManager.mediaManager[this.setting._id]
            }
        },
        methods: {
            updateSize(start: PointMixed, end: PointMixed) {
                this.$emit('update-size', start, end, this.setting.Setting)
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
        created(): void {

        },
        record: {
            status: 'editing',
            description: '在ViewBox中的Media'
            //todo 尺寸调节
        },
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/31
* Updated by []
*/
