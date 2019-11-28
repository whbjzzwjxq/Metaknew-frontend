<template>

</template>

<script lang="ts">
    import Vue from 'vue'
    import {MediaInfoPart, NodeInfoPart} from '@/utils/graphClass'

    interface iconItem {
        icon: string,
        _func: Function,
        color: string,
        render: boolean
    }

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

            badIcon() {
                let vm = this;
                let _func = () => vm.userConcern.isBad
                    ? 'mdi-thumb-down'
                    : 'mdi-thumb-down-outline';
                return _func()
            },

            iconList(vm): iconItem[] {
                return [
                    {icon: vm.starIcon, _func: vm.starItem, color: 'white', render: true},
                    {icon: vm.goodIcon, _func: vm.goodItem, color: 'white', render: true},
                    {icon: vm.badIcon, _func: vm.badItem, color: 'white', render: true},
                    {icon: 'mdi-share-variant', _func: vm.shareItem, color: vm.shareColor, render: true}
                ]
            },
            renderIcons: vm => vm.normalIconList.filter((item: iconItem) => item.render)
        },
        methods: {},
        watch: {},
        record: {
            status: 'done'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/11/25
* Updated by []
*/
