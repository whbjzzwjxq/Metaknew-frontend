<template>
    <div>
        <v-row style="width: 210px" class="ma-0 ml-n1">
            <v-col v-for="icon in iconList" :key="icon.name" cols="3" class="pa-0 pr-2" style="align-content: normal">
                <v-btn text
                       small
                       @click="icon._func"
                       :color="icon.color ? icon.color : 'grey'">
                    <v-icon left class="pr-1"> {{ icon.name }}</v-icon>
                    <p> {{ icon.num }} </p>
                </v-btn>
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import IconGroup from "@/components/IconGroup.vue";
    import {getIcon} from "@/utils/icon";
    import {LinkInfoPart, MediaInfoPart, NodeInfoPart, FragmentInfoPart} from "@/class/graphItem";
    import {dispatchFragmentAdd} from "@/store/modules/_dispatch";
    import {getIndex} from "@/utils/utils";

    export default Vue.extend({
        name: "ItemSharer",
        components: {
            IconGroup
        },
        data: function () {
            return {}
        },
        props: {
            baseData: {
                type: Object as () => NodeInfoPart | MediaInfoPart | LinkInfoPart,
                required: true
            }
        },
        computed: {
            userDataManager: function (): UserDataManagerState {
                return this.$store.state.userDataManager
            },

            userConcern: function (): UserConcern {
                return this.userDataManager.userConcernDict[this.baseData._type][this.baseData._id]
            },

            iconList: function (): IconItem[] {
                let {NumShared, NumGood, NumBad, NumStar} = this.userConcern;
                return [
                    {
                        name: getIcon('i-edit', 'share'),
                        color: NumShared ? 'blue' : 'grey',
                        _func: this.shareItem,
                        num: this.ctrl.NumShared
                    },
                    {
                        name: getIcon('i-good', NumGood),
                        color: NumGood ? 'green' : 'grey',
                        _func: this.goodItem,
                        num: this.ctrl.NumGood
                    },
                    {
                        name: getIcon('i-bad', NumBad),
                        color: NumBad ? 'red' : 'grey',
                        _func: this.badItem,
                        num: this.ctrl.NumBad
                    },
                    {
                        name: getIcon('i-star', NumStar),
                        color: NumStar ? 'yellow' : 'grey',
                        _func: this.starItem,
                        num: this.ctrl.NumStar
                    },
                ]
            },

            ctrl: function (): PublicCtrl {
                return this.baseData.Ctrl
            },

            fragmentSourceIdList: function (): id[] {
                return this.$store.getters.fragmentSourceIdList
            }
        },
        methods: {
            shareItem: function () {
                !this.userConcern.NumShared && (this.ctrl.NumShared += 1);
                this.userConcern.NumShared = true;
            },
            goodItem: function () {
                this.handleNum('NumGood');
                this.addFragment('good')
            },
            badItem: function () {
                this.handleNum('NumBad')
            },
            starItem: function () {
                this.handleNum('NumStar');
                this.addFragment('star')
            },
            handleNum: function (prop: 'NumGood' | 'NumBad' | 'NumStar') {
                this.userConcern[prop]
                    ? (this.ctrl[prop] -= 1)
                    : (this.ctrl[prop] += 1);
                this.userConcern[prop] = !this.userConcern[prop]
            },

            addFragment: function (method: string) {
                let _id = getIndex();
                if (!this.fragmentSourceIdList.includes(this.baseData._id)) {
                    if (this.baseData.isRemote) {
                        let fragment = FragmentInfoPart.fragmentFromItem(this.baseData, _id, method);
                        dispatchFragmentAdd(fragment)
                    } else {
                        // 非远端不生成 测试功能暂时使用
                        let fragment = FragmentInfoPart.fragmentFromItem(this.baseData, _id, method);
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
