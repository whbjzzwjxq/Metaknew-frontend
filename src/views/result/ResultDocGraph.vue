<template>
    <div class="ma-0 pa-0" :style="viewBoxStyle" id="viewBox">

    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {ComponentSize, StyleManagerState} from '@/store/modules/styleWindowSize'

    export default Vue.extend({
        name: "ResultDocGraph",
        components: {},
        data() {
            return {}
        },
        props: {},
        computed: {
            allComponentsStyle(): StyleManagerState {
                return this.$store.state.styleComponentSize
            },
            viewBoxStyle(): ComponentSize {
                return this.$store.getters.viewBox
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
* Created by whb on 2019/12/4
* Updated by []
*/
