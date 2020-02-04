<template>
    <v-app id="page" v-resize="screenResize">
        <v-content class="d-flex flex-nowrap">
            <v-card :style="toolBarStyle">
                <div :style="toolbarLeftStyle">
                    <p class="font-weight-bold pl-4 ma-0">META-KNEW</p>
                </div>
                <div :style="toolbarMidStyle">
                    <search-bar edit-mode v-if="toolBarSearch">

                    </search-bar>
                </div>
                <div :style="toolbarRightStyle">
                    <div class="pt-2">
                    <v-btn text href="/index">Home</v-btn>
                    <v-btn text href="/index/about">About</v-btn>
                    <template v-if="isLogin">
                        <v-btn text href="/index/userCenter">{{userName}}</v-btn>
                        <v-btn text @click="logout">Sign Out</v-btn>
                    </template>
                    <template v-else>
                        <v-btn text href="/index/login">Sign in</v-btn>
                        <v-btn text href="/index/register">Sign up</v-btn>
                    </template>
                    </div>
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
    </v-app>
</template>

<script lang="ts">
    import Vue from 'vue'
    import GlobalSnackBar from '@/components/global/GlobalSnackBar.vue';
    import SearchBar from '@/components/SearchBar.vue';
    import {delCookie, getCookie} from "@/utils/utils"
    import {commitLoginOut, commitScreenResize, commitUserLogin} from '@/store/modules/_mutations'
    import {ToolBar} from "@/store/modules/styleComponentSize";

    export default Vue.extend({
        name: "App",
        components: {GlobalSnackBar, SearchBar},
        data() {
            return {
                buttonNum: 5,
                rightWidth: 480
            }
        },
        props: {},
        computed: {
            isLogin: function (): boolean {
                return this.$store.state.userBaseModule.isLogin
            },
            userName: function (): boolean {
                return this.$store.state.userBaseModule.userInfo.userName
            },
            toolBarSearch: function (): boolean {
                return this.$route.name !== 'home'
            },
            allComponentSize: function (): StyleManagerState {
                return this.$store.state.styleComponentSize
            },
            toolBar: function (): ToolBar {
                return this.allComponentSize.toolBar
            },
            toolBarStyle: function(): CSSProp {
                return {
                    width: '100%',
                    height: this.toolBar.height + 'px',
                    position: "absolute",
                    left: 0,
                    top: 0,
                    zIndex: 2,
                }
            },
            spaceStyle: function(): CSSProp {
                return {
                    height: this.toolBar.height + 'px',
                    width: '100%'
                }
            },
            contentStyle: function(): CSSProp {
                return {
                    width: "100%",
                    height: this.allComponentSize.screenY - this.toolBar.height + "px"
                }
            },
            toolbarLeftStyle: function(): CSSProp {
                return {
                    height: this.toolBar.height + 'px',
                    width: this.allComponentSize.leftCard.width + 'px',
                    textAlign: "start",
                    textJustify: "auto",
                    display: "inline-block",
                    verticalAlign: "top",
                    fontSize: Math.floor(this.toolBar.height / 1.5) + 'px'
                }
            },

            toolbarRightStyle: function(): CSSProp {
                return {
                    height: this.toolBar.height + 'px',
                    width: this.rightWidth + 'px',
                    display: "inline-block",
                    verticalAlign: "top",
                    textAlign: "right",
                }
            },

            toolbarMidStyle: function(): CSSProp {
                return {
                    height: this.toolBar.height + 'px',
                    width: (this.allComponentSize.screenX - this.rightWidth - this.allComponentSize.leftCard.width) + 'px',
                    display: "inline-block",
                    verticalAlign: "top"
                }
            }

        },
        methods: {
            logout() {
                delCookie("user_name");
                delCookie("token");
                commitLoginOut();
            },
            screenResize() {
                commitScreenResize()
            }
        },
        watch: {},
        created(): void {
            let userName = getCookie("user_name");
            let userId = parseInt(getCookie('user_id'));
            let token = getCookie('token');
            let fileToken = {
                'AccessKeySecret': '',
                'AccessKeyId': '',
                'Expiration': 19000000,
                'SecurityToken': ''
            } as FileToken;
            userName
                ? commitUserLogin({userName, userId, token, fileToken})
                : commitLoginOut();
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

</style>
