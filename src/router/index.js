// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import Resources from '@/components/Resources.vue'
import Recommend from '@/components/Recommend.vue'
import Forbidden from '@/views/ForbiddenView.vue'

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

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!auth.token) auth.loadSession()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    alert('Please log in to continue.')
    return { path: '/resources' }
  }

  if (to.meta.roles?.length) {
    if (!to.meta.roles.includes(auth.role)) {
      return { path: '/403' }
    }
  }
})

export default router
