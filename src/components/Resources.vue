<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRatingsStore } from '@/stores/ratings'
import RatingStars from '@/components/RatingStars.vue'

const auth = useAuthStore()
const ratings = useRatingsStore()

const resources = ref([
  { id: 1, title: 'Depression problem', tags: ['depressed', 'melancholy'] },
  { id: 2, title: 'How to sleep better', tags: ['tired', 'asleep'] },
  { id: 3, title: 'Try a 5-minute relaxing', tags: ['tired', 'exhuasted'] },
])

const q = ref('')
const filtered = computed(() => {
  const s = q.value.trim().toLowerCase()
  if (!s) return resources.value
  return resources.value.filter(
    (x) => x.title.toLowerCase().includes(s) || x.tags.join(' ').toLowerCase().includes(s),
  )
})

const statsOf = (id) => ratings.getStats(id)
const myOf = (id) => (auth.isAuthenticated ? ratings.getUserRating(id, auth.user.id) : 0)

const rate = (id, value) => {
  if (!auth.isAuthenticated) {
    alert('Please log in to rate.')
    return
  }
  ratings.setUserRating(id, auth.user.id, value)
}
</script>

<template>
  <section>
    <h2 class="h4 mb-3">Resources</h2>

    <div class="row mb-3">
      <div class="col-12 col-md-6">
        <input v-model="q" type="text" class="form-control" placeholder="Search title or tag…" />
      </div>
    </div>

    <p v-if="filtered.length === 0" class="text-muted fst-italic">No results.</p>

    <div class="row g-3">
      <div v-for="x in filtered" :key="x.id" class="col-12 col-sm-6 col-lg-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">{{ x.title }}</h5>
            <p class="card-text">
              <small class="text-muted">Tags: {{ x.tags.join(', ') }}</small>
            </p>
          </div>
          <div class="card-footer bg-white border-0 pt-0 pb-3">
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
  </section>
</template>
