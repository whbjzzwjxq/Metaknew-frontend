<template>
    <v-card :width="width" tile flat class="pa-2">
        <v-card-title style="font-size: 14px"> Current {{ propName }}</v-card-title>
        <v-card-text>
            <v-text-field
                :disabled="!editable"
                :rules="rules"
                hide-details
                single-line
                type="number"
                v-model="number">

            </v-text-field>
        </v-card-text>
        <slot name="tips"></slot>
    </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {Rule} from "@/interface/interfaceInComponent";
    import {outputRuleCheck, validGroup} from "@/utils/validation";

    interface Range {
        min: number,
        max: number,
        check: boolean
    }

    export default Vue.extend({
        name: 'fieldNumber',
        data() {
            return {}
        },
        props: {
            baseNum: {
                type: Number,
                required: true
            },
            propName: {
                type: String as () => string,
                required: true
            },
            range: {
                type: Object as () => Range,
                default: () => ({
                    min: 0,
                    max: 100,
                    check: true
                }) as Range
            },
            width: {
                type: Number,
                default: 200
            },
            intCheck: {
                type: Boolean,
                default: false
            },
            defaultValue: {
                type: Number,
                default: 1
            },
            editable: {
                type: Boolean,
                default: true
            }
        },
        computed: {
            number: {
                get(): number {
                    return this.baseNum
                        ? Number(this.baseNum)
                        : Number(this.defaultValue)
                },
                set(value: string | number): void {
                    let num = Number(value);
                    this.$emit('update-value', this.propName, num, this.status)
                }
            },
            rules: function (): Rule<number>[] {
                let {check, min, max} = this.range;
                let validation = validGroup.Number;
                let result = [];
                check && result.push(validation.minCheck(this.propName, min), validation.maxCheck(this.propName, max));
                this.intCheck && result.push(validation.int());
                return result
            },
            status: function (): string {
                return outputRuleCheck(this.rules, Number(this.number)).length > 0
                    ? 'error'
                    : 'default'
            }
        },
        methods: {},
        record: {
            status: 'done',
            description: '数字编辑器'
        }
    })
</script>

<style scoped>

</style>
/**
* Created by whb on 2019/12/4
* Updated by [whb on 2020年1月8日19:58:44]
*/
