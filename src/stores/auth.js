import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null, // { id, username, role }
    token: null,
  }),
  getters: {
    isAuthenticated: (s) => !!s.token,
    role: (s) => s.user?.role || 'user',
  },
  actions: {
    loadSession() {
      const s = JSON.parse(localStorage.getItem('session') || 'null')
      if (s) {
        this.user = s.user
        this.token = s.token
      }
    },
    _saveSession() {
      localStorage.setItem('session', JSON.stringify({ user: this.user, token: this.token }))
    },
    async register({ username, password, role = 'user' }) {
      username = String(username || '').trim()
      const hasUpper = /[A-Z]/.test(password)
      const hasLower = /[a-z]/.test(password)
      const hasNum = /\d/.test(password)
      const hasSpec = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
      if (username.trim().length < 3) throw new Error('Username must be at least 3 characters.')
      if (password.length < 8 || !hasUpper || !hasLower || !hasNum || !hasSpec) {
        throw new Error('Password must be 8+ chars and include upper/lower/number/special.')
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]')
      if (users.find((u) => u.username === username)) throw new Error('User already exists.')

      users.push({ id: Date.now(), username, password, role })
      localStorage.setItem('users', JSON.stringify(users))
    },
    async login({ username, password }) {
      username = String(username || '').trim()
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const u = users.find((u) => u.username === username && u.password === password)
      if (!u) throw new Error('Invalid username or password.')
      this.user = { id: u.id, username: u.username, role: u.role }
      this.token = 'demo-' + crypto.randomUUID()
      this._saveSession()
    },
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('session')
    },
  },
})
