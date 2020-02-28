import Vue from 'vue'
import VueRouter, {Route} from 'vue-router'
import {commitEditModeChange} from "@/store/modules/_mutations";

Vue.use(VueRouter);
export const IndexUrl = '/index';
export const ResultUrl = '/result';
export const EditUrl = '/edit';
export const TestUrl = '/test';

const routes = [
    {
        path: '',
        redirect: {name: 'home'}
    },
    {
        path: IndexUrl + '/about',
        name: 'about',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "group-index" */ '@/views/index/About.vue')
    },
    {
        path: IndexUrl,
        name: 'home',
        component: () => import(/* webpackChunkName: "group-index" */ '@/views/index/Home.vue'),
    },
    {
        path: IndexUrl + 'user-center',
        name: 'user-center',
        component: () => import(/* webpackChunkName: "group-index" */ '@/views/index/UserCenter.vue'),
    },
    {
        path: ResultUrl,
        name: "result",
        component: () => import('@/views/result/Result.vue'),
        children: [
            {
                path: 'graph/id=:id',
                name: 'graph',
                component: () => import(/* webpackChunkName: "group-result" */ '@/views/result/ResultDocGraph.vue'),
                props: true
            },
            {
                path: 'graph/edit',
                name: 'graph-edit',
                beforeRouteEnter(to: Route, from: Route, next: Function) {
                    commitEditModeChange(true);
                    next()
                },
                component: () => import(/* webpackChunkName: "group-result" */ '@/views/result/ResultDocGraph.vue'),
            },
            {
                path: 'paper/id=:id',
                name: 'paper',
                component: () => import(/* webpackChunkName: "group-result" */ '@/views/result/ResultDocPaper.vue'),
                props: true
            },
            {
                path: 'paper/edit',
                name: 'paper-edit',
                component: () => import(/* webpackChunkName: "group-result" */ '@/views/result/ResultDocPaper.vue'),
                props: true
            }
        ]
    },

    {
        path: EditUrl + '/dataTable',
        name: 'dataTable',
        component: () => import(/* webpackChunkName: "group-result" */ '@/views/dataTable/DataTable.vue')
    },

    {
        path: TestUrl + '/markdown',
        name: 'test',
        component: () => import('@/views/test/TestMarkDown.vue')
    }
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});

export default router
