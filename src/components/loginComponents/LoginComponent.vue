<template>
    <v-container class="pa-2 pt-1">
        <v-tabs v-model="currentTab" height="36px" fixed-tabs>
            <v-tab>账户密码登录</v-tab>
            <v-tab>手机快捷登录</v-tab>
        </v-tabs>
        <v-card flat class="pa-1 pt-3">
            <v-card-text class="pa-0">
                <v-tabs-items v-show="currentTab === 0">
                    <v-form
                        ref="formValid"
                        v-model="loginValid">
                        <template v-for="(setting, index) in textFieldSetting">
                            <v-text-field
                                dense
                                class="py-1"
                                :append-icon="setting.appendIcon ? setting.appendIcon : ''"
                                :key="index"
                                :label="setting.label"
                                :type="setting.type ? setting.type : 'text'"
                                :rules="setting.rules"
                                :clearable="setting.clearable"
                                @click:append="doSomething(setting._func)"
                                v-model="formData[setting.prop]">
                            </v-text-field>
                        </template>
                        <v-checkbox v-model="isEmail">
                            <template v-slot:label>
                                <div>
                                    使用邮箱名登录?
                                </div>
                            </template>
                        </v-checkbox>
                    </v-form>
                </v-tabs-items>
                <v-tabs-items v-show="currentTab === 1">
                    <v-form
                        ref="formRegisterFast"
                        v-model="loginFastValid">
                        <phone-code-group
                            :width="360"
                            :phone.sync="formDataFast.Phone"
                            :code.sync="formDataFast.Code">

                        </phone-code-group>
                    </v-form>
                </v-tabs-items>
            </v-card-text>
            <v-card-actions class="pa-0">
                <v-checkbox v-model="agree">
                    <template v-slot:label>
                        <div>
                            保持7天登录
                        </div>
                    </template>
                </v-checkbox>
                <v-spacer></v-spacer>
                <v-btn text depressed @click="signIn" :disabled="!signInValid">
                    Sign In
                </v-btn>
            </v-card-actions>
        </v-card>
        <v-tabs-items>

        </v-tabs-items>
    </v-container>
</template>

<script lang="ts">
    import Vue from 'vue'
    import PhoneCodeGroup from "@/components/loginComponents/PhoneCodeGroup.vue";
    import {TextFieldSetting} from "@/interface/interfaceInComponent";
    import {validGroup} from "@/utils/validation";
    import {getIcon} from "@/utils/icon";
    import {LoginDataByPhoneCode, LoginDataByUserName, loginPhoneCode, loginUserName} from "@/api/user/loginApi";
    import {doNothing, setLoginIn} from "@/utils/utils";

    export default Vue.extend({
        name: "LoginComponent",
        components: {
            PhoneCodeGroup
        },
        data: function () {
            return {
                currentTab: 0,
                loginValid: false,
                loginFastValid: false,
                passwordOn: false,
                formData: {
                    Name: '',
                    Password: '',
                    IsEmail: false
                } as LoginDataByUserName,
                formDataFast: {
                    Phone: '',
                    Code: ''
                } as LoginDataByPhoneCode,
                agree: false,
                isEmail: false
            }
        },
        props: {},
        computed: {
            textFieldSetting: function (): TextFieldSetting[] {
                let stringGroup = validGroup.String;
                return [
                    {
                        label: 'Name Or Email',
                        rules: this.isEmail
                            ? [stringGroup.notNone('Name'), stringGroup.emailCheck()]
                            : [stringGroup.notNone('Name')],
                        prop: 'Name',
                        clearable: true
                    },
                    {
                        label: 'Password',
                        rules: [stringGroup.notNone('Password'), stringGroup.minCheck('Password', 8)],
                        prop: 'Password',
                        appendIcon: getIcon('i-eye', this.passwordOn),
                        _func: this.viewPassword,
                        type: this.passwordOn ? 'text' : 'password',
                        clearable: true
                    },
                ]
            },

            signInValid: function (): boolean {
                return this.currentTab === 0
                    ? this.loginValid
                    : this.loginFastValid
            },

            formName: function (): string {
                return this.formData.Name
            }
        },
        methods: {
            viewPassword() {
                this.passwordOn = !this.passwordOn
            },
            doSomething(_func?: Function) {
                _func !== undefined
                    ? _func()
                    : doNothing()
            },

            signIn() {
                let sevenDays = this.agree;
                if (this.currentTab === 0) {
                    loginUserName(this.formData)
                } else {
                    loginPhoneCode(this.formDataFast)
                }
            }
        },
        watch: {
            formName: function (): void {
                if (validGroup.String.emailCheck()(this.formName) === true) {
                    this.isEmail = true
                } else {
                    //
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
