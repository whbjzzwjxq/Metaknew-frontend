<template>
  <v-list dense class="pa-0 pt-2">
    <v-list-item dense :class="itemClass">
      <v-autocomplete
        v-model="addLinkStartModel"
        :items="nodeToLinkItems"
        :disabled="!editable"
        item-text="text"
        item-value="value"
        item-disabled="disabled"
        label="startNode"
        dense
        return-object>
      </v-autocomplete>

    </v-list-item>
    <v-list-item dense :class="itemClass">
      <v-autocomplete
        v-model="addLinkEndModel"
        :items="nodeToLinkItems"
        :disabled="!editable"
        item-text="text"
        item-value="value"
        item-disabled="disabled"
        label="endNode"
        dense
        return-object>
      </v-autocomplete>
    </v-list-item>

    <v-list-item dense v-if="editMode" :class="itemClass">
      <v-btn text small @click="editable = !editable">{{editable ? 'edit off' : 'edit on '}}</v-btn>
      <v-btn text small @click="addLinkSelect" :disabled="!addLinkDisable">Confirm</v-btn>
      <v-btn text small @click="clearSelect" :disabled="!editable">Clear</v-btn>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
  import Vue from 'vue'
  import {
    GraphSelfPart,
    MediaSettingPart,
    NodeSettingPart,
    id,
    itemEqual,
    BaseType,
    VisualNodeSettingPart
  } from "@/utils/graphClass";
  import {DataManagerState} from "@/store/modules/dataManager";

  interface NodeAsSelectorItem {
    disabled: boolean,
    text: string,
    value: id
  }

  export default Vue.extend({
    name: "LinkStartEndSelector",
    components: {},
    data() {
      return {
        startCache: null as unknown as NodeAsSelectorItem,
        endCache: null as unknown as NodeAsSelectorItem,
        editable: false,
        itemClass: "pt-0 pb-0 pl-1 pr-1"
      }
    },
    props: {
      editMode: {
        type: Boolean,
        default: false
      },
      document: {
        type: Object as () => GraphSelfPart,
        required: true
      },
      currentStart: {
        type: Object as () => VisualNodeSettingPart,
        default: () => ({
          Setting: {
            _id: -1,
            _type: 'node' as BaseType,
            _label: ''
          }
        })
      },
      currentEnd: {
        type: Object as () => VisualNodeSettingPart,
        default: () => ({
          Setting: {
            _id: -1,
            _type: 'node' as BaseType,
            _label: ''
          }
        })
      }
    },
    computed: {
      dataManager: function (): DataManagerState {
        return this.$store.state.dataManager
      },
      nodes: function (): VisualNodeSettingPart[] {
        return this.document.Graph.nodes
      },
      nodeToLinkItems: function (): NodeAsSelectorItem[] {
        return this.nodes.map(node => ({
          "disabled": itemEqual(this.currentStart.Setting, node.Setting) ||
            itemEqual(this.currentEnd.Setting, node.Setting),
          "text": node.Setting._name,
          "value": node.Setting._id
        }))
      },
      addLinkDisable: (vm: any): boolean => vm.editable && vm.addLinkStartModel && vm.addLinkEndModel,

      addLinkStartModel: {
        get(): NodeAsSelectorItem {
          return this.currentStart instanceof NodeSettingPart || this.currentStart instanceof MediaSettingPart
            ? this.nodeToLinkItems[this.nodes.indexOf(this.currentStart)]
            : this.startCache;
        },
        set(value: NodeAsSelectorItem): void {
          let start = this.nodes.filter(node => node.Setting._id === value.value)[0];
          value.disabled = true;
          this.startCache = value;
          this.$emit('selectItem-link', start, null)
        }
      },

      addLinkEndModel: {
        get(): NodeAsSelectorItem {
          return this.currentEnd instanceof NodeSettingPart || this.currentEnd instanceof MediaSettingPart
            ? this.nodeToLinkItems[this.nodes.indexOf(this.currentEnd)]
            : this.endCache;
        },
        set(value: NodeAsSelectorItem): void {
          let end = this.nodes.filter(node => node.Setting._id === value.value)[0];
          value.disabled = true;
          this.endCache = value;
          this.$emit('selectItem-link', null, end)
        }
      },
    },
    methods: {
      select($event: NodeAsSelectorItem['value']) {
        let node = this.nodes.filter(node => node.Setting._id === $event)[0];
        let index = this.nodes.indexOf(node);
        this.nodeToLinkItems[index].disabled = true;
      },

      addLinkSelect() {
        let result = this.clearSelect();
        this.$emit('add-link', result[0], result[1])
      },

      clearSelect() {
        let start;
        let end;
        if (this.addLinkStartModel) {
          start = this.nodes.filter(node => node.Setting._id === this.addLinkStartModel.value)[0];
          let indexStart = this.nodes.indexOf(start);
          this.nodeToLinkItems[indexStart].disabled = false;
        }
        if (this.addLinkEndModel) {
          end = this.nodes.filter(node => node.Setting._id === this.addLinkEndModel.value)[0];
          let indexEnd = this.nodes.indexOf(end);
          this.nodeToLinkItems[indexEnd].disabled = false;
        }
        if (start && end) {
          return [start, end]
        } else {
          return [null, null]
        }
      }
    },
    watch: {},
    record: {
      status: 'done'
    }
  })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/11/29
* Updated by []
*/
