import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Home', component: () => import('@/views/HomeView.vue') },
    { path: '/about', name: 'About', component: () => import('@/views/About.vue') },
    { path: '/experience', name: 'Experience', component: () => import('@/views/Experience.vue') },
    { path: '/projects', name: 'Projects', component: () => import('@/views/Projects.vue') },
    { path: '/skills', name: 'Skills', component: () => import('@/views/Skills.vue') },
    { path: '/services', name: 'Services', component: () => import('@/views/ServicesView.vue') },
    { path: '/learn', name: 'Learn', component: () => import('@/views/LearnIndexView.vue') },
    {
      path: '/learn/:slug',
      name: 'LearnModule',
      component: () => import('@/views/LearnModuleView.vue'),
    },
    { path: '/generate-cv', name: 'ResumeGenerator', component: () => import('@/views/GenerateCvView.vue') },
  ],
})

export default router
