<script setup>
import { useAuthStore } from './stores/auth'
import AuthPanel from './components/AuthPanel.vue'
import { ref, onMounted } from 'vue'

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

onMounted(() => {
  // 如需：可在這裡做首次載入的焦點管理
})
</script>

<template>
  <!-- Skip Link-->>
  <a class="skip-link" href="#main">Skip to main content</a>
  <header class="border-bottom">
    <nav class="navbar navbar-expand-lg bg-light" aria-label="Primary">
      <div class="container">
        <router-link class="navbar-brand" to="/">Youth Mental Health and Wellbeing</router-link>

        <ul class="navbar-nav ms-auto d-flex align-items-center gap-2">
          <li class="nav-item">
            <router-link
              class="btn btn-outline-primary"
              to="/resources"
              aria-label="Go to Resources page"
            >
              Resources
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              class="btn btn-outline-primary"
              to="/recommend"
              aria-label="Go to Recommend page"
            >
              Recommend
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="btn btn-outline-primary" to="/geo" aria-label="Go to Map page">
              Map
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              class="btn btn-outline-primary"
              to="/booking"
              aria-label="Go to Booking page"
            >
              Book
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="btn btn-outline-primary" to="/charts" aria-label="Go to chart page">
              Charts
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              class="btn btn-outline-primary"
              to="/offline"
              aria-label="Go to chart page"
            >
              Notebook
            </router-link>
          </li>

          <!-- Login/Logout 區 -->
          <li class="nav-item" v-if="!auth.isAuthenticated">
            <button
              class="btn btn-primary ms-2"
              type="button"
              @click="openLogin"
              aria-haspopup="dialog"
              aria-controls="auth-panel"
            >
              Login
            </button>
          </li>
          <li class="nav-item" v-if="!auth.isAuthenticated">
            <button
              class="btn btn-secondary"
              type="button"
              @click="openRegister"
              aria-haspopup="dialog"
              aria-controls="auth-panel"
            >
              Register
            </button>
          </li>

          <li class="nav-item d-flex align-items-center" v-else>
            <span class="text-muted small" aria-live="polite">
              Hi, {{ auth.user?.email }}
              <span v-if="auth.role">({{ auth.role }})</span>
            </span>
            <button
              class="btn btn-outline-danger btn-sm ms-2"
              type="button"
              @click="auth.logout()"
              aria-label="Log out"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  </header>
  <!--Main content-->
  <main id="main" tabindex="-1" class="container py-2">
    <div id="global-status" class="sr-only" aria-live="polite"></div>

    <router-view />
  </main>

  <footer class="mt-4 border-top py-3">
    <div class="container">
      <p class="mb-0">© 2025 Youth Mental Health & Wellbeing</p>
    </div>
  </footer>
  <!--login/Register dashboard-->
  <AuthPanel :show="showAuth" :mode="authMode" @close="closeAuth" id="auth-panel" />
</template>

<style>
:focus-visible {
  outline: 3px solid #0d6efd;
  outline-offset: 2px;
}

.skip-link {
  position: absolute;
  left: -9999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
.skip-link:focus {
  position: static;
  width: auto;
  height: auto;
  padding: 0.5rem 1rem;
  background: #fff;
  border: 2px solid #0d6efd;
  border-radius: 0.25rem;
  z-index: 1000;
}

.sr-only {
  position: absolute !important;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}

.navbar-brand {
  font-size: 1.75rem;
  font-weight: bold;
}
</style>
