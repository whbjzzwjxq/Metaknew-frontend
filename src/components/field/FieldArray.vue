<template>
  <v-card :width="width" tile flat class="pa-2">
    <v-card-text>
      <span class="subheading">Current {{ propName }}</span>
      <v-chip-group column active-class="primary--text">
        <v-chip
          v-for="(item, index) in existTags"
          :key="item"
          :color="indexToColor(index)"
          label
          outlined
          :close="editMode"
          tile
          @click:close="removeTag(item)">
          {{ item }}
        </v-chip>
      </v-chip-group>
    </v-card-text>

    <v-card-text v-for="(list, key) in recommendTags" :key="key">
      <span class="subheading">{{ key }}</span>
      <v-chip-group column active-class="primary--text">
        <v-chip v-for="(item, index) in list" :key="item" :color="indexToColor(index)" label outlined tile>
          {{ item }}
          <v-icon right @click="addTag(item)" small>mdi-plus</v-icon>
        </v-chip>
      </v-chip-group>
    </v-card-text>

    <v-card-text v-if="editMode">
      <span class="subheading">Rollback delete</span>
      <v-chip-group column active-class="primary--text">
        <v-chip v-for="(item, index) in removedTags" :key="item" label tile>
          {{item}}
          <v-icon @click="restoreTag(index)" right>mdi-restore</v-icon>
        </v-chip>
      </v-chip-group>
    </v-card-text>

    <v-card-text v-if="editMode">
      <span class="subheading">Tips</span>
      <v-icon @click="checkTags">mdi-magnify-outline</v-icon>
      <p style="font-weight: bolder; color: darkred">
        {{tipsContent}}
      </p>
    </v-card-text>

    <v-card-text v-if="editMode">
      <v-textarea
        v-model="tagsToString"
        outlined
        label="直接使用字符编辑"
        placeholder="使用;分隔内容">

      </v-textarea>
    </v-card-text>
  </v-card>
</template>

<script>
  import Vue from 'vue'
  import { indexToColor, checkDuplicate } from '@/utils/utils'

  export default Vue.extend({
    name: 'FieldArray',
    data () {
      return {
        removedTags: [],
        cacheText: ''
      }
    },
    props: {
      baseArray: {
        type: Array,
        required: true
      },
      availableTags: {
        type: Object,
        default: function () {
          return {
            'recommend': []
          }
        }
      },
      propName: {
        type: String,
        required: true
      },
      width: {
        type: Number,
        default: 400
      },
      resolveType: {
        type: String,
        default: 'normal',
        validator: function (value) {
          return ['normal', 'time', 'location', 'name'].indexOf(value) !== -1
        }
      },
      basePool: {
        type: Array,
        default () {
          return []
        }
      },
      editMode: {
        type: Boolean,
        default: true
      },
      defaultValue: {
        type: Array,
        default: function () {
          return []
        }
      }
    },
    computed: {
      tagsToString: {
        get () {
          return this.existTags.join(';')
        },
        set (value) {
          this.updateTags(value.split(';').filter(item => item !== ''))
        }
      },
      status: (vm) => !vm.duplicate
        ? 'default'
        : 'error',

      pool: (vm) => vm.existTags.concat(vm.basePool),

      duplicate: (vm) =>
        vm.existTags.length > 0 &&
        vm.existTags.filter((tag) => checkDuplicate(vm.pool, tag)).length === vm.existTags.length,

      recommendTags: (vm) => vm.editable
        ? vm.availableTags
        : {},

      tipsContent: (vm) => vm.duplicate
        ? 'duplicate tag'
        : '',

      existTags: (vm) => vm.baseArray
        ? vm.baseArray.filter((item) => item !== '')
        : vm.defaultValue
      //
    },
    methods: {
      removeTag (item) {
        this.removedTags.indexOf(item) === -1 && this.removedTags.push(item)
        let index = this.existTags.indexOf(item)
        this.existTags.splice(index, 1)
        this.updateTags(this.existTags)
      },

      // 添加标签
      addTag (item) {
        this.existTags.push(item)
        this.updateTags(this.existTags)
      },

      restoreTag (index) {
        let item = this.removedTags[index]
        this.removedTags.splice(index, 1)
        this.addTag(item)
      },

      // 检查标签
      checkTags () {

      },

      updateTags (value) {
        this.$emit('update-value', this.propName, value, this.status)
      },

      // chip颜色
      indexToColor (index) {
        return indexToColor(index)
      }
    },
    created () {

    },

    updated () {

    }
  })
</script>

<style scoped>

</style>
