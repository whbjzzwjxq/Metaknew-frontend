<template>
    <div class="title unselected" :style="divCss">
        <v-text-field
            :style="fontCss"
            :value="text"
            @input="updateText"
            dense
            flat
            hide-details
            class="pr-2"
            v-if="editMode">

        </v-text-field>
        <p class="title-text pt-2 pr-2" v-else :style="fontCss">
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
            }
        },
        computed: {},
        methods: {
            updateText($event: string) {
                this.$emit('update-text', $event);
            },
            doNothing() {
                alert('doNothing')
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
        line-height: 20px;
        font-size: 16px;
        margin: unset;
        text-overflow:ellipsis;
        white-space: nowrap;
    }
</style>

/**
* Created by whb on 2019/11/25
* Updated by []
*/
