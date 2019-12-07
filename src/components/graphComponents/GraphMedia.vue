<template>
    <div :style="containerStyle">
        <card-root-media
            in-view-box
            :file="mediaInfo"
            :index="index"
            :width="location.width"
            :height="location.height"
        >

        </card-root-media>
    </div>
</template>

<script lang="js">
    import CardRootMedia from '../card/page/CardPageMediaInfo'

    export default {
        name: 'GraphMedia',
        components: { CardRootMedia },
        props: {
            //基础数据
            media: {
                type: Object,
                required: true,
            },

            //容器的尺寸信息
            container: {
                type: Object,
                required: true
            },

            location: {
                type: Object,
                required: true
            },

            //缩放情况
            scale: {
                type: Number,
                required: true
            },

            index: {
                type: Number,
                required: true
            }
        },
        computed: {
            containerStyle () {
                return {
                    'width': this.location.width + 'px',
                    'height': this.location.height + 'px',
                    'position': 'absolute',
                    'left': this.location.x + 'px',
                    'top': this.location.y + 'px',
                    'z-index': 0
                }
            },
            setting: vm => vm.media.Setting,
            mediaInfo: vm => vm.$store.state.dataManager.nodeManager[vm.setting._id]
        }
    }
</script>

<style scoped>

</style>
