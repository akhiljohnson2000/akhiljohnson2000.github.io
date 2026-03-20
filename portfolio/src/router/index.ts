import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Home', component: () => import('@/views/HomeView.vue') },
    { path: '/about', name: 'About', component: () => import('@/views/About.vue') },
    { path: '/experience', name: 'Experience', component: () => import('@/views/Experience.vue') },
    { path: '/projects', name: 'Projects', component: () => import('@/views/Projects.vue') },
    { path: '/skills', name: 'Skills', component: () => import('@/views/Skills.vue') },
    { path: '/learn', name: 'Learn', component: () => import('@/views/LearnView.vue') },
  ],
})

export default router
