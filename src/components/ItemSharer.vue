<template>
    <div>
        <v-row style="width: 360px" class="ma-0 pl-8">
            <v-col v-for="icon in iconList" :key="icon.name" cols="2" class="pa-1" style="align-content: normal">
                <v-btn icon
                       @click="icon._func"
                       :color="icon.color ? icon.color : 'grey'">
                    <v-icon left class="pr-1"> {{ icon.name }}</v-icon>
                    <p> {{ icon.num }} </p>
                </v-btn>
            </v-col>
            <v-col cols="3">
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
                return this.userDataManager.userConcernDict[this.itemInfo.type][this.itemInfo.id]
            },

            iconList: function (): IconItem[] {
                let {isShared, isGood, isBad, isStar} = this.userConcern;
                return [
                    {
                        name: getIcon('i-edit', 'share'),
                        color: isShared ? 'blue' : 'grey',
                        _func: this.shareItem,
                        num: this.ctrl.isShared
                    },
                    {
                        name: getIcon('i-good', isGood),
                        color: isGood ? 'green' : 'grey',
                        _func: this.goodItem,
                        num: this.ctrl.isGood
                    },
                    {
                        name: getIcon('i-bad', isBad),
                        color: isBad ? 'red' : 'grey',
                        _func: this.badItem,
                        num: this.ctrl.isBad
                    },
                    {
                        name: getIcon('i-star', isStar),
                        color: isStar ? 'yellow' : 'grey',
                        _func: this.starItem,
                        num: this.ctrl.isStar
                    },
                ]
            },

            ctrl: function (): CommonCtrl {
                return this.itemInfo.Ctrl
            },

            fragmentSourceIdList: function (): id[] {
                return this.$store.getters.fragmentSourceIdList
            }
        },
        methods: {
            shareItem: function () {
                !this.userConcern.isShared && (this.ctrl.isShared += 1);
                this.userConcern.isShared = true;
            },
            goodItem: function () {
                this.handleNum('isGood');
                this.addFragment('good')
            },
            badItem: function () {
                this.handleNum('isBad')
            },
            starItem: function () {
                this.handleNum('isStar');
                this.addFragment('star')
            },
            handleNum: function (prop: 'isGood' | 'isBad' | 'isStar') {
                this.userConcern[prop]
                    ? (this.ctrl[prop] -= 1)
                    : (this.ctrl[prop] += 1);
                this.userConcern[prop] = !this.userConcern[prop]
            },

            addFragment: function (method: string) {
                let id = getIndex();
                if (!this.fragmentSourceIdList.includes(this.itemInfo.id)) {
                    if (this.itemInfo.isRemote) {
                        let fragment = FragmentInfoPart.fragmentFromItem(this.itemInfo, id, method);
                        dispatchFragmentAdd(fragment)
                    } else {
                        // 非远端不生成 测试功能暂时使用
                        let fragment = FragmentInfoPart.fragmentFromItem(this.itemInfo, id, method);
                        dispatchFragmentAdd(fragment)
                    }
                } else {
                    // 自动生成不重复
                }
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
