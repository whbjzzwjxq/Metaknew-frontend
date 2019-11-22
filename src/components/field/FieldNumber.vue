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

<script>
import {fieldDefaultValue} from '../../../utils/OfficialLabels';

export default {
  name: 'fieldNumber',
  data() {
    return {
      rules: {
        range: value => this.range.min <= value <= this.range.max ||
                        'Out of Range',
        int: value => value % 1 === 0 ||
                        'Int required'
      }
    }
  },
  props: {
    baseNum: {
      type: Number,
      required: true
    },
    propName: {
      type: String,
      required: true
    },
    range: {
      type: Object,
      default() {
        return {
          'check': true,
          'min': 0,
          'max': 100
        }
      }
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
  methods: {
    newValue($event) {
      let value = Number($event);
      this.$emit('update-value', this.propName, value, 'default')
    }
  },
  computed: {
    activeRules: vm => {
      let result = [];
      vm.range.check && result.push(vm.rules.range);
      vm.intCheck && result.push(vm.rules.int);
      return result
    },
    number: vm => vm.baseNum
      ? vm.baseNum
      : vm.defaultValue
  },
  created() {
  }
}
</script>

<style scoped>

</style>
