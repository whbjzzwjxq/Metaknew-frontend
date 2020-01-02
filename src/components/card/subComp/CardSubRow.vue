<template>
    <div>
        <hr class="cardHr"/>
        <v-row class="pl-4 pr-4 justify-content-between">
            <v-col class="pa-0 ma-0" cols="11">
                <v-subheader class="ml-n4 card-subheader" style="height: 36px">{{text}}</v-subheader>
            </v-col>
            <v-col class="pa-0 ma-0" cols="1">
                <v-btn icon x-small v-if="!noCollapse">
                    <v-icon @click="input">{{collapsedIcon}}</v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <v-row class="pl-4 pr-4 pb-2" v-show="!isCollapsed">
            <slot name="content"></slot>
        </v-row>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {getIcon} from "@/utils/icon";

    export default Vue.extend({
        name: "CardSubRow",
        components: {},
        data() {
            return {
                isCollapsed: false
            }
        },
        props: {
            noCollapse: {
                type: Boolean as () => boolean,
                default: false
            },
            text: {
                type: String as () => string,
                default: ''
            }
        },
        computed: {
            collapsedIcon(): string {
                return getIcon("i-collapse", !this.isCollapsed)
            },

        },
        methods: {
            input() {
                this.isCollapsed = !this.isCollapsed
            }
        },
        watch: {},
        record: {
            status: 'done'
        }
    });
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/11/25
* Updated by []
*/
