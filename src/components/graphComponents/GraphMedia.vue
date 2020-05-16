<template>
    <rect-container
        :container="position"
        :is-selected="state.isSelected"
        @update-size="updateSize"
        class="media"
        expand
    >
        <template v-slot:content>
            <media-viewer
                :label="setting._label"
                :max-height="containerRect.height"
                :src="setting._src"
                :width="containerRect.width"
                v-show="setting.InGraph.Show.showAll"
            >

            </media-viewer>
            <p class="text-center title" v-show="showTitle"> {{ setting._name }}</p>
        </template>
    </rect-container>
</template>

<script lang="ts">
    import Vue from 'vue'
    import CardPageMediaInfo from "@/components/card/page/CardPageMediaInfo.vue";
    import RectContainer from "@/components/container/RectContainer.vue";
    import IconGroup from "@/components/IconGroup.vue";
    import MediaViewer from "@/components/media/MediaViewer.vue";
    import {RectByPoint} from "@/class/geometric";

    export default Vue.extend({
        name: "GraphMedia",
        components: {
            CardPageMediaInfo,
            RectContainer,
            IconGroup,
            MediaViewer
        },
        data() {
            return {}
        },
        props: {
            //基础数据
            setting: {
                type: Object as () => MediaSetting,
                required: true,
            },

            //范围框
            state: {
                type: Object as () => MediaState,
                required: true
            },

            position: {
                type: Object as () => RectByPoint,
                required: true
            },
        },
        computed: {
            containerRect: function (): AreaRect {
                return this.position.positiveRect()
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

            showTitle: function (): boolean {
                let {showAll, showName} = this.setting.InGraph.Show
                return showAll && showName && !this.state.isMouseOn
            }
        },
        methods: {
            updateSize(start: PointMixed, end: PointMixed) {
                this.$emit('update-size', start, end)
            },
        },
        watch: {},
        created(): void {

        },
        record: {
            status: 'editing',
            description: '在ViewBox中的Media'
        },
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/31
* Updated by []
*/
