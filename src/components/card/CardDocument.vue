<template>
    <div>
        12345
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'

    export default Vue.extend({
        name: "CardDocument",
        components: {},
        data() {
            return {
                tabItems: {
                    "directory": {

                    },
                    "document-style": {

                    },
                    "node-style": {

                    },
                    "link-style": {

                    },
                    "history&branch": {

                    },
                    "comment": {

                    }
                },
            }
        },
        props: {
            editMode: {
                type: Boolean,
                default: false
            }
        },
        computed: {},
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
