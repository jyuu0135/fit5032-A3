<template>
  <section class="p-4" style="max-width: 720px; margin: auto">
    <div
      :style="{
        padding: '8px 12px',
        borderRadius: '8px',
        marginBottom: '12px',
        fontWeight: 600,
        background: online ? '#e8f5e9' : '#fff3cd',
        color: online ? '#1b5e20' : '#7a5b00',
        border: online ? '1px solid #c8e6c9' : '1px solid #ffe69c',
      }"
      aria-live="polite"
    >
      {{ online ? 'Online now：Input to save' : 'Offline now：Save locally' }}
    </div>

    <div class="mb-2" style="display: flex; align-items: center; gap: 8px">
      <h2 style="font-size: 18px; margin: 0">Offline Notebook</h2>
      <small class="text-muted" v-if="lastSavedAt"> Last storage：{{ lastSavedAt }} </small>
    </div>

    <textarea
      v-model="text"
      rows="10"
      class="form-control"
      :placeholder="placeholder"
      @input="onInput"
      style="width: 100%; border-radius: 8px; padding: 10px"
      aria-label="Enter content"
    ></textarea>

    <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap">
      <button @click="manualSave" class="btn btn-primary">Save</button>
      <button @click="clearAll" class="btn btn-outline-danger">Clear</button>
      <button @click="downloadTxt" class="btn btn-outline-secondary">Download .txt</button>
      <span class="text-muted" v-if="savedHint" style="align-self: center">{{ savedHint }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{
  storageKey?: string
  placeholder?: string
}>()

const KEY = props.storageKey ?? 'offline_scratchpad_v1'
const placeholder = props.placeholder ?? 'Write text offline'

const text = ref<string>('')
const online = ref<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true)
const savedHint = ref<string>('')
const lastSavedAt = ref<string>('')

const handleOnline = () => (online.value = true)
const handleOffline = () => (online.value = false)

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw != null) {
      text.value = raw
    }
  } catch (e) {
    console.error('load failed', e)
  }
}

function save(val: string) {
  try {
    localStorage.setItem(KEY, val)
    const ts = new Date()
    lastSavedAt.value = ts.toLocaleString()
    savedHint.value = 'Saved'
    setTimeout(() => (savedHint.value = ''), 1200)
  } catch (e) {
    console.error('save failed', e)
  }
}

let timer: number | undefined
function onInput() {
  if (timer) window.clearTimeout(timer)
  timer = window.setTimeout(() => save(text.value), 300)
}

function manualSave() {
  save(text.value)
}

function clearAll() {
  text.value = ''
  save('')
}

function downloadTxt() {
  const blob = new Blob([text.value ?? ''], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'scratchpad.txt'
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  load()
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

onBeforeUnmount(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})

watch(online, (val) => {
  if (val) {
    savedHint.value = 'Back online'
    setTimeout(() => (savedHint.value = ''), 1200)
  }
})
</script>

<style scoped>
.btn {
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
}
.btn-primary {
  background: #0d6efd;
  color: #fff;
  border: 1px solid #0d6efd;
}
.btn-outline-danger {
  background: transparent;
  color: #dc3545;
  border: 1px solid #dc3545;
}
.btn-outline-secondary {
  background: transparent;
  color: #6c757d;
  border: 1px solid #6c757d;
}
.text-muted {
  color: #6c757d;
}
.form-control {
  border: 1px solid #dadada;
}
</style>
