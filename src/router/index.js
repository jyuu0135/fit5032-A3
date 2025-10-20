import { createRouter, createWebHistory } from 'vue-router'

import Resources from '../components/Resources.vue'
import Recommend from '../components/Recommend.vue'
import Forbidden from '../views/ForbiddenView.vue'
import MapView from '../components/MapView.vue'
import BookingCalendar from '@/components/BookingCalendar.vue'
import WellbeingChart from '@/components/WellbeingChart.vue'
import DevSeedMood from '@/dev/DevSeedMood.vue'
import OfflineScratchpad from '@/components/OfflineScratchpad.vue'

const routes = [
  { path: '/', redirect: '/resources' },
  { path: '/resources', name: 'Resources', component: Resources },
  {
    path: '/recommend',
    name: 'Recommend',
    component: Recommend,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  { path: '/403', name: 'Forbidden', component: Forbidden },
  { path: '/geo', name: 'geo', component: MapView },
  { path: '/booking', name: 'Booking', component: BookingCalendar },
  { path: '/charts', name: 'Charts', component: WellbeingChart },
  { path: '/dev/seed', component: DevSeedMood },
  { path: '/offline', component: OfflineScratchpad },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

import { useAuthStore } from '../stores/auth'

router.beforeEach((to) => {
  const auth = useAuthStore()
  auth.loadSession?.()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { path: '/resources' }
  }

  if (to.meta.roles?.length && auth.isAuthenticated) {
    if (!to.meta.roles.includes(auth.role)) {
      return { path: '/403' }
    }
  }

  return true
})

router.afterEach(() => {
  requestAnimationFrame(() => {
    const main = document.getElementById('main')
    if (main) main.focus()
  })
})

export default router
