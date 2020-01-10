<template>
    <v-app id="page">
        <v-content class="d-flex flex-nowrap">
            <div style="width: 100%; position: absolute; left: 0; top: 0; z-index: 2">
                <v-toolbar tile color="white" :height="toolBar.height + 'px'">
                    <div :style="toolbarSpaceStyle">
                        <p class="font-weight-bold" style="text-align: justify; text-justify: auto; font-size: x-large">
                            META-KNEW</p>
                    </div>
                    <v-toolbar-items>
                        <search-bar edit-mode class="mt-n2 pl-4" v-if="toolBarSearch"></search-bar>
                    </v-toolbar-items>
                    <v-spacer></v-spacer>
                    <v-toolbar-items class="hidden-sm-and-down">
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
                    </v-toolbar-items>
                </v-toolbar>
            </div>
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
    import {FileToken} from "@/api/user"

    export default Vue.extend({
        name: "App",
        components: {GlobalSnackBar, SearchBar},
        data() {
            return {}
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
            toolBar: function () {
                return this.allComponentSize.toolBar
            },
            spaceStyle(): ComponentSize {
                return {
                    height: this.toolBar.height + 'px',
                    width: '100%'
                }
            },
            contentStyle(): ComponentSize {
                return {
                    "width": "100%",
                    "height": this.allComponentSize.screenY - this.toolBar.height + "px"
                }
            },
            toolbarSpaceStyle(): ComponentSize {
                return {
                    height: this.toolBar.height + 'px',
                    width: this.allComponentSize.leftCard.width + 'px'
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
