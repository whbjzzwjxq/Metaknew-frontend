<template>
    <div class="d-flex home backend" style="overflow: hidden">
        <div class="d-flex flex-column align-center justify-center" style="width: 100%; height: 100%; top: 128px; position: relative">
            <p class="name-title ma-0" style="font-size: 64px; width: 75%; text-align: center; color: whitesmoke"> META KNEW </p>
            <search-bar single-select style="width: 75%" class="pt-2">

            </search-bar>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import SearchBar from '@/components/SearchBar.vue';

    export default Vue.extend({
        name: "Home",
        components: {
            SearchBar
        },
        data() {
            return {}
        },
        props: {},
        computed: {},
        methods: {},
        watch: {},
        record: {
            status: 'empty'
        }
    })
</script>

<style scoped>
    @import "../../../src/style/css/backend.css";
    .home {
        height: 100%;
    }

</style>

/**
* Created by whb on 2019/12/4
* Updated by []
*/
