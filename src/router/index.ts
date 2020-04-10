import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter);
export const IndexUrl = '/index';
export const ResultUrl = '/result';
export const EditUrl = '/edit';
export const TestUrl = '/test';

const routes = [
    {
        path: '',
        redirect: {name: 'index'}
    },
    {
        path: IndexUrl + '/about',
        name: 'about',
        component: () => import(/* webpackChunkName: "group-index" */ '@/views/index/About.vue')
    },
    {
        path: IndexUrl,
        name: 'index',
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
                path: 'graph',
                name: 'graph',
                component: () => import(/* webpackChunkName: "result-graph" */ '@/views/result/ResultDocGraph.vue'),
                children: [
                    {
                        path: 'id=:id/normal',
                        name: 'graph-normal',
                        components: {
                            content: () => import(/* webpackChunkName: "result-graph" */ '@/components/graphComponents/GraphViewBox.vue'),
                            toolbarBottom: () => import(/* webpackChunkName: "result-graph" */ '@/components/toolbar/ToolbarBottomGraphNormal.vue')
                        },
                        props: {
                            content: {
                                renderMedia: true,
                                renderNotes: true,
                                renderSelector: true,
                                renderLabelSelector: true,
                                renderCard: true,
                                editMode: false,
                                dragAble: true
                            },
                            toolbarBottom: {}
                        },
                        alias: 'id=:id'
                    },
                    {
                        path: 'id=:id/timeline',
                        name: 'graph-timeline',
                        components: {
                            content: () => import(/* webpackChunkName: "result-graph" */ '@/components/graphComponents/GraphTimeline.vue'),
                            toolbarBottom: () => import(/* webpackChunkName: "result-graph" */ '@/components/toolbar/ToolbarBottomGraphNormal.vue')
                        },
                        props: {
                            content: {

                            }
                        }
                    },
                    {
                        path: 'edit',
                        name: 'graph-edit',
                        components: {
                            content: () => import(/* webpackChunkName: "result-graph" */ '@/components/graphComponents/GraphViewBox.vue'),
                            toolbarBottom: () => import(/* webpackChunkName: "result-graph" */ '@/components/toolbar/ToolbarBottomGraphEdit.vue')
                        },
                        props: {
                            content: {
                                renderMedia: true,
                                renderNotes: true,
                                renderSelector: true,
                                renderLabelSelector: true,
                                renderCard: true,
                                editMode: true,
                                dragAble: true
                            },
                            toolbarBottom: {}
                        },
                    }
                ]
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
