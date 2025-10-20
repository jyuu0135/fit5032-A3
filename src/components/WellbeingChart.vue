<template>
  <section class="p-4">
    <h2 class="h5 mb-3">My Wellbeing Tracker</h2>

    <!-- ========= Mood inputing area ========= -->
    <div class="card p-3 mb-4 shadow-sm">
      <h5 class="mb-2">How do you feel today?</h5>

      <div class="mb-3">
        <label class="form-label">Mood (1 = bad, 5 = great)</label>
        <input type="range" min="1" max="5" v-model.number="mood" class="form-range" />
        <div class="d-flex justify-content-between">
          <small>😢</small>
          <strong>{{ mood }}</strong>
          <small>😁</small>
        </div>
      </div>

      <div class="mb-3">
        <textarea
          v-model.trim="note"
          rows="2"
          class="form-control"
          placeholder="Write something about your mood (optional)"
        ></textarea>
      </div>

      <div class="d-flex gap-2 align-items-center">
        <button class="btn btn-primary" :disabled="submitting" @click="submitMood">
          {{ submitting ? 'Saving...' : 'Save mood' }}
        </button>
        <p v-if="msg" class="m-0" :class="ok ? 'text-success' : 'text-danger'">{{ msg }}</p>
      </div>
    </div>

    <!-- ========= Chart area ========= -->
    <div class="card p-3 mb-4">
      <div class="d-flex gap-2 align-items-end flex-wrap mb-3">
        <div>
          <label class="form-label">Range</label>
          <select v-model="rangeDays" class="form-select form-select-sm" @change="reload">
            <option :value="7">Last 7 days</option>
            <option :value="30">Last 30 days</option>
            <option :value="90">Last 90 days</option>
          </select>
        </div>
        <button class="btn btn-outline-primary btn-sm" @click="reload">Refresh</button>
        <span class="text-muted ms-2">Live: {{ isLive ? 'on' : 'off' }}</span>
      </div>

      <div style="min-height: 350px">
        <Line :data="chartData" :options="chartOptions" />
      </div>
      <p class="text-muted mt-2" style="font-size: 0.9rem">
        * Each point shows the average mood per day (1–5).
      </p>
    </div>

    <!-- ========= History area ========= -->
    <div class="card p-3">
      <h5 class="mb-3">🕒 My Mood History</h5>
      <div v-if="loading" class="text-muted">Loading...</div>

      <div v-else-if="records.length === 0" class="alert alert-info">
        You haven't logged any moods yet.
      </div>

      <div v-else>
        <table class="table table-sm table-hover align-middle">
          <thead>
            <tr>
              <th>Date</th>
              <th>Mood</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in records" :key="i">
              <td>{{ formatDate(r.ts) }}</td>
              <td>
                <span :class="moodBadge(r.mood)"> {{ r.mood }} {{ moodEmoji(r.mood) }} </span>
              </td>
              <td>{{ r.note || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { db, auth } from '@/firebase/init'
import { onAuthStateChanged } from 'firebase/auth'
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)

/* ---------- 心情輸入 ---------- */
const mood = ref(3)
const note = ref('')
const submitting = ref(false)
const msg = ref('')
const ok = ref(false)

async function submitMood() {
  try {
    submitting.value = true
    msg.value = ''
    ok.value = false

    if (!uid.value) throw new Error('Please sign in first.')

    await addDoc(collection(db, 'moodLogs'), {
      userId: uid.value,
      ts: new Date(),
      mood: Number(mood.value),
      note: note.value || null,
      createdAt: serverTimestamp(),
    })
    ok.value = true
    msg.value = 'Mood saved!'
    note.value = ''
  } catch (e) {
    ok.value = false
    msg.value = e.message || 'Failed to save.'
  } finally {
    submitting.value = false
  }
}

/* ---------- 圖表 ---------- */
const rangeDays = ref(30)
const isLive = ref(false)
let unsubChart = null

const chartData = ref({
  labels: [],
  datasets: [
    {
      label: 'Avg Mood',
      data: [],
      tension: 0.3,
      fill: false,
      borderColor: '#3b82f6',
      pointBackgroundColor: '#3b82f6',
    },
  ],
})
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: { y: { min: 1, max: 5, ticks: { stepSize: 1 } } },
  plugins: { legend: { display: true } },
}

function aggregateDaily(docs) {
  const bucket = new Map()
  for (const d of docs) {
    const ts = d.ts?.toDate?.() ?? d.ts
    if (!ts) continue
    const key = format(ts, 'yyyy-MM-dd')
    const arr = bucket.get(key) || []
    arr.push(Number(d.mood) || 0)
    bucket.set(key, arr)
  }
  const labels = Array.from(bucket.keys()).sort()
  const data = labels.map((k) => {
    const arr = bucket.get(k)
    return +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)
  })
  return { labels, data }
}

function reload() {
  if (!uid.value) return
  if (unsubChart) {
    unsubChart()
    unsubChart = null
  }

  const end = endOfDay(new Date())
  const start = startOfDay(subDays(end, rangeDays.value - 1))

  const q = query(
    collection(db, 'moodLogs'),
    where('userId', '==', uid.value),
    where('ts', '>=', Timestamp.fromDate(start)),
    where('ts', '<=', Timestamp.fromDate(end)),
    orderBy('ts', 'asc'),
  )

  unsubChart = onSnapshot(
    q,
    (snap) => {
      isLive.value = true
      const rows = snap.docs.map((d) => d.data())
      const { labels, data } = aggregateDaily(rows)
      chartData.value = {
        labels,
        datasets: [
          {
            label: 'Avg Mood',
            data,
            tension: 0.3,
            borderColor: '#3b82f6',
            pointBackgroundColor: '#3b82f6',
          },
        ],
      }
    },
    () => {
      isLive.value = false
    },
  )
}

/* ---------- 歷史紀錄 ---------- */
const records = ref([])
const loading = ref(true)
let unsubHistory = null

function startHistoryListener() {
  if (!uid.value) return
  if (unsubHistory) {
    unsubHistory()
    unsubHistory = null
  }

  const q = query(
    collection(db, 'moodLogs'),
    where('userId', '==', uid.value),
    orderBy('ts', 'desc'),
  )
  unsubHistory = onSnapshot(q, (snap) => {
    records.value = snap.docs.map((d) => d.data())
    loading.value = false
  })
}

/* ---------- Auth 就緒後再掛監聽 ---------- */
const uid = ref(null)
let unsubAuth = null

onMounted(() => {
  loading.value = true
  unsubAuth = onAuthStateChanged(auth, (user) => {
    uid.value = user?.uid || null

    // 先停掉舊監聽
    if (unsubChart) {
      unsubChart()
      unsubChart = null
    }
    if (unsubHistory) {
      unsubHistory()
      unsubHistory = null
    }

    if (uid.value) {
      // 使用者已登入 → 掛上兩個監聽
      reload()
      startHistoryListener()
    } else {
      // 未登入 → 不顯示資料
      isLive.value = false
      loading.value = false
      records.value = []
      chartData.value = { labels: [], datasets: chartData.value.datasets }
    }
  })
})

onBeforeUnmount(() => {
  if (unsubAuth) unsubAuth()
  if (unsubChart) unsubChart()
  if (unsubHistory) unsubHistory()
})

/* ---------- 小工具 ---------- */
function formatDate(ts) {
  if (!ts) return '-'
  const d = ts.toDate ? ts.toDate() : ts
  return new Date(d).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' })
}
function moodEmoji(mood) {
  const map = { 1: '😢', 2: '🙁', 3: '😐', 4: '🙂', 5: '😁' }
  return map[mood] || ''
}
function moodBadge(mood) {
  const base = 'badge rounded-pill px-3 py-2'
  if (mood <= 2) return base + ' bg-danger-subtle text-danger'
  if (mood === 3) return base + ' bg-warning-subtle text-dark'
  return base + ' bg-success-subtle text-success'
}
</script>

<style scoped>
.card {
  border-radius: 10px;
}
.table {
  font-size: 0.9rem;
}
.badge {
  font-size: 0.9rem;
}
</style>
