<template>
  <v-text-field
    :disabled="disabled"
    :label="label"
    :placeholder="placeholder"
    :value="value"
    :style="style"
    @blur="updateValue"
    @input="cacheText = $event"
    v-if="singleLine"
    dense
  >

  </v-text-field>
  <v-textarea
    :disabled="disabled"
    :label="label"
    :placeholder="placeholder"
    :value="value"
    :style="style"
    @blur="updateValue"
    @input="cacheText = $event"
    auto-grow
    counter
    dense
    outlined
    v-else>
    <template v-slot:append>
      <v-icon @click="updateValue" v-if="!disabled">mdi-content-save</v-icon>
    </template>
  </v-textarea>
</template>

<script>
  export default {
    name: 'fieldTextAreaOrField',
    data () {
      return {
        cacheText: ''
      }
    },
    props: {
      singleLine: {
        type: Boolean,
        required: true
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
      value: {
        type: String,
        default: ''
      },
      propName: {
        type: String,
        required: true
      },
      width: {
        type: [String, Number],
        default: 400
      }
    },
    computed: {
      style () {
        return {
          'width': this.width + 'px'
        }
      }
    },
    methods: {
      updateValue () {
        this.cacheText !== '' &&
        this.$emit('update-text', this.propName, this.cacheText)
      }
    },
    record: {
      status: 'done'
    }
  }
</script>

<style scoped>

</style>
