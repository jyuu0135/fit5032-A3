<script setup>
import { ref, computed } from 'vue'

const resources = ref([
    {id: 1, title: 'title 1', tags: ['tag1', 'tag2']},
    {id: 2, title: 'title 2', tags: ['tag3', 'tag4']},
    {id: 3, title: 'title 3', tags: ['tag1', 'tag5']},
])

const q = ref('')
const filtered = computed(() => {
    const s = q.value.trim().toLowerCase()
    if (!s) return resources.value
    return resources.value.filter(x =>
        x.title.toLowerCase().includes(s) ||
        x.tags.join(' ').toLowerCase().include(s)
    )
})
</script>

<template>
  <section>
    <h2 class="h4 mb-3">Resources</h2>

    <div class="row mb-3">
      <div class="col-12 col-md-6">
        <input v-model="q" type="text" class="form-control" placeholder="Search title or tag…" />
      </div>
    </div>

    <p v-if="filtered.length===0" class="text-muted fst-italic">No results.</p>

    <div class="row g-3">
      <div v-for="x in filtered" :key="x.id" class="col-12 col-sm-6 col-lg-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">{{ x.title }}</h5>
            <p class="card-text"><small class="text-muted">Tags: {{ x.tags.join(', ') }}</small></p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>