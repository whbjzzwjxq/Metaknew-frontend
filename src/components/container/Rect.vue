<template>
    <div>

    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {RectByPoint} from "@/utils/geoMetric";

    export default Vue.extend({
        name: "Rect",
        components: {},
        data() {
            return {
                isLock: false
            }
        },
        props: {
            // 容器
            container: {
                type: Object as () => RectByPoint,
                required: true
            },

            // 是否可以改变尺寸
            expandAble: {
                type: Boolean as () => boolean,
                default: false
            },

            // 是否上传改变尺寸的事件
            expandEmit: {
                type: Boolean as () => boolean,
                default: false
            },

            renderIcon: {
                type: Boolean as () => boolean,
                default: false
            }
        },
        computed: {},
        methods: {},
        watch: {},
        record: {
            status: 'empty'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/17
* Updated by []
*/
