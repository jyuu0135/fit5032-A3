<script setup>
import { reactive, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as bootstrap from 'bootstrap'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  mode: { type: String, default: 'login' }, // 'login' | 'register'
  show: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'switched'])

const auth = useAuthStore()
const current = ref(props.mode)
const error = ref('')
//view username as email
const form = reactive({ username: '', password: '', role: 'user' })
const roles = ['user', 'admin']

let modalInstance = null
let modalEl = null

watch(
  () => props.mode,
  (v) => {
    current.value = v
  },
)

watch(
  () => props.show,
  (v) => {
    if (!modalInstance) return
    v ? modalInstance.show() : modalInstance.hide()
  },
  { immediate: true },
)

function bindBootstrapEvents() {
  if (!modalEl) return
  modalEl.addEventListener('hidden.bs.modal', () => emit('close'))
}

onMounted(() => {
  modalEl = document.getElementById('authModal')
  modalInstance = new bootstrap.Modal(modalEl, {
    backdrop: 'static',
    keyboard: true,
  })
  bindBootstrapEvents()
  if (props.show) modalInstance.show()
})

onBeforeUnmount(() => {
  if (modalInstance) {
    modalInstance.hide()
    modalInstance = null
  }
  modalEl = null
})

const switchMode = (m) => {
  current.value = m
  error.value = ''
  form.username = ''
  form.password = ''
  form.role = 'user'
  emit('switched', m)
}

const submit = async () => {
  error.value = ''
  try {
    if (current.value === 'login') {
      if (!form.username.trim() || !form.password)
        throw new Error('Please enter valid username and password.')
      await auth.login({ username: form.username, password: form.password })
    } else {
      await auth.register({
        username: form.username.trim(),
        password: form.password,
        role: form.role,
      })
      //log in after registering automatically
      await auth.login({ username: form.username.trim(), password: form.password })
    }
    emit('close')
  } catch (e) {
    error.value = e.message || 'Action failed.'
  }
}
</script>

<template>
  <div
    class="modal fade"
    id="authModal"
    tabindex="-1"
    aria-labelledby="authModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="authModalLabel">
            {{ current === 'login' ? 'Login' : 'Register' }}
          </h5>

          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>

        <div class="modal-body">
          <div v-if="error" class="alert alert-danger">{{ error }}</div>

          <div class="mb-3">
            <label class="form-label">Username</label>
            <input
              v-model.trim="form.username"
              class="form-control"
              autocomplete="username"
              @keyup.enter="submit"
            />
          </div>

          <div class="mb-3">
            <label class="form-label">Password</label>
            <input
              v-model="form.password"
              type="password"
              class="form-control"
              :autocomplete="current === 'register' ? 'new-password' : 'current-password'"
              @keyup.enter="submit"
            />
          </div>

          <div v-if="current === 'register'" class="mb-3">
            <label class="form-label">Role</label>
            <select v-model="form.role" class="form-select">
              <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <div class="btn-group me-auto">
            <button
              class="btn btn-sm"
              :class="current === 'login' ? 'btn-primary' : 'btn-outline-primary'"
              @click="switchMode('login')"
            >
              Login
            </button>
            <button
              class="btn btn-sm"
              :class="current === 'register' ? 'btn-primary' : 'btn-outline-primary'"
              @click="switchMode('register')"
            >
              Register
            </button>
          </div>

          <button class="btn btn-primary" @click="submit">
            {{ current === 'login' ? 'Login' : 'Create account' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
