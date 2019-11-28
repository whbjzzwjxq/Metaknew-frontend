<template>
  <v-snackbar
    bottom
    multi-line
    :timeout="timeout"
    :value="snackBarOn"
    :color="snackColor"
    @input="offSnackBar"
  >
    {{snackText}}
    <v-btn v-if="buttonText"
           text
           @click="doAction">{{buttonText}}
    </v-btn>
    <v-btn text @click="offSnackBar">关闭消息</v-btn>
  </v-snackbar>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {State as snackBarState} from '@/store/modules/componentSnackBar'
    import {commitSnackbarOff} from '@/store/modules/_mutations'

    export default Vue.extend({
        name: "GlobalSnackBar",
        components: {},
        data() {
            return {}
        },
        props: {},
        computed: {
            getSnackBarState(): snackBarState {
                return this.$store.state.componentSnackBar
            },
            snackBarOn(): boolean {
                let vm = this;
                return vm.getSnackBarState.on
            },
            snackText: (vm) => vm.getSnackBarState.payload.content,
            buttonText: (vm) => vm.getSnackBarState.payload.buttonText,
            timeout: (vm) => vm.getSnackBarState.payload.timeout,
            snackColor: (vm) => vm.getSnackBarState.payload.color
        },
        methods: {
            offSnackBar() {
                commitSnackbarOff()
            },
            doAction() {
                this.getSnackBarState.payload.action &&
                this.getSnackBarState.payload.action(this.getSnackBarState.payload.actionObject)
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
* Created by whb on 2019/11/25
* Updated by []
*/
