<template>
    <div :style="totalCardStyle">
        <v-container>
            <v-tabs>
                <v-tabs-slider color="todo"></v-tabs-slider>
            </v-tabs>

        </v-container>

    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {StyleManagerState, ToolBar} from "@/store/modules/styleWindowSize"

    export default Vue.extend({
        name: "CardRoot",
        components: {},
        data() {
            return {}
        },
        props: {},
        computed: {
            allComponentSize(): StyleManagerState {
                return this.$store.state.styleComponentSize
            },
            toolBar(): ToolBar {
                return this.allComponentSize.toolBar
            },
            totalCardStyle() {
                return {
                    position: 'absolute',
                    left: 0,
                    top: ''
                }
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
* Created by whb on 2019/12/1
* Updated by []
*/
