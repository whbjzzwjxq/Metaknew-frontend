<template>
    <div :style="styleWithOpacity" :class="classContent">
        <v-tooltip bottom v-for="(icon, index) in activeIconList" :key="index">
            <template v-slot:activator="{ on }">
                <v-btn
                    icon
                    :small="small"
                    :x-small="xSmall"
                    :large="large"
                    :x-large="xLarge"
                    :color="icon.color ? icon.color : color"
                    :disabled="(icon.name === '' || icon.disabled) || hide"
                    @click="doSomething(icon)"
                    v-on="on"
                >
                    <v-icon>{{ icon.name }}</v-icon>
                </v-btn>
            </template>
            <span> {{ icon.toolTip }} </span>
        </v-tooltip>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {doNothing} from "@/utils/utils";

    export default Vue.extend({
        name: "IconGroup",
        components: {},
        data() {
            return {}
        },
        props: {
            iconList: {
                type: Array as () => IconItem[],
                required: true
            },
            small: {
                type: Boolean,
                default: false
            },
            xSmall: {
                type: Boolean,
                default: false
            },
            large: {
                type: Boolean,
                default: false
            },
            xLarge: {
                type: Boolean,
                default: false
            },
            vertical: {
                type: Boolean,
                default: false
            },
            hide: {
                type: Boolean,
                default: false
            },
            containerStyle: {
                type: Object as () => CSSProp,
                default: () => {
                    return {}
                }
            },
            color: {
                type: String as () => string,
                default: 'grey'
            }
        },
        computed: {
            activeIconList: function (): IconItem[] {
                return this.iconList.filter(icon => icon.render === true || icon.render === undefined)
            },
            classContent: function (): string {
                return this.vertical
                    ? "d-flex flex-column"
                    : "d-flex flex-row"
            },
            styleWithOpacity: function (): CSSProp {
                return Object.assign({opacity: this.hide ? 0 : 1}, this.containerStyle)
            }
        },
        methods: {
            doSomething: function (icon: IconItem) {
                icon._func
                    ? icon.payload
                        ? icon._func(icon.payload)
                        : icon._func()
                    : doNothing()
            }
        },
        watch: {},
        record: {
            status: 'done',
            description: 'Icon的排列'
            // todo Icon的提示
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/18
* Updated by []
*/
