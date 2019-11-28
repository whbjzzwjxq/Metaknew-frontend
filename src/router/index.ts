import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter);
export const IndexUrl = '/index';
export const ResultUrl = '/result';
export const EditUrl = '/edit';

const routes = [
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: IndexUrl + '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "group-index" */ '@/views/index/Login.vue')
  }
  // {
  //   path: IndexUrl + '/register',
  //   name: 'register',
  //   component: () => import(/* webpackChunkName: "group-index" */ './index/Register.vue')
  // },
  //
  // {
  //   path: ResultUrl,
  //   name: "result",
  //   component: () => import('./result/result.vue'),
  //   children: [
  //     {
  //       path: 'graph/id=:id/mode=:mode',
  //       name: 'graph',
  //       component: () => import(/* webpackChunkName: "group-result" */ './result/resultDocGraph.vue'),
  //       props: true
  //     },
  //     {
  //       path: 'paper',
  //       name: 'paper',
  //       component: () => import(/* webpackChunkName: "group-result" */ './result/resultDocPaper.vue')
  //     },
  //     {
  //       path: 'edit',
  //       name: 'edit',
  //       component: () => import(/* webpackChunkName: "group-result" */ './result/resultDocGraphEdit.vue'),
  //       props: true
  //     }
  //   ]
  // },
  //
  // {
  //   path: EditUrl + '/dataTable',
  //   name: 'dataTable',
  //   component: () => import(/* webpackChunkName: "group-result" */ './edit/dataTable.vue')
  // }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router
