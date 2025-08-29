<script setup>
import { ref } from 'vue'

const form = ref({ mood: '',mins: ''})
const errors = ref({})
const result = ref('')

function validate() {
    const e = {}
    if (!form.value.mood?.trim()) e.mood = 'Mood is required.'
    
    const m = Number(form.value.mins)
    if (!m || m < 1 || m > 180) e.mins = 'Minutes must be between 1 and 180.'
    errors.value = e
    return Object.keys(e).length === 0
}

function makeSuggestion(mood, mins) {
    const t = Number(mins)
    const m = (mood || '').toLowerCase()
    if (m.includes('depressed')) return 'Depression problem'
    if (m.includes('sleep') || t > 15) return 'How to sleep better'
    if (t > 0 && t < 5) return 'Try a 5-minute relaxing'
    return 'Take a break'
}
</script>

<template>
    <section>
        <h2 class="h4 mb-3">Recommendation</h2>

        <form @submit="onSubmit" class="row g-3" style="max-width: 640px">
            <div class="col-12">
                <label class="form-label">Mood *</label>
                <input v-model="form.mood" type="text" class="form-control" placeholder="e.g. anxious / tired" />
                <div v-if="errors.mood" class="text-danger small">{{ errors.mood }}</div>
            </div>

            <div class="col-12 col-md-6">
                <label class="form-label">Minutes (1-180) *</label>
                <input v-model="form.mins" type="number" min="1" max="180" class="form-control" />
                <div v-if="errors.mins" class="text-danger small">{{ errors.mins }}</div>
            </div>

            <div class="col-12">
                <button class="btn btn-primary">Get suggestion</button>
            </div>
        </form>

        <div v-if="result" class="alert alert-primary mt-3">
      <strong>Suggestion:</strong> {{ result }}
    </div>
  </section>
</template>