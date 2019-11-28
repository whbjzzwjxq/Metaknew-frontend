<template>
  <v-card :width="width" tile flat class="pa-2">
    <v-card-title style="font-size: 14px"> Current {{ propName }}</v-card-title>
    <v-card-text>
      <v-text-field
        :value="number"
        @input="newValue"
        hide-details
        single-line
        type="number"
        :rules="activeRules">

      </v-text-field>
    </v-card-text>
    <slot name="tips"></slot>
  </v-card>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {fieldDefaultValue} from '@/utils/labelField'

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
                type: Number as () => number,
                required: true
            },
            propName: {
                type: String as () => string,
                required: true
            },
            range: {
                type: Object as () => Range,
                default: {
                    min: 0,
                    max: 100,
                    check: true
                } as Range
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
                default: fieldDefaultValue['NumberField']
            }
        },
        computed: {
            activeRules: (vm): any[] => {
                let result = [];
                vm.range.check && result.push(vm.rules.range);
                vm.intCheck && result.push(vm.rules.int);
                return result
            },
            number: (vm): number => vm.baseNum
                ? vm.baseNum
                : vm.defaultValue,
            rules(): any {
                let range = this.range as Range;
                return {
                    range: (value: number) => (range.min <= value && value <= range.max) ||
                        'Out of Range',
                    int: (value: number) => value % 1 === 0 ||
                        'Int required'
                }
            }
        },
        methods: {
            newValue($event: string) {
                let value = Number($event);
                this.$emit('update-value', this.propName, value, 'default')
            }
        },
        record: {
            status: 'done'
        }
    })
</script>

<style scoped>

</style>
