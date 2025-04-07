import { createRouter, createWebHistory } from 'vue-router'
import AttendancePage from '@/views/AttendancePage.vue'

const routes = [
  {
    path: '/',
    name: 'attendance',
    component: AttendancePage
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
