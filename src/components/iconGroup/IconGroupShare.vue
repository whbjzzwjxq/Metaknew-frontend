<template>
    <div></div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {MediaInfoPart, NodeInfoPart} from "@/utils/graphClass";
    import {getIcon} from "@/utils/icon";

    export default Vue.extend({
        name: "IconGroupShare",
        components: {},
        data() {
            return {}
        },
        props: {
            infoPart: {
                type: Object as () => MediaInfoPart | NodeInfoPart,
                required: true
            }
        },
        computed: {
            iconList: function (): IconItem[] {
                let userConcern = this.infoPart.UserConcern;
                let {isStar, isGood, isBad, isShared} = userConcern;
                return [
                    {name: getIcon('i-star', isStar), _func: this.starItem},
                    {name: getIcon('i-good', isGood), _func: this.goodItem},
                    {name: getIcon('i-bad', isBad), _func: this.badItem},
                    {name: 'mdi-share-variant', _func: this.shareItem, color: isShared ? 'yellow' : 'white'}
                ];
            },
        },
        methods: {
            starItem: function () {

            },
            goodItem: function () {

            },
            badItem: function () {

            },
            shareItem: function () {

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
* Created by whb on 2019/12/18
* Updated by []
*/
