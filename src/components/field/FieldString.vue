<template>
  <v-card :width="width" tile flat class="pa-2">
    <v-card-text>
      <span class="subheading">Current {{propName}}</span>
      <v-autocomplete
        v-if="select"
        :value="text"
        :items="selection"
        @change="update"
        single-line>

      </v-autocomplete>

      <v-text-field
        v-else
        :value="text"
        :rules="[rules.empty, rules.errorChar, rules.duplicate]"
        @blur="saveText"
        @input="inputText"
        label="EditText"
        single-line
        counter>

      </v-text-field>
    </v-card-text>

    <v-card-text v-if="renderHistory">
      <span class="subheading">History {{propName}}</span>
      <v-chip-group column active-class="primary--text">
        <v-chip
          v-for="(item, index) in editHistory"
          :key="index"
          color="secondary"
          label
          outlined
          tile>
          {{ item }}
          <v-icon @click="restoreText(index)" right>restore</v-icon>
        </v-chip>
      </v-chip-group>
    </v-card-text>
  </v-card>
</template>

<script>
import {checkDuplicate, checkExist} from '../../../utils/fileHandle';

export default {
  name: 'fieldString',
  data() {
    return {
      editHistory: [],
      cacheText: this.select ? 'auto' : '',
      rules: {
        empty: value => value === ''
          ? '字符串不能为空！'
          : false,
        errorChar: value => new RegExp('[\\\\:*?"<>|]').test({ vm: value })
          ? '含有异常字符!'
          : false,
        duplicate: value => this.checkDuplicate && checkExist(this.textPool, value)
          ? '重复的' + this.propName + '!'
          : false
      }
    }
  },
  computed: {

    renderHistory: vm => !vm.select && vm.editable,

    text: vm => vm.baseText
      ? vm.baseText.toString()
      : vm.defaultValue.toString()
  },
  props: {
    // 基础值
    baseText: {
      type: [String, Number],
      required: true
    },

    // 属性名
    propName: {
      type: String,
      required: true
    },

    // 字段池 用于检测重复
    textPool: {
      type: Array,
      default: function () {
        return []
      }
    },

    // 是否使用selection
    select: {
      type: Boolean,
      default: false
    },

    // 选择内容
    selection: {
      type: Array,
      default: function () {
        return []
      }
    },

    width: {
      type: Number,
      default: 200
    },

    editable: {
      type: Boolean,
      default: true
    },

    defaultValue: {
      type: String,
      default: function () {
        return ''
      }
    },

    checkDuplicate: {
      type: Boolean,
      default: false
    }

  },
  methods: {
    inputText($event) {
      this.cacheText = $event;
    },

    saveText() {
      if (this.cacheText !== '') {
        this.editHistory.push(this.text);
        this.update(this.cacheText);
        this.cacheText = '';
      }
    },

    restoreText(index) {
      index > 0
        ? this.$set(this.editHistory, index, this.text)
        : this.$set(this.editHistory, 1, this.text);
      this.update(this.editHistory[index]);
    },

    update($event) {
      this.$emit('update-value', this.propName, $event, this.status(this.cacheText));
    },

    status(text) {
      let vm = this;
      let result;
      vm.rules.empty(text) ||
                vm.rules.errorChar(text) ||
                (vm.checkDuplicate && checkDuplicate(vm.textPool, text))
        ? result = 'error'
        : result = 'default';
      return result
    }
  },
  watch: {},

  created() {
  }

}
</script>

<style scoped>

</style>
