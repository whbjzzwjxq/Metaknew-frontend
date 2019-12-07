<template>
  <div class="login">
    <div class="row">
      <div class="col-md-3">
      </div>
      <div class="col-md-6 justify-center">
        <div class="MontSerra" id="welcome">WELCOME TO META-KNEW</div>
          <v-text-field
            v-model="loginData.phone"
            dense
            clearable
            label="phone"
            :rules="phoneRules"
          >

          </v-text-field>
          <v-text-field
            v-model="loginData.password"
            dense
            clearable
            label="password"
            :rules="passwordRules"
          >
          </v-text-field>
        <v-btn outlined block @click="login"> Login </v-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import {login, loginData, UserLoginData} from '@/api/user'
    import {getCookie, setCookie, delCookie} from '@/utils/utils'
    import {commitFileToken, commitUserLogin} from '@/store/modules/_mutations'

    export default Vue.extend({
        name: "Login",
        components: {},
        data() {
            return {
                loginData: {
                    name: '',
                    phone: '',
                    email: '',
                    password: ''
                } as loginData,
                phoneRules: [
                    (value: string) => new RegExp('[0-9]{11}').test(value)
                        ? false
                        : '手机号是11位数字'
                ],
                passwordRules: [
                    (value: string) => value !== ''
                        ? false
                        : '密码不能为空'
                ]
            }
        },
        props: {},
        computed: {},
        methods: {
            login(): any {
                login(this.loginData).then(res => {
                    if (res.status !== 400) {
                        let data: UserLoginData = res.data;
                        setCookie('user_name', data.userName, 7);
                        setCookie('token', data.token, 7);
                        setCookie('user_id', data.userId.toString(), 7);
                        commitUserLogin(data);
                        commitFileToken(data.fileToken);
                        this.$router.push({
                            path: '/index'
                        })
                        // todo 拦截器之类的内容
                    } else {
                        // todo
                    }
                });
            },
            type: function () {

            }
        },
        watch: {}
    })
</script>

<style scoped>

</style>
