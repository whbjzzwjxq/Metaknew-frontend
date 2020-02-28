<template>
    <v-dialog persistent v-model="dialogOn" :width="width">
        <v-card :width="width" :height="height">
            <v-card-title class="pa-2 pb-0">
                <v-tabs v-model="currentTab" height="36px">
                    <v-tab :key="'login'">登录</v-tab>
                    <v-tab :key="'register'">注册</v-tab>
                    <v-spacer></v-spacer>
                    <v-btn icon @click="closeDialog">
                        <v-icon> {{ closeIcon }}</v-icon>
                    </v-btn>
                </v-tabs>
            </v-card-title>
            <div class="pa-2">
                <v-tabs-items v-model="currentTab">
                    <v-tab-item>
                        <login-component>

                        </login-component>
                    </v-tab-item>
                    <v-tab-item>
                        <register-component>

                        </register-component>
                    </v-tab-item>
                </v-tabs-items>
            </div>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {commitLoginDialogChange, commitLoginDialogOn} from "@/store/modules/_mutations";
    import {getIcon} from "@/utils/icon";
    import LoginComponent from "@/components/loginComponents/LoginComponent.vue";
    import RegisterComponent from "@/components/loginComponents/RegisterComponent.vue";

    export default Vue.extend({
        name: "GlobalLoginRegister",
        components: {
            LoginComponent,
            RegisterComponent
        },
        data: function () {
            return {
                width: 400,
                height: 530,
                closeIcon: getIcon('i-normal', 'close'),
                isLoginPage: true,
                isPhonePage: true,
                loginUserNameValid: false,
                formData: {
                    UserName: '',
                    Phone: '',
                    Email: '',
                    Message: '',
                    Agree: false
                },
                currentSubTab: 0
            }
        },
        props: {},
        computed: {
            componentState: function (): ComponentState {
                return this.$store.state.componentState
            },
            dialogOn: function (): boolean {
                return this.componentState.loginDialogOn
            },
            currentTab: {
                get(): number {
                    return this.componentState.loginTab.root
                },
                set(value: 0 | 1): void {
                    commitLoginDialogOn(value)
                }
            }
        },
        methods: {
            closeDialog() {
                commitLoginDialogChange(false)
            },
            clickTab(value: boolean) {
                this.isLoginPage = value
            },

            clickSubTab(value: boolean) {
                this.isPhonePage = value
            },

            resetForm() {
                //@ts-ignore
                this.$refs.formLoginUserName.reset()
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
