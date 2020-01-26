<template>
    <div style="align-content: normal">
        <v-row>
            <v-col v-for="icon in iconList" :key="icon.name" cols="2">
                <v-btn icon
                       @click="icon._func"
                       :color="icon.color ? icon.color : 'grey'">
                    <v-icon> {{ icon.name }}</v-icon>
                </v-btn>
            </v-col>
            <v-col cols="4">
                <v-btn text>
                    Learn+
                </v-btn>
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {getIcon} from "@/utils/icon";
    import {getIndex, LinkInfoPart, MediaInfoPart, NodeInfoPart} from "@/utils/graphClass";
    import {FragmentInfoPart} from "@/utils/userConcern";
    import {dispatchFragmentAdd} from "@/store/modules/_dispatch";
    import IconGroup from "@/components/IconGroup.vue";

    export default Vue.extend({
        name: "ItemSharer",
        components: {
            IconGroup
        },
        data: function () {
            return {}
        },
        props: {
            itemInfo: {
                type: Object as () => NodeInfoPart | MediaInfoPart | LinkInfoPart,
                required: true
            }
        },
        computed: {
            userDataManager: function (): UserDataManagerState {
                return this.$store.state.userDataManager
            },

            userConcern: function (): UserConcern {
                return this.userDataManager.UserConcernDict[this.itemInfo.type][this.itemInfo.id]
            },

            iconList: function (): IconItem[] {
                let {isGood, isBad, isStar} = this.userConcern;
                return [
                    {name: getIcon('i-edit', 'share'), _func: this.shareItem},
                    {name: getIcon('i-good', isGood), color: isGood ? 'yellow' : 'grey', _func: this.goodItem},
                    {name: getIcon('i-bad', isBad), color: isBad ? 'red' : 'grey', _func: this.badItem},
                    {name: getIcon('i-star', isStar), color: isStar ? 'yellow' : 'grey', _func: this.starItem},
                ]
            },

            ctrl: function (): CommonCtrl {
                return this.itemInfo.Ctrl
            }
        },
        methods: {
            shareItem: function () {

            },
            goodItem: function () {
                this.userConcern.isGood = !this.userConcern.isGood;
                let id = getIndex();
                if (this.itemInfo.isRemote) {
                    let fragment = FragmentInfoPart.fragmentFromItem(this.itemInfo, id, 'good');
                    dispatchFragmentAdd(fragment)
                } else {
                    //必须远端的才能自动生成碎片
                }
            },
            badItem: function () {
                this.userConcern.isBad = !this.userConcern.isBad
            },
            starItem: function () {
                this.userConcern.isStar = !this.userConcern.isStar;
                let id = getIndex();
                if (this.itemInfo.isRemote) {
                    let fragment = FragmentInfoPart.fragmentFromItem(this.itemInfo, id, 'star');
                    dispatchFragmentAdd(fragment)
                } else {
                    //必须远端的才能自动生成碎片
                }
            },
        },
        record: {
            status: 'empty',
            description: ''
        }
    })
</script>

<style scoped>

</style>
