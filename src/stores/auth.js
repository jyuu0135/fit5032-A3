import { defineStore } from 'pinia'
import { auth, db } from '@/firebase/init'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null, // { uid, email, role }
    token: null, // Firebase idToken
    _unsub: null, // auth state listener
  }),
  getters: {
    isAuthenticated: (s) => !!s.user,
    role: (s) => s.user?.role || 'user',
  },
  actions: {
    loadSession() {
      if (this._unsub) return

      this._unsub = onAuthStateChanged(auth, async (u) => {
        if (u) {
          try {
            const idToken = await u.getIdTokenResult(true)
            let role = 'user'

            if (idToken.claims?.admin) {
              role = 'admin'
            } else {
              const rdoc = await getDoc(doc(db, 'user_roles', u.uid))
              if (rdoc.exists()) role = rdoc.data().role || 'user'
              else await setDoc(doc(db, 'user_roles', u.uid), { role })
            }

            this.user = { uid: u.uid, email: u.email, role }
            this.token = idToken.token
            this._saveSession()
          } catch (e) {
            this.user = { uid: u.uid, email: u.email, role: 'user' }
            this.token = null
            this._saveSession()
          }
        } else {
          this.user = null
          this.token = null
          localStorage.removeItem('session')
        }
      })
    },

    _saveSession() {
      localStorage.setItem(
        'session',
        JSON.stringify({
          user: this.user,
          token: this.token,
        }),
      )
    },

    //View username as email
    async register({ username, password, role = 'user' }) {
      const email = String(username || '').trim()
      if (!/.+@.+/.test(email)) throw new Error('Please enter a valid email address.')
      const hasUpper = /[A-Z]/.test(password)
      const hasLower = /[a-z]/.test(password)
      const hasNum = /\d/.test(password)
      const hasSpec = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
      if (email.length < 3) throw new Error('Email must be valid.')
      if (password.length < 8 || !hasUpper || !hasLower || !hasNum || !hasSpec) {
        throw new Error('Password must be 8+ chars incl. upper/lower/number/special.')
      }

      //Create account
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await setDoc(doc(db, 'user_roles', cred.user.uid), { role: role || 'user' })
    },

    async login({ username, password }) {
      const email = String(username || '').trim()
      if (!/.+@.+/.test(email)) throw new Error('Please enter a valid email address.')
      await signInWithEmailAndPassword(auth, email, password)
    },

    async logout() {
      await signOut(auth)
      this.user = null
      this.token = null
      localStorage.removeItem('session')
    },
  },
})
