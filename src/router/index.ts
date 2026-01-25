import { createRouter, createWebHistory } from 'vue-router'
import ClinicView from '../views/ClinicView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/my-clinic'
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/:slug',
      name: 'clinic',
      component: ClinicView,
      children: [
        {
          path: 'appointment',
          name: 'appointment',
          component: () => import('../views/AppointmentView.vue'),
          props: true
        }
      ]
    },
  ],
})

export default router
