import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/parent',
    name: 'Parent',
    component: () => import('../views/ParentView.vue'),
  },
  {
    path: '/conversation',
    name: 'Conversation',
    component: () => import('../views/ConversationView.vue'),
  },
  {
    path: '/conversation/builder',
    name: 'SentenceBuilder',
    component: () => import('../views/SentenceBuilderView.vue'),
  },
  {
    path: '/conversation/:category',
    name: 'ConversationCategory',
    component: () => import('../views/ConversationCategoryView.vue'),
    props: true,
  },
  {
    path: '/routines',
    name: 'Routines',
    component: () => import('../views/RoutinesView.vue'),
  },
  {
    path: '/writer',
    name: 'Writer',
    component: () => import('../views/WriterView.vue'),
  },
  {
    path: '/interactive',
    name: 'Interactive',
    component: () => import('../views/InteractiveView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
