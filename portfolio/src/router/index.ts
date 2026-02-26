import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
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
