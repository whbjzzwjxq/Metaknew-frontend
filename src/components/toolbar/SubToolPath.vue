<template>
    <v-card flat tile class="pa-0 ma-0">
        <v-card-subtitle class="pa-0 ma-0 mb-n2" dense>
            <v-chip class="unselected pa-0" label pill color="white">
                Path
                <v-icon small> {{ pathIcon }}</v-icon>
            </v-chip>
        </v-card-subtitle>
        <icon-group :icon-list="iconItemList">

        </icon-group>
        <v-menu
            top
            offset-y
            :close-delay="500"
            :close-on-content-click="false"
            >
            <template v-slot:activator="{ on }">
                <v-btn icon v-on="on">
                    <v-icon> {{ pathListIcon }}</v-icon>
                </v-btn>
            </template>
            <v-card
                flat
                tile
                outlined
                :min-width="300"
                :min-height="200"
                :max-height="600"
                class="cardItem">
                <v-card-subtitle style="font-size: 18px">
                    PathList
                </v-card-subtitle>
            </v-card>
        </v-menu>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {getIcon} from "@/utils/icon";
    import IconGroup from "@/components/IconGroup.vue";

    export default Vue.extend({
        name: "SubToolPath",
        components: {
            IconGroup
        },
        data: function () {
            return {
                pathIcon: getIcon('i-item', 'path'),
                pathListIcon: getIcon('i-path', 'list'),
            }
        },
        props: {
            editMode: {
                type: Boolean as () => boolean,
                default: false
            }
        },
        computed: {
            iconItemList: function (): IconItem[] {
                return [
                    {
                        name: getIcon('i-path', 'current'),
                        _func: this.openCurrent,
                    },
                    {
                        name: getIcon('i-path', 'pre'),
                        _func: this.prePage
                    },
                    {
                        name: getIcon('i-path', 'next'),
                        _func: this.nextPage
                    }
                ]
            }
        },
        methods: {
            openCurrent: function () {
                this.$emit('path-open-current')
            },

            nextPage: function () {
                this.$emit('path-next-page')
            },

            prePage: function () {
                this.$emit('path-pre-page')
            },

            openList: function () {

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
