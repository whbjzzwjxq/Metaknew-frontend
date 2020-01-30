import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter);
export const IndexUrl = '/index';
export const ResultUrl = '/result';
export const EditUrl = '/edit';

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
        path: IndexUrl + '/login',
        name: 'login',
        component: () => import(/* webpackChunkName: "group-index" */ '@/views/index/Login.vue')
    },
    {
        path: IndexUrl + '/register',
        name: 'register',
        component: () => import(/* webpackChunkName: "group-index" */ '@/views/index/Register.vue')
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
                component: () => import(/* webpackChunkName: "group-result" */ '@/views/result/ResultDocGraph.vue'),
            },
            {
                path: 'paper/id=:id',
                name: 'paper',
                component: () => import(/* webpackChunkName: "group-result" */ '@/views/result/ResultDocPaper.vue'),
                props: true
            }
        ]
    },

    {
        path: EditUrl + '/dataTable',
        name: 'dataTable',
        component: () => import(/* webpackChunkName: "group-result" */ '@/views/dataTable/DataTable.vue')
    }
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});

export default router
