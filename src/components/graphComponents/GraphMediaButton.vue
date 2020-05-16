<template>
    <div :style="divStyle" v-show="!hide">
        <icon-group
            :container-style="buttonGroupStyle"
            :icon-list="iconList"
            :hide="hide"
            vertical
            x-small
        >

        </icon-group>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import IconGroup from "@/components/IconGroup.vue";
    import {MediaSettingPart} from "@/class/settingBase";
    import {Point} from "@/class/geometric";
    import {getIcon, iconMap} from "@/utils/icon";

    export default Vue.extend({
        name: "GraphMediaButton",
        components: {
            IconGroup
        },
        data: function () {
            return {
                resizeBase: 100,
                sizeIconGroup: iconMap["i-resize"],
            }
        },
        props: {
            mediaSetting: {
                type: Object as () => NodeSettingSimply,
                required: true
            },

            media: {
                type: Object as () => MediaSettingPart,
                required: true
            },

            hide: {
                type: Boolean,
                default: false
            },

            editMode: {
                type: Boolean,
                default: true
            },
        },
        computed: {
            width: function (): number {
                return this.mediaSetting.width
            },
            divStyle: function (): CSSProp {
                return {
                    width: '24px',
                    height: '120px',
                    left: this.x + 'px',
                    top: this.y + 'px',
                    position: 'absolute',
                }
            },
            x: function (): number {
                return this.mediaSetting.x + this.mediaSetting.width / 2 - 4
            },
            y: function (): number {
                return this.mediaSetting.y - this.mediaSetting.height / 2 + 4
            },
            buttonGroupStyle: function (): CSSProp {
                return {
                    width: '18px',
                    height: '120px',
                    left: '3px',
                    top: 0,
                    position: 'absolute',
                }
            },
            iconList: function (): IconItem[] {
                let sizeIconGroup = this.sizeIconGroup;
                return [
                    {name: sizeIconGroup.plus, _func: this.enlarge, toolTip: '增大尺寸'},
                    {name: sizeIconGroup.minus, _func: this.narrow, toolTip: '减小尺寸'},
                    {name: sizeIconGroup.five, _func: this.twentyPercent, toolTip: '缩放到五分之一'},
                    {name: sizeIconGroup.three, _func: this.oneThird, toolTip: '缩放到三分之一'},
                    {name: sizeIconGroup.two, _func: this.half, toolTip: '缩放到二分之一'},
                    {name: sizeIconGroup.double, _func: this.double, toolTip: '放大到两倍'},
                    {name: ''},
                    {name: getIcon('i-edit', 'delete'), _func: this.deleteMedia, toolTip: '删除媒体'},
                    {name: getIcon('i-item', 'link'), _func: this.addLink, toolTip: '添加关系'},
                    {name: getIcon('i-eye', this.media.StyleInGraph.Show.showAll), _func: this.unShow, toolTip: '显示关闭'},
                ]
            },
        },
        methods: {
            updateSize(start: PointMixed, end: PointMixed) {
                this.$emit('update-size', start, end)
            },

            updateSizeByNumber(newWidth: number): void {
                let {width, height} = this.mediaSetting;
                // 成比例更新
                let x = newWidth - width;
                let y = this.media.StyleInGraph.Base.scaleX * newWidth - height;
                let delta = new Point(x, y).multi(0.5);
                this.updateSize(delta.copy().multi(-1), delta);
            },

            addLink() {
                this.$emit('add-link')
            },

            enlarge() {
                this.updateSizeByNumber(this.width + this.resizeBase)
            },
            narrow() {
                this.updateSizeByNumber(this.width - this.resizeBase)
            },
            twentyPercent() {
                this.updateSizeByNumber(this.width * 0.2)
            },
            oneThird() {
                this.updateSizeByNumber(this.width / 3)
            },
            half() {
                this.updateSizeByNumber(this.width * 0.5)
            },
            double() {
                this.updateSizeByNumber(this.width * 2)
            },
            deleteMedia() {
                this.media.parent.deleteItem(this.media)
            },
            unShow() {
                this.media.StyleInGraph.Show.showAll = !this.media.StyleInGraph.Show.showAll
            }
        },
        record: {
            status: 'empty',
            description: ''
        }
    })
</script>

<style scoped>

</style>
