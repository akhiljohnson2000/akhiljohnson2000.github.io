import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Home', component: () => import('@/views/HomeView.vue') },
    {
      path: '/javascript-engine-visualizer',
      name: 'EngineVisualizer',
      component: () => import('@/views/EngineVisualizerView.vue'),
    },
  ],
})

export default router
