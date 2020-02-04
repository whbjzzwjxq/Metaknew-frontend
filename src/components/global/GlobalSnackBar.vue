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
    import {commitSnackbarOff} from '@/store/modules/_mutations'

    export default Vue.extend({
        name: "GlobalSnackBar",
        components: {},
        data() {
            return {}
        },
        props: {},
        computed: {
            getSnackBarState: function (): SnackBarState {
                return this.$store.state.componentSnackBar
            },
            snackBarOn: function (): boolean {
                return this.getSnackBarState.on
            },
            snackText: function (): string {
                return this.getSnackBarState.payload.content
            },
            buttonText: function (): string | undefined {
                return this.getSnackBarState.payload.buttonText
            },
            timeout: function (): number | undefined {
                return this.getSnackBarState.payload.timeout
            },
            snackColor: function (): string {
                return this.getSnackBarState.payload.color
            }
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
            status: 'done',
            description: '全局提示消息'
        }
    })
</script>

<style scoped>

</style>

/**
* Created by whb on 2019/11/25
* Updated by [whb on 2020年1月8日20:34:54]
*/
