import { createRouter, createWebHistory } from 'vue-router'
import WeatherHomeView from '../views/WeatherHomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'WeatherHome',
      component: WeatherHomeView,
    },
    {
      path: '/weather/:cityId',
      name: 'WeatherDetail',
      // route level code-splitting
      component: () => import('../views/WeatherDetailView.vue'),
    },
    {
      path: '/map',
      name: 'WeatherMap',
      component: () => import('../views/WeatherMapView.vue'),
    },
    {
      path: '/about',
      name: 'WeatherAbout',
      component: () => import('../views/WeatherAboutView.vue'),
    },
    {
      path: '/checklist/:cityId',
      name: 'Checklist',
      component: () => import('../views/ChecklistView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

export default router
