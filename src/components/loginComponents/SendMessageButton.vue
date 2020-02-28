<template>
    <v-btn text depressed @click="sendMessage" :disabled="!phoneIsValid || !buttonOn">
        {{ text }}
    </v-btn>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {sendCode} from "@/api/user/registerApi";
    import {commitSnackbarOn} from "@/store/modules/_mutations";
    import {validGroup} from "@/utils/validation";

    export default Vue.extend({
        name: "SendMessageButton",
        components: {},
        data: function () {
            return {
                buttonOn: true,
                text: 'Send Message',
                coolDown: 120
            }
        },
        props: {
            phone: {
                type: String,
                required: true
            }
        },
        computed: {
            phoneIsValid: function (): boolean {
                return validGroup.String.phoneCheck()(this.phone) === true
            }
        },
        methods: {
            sendMessage() {
                sendCode(this.phone).then(() => {
                    let payload = {
                        color: 'success',
                        content: 'Send Message Success',
                        once: false,
                        actionName: 'Send Message'
                    } as SnackBarStatePayload;
                    commitSnackbarOn(payload)
                }).catch(() => {
                    let payload = {
                        color: 'error',
                        content: 'Connection is bad',
                        once: false,
                        actionName: 'Send Message Error'
                    } as SnackBarStatePayload;
                    commitSnackbarOn(payload)
                });
                this.setTime()
            },
            setTime() {
                let vm = this;
                if (vm.coolDown === 0) {
                    vm.text = 'Send Again';
                    vm.buttonOn = true;
                    vm.coolDown = 120
                } else {
                    vm.text = `Wait ${vm.coolDown}s`;
                    vm.buttonOn = false;
                    vm.coolDown--;
                    setTimeout(() => vm.setTime(), 1000)
                }
            }
        },
        record: {
            status: 'empty',
            description: ''
        }
    })
</script>

<style scoped>

</style>
