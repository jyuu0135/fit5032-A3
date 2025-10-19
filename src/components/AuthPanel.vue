<script setup>
import { reactive, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Modal } from 'bootstrap'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  mode: { type: String, default: 'login' }, // 'login' | 'register'
  show: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'switched'])

const auth = useAuthStore()
const current = ref(props.mode)
const error = ref('')
const form = reactive({ username: '', password: '', role: 'user' })
const roles = ['user', 'admin']

// Bootstrap Modal 實體綁定
const modalRoot = ref(null)
let modalInstance = null
let prevActiveEl = null

watch(
  () => props.mode,
  (v) => {
    current.value = v
  },
)

watch(
  () => props.show,
  (v) => {
    if (modalInstance) v ? modalInstance.show() : modalInstance.hide()
  },
  { immediate: true },
)

// A11y：開啟聚焦第一個欄位，關閉還原焦點
function onShown() {
  prevActiveEl = document.activeElement
  document.getElementById('auth-username')?.focus()
}
function onHidden() {
  prevActiveEl?.focus?.()
  emit('close')
}
function bindBootstrapEvents() {
  if (!modalRoot.value) return
  modalRoot.value.addEventListener('shown.bs.modal', onShown)
  modalRoot.value.addEventListener('hidden.bs.modal', onHidden)
}

onMounted(() => {
  if (!modalRoot.value) return
  modalInstance = new Modal(modalRoot.value, {
    backdrop: 'static',
    keyboard: true,
  })
  bindBootstrapEvents()
  if (props.show) modalInstance.show()
})

onBeforeUnmount(() => {
  try {
    modalInstance?.hide()
  } catch {}
  modalInstance = null
})

// 切換模式 / 送出
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
      await auth.login({ username: form.username.trim(), password: form.password })
    }
    emit('close')
  } catch (e) {
    error.value = e?.message || 'Action failed.'
  }
}
</script>

<template>
  <div
    ref="modalRoot"
    class="modal fade"
    id="authModal"
    tabindex="-1"
    role="dialog"
    aria-modal="true"
    aria-labelledby="authModalLabel"
    aria-describedby="authModalDesc"
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
          <p id="authModalDesc" class="visually-hidden">
            Use the form fields below to {{ current === 'login' ? 'log in' : 'create an account' }}.
            All fields are keyboard accessible.
          </p>

          <div v-if="error" class="alert alert-danger" role="alert" aria-live="assertive">
            {{ error }}
          </div>

          <div class="mb-3">
            <label class="form-label" for="auth-username">Username</label>
            <input
              id="auth-username"
              v-model.trim="form.username"
              class="form-control"
              autocomplete="username"
              @keyup.enter="submit"
              :aria-invalid="!!error || undefined"
              :aria-describedby="error ? 'auth-error' : undefined"
            />
          </div>

          <div class="mb-3">
            <label class="form-label" for="auth-password">Password</label>
            <input
              id="auth-password"
              v-model="form.password"
              type="password"
              class="form-control"
              :autocomplete="current === 'register' ? 'new-password' : 'current-password'"
              @keyup.enter="submit"
            />
          </div>

          <div v-if="current === 'register'" class="mb-3">
            <label class="form-label" for="auth-role">Role</label>
            <select id="auth-role" v-model="form.role" class="form-select">
              <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <div class="btn-group me-auto" role="group" aria-label="Switch auth mode">
            <button
              class="btn btn-sm"
              :class="current === 'login' ? 'btn-primary' : 'btn-outline-primary'"
              @click="switchMode('login')"
              type="button"
            >
              Login
            </button>
            <button
              class="btn btn-sm"
              :class="current === 'register' ? 'btn-primary' : 'btn-outline-primary'"
              @click="switchMode('register')"
              type="button"
            >
              Register
            </button>
          </div>

          <button class="btn btn-primary" type="button" @click="submit" id="auth-submit">
            {{ current === 'login' ? 'Login' : 'Create account' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
