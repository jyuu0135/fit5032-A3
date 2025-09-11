import { defineStore } from 'pinia'

/**
 * LocalStorage 結構：
 * ratings = {
 *   [resourceId]: {
 *     byUser: { [userId]: number }  // 1..5
 *   },
 *   ...
 * }
 */
export const useRatingsStore = defineStore('ratings', {
  state: () => ({
    map: {},
  }),
  actions: {
    _load() {
      if (Object.keys(this.map).length) return
      const raw = localStorage.getItem('ratings')
      this.map = raw ? JSON.parse(raw) : {}
    },
    _save() {
      localStorage.setItem('ratings', JSON.stringify(this.map))
    },
    getUserRating(resourceId, userId) {
      this._load()
      const v = this.map[resourceId]?.byUser?.[userId]
      return Number.isInteger(v) ? v : null
    },
    setUserRating(resourceId, userId, value) {
      this._load()
      if (!Number.isInteger(value) || value < 1 || value > 5) {
        throw new Error('Rating must be an integer between 1 and 5.')
      }
      if (!this.map[resourceId]) this.map[resourceId] = { byUser: {} }
      this.map[resourceId].byUser[userId] = value
      this._save()
    },
    getStats(resourceId) {
      this._load()
      const byUser = this.map[resourceId]?.byUser || {}
      const values = Object.values(byUser).filter(Number.isInteger)
      const count = values.length
      const sum = values.reduce((a, b) => a + b, 0)
      const avg = count ? +(sum / count).toFixed(1) : 0
      return { avg, count }
    },
  },
})
