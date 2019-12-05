<template>
    <div class="Home d-flex">
        <div class="d-flex flex-column align-center justify-center" style="width: 100%; height: 100%">
            <p class="font-weight-bold" style="font-size: 72px; width: 600px; text-align: center"> META-KNEW </p>
            <search-bar single-select>

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
    .Home {
        height: 100%;
    }

</style>

/**
* Created by whb on 2019/12/4
* Updated by []
*/
