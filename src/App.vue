<script setup>
import { ref } from 'vue'
import Resources from './components/Resources.vue'
import Recommend from './components/Recommend.vue'

import { useAuthStore } from './stores/auth.js'
import AuthPanel from './components/AuthPanel.vue'

const tab = ref('resources')

const auth = useAuthStore()
auth.loadSession()

const showAuth = ref(false)
const authMode = ref('login') // 'login' | 'register'

const openLogin = () => {
  authMode.value = 'login'
  showAuth.value = true
}
const openRegister = () => {
  authMode.value = 'register'
  showAuth.value = true
}
const closeAuth = () => {
  showAuth.value = false
}
</script>

<template>
  <div>
    <nav class="navbar navbar-expand-lg border-bottom mb-3">
      <div class="container">
        <a class="navbar-brand" href="#"> Youth Mental Health and Wellbeing</a>

        <div class="ms-auto">
          <button class="btn btn-outline-primary me-2" @click="tab = 'resources'">Resources</button>
          <button class="btn btn-outline-primary" @click="tab = 'recommend'">Recommend</button>

          <template v-if="!auth.isAuthenticated">
            <button class="btn btn-primary ms-2 me-2" @click="openLogin">Login</button>
            <button class="btn btn-secondary" @click="openRegister">Register</button>
          </template>
          <template v-else>
            <span class="text-muted small"> {{ auth.user.username }} ({{ auth.role }})</span>
            <button class="btn btn-outline-danger btn-sm" @click="auth.logout()">Logout</button>
          </template>
        </div>
      </div>
    </nav>

    <main class="container py-2">
      <Resources v-if="tab === 'resources'" />
      <Recommend v-if="tab === 'recommend'" />
    </main>

    <AuthPanel :show="showAuth" :mode="authMode" @close="closeAuth" />
  </div>
</template>

<style>
.navbar-brand {
  font-size: 1.75rem;
  font-weight: bold;
}
</style>
