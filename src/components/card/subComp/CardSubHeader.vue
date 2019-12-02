<template>

</template>

<script lang="ts">
    import Vue from 'vue'
    import {MediaInfoPart, NodeInfoPart} from '@/utils/graphClass'
    import {iconItem} from "@/utils/interfaceInComponent";

    export default Vue.extend({
        name: "CardSubHeader",
        components: {},
        data() {
            return {
                showHeader: false as boolean,
            }
        },
        props: {
            infoPart: Object as () => NodeInfoPart | MediaInfoPart
        },
        computed: {
            userConcern() {
                return this.infoPart.UserConcern
            },

            toolOpacity: vm => vm.showHeader
                ? '50%'
                : '0%',

            starIcon: vm => vm.userConcern.isStar
                ? 'mdi-star'
                : 'mdi-star-outline',

            goodIcon: vm => vm.userConcern.isGood
                ? 'mdi-thumb-up'
                : 'mdi-thumb-up-outline',

            badIcon: vm => vm.userConcern.isBad
                ? 'mdi-thumb-down'
                : 'mdi-thumb-down-outline',

            shareColor: vm => vm.userConcern.isShared
                ? 'yellow'
                : 'white',

            iconList: function (): iconItem[] {
                return [
                    {icon: this.starIcon, _func: this.starItem, color: 'white', render: true},
                    {icon: this.goodIcon, _func: this.goodItem, color: 'white', render: true},
                    {icon: this.badIcon, _func: this.badItem, color: 'white', render: true},
                    {icon: 'mdi-share-variant', _func: this.shareItem, color: this.shareColor, render: true}
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
            status: 'edit'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/11/25
* Updated by []
*/
