<template>
    <div class="title unselected">
        <v-text-field
            :value="text"
            @input="updateText"
            dense
            flat
            hide-details
            v-if="editMode">

        </v-text-field>
        <p class="title-text" v-else> {{ text }}</p>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'

    export default Vue.extend({
        name: "TitleTextField",
        components: {},
        data() {
            return {}
        },
        props: {
            text: {
                type: String,
                required: true
            },
            editMode: {
                type: Boolean,
                default: false
            }
        },
        computed: {},
        methods: {
            updateText($event: string) {
                this.$emit('update-text', $event);
            }
        },
        watch: {},
        record: {
            status: 'done'
        }
    })
</script>

<style scoped>
    @import "../style/css/unselected.css";

    .title {
        height: 48px;
        color: grey;
    }

    .title-text {
        text-align: center;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-break: normal;
        overflow: hidden;
        line-height: 20px;
        font-size: 16px;
    }
</style>

/**
* Created by whb on 2019/11/25
* Updated by []
*/
