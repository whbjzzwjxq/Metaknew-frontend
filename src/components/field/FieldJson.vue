<template>
  <v-card :width="width" tile flat class="pa-2">
    <v-simple-table dense>
      <template v-slot:default>
        <thead>
        <tr>
          <th class="text-left">Prop</th>
          <th class="text-left">Value</th>
          <th class="text-left" v-if="changeType">Type</th>
          <th class="text-left" v-if="changeType">Resolve</th>
          <th class="text-left" v-if="changeType">Action</th>
        </tr>
        </thead>

        <tbody>
        <tr v-for="(item, key) in dict" :key="key">
          <td>
            <v-text-field
              :value="key"
              :rules="[rules.empty, rules.tooLong]"
              @input="inputKey"
              @blur="updateKey(key, item)"
              :disabled="!changeType"
              dense
              height="16px"
              style="width: 100px;"
              class="pt-4">

            </v-text-field>
          </td>

          <td>
            <data-table-field
              :prop-name="key"
              :base-value="item.value"
              :field-type="item.type"
              :resolve="item.resolve"
              :setting="fieldSetting"
              :p-label="pLabel"
              @update="updateValue(key, $event)">

            </data-table-field>
          </td>

          <td v-if="changeType">
            <v-select
              :value="item.type"
              @change="updateType(item, $event)"
              :items="types"
              dense>

            </v-select>
          </td>

          <td v-if="changeType">
            <v-select
              :value="item.resolve"
              @change="updateResolveType(item, $event)"
              :items="resolves">

            </v-select>
          </td>

          <td v-if="changeType">
            <v-btn
              v-if="editable"
              @click="delProp(key)"
              left x-small icon>
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>

        </tr>

        </tbody>
      </template>
    </v-simple-table>
    <template v-if="changeType">
      <div class="d-flex flex-row">
        <v-col cols="3">
          <v-btn text small @click="addNewProp">
            New Item
            <v-icon right small>mdi-plus</v-icon>
          </v-btn>
        </v-col>
        <v-col cols="3">
          <v-btn text small @click="update">
            Save
            <v-icon right small>save</v-icon>
          </v-btn>
        </v-col>
      </div>
    </template>
  </v-card>
</template>

<script>

import {fieldTypes, fieldSetting, fieldDefaultValue, fieldResolveTypes} from '../../../utils/OfficialLabels';
import {deepClone} from '../../../utils/deepclone'

export default {
  name: 'fieldJson',
  data() {
    return {
      cacheKey: '',
      rules: {
        empty: key => key === '' && 'Key is empty!!',
        tooLong: key => key.length >= 20 && 'Key is too long!!'
      },
      fieldSetting: fieldSetting,
      types: fieldTypes,
      resolves: fieldResolveTypes,
      reg: new RegExp('[\\\\:*?"<>|]')
    }
  },
  components: {
    dataTableField: () => import('../../Private/dataTable/dataTableField.vue')
  },
  props: {
    baseProps: {
      type: Object,
      required: true
    },
    propName: {
      type: String,
      required: true
    },
    width: {
      type: [Number, String],
      default: 360
    },
    // 是否是原生属性
    changeType: {
      type: Boolean,
      default: false
    },
    // 是否是editMode
    editable: {
      type: Boolean,
      default: true
    },
    pLabel: {
      type: String,
      required: true
    },

    defaultValue: {
      type: Object,
      default: function () {
        return {}
      }
    },

    newPropType: {
      type: String,
      default: 'StringField'
    }
  },
  methods: {
    inputKey($event) {
      this.cacheKey = $event
    },

    updateKey(key, item) {
      if (this.cacheKey !== '') {
        this.delProp(key);
        this.addProp(this.cacheKey, item);
        this.cacheKey = '';
      }
    },

    updateValue(item, value) {
      this.$set(this.dict[item], 'value', value);
      this.update()
    },

    delProp(key) {
      this.$delete(this.dict, key);
      this.update()
    },

    addProp(key, item) {
      this.$set(this.dict, key, item);
      this.update()
    },

    addNewProp() {
      let key = '$_new' + this.propNum;
      let item = {
        'value': fieldDefaultValue[this.newPropType],
        'type': this.newPropType,
        'resolve': 'normal'
      };
      this.addProp(key, item);
    },

    updateType(item, type) {
      this.$set(item, 'type', type);
      this.$set(item, 'value', fieldDefaultValue[type]);
      this.update()
    },

    updateResolveType(item, resolveType) {
      this.$set(item, 'resolve', resolveType);
      this.update()
    },

    update() {
      this.$emit('update-value', this.propName, this.dict, this.status)
    }
  },

  computed: {
    keys: vm => Object.keys(vm.dict),
    propNum: vm => vm.keys.length,
    status: vm => vm.keys.filter(key => (key && key.length <= 20)).length === vm.propNum
      ? 'default'
      : 'error',
    dict: vm => Object.keys(vm.baseProps).length > 0
      ? deepClone(vm.baseProps)
      : vm.defaultValue
  }
}
</script>

<style scoped>

</style>
