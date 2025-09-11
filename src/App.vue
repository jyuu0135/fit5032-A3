<script setup>
import { useAuthStore } from './stores/auth'
import AuthPanel from './components/AuthPanel.vue'
import { ref } from 'vue'

const auth = useAuthStore()
auth.loadSession()

const showAuth = ref(false)
const authMode = ref('login')
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
    <nav class="navbar navbar-expand-lg bg-light border-bottom mb-3">
      <div class="container">
        <router-link class="navbar-brand" to="/">Youth Mental Health and Wellbeing</router-link>

        <div class="ms-auto d-flex align-items-center gap-2">
          <router-link class="btn btn-outline-primary" to="/resources"> Resources </router-link>

          <router-link class="btn btn-outline-primary" to="/recommend"> Recommend </router-link>

          <template v-if="!auth.isAuthenticated">
            <button class="btn btn-primary ms-2" @click="openLogin">Login</button>
            <button class="btn btn-secondary" @click="openRegister">Register</button>
          </template>
          <template v-else>
            <span class="text-muted small">Hi, {{ auth.user.username }} ({{ auth.role }})</span>
            <button class="btn btn-outline-danger btn-sm" @click="auth.logout()">Logout</button>
          </template>
        </div>
      </div>
    </nav>

    <main class="container py-2">
      <router-view />
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
