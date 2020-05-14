<template>
    <div class="title unselected" :style="divCss">
        <v-text-field
            :style="fontCss"
            :value="text"
            :label="label"
            @input="updateText"
            dense
            flat
            :hide-details="hideDetails"
            v-if="editMode">

        </v-text-field>
        <p class="title-text text-center" v-else :style="fontCss">
            {{ text }}
        </p>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'

    export default Vue.extend({
        name: "FieldTitle",
        components: {},
        data() {
            return {}
        },
        props: {
            text: {
                type: String as () => string,
                required: true
            },
            editMode: {
                type: Boolean as () => boolean,
                default: false
            },
            fontCss: {
                type: Object as () => CSSProp,
                default: () => {}
            },
            divCss: {
                type: Object as () => CSSProp,
                default: () => {}
            },
            label: {
                type: String,
                default: ''
            },
            hideDetails: {
                type: Boolean,
                default: true
            }
        },
        computed: {},
        methods: {
            updateText($event: string) {
                this.$emit('update-text', $event);
            },
            doNothing() {

            }
        },
        watch: {},
        record: {
            status: 'done',
            description: '可编辑的Title'
        }
    })
</script>

<style scoped>

    .title {
        height: 32px;
        color: grey;
        -moz-user-select: none;
        -webkit-user-select: none;
        user-select: none;
        -ms-user-select: none;
        width: 100%;
        top: 0;
        left: 0;
    }

    .title-text {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-break: normal;
        overflow: hidden;
        line-height: 28px;
        font-size: 24px;
        font-weight: bolder;
        margin: unset;
        text-overflow:ellipsis;
        white-space: nowrap;
    }
</style>

/**
* Created by whb on 2019/11/25
* Updated by []
*/
