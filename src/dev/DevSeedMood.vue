<template>
  <section class="p-4">
    <h3>Seed MoodLogs (dev)</h3>
    <button class="btn btn-primary" @click="seedMood(20)">Insert 20 rows</button>
    <p class="mt-2 text-muted">{{ msg }}</p>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { db, auth } from '@/firebase/init'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const msg = ref('')
async function seedMood(n = 12) {
  const uid = auth.currentUser?.uid || 'demo-user'
  msg.value = 'Seeding...'
  for (let i = 0; i < n; i++) {
    const daysAgo = Math.floor(Math.random() * 15)
    const ts = new Date()
    ts.setDate(ts.getDate() - daysAgo)
    ts.setHours(12, 0, 0, 0)
    await addDoc(collection(db, 'moodLogs'), {
      userId: uid,
      ts, // Firestore 會自動轉 Timestamp
      mood: 1 + Math.floor(Math.random() * 5),
      note: 'seed',
      createdAt: serverTimestamp(),
    })
  }
  msg.value = `Done. Inserted ${n} rows for user ${uid}.`
}
</script>
