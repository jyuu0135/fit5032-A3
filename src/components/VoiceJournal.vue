<template>
  <section class="p-4" style="max-width: 720px; margin: auto">
    <header style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px">
      <h2 style="margin: 0; font-size: 18px">Voice Journal</h2>
      <span
        v-if="!supported"
        class="badge"
        style="background: #ffe69c; color: #7a5b00; border: 1px solid #ffc107"
      >
        Speech recognition not supported (try Chrome/Edge)
      </span>
      <small v-if="lastSavedAt" class="text-muted">Last saved: {{ lastSavedAt }}</small>
    </header>

    <!-- Language & Controls -->
    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px">
      <label style="display: flex; align-items: center; gap: 6px">
        Language:
        <select v-model="lang" class="form-select" style="min-width: 200px">
          <option value="en-AU">English (Australia)</option>
          <option value="en-US">English (US)</option>
          <option value="zh-TW">Chinese (Taiwan)</option>
          <option value="zh-CN">Chinese (Simplified)</option>
          <option value="ja-JP">Japanese</option>
        </select>
      </label>

      <button
        class="btn"
        :class="isListening ? 'btn-danger' : 'btn-primary'"
        @click="toggle()"
        :disabled="!supported"
      >
        {{ isListening ? 'Stop' : 'Start' }}
      </button>

      <button class="btn btn-outline-secondary" @click="downloadTxt">Download .txt</button>
      <button class="btn btn-outline-danger" @click="clearAll">Clear</button>
      <button class="btn btn-outline-success" @click="manualSave">Save</button>
    </div>

    <!-- Live hint/status -->
    <p class="text-muted" aria-live="polite" style="min-height: 1.5em">
      {{ hint }}
    </p>

    <!-- Transcript (auto-save) -->
    <textarea
      v-model="text"
      rows="10"
      class="form-control"
      placeholder="Click Start and speak; text will appear here. You can also type manually."
      @input="onInput"
      style="width: 100%; border-radius: 8px; padding: 10px"
      aria-label="Voice journal transcript"
    ></textarea>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{ storageKey?: string }>()
const KEY = props.storageKey ?? 'voice_journal_v1'

const supported = typeof window !== 'undefined' && 'webkitSpeechRecognition' in window
const text = ref<string>('')
const hint = ref<string>('')
const isListening = ref<boolean>(false)
const lastSavedAt = ref<string>('')
const lang = ref<string>('en-AU')

let rec: any | null = null

// ---- LocalStorage ----
function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw != null) text.value = raw
  } catch {}
}
function save(val: string) {
  try {
    localStorage.setItem(KEY, val)
    lastSavedAt.value = new Date().toLocaleString()
    hint.value = 'Saved'
    setTimeout(() => (hint.value = ''), 1200)
  } catch {}
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
  a.download = 'voice-journal.txt'
  a.click()
  URL.revokeObjectURL(url)
}

// ---- Speech Recognition ----
function initRecognition() {
  if (!supported) return
  // @ts-ignore
  const SR = window.webkitSpeechRecognition
  rec = new SR()
  rec.continuous = true
  rec.interimResults = true
  rec.lang = lang.value

  rec.onstart = () => {
    isListening.value = true
    hint.value = 'Listening… speak naturally.'
  }
  rec.onerror = (e: any) => {
    hint.value = `Recognition error: ${e?.error ?? 'unknown'}`
  }
  rec.onend = () => {
    isListening.value = false
    hint.value = 'Recognition stopped'
  }
  rec.onresult = (ev: any) => {
    let interim = ''
    for (let i = ev.resultIndex; i < ev.results.length; i++) {
      const res = ev.results[i]
      if (res.isFinal) {
        text.value +=
          (text.value.endsWith('\n') || text.value === '' ? '' : ' ') + res[0].transcript.trim()
        text.value += '\n'
        save(text.value)
      } else {
        interim += res[0].transcript
      }
    }
    if (interim) {
      hint.value = `Interim: ${interim}`
    } else {
      hint.value = ''
    }
  }
}

function start() {
  if (!supported) return
  try {
    if (!rec) initRecognition()
    if (rec) {
      rec.lang = lang.value
      rec.start()
    }
  } catch (e) {
    hint.value = 'Unable to start. Check browser permissions/support.'
  }
}

function stop() {
  try {
    rec?.stop()
  } catch {}
}

function toggle() {
  isListening.value ? stop() : start()
}

onMounted(() => {
  load()
  if (supported) initRecognition()
})
onBeforeUnmount(() => {
  if (isListening.value) stop()
})

watch(lang, (v) => {
  if (rec) rec.lang = v
})
</script>

<style scoped>
.form-control {
  border: 1px solid #dadada;
}
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
.btn-danger {
  background: #dc3545;
  color: #fff;
  border: 1px solid #dc3545;
}
.btn-outline-secondary {
  background: transparent;
  color: #6c757d;
  border: 1px solid #6c757d;
}
.btn-outline-danger {
  background: transparent;
  color: #dc3545;
  border: 1px solid #dc3545;
}
.btn-outline-success {
  background: transparent;
  color: #198754;
  border: 1px solid #198754;
}
.badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
}
.text-muted {
  color: #6c757d;
}
</style>
