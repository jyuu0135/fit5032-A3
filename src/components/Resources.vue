<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRatingsStore } from '@/stores/ratings'
import RatingStars from '@/components/RatingStars.vue'
import { escapeHTML, safeURL } from '@/utils/sanitize'

import ServicesDataTable from '@/components/tables/ServiceDataTable.vue'
import UsersDataTable from '@/components/tables/UserDataTable.vue'

const auth = useAuthStore()
const ratings = useRatingsStore()
const tab = ref('cards')

const resources = ref([
  { id: 1, title: 'Depression problem', tags: ['depressed', 'melancholy'] },
  { id: 2, title: 'How to sleep better', tags: ['tired', 'asleep'] },
  { id: 3, title: 'Try a 5-minute relax', tags: ['tired', 'exhuasted'] },
])

const q = ref('')
const filtered = computed(() => {
  const s = q.value.trim().toLowerCase()
  if (!s) return resources.value
  return resources.value.filter(
    (x) => x.title.toLowerCase().includes(s) || x.tags.join(' ').toLowerCase().includes(s),
  )
})

const statsOf = (id) => ratings.getStats(String(id))
const myOf = (id) => (auth.isAuthenticated ? ratings.getUserRating(String(id), auth.user.id) : null)

const rate = (id, value) => {
  if (!auth.isAuthenticated) {
    alert('Please log in to rate.')
    return
  }
  const v = Number(value)
  if (!Number.isInteger(v) || v < 1 || v > 5) {
    alert('Rating must be an integer between 1 and 5.')
    return
  }
  ratings.setUserRating(String(id), auth.user.id, v)
}

const thumbUrl = (x) => {
  const u = safeURL(x.thumbnail)
  return u || null
}
</script>

<template>
  <section>
    <h2 class="h4 mb-3">Resources</h2>

    <!-- Switch page -->
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <button class="nav-link" :class="{ active: tab === 'cards' }" @click="tab = 'cards'">
          Cards
        </button>
      </li>
      <li class="nav-item">
        <button class="nav-link" :class="{ active: tab === 'users' }" @click="tab = 'users'">
          Table — Users
        </button>
      </li>
      <li class="nav-item">
        <button class="nav-link" :class="{ active: tab === 'services' }" @click="tab = 'services'">
          Table — Services
        </button>
      </li>
    </ul>

    <!-- Card format -->
    <template v-if="tab === 'cards'">
      <div class="row mb-3">
        <div class="col-12 col-md-6">
          <input
            v-model.trim="q"
            type="text"
            class="form-control"
            placeholder="Search title or tag…"
            aria-label="Global search for cards"
          />
        </div>
      </div>

      <p v-if="filtered.length === 0" class="text-muted fst-italic">No results.</p>

      <div class="row g-3">
        <div v-for="x in filtered" :key="x.id" class="col-12 col-sm-6 col-lg-4">
          <div class="card h-100">
            <img
              v-if="thumbUrl(x)"
              :src="thumbUrl(x)"
              :alt="`${x.title} thumbnail`"
              class="card-img-top"
              loading="lazy"
            />

            <div class="card-body">
              <h5 class="card-title" v-text="x.title" />
              <p v-if="x.description" class="card-text">{{ escapeHTML(x.description) }}</p>
              <p class="card-text">
                <small class="text-muted">Tags: {{ x.tags.join(', ') }}</small>
              </p>
            </div>

            <div class="card-footer bg-white border-0 pt-0 pb-3">
              <div class="mb-2">
                <a
                  v-if="safeURL(x.link)"
                  :href="safeURL(x.link)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-sm btn-outline-secondary"
                >
                  Open resource
                </a>
              </div>

              <div class="d-flex flex-column gap-1">
                <span class="small text-muted">Rating</span>
                <RatingStars
                  :model-value="myOf(x.id)"
                  :average="statsOf(x.id).avg"
                  :count="statsOf(x.id).count"
                  :readonly="!auth.isAuthenticated"
                  @rate="(v) => rate(x.id, v)"
                />
                <div v-if="!auth.isAuthenticated" class="form-text">Log in to rate.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Table：Users -->
    <UsersDataTable v-else-if="tab === 'users'" />

    <!-- Table：Services -->
    <ServicesDataTable v-else />
  </section>
</template>
