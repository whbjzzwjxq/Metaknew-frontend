<template>
    <v-container class="pa-2 pt-1">
        <v-tabs v-model="currentTab" height="36px" fixed-tabs>
            <v-tab>账户密码注册</v-tab>
            <v-tab>手机快捷注册</v-tab>
        </v-tabs>
        <v-card flat class="pa-1 pt-3">
            <v-card-text class="pa-0">
                <v-tabs-items v-show="currentTab === 0">
                    <v-form
                        ref="formRegister"
                        v-model="registerValid">
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
                        <phone-code-group
                            :width="360"
                            :phone.sync="formData.Phone"
                            :code.sync="formData.Code">

                        </phone-code-group>
                    </v-form>
                </v-tabs-items>
                <v-tabs-items v-show="currentTab === 1">
                    <v-form
                        ref="formRegisterFast"
                        v-model="registerFastValid">
                        <phone-code-group
                            :width="360"
                            :phone.sync="formDataFast.Phone"
                            :code.sync="formDataFast.Code">

                        </phone-code-group>
                    </v-form>
                </v-tabs-items>
            </v-card-text>
            <v-card-actions class="pa-0">
                <v-checkbox :rules="[(v) => v]" v-model="agree">
                    <template v-slot:label>
                        <div @click.stop="">
                            Accept the
                            <a href="javascript:" @click.stop="terms = true">terms</a>
                        </div>
                    </template>
                </v-checkbox>
                <v-spacer></v-spacer>
                <v-btn text depressed @click="reset">
                    Reset
                </v-btn>
                <v-btn text depressed @click="register" :disabled="!signUpValid || !agree">
                    Sign Up
                </v-btn>
            </v-card-actions>
        </v-card>
        <v-tabs-items>

        </v-tabs-items>
    </v-container>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {validGroup} from "@/utils/validation";
    import {FastRegisterData, RegisterData, TextFieldSetting} from "@/interface/interfaceInComponent";
    import {getIcon} from "@/utils/icon";
    import SendMessageButton from "@/components/loginComponents/SendMessageButton.vue";
    import {registerFast} from "@/api/user/registerApi";
    import {doNothing, setLoginIn} from "@/utils/utils";
    import PhoneCodeGroup from "@/components/loginComponents/PhoneCodeGroup.vue";
    export default Vue.extend({
        name: "RegisterComponent",
        components: {
            SendMessageButton,
            PhoneCodeGroup
        },
        data: function () {
            return {
                currentTab: 0,
                registerValid: true,
                registerFastValid: true,
                passwordOn: false,
                agree: false,
                formData: {
                    Name: '',
                    Password: '',
                    ConfirmPassword: '',
                    Email: '',
                    Phone: '',
                    Code: ''
                } as RegisterData,
                formDataFast: {
                    Phone: '',
                    Code: ''
                } as FastRegisterData
            }
        },
        props: {},
        computed: {
            textFieldSetting: function (): TextFieldSetting[] {
                let stringGroup = validGroup.String;
                let confirmPassword = (v: string) => this.formData.Password === this.formData.ConfirmPassword || 'Password is not the same';
                return [
                    {
                        label: 'Name',
                        rules: [stringGroup.notNone('Name')],
                        prop: 'Name',
                        clearable: true
                    },
                    {
                        label: 'Email',
                        rules: [stringGroup.emailCheck(), stringGroup.notNone('Email')],
                        prop: 'Email',
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
                    {
                        label: 'Confirm Password',
                        rules: [confirmPassword],
                        prop: 'ConfirmPassword',
                        type: this.passwordOn ? 'text' : 'password',
                        clearable: true
                    }
                ]
            },

            signUpValid: function (): boolean {
                return this.currentTab === 0
                    ? this.registerValid
                    : this.registerFastValid
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
            reset() {
                this.currentTab === 0
                    //@ts-ignore
                    ? this.$refs.formRegister.reset()
                    //@ts-ignore
                    : this.$refs.formRegisterFast.reset()
            },
            register() {
                if (this.currentTab === 1) {
                    registerFast(this.formDataFast).then(setLoginIn).catch()
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
