import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter);
const IndexUrl = '/index';
const ResultUrl = '/result';
const EditUrl = '/edit';
const TestUrl = '/test';
const PathUrl = '/path';

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
                            content: {}
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
                        }
                    }
                ]
            },
            {
                path: 'paper',
                name: 'paper',
                component: () => import(/* webpackChunkName: "group-result" */ '@/views/result/ResultDocPaper.vue'),
                children: [
                    {
                        path: 'id=:id/normal',
                        name: 'paper-normal',
                        components: {
                            content: () => import('@/components/paperComponents/PaperViewBox.vue'),
                            toolbarBottom: () => import('@/components/toolbar/ToolBarBottomPaperNormal.vue')
                        }
                    },
                    {
                        path: 'edit',
                        name: 'paper-edit',
                        components: {
                            content: () => import('@/components/paperComponents/PaperViewBox.vue'),
                            toolbarBottom: () => import('@/components/toolbar/ToolBarBottomPaperEdit.vue')
                        },
                        props: {
                            content: {
                                editMode: true,
                            },
                            toolbarBottom: {}
                        }
                    }
                ]
            },
            {
                path: 'path',
                name: 'path',
                component: () => import('@/views/result/ResultPath.vue')
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
