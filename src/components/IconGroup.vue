<template>
    <div :style="StyleWithOpacity" :class="classContent">
        <v-btn
            v-for="(icon, index) in activeIconList"
            icon
            :key="index"
            :small="small"
            :x-small="xSmall"
            :large="large"
            :x-large="xLarge"
            :color="icon.color ? icon.color : color"
            :disabled="(icon.name === '' || icon.disabled) || hide"
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
            classContent: function (): string {
                return this.vertical
                    ? "d-flex flex-column"
                    : "d-flex flex-row"
            },
            StyleWithOpacity: function (): CSSProp {
                return Object.assign({opacity: this.hide ? 0 : 1}, this.containerStyle)
            }
        },
        methods: {},
        watch: {},
        record: {
            status: 'done',
            description: 'Icon的排列'

        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/12/18
* Updated by []
*/
