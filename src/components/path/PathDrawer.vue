<template>
    <div class="pa-0 ma-0">
        <svg style="fill: chocolate" width="100%" height="100%">

        </svg>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {PathSelfPart} from "@/utils/graphClass";
    import {RectByPoint} from "@/utils/geoMetric";

    export default Vue.extend({
        name: 'PathDrawer',
        components: {},
        data: function () {
            return {
                // 最大行数
                maxRow: 6,
                // 最大深度
                maxDepth: 10,
                // ToolbarSize
                toolbarHeight: 64
            }
        },
        props: {
            path: {
                type: Object as () => PathSelfPart,
                // required: true
            },
            container: {
                type: Object as () => RectByPoint,
                required: true
            }
        },
        computed: {
            // 容器尺寸
            containerRect: function (): AreaRect {
                return this.container.positiveRect()
            },
            divStyle: function ():CSSProp {
              return this.container.getDivCSS({}, true)
            },
            // 设置
            setting: function (): PathSetting {
                return this.path.Conf
            },
            // 全部展示需要的尺寸
            totalRect: function (): AreaRect {
                let {itemSize, row, depth} = this.setting.Base;
                let {x, y} = this.containerRect;
                return {
                    x,
                    y,
                    width: itemSize * depth,
                    height: itemSize * row
                }
            }
        },
        methods: {},
        record: {
            status: 'empty',
            description: ''
        }
    })
</script>

<style scoped>
    @import "../../style/css/unselected.css";
</style>
