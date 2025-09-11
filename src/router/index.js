import { createRouter, createWebHistory } from 'vue-router'

import Resources from '../components/Resources.vue'
import Recommend from '../components/Recommend.vue'
import Forbidden from '../views/ForBiddenView.vue'

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

export default router
