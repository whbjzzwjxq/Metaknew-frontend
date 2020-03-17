<template>
    <div :style="divStyle" class="cardItem">
        <v-textarea
            style="width: 100%"
            class="unselected"
            :disabled="disabled"
            :label="label"
            :placeholder="placeholder"
            :row-height="rowHeight"
            :rows="actualRows"
            :value="value"
            @blur="updateValue"
            @input="cacheText = $event"
            auto-grow
            counter
            filled
            v-show="showArea">

        </v-textarea>
        <vue-markdown
            v-show="!showArea"
            :source="value"
            @onselect="select"
            @select="select">

        </vue-markdown>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import vueMarkdown from "vue-markdown";
    export default Vue.extend({
        name: "FieldTextRender",
        components: {
            vueMarkdown
        },
        data: function () {
            return {
                cacheText: '',
                actualRows: 0
            }
        },
        props: {
            singleLine: {
                type: Boolean,
                default: false
            },
            placeholder: {
                type: String,
                default: ''
            },
            label: {
                type: String,
                default: ''
            },
            disabled: {
                type: Boolean,
                default: false
            },
            renderAsMarkdown: {
                type: Boolean,
                default: false
            },
            value: {
                type: String,
                required: true
            },
            divStyle: {
                type: Object as () => CSSProp,
                default: () => {}
            },
            rows: {
                type: Number,
                default: 20
            },
            rowHeight: {
                type: Number,
                default: 24
            },
            propName: {
                type: String,
                default: ''
            }

        },
        computed: {
            // 解析方式
            showArea: function (): boolean {
                return !this.renderAsMarkdown || !this.disabled
            }
        },
        methods: {
            updateValue() {
                this.cacheText !== '' &&
                this.$emit('update-text', this.propName, this.cacheText)
            },

            select() {

            }
        },
        record: {
            status: 'empty',
            description: 'Markdown文本两用编辑器'
        },
        created(): void {
            this.singleLine
                ? (this.actualRows = 1)
                : (this.actualRows = this.rows)
        }
    })
</script>

<style scoped>

</style>
