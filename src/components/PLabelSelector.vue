<template>
    <v-autocomplete
        :items="availableLabel"
        :value="label"
        :disabled="disabled"
        :item-disabled="(item) => documentLabel.includes(item)"
        @input="choosePrimaryLabel"
        @update:search-input="updateText"
        autofocus
        persistent-hint
        label="PrimaryLabel Select">
        <template v-slot:no-data>
            <v-list-item>
                <v-list-item-title>
                    点击右边加号按钮添加标签
                </v-list-item-title>
            </v-list-item>
        </template>
        <template v-slot:append-outer v-if="!disabled">
            <v-btn icon @click="addLabel" small>
                <v-icon> {{ plusIcon }}</v-icon>
            </v-btn>
        </template>
    </v-autocomplete>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {availableLabel} from "@/utils/fieldResolve";
    import {getIcon} from "@/utils/icon";

    export default Vue.extend({
        name: "PLabelSelector",
        components: {},
        data() {
            return {
                availableLabel: availableLabel,
                text: '',
                plusIcon: getIcon('i-edit', 'add'),
                documentLabel: ['DocGraph', 'DocPaper']
            }
        },
        props: {
            label: {
                type: String,
                required: true
            },
            disabled: {
                type: Boolean,
                default: false
            }
        },
        computed: {},
        methods: {
            choosePrimaryLabel($event: string) {
                if (!this.documentLabel.includes($event)) {
                    this.$emit("update-label", $event)
                }
            },
            updateText(value: string) {
                this.text = value
            },
            addLabel() {
                let text = this.text;
                availableLabel.includes(text) || availableLabel.push(text);
                this.$emit('update-label', text)
            }
        },
        watch: {},
        record: {
            status: 'done',
            description: 'Node主标签选择器'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/11/25
* Updated by []
*/
