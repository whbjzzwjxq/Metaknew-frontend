<template>
    <icon-group :icon-list="iconList" :x-small="xSmall" :small="!xSmall">
        <template v-slot:text="{ icon }">
            <p class="text--disabled caption px-1"> {{ icon.num }}</p>
        </template>
    </icon-group>
</template>

<script lang="ts">
    import Vue from 'vue'
    import IconGroup from "@/components/IconGroup.vue";
    import {getIcon} from "@/utils/icon";
    import {dispatchFragmentAdd} from "@/store/modules/_dispatch";
    import {getIndex} from "@/utils/utils";
    import {FragmentInfoPart, LinkInfoPart, MediaInfoPart, NodeInfoPart} from "@/class/info";

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
            },
            userConcern: {
                type: Object as () => UserConcern,
                required: true
            },
            xSmall: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            userDataManager: function (): UserDataManagerState {
                return this.$store.state.userDataManager
            },

            disabled: function (): boolean {
                return !this.baseData.isRemote || !this.userConcern.isConfirm
            },

            iconList: function (): IconItem[] {
                let {NumShared, NumGood, NumBad, NumStar} = this.userConcern;
                let disabled = this.disabled;
                return [
                    {
                        name: getIcon('i-edit', 'share'),
                        color: NumShared ? 'blue' : 'grey',
                        _func: this.shareItem,
                        num: this.ctrl.NumShared,
                        disabled,
                    },
                    {
                        name: getIcon('i-good', NumGood),
                        color: NumGood ? 'green' : 'grey',
                        _func: this.goodItem,
                        num: this.ctrl.NumGood,
                        disabled,
                    },
                    {
                        name: getIcon('i-bad', NumBad),
                        color: NumBad ? 'red' : 'grey',
                        _func: this.badItem,
                        num: this.ctrl.NumBad,
                        disabled,
                    },
                    {
                        name: getIcon('i-star', NumStar),
                        color: NumStar ? 'yellow' : 'grey',
                        _func: this.starItem,
                        num: this.ctrl.NumStar,
                        disabled,
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
        },
        mounted(): void {
        }
    })
</script>

<style scoped>

</style>
