<template>
  <div>
    <hr class="cardHr"/>
    <v-row class="pl-4 pr-4 justify-content-between">
      <v-col class="pa-0 ma-0" cols="11">
        <v-subheader class="ml-n4 card-subheader">{{text}}</v-subheader>
      </v-col>
      <v-col class="pa-0 ma-0" cols="1">
        <v-btn icon x-small v-if="collapse">
          <v-icon @click="input">{{collapsedIcon}}</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row class="pl-4 pr-4" v-show="!isCollapsed">
      <slot name="content"></slot>
    </v-row>
  </div>
</template>

<script lang="ts">
    import Vue from 'vue'

    export default Vue.extend({
        name: "cardSubRow",
        components: {},
        data() {
            return {
                isCollapsed: false
            }
        },
        props: {},
        computed: {
            collapsedIcon: (vm): string => vm.isCollapsed
                ? 'mdi-plus'
                : 'mdi-minus'

        },
        methods: {},
        watch: {},
        vm: this
    });
</script>

<style scoped>

</style>
