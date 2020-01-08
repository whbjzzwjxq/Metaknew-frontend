<template>
    <div :style="containerStyle" :class="classContent" v-show="!hide">
        <v-btn
            v-for="(icon, index) in activeIconList"
            icon
            :key="index"
            :small="small"
            :x-small="xSmall"
            :large="large"
            :x-large="xLarge"
            :color="icon.color ? icon.color : color"
            :disabled="icon.name === '' || icon.disabled"
            @click="icon._func"
        >
            <v-icon>{{ icon.name }}</v-icon>
        </v-btn>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'

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
            classContent: function () {
                return this.vertical
                    ? "flex-column"
                    : "flex-row"
            }
        },
        methods: {},
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
