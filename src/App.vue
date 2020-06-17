<template>
    <v-app id="page" v-resize="screenResize">
        <v-content class="d-flex flex-nowrap">
            <v-card :style="toolBarStyle" class="d-flex flex-row flex-nowrap">
                <div :style="toolbarLeftStyle" class="flex-shrink-0" v-if="!isIndex">
                    <v-btn large text block href="/index" :style="buttonStyle" class="px-2 name-title">
                        Meta Knew
                    </v-btn>
                </div>
                <div class="flex-grow-1">
                    <search-bar edit-mode v-if="!isIndex">

                    </search-bar>
                </div>
                <div class="pt-2 flex-nowrap">
                    <v-menu offset-y>
                        <template v-slot:activator="{on}">
                            <v-btn text v-on="on" class="px-sm-1 px-xs-1 px-md-2 px-lg-4">
                                {{ 'Lang: ' + lang }}
                            </v-btn>
                        </template>
                        <v-list>
                            <v-list-item
                                v-for="item in supportedLang"
                                :key="item"
                                @click="langChange(item)">
                                <v-list-item-title>
                                    {{ item }}
                                </v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                    <template v-if="isLogin">
                        <v-menu offset-y>
                            <template v-slot:activator="{on}">
                                <v-btn text v-on="on" class="px-sm-1 px-xs-1 px-md-2 px-lg-4">
                                    {{ userNameShow }}
                                </v-btn>
                            </template>
                            <v-list>
                                <v-list-item href="/userCenter">
                                    <v-list-item-title>
                                        用户中心
                                    </v-list-item-title>
                                </v-list-item>
                                <v-list-item @click="logout">
                                    <v-list-item-title>
                                        退出登录
                                    </v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </template>
                    <template v-else>
                        <v-btn text @click="logIn">Sign in/up</v-btn>
                    </template>
                </div>
            </v-card>
            <div :style="spaceStyle"></div>
            <v-container fluid
                         class="view-container flex-nowrap ma-0 pa-0"
                         ref="main"
                         :style="contentStyle"
            >
                <router-view></router-view>
            </v-container>
        </v-content>
        <global-snack-bar></global-snack-bar>
        <global-login-register></global-login-register>
    </v-app>
</template>

<script lang="ts">
    import Vue from 'vue'
    import GlobalSnackBar from '@/components/global/GlobalSnackBar.vue';
    import SearchBar from '@/components/SearchBar.vue';
    import GlobalLoginRegister from "@/components/global/GlobalLoginRegister.vue";
    import {getCookie, setLoginIn, setLoginOut} from "@/utils/utils"
    import {commitLangChange, commitLoginDialogOn, commitScreenRefresh} from '@/store/modules/_mutations'
    import {ToolBar} from "@/store/modules/styleComponentSize";
    import {loginCookie} from "@/api/user/loginApi";
    import {supportedLang} from "@/store/modules/userInfo";

    export default Vue.extend({
        name: "App",
        components: {
            GlobalSnackBar,
            SearchBar,
            GlobalLoginRegister
        },
        data() {
            return {
                buttonNum: 5,
                rightWidth: 480,
                supportedLang: supportedLang
            }
        },
        props: {},
        computed: {
            isLogin: function (): boolean {
                return this.$store.state.userBaseModule.isLogin
            },
            userInfo: function (): UserLoginResponse {
                return this.$store.state.userBaseModule.userInfo
            },
            lang: function (): string {
                return this.$store.state.userBaseModule.lang
            },
            userName: function (): string {
                return this.userInfo.userName
            },

            allComponentSize: function (): StyleManagerState {
                return this.$store.state.styleComponentSize
            },
            toolBar: function (): ToolBar {
                return this.allComponentSize.toolBar
            },
            toolBarStyle: function (): CSSProp {
                return {
                    width: '100%',
                    height: this.toolBar.height + 'px',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    zIndex: 2,
                }
            },
            spaceStyle: function (): CSSProp {
                return {
                    height: this.toolBar.height + 'px',
                    width: '100%'
                }
            },
            contentStyle: function (): CSSProp {
                return {
                    width: "100%",
                    height: this.allComponentSize.screenY - this.toolBar.height + "px"
                }
            },
            screenX: function (): number {
                return this.allComponentSize.screenX
            },
            isMiddle: function (): boolean {
                return this.screenX >= 960
            },
            toolbarLeftStyle: function (): CSSProp {
                return {
                    height: this.toolBar.height + 'px',
                    width: this.isMiddle ? this.allComponentSize.leftCard.width + 'px' : '180px',
                    textAlign: "start",
                    textJustify: "auto",
                    display: "inline-block",
                    verticalAlign: "top"
                }
            },
            buttonStyle: function (): CSSProp {
                return {
                    fontWeight: "bolder",
                    fontSize: this.isMiddle ? '40px' : 'x-large'
                }
            },
            userNameShow: function (): string {
                let userName = this.userName;
                return this.isMiddle
                    ? userName
                    : userName.length > 9 ? userName.substring(0, 6) + '...' : userName
            },
            isIndex: function (): boolean {
                return this.$route.name === 'index'
            }
        },
        methods: {
            logout() {
                setLoginOut()
            },
            logIn() {
                commitLoginDialogOn(0)
            },
            screenResize() {
                commitScreenRefresh()
            },
            langChange(payload: string) {
                commitLangChange(payload);
            }
        },
        watch: {},
        created(): void {
            getCookie('token') && loginCookie().then(setLoginIn).catch()
        },
        mounted(): void {
            this.screenResize()
        },
        record: {
            status: "done"
        }
    })
</script>

<style scoped>
    @font-face {
        font-family: 'BankGothic-Md';
        src:url("style/fonts/BankGothic Md BT Medium.ttf");
    }
    .name-title {
        font-family: "BankGothic-Md",sans-serif;
        font-weight: bolder;
    }
</style>
