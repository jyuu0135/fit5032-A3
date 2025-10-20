<script setup>
import { computed, toRaw, ref } from 'vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { sendReportEmail } from '@/services/emailService'

const props = defineProps({
  defaultName: { type: String, required: true },
  columns: { type: Array, required: true },
  allRows: { type: [Array, Object], required: true },
  filteredRows: { type: [Array, Object], required: true },
})

const filename = ref('')
const scope = ref('filtered') // 'filtered' | 'all'

const recipientsInput = ref('')
const emailSubject = ref('Report')
const sending = ref(false)
const statusMsg = ref('')

// ---- normalize rows from props (accept Array or Ref<Array>) ----
const rowsAll = computed(() =>
  Array.isArray(props.allRows) ? props.allRows : (props.allRows?.value ?? []),
)
const rowsFiltered = computed(() =>
  Array.isArray(props.filteredRows) ? props.filteredRows : (props.filteredRows?.value ?? []),
)
const selectedRows = computed(() => (scope.value === 'all' ? rowsAll.value : rowsFiltered.value))

// ---- helpers for columns / value extraction ----
const getColTitle = (c) => c.title ?? c.header ?? c.label ?? ''
const getColKey = (c) => c.data ?? c.field ?? c.key ?? ''

function getByDotPath(obj, path) {
  return (path || '').split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj)
}

function findKeyCaseInsensitive(obj, key) {
  if (!obj || !key) return undefined
  const target = String(key).toLowerCase()
  const matched = Object.keys(obj).find((k) => k.toLowerCase() === target)
  return matched
}

function getCellValue(row, col, idx) {
  const raw = toRaw(row)

  if (typeof col?.accessor === 'function') {
    try {
      const v = col.accessor(raw)
      return v == null ? '' : String(v)
    } catch {
      return ''
    }
  }

  if (Array.isArray(raw)) {
    const v = raw[idx]
    return v == null ? '' : String(v)
  }

  const key = getColKey(col)
  if (key) {
    const byPath = getByDotPath(raw, key)
    if (byPath != null) return String(byPath)

    if (!key.includes('.')) {
      const ci = findKeyCaseInsensitive(raw, key)
      if (ci) {
        const v = raw[ci]
        if (v != null) return String(v)
      }
    }
  }

  return ''
}

// ---- CSV ----
function toCSV(cols, rows) {
  const header = cols.map((c) => getColTitle(c))
  const lines = [header]
  for (const row of rows) {
    const line = cols.map((c, idx) => {
      let v = getCellValue(row, c, idx)
      if (/[",\n]/.test(v)) v = '"' + v.replace(/"/g, '""') + '"'
      return v
    })
    lines.push(line)
  }
  return lines.map((a) => a.join(',')).join('\n')
}

function downloadBlob(content, mime, name) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

function exportCSV() {
  const name = (filename.value?.trim() || props.defaultName) + '.csv'
  const csv = toCSV(props.columns, selectedRows.value)
  downloadBlob(csv, 'text/csv;charset=utf-8', name)
}

// ---- PDF ----
function buildPDFBase64() {
  const doc = new jsPDF({ orientation: 'landscape' })
  const head = [props.columns.map((c) => getColTitle(c))]
  const body = selectedRows.value.map((row) =>
    props.columns.map((c, idx) => getCellValue(row, c, idx)),
  )
  autoTable(doc, {
    head,
    body,
    styles: { fontSize: 9 },
    headStyles: { halign: 'left' },
    bodyStyles: { cellWidth: 'wrap' },
    theme: 'striped',
    tableWidth: 'auto',
  })
  return doc.output('datauristring').split(',')[1]
}

function exportPDF() {
  const name = (filename.value?.trim() || props.defaultName) + '.pdf'
  const doc = new jsPDF({ orientation: 'landscape' })

  const head = [props.columns.map((c) => getColTitle(c))]
  const body = selectedRows.value.map((row) =>
    props.columns.map((c, idx) => getCellValue(row, c, idx)),
  )

  autoTable(doc, {
    head,
    body,
    styles: { fontSize: 9 },
    headStyles: { halign: 'left' },
    bodyStyles: { cellWidth: 'wrap' },
    theme: 'striped',
    tableWidth: 'auto',
  })
  doc.save(name)
}

function strToBase64(str) {
  const withBom = '\ufeff' + str
  return btoa(unescape(encodeURIComponent(withBom)))
}

async function sendEmail() {
  try {
    sending.value = true
    statusMsg.value = ''

    const to = recipientsInput.value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    if (to.length === 0) throw new Error('請輸入至少一個收件者（逗號分隔）')

    const base = filename.value?.trim() || props.defaultName

    const rows = selectedRows.value
    const csv = toCSV(props.columns, rows)
    const csvB64 = strToBase64(csv)
    const pdfB64 = buildPDFBase64()

    await sendReportEmail({
      to,
      subject: emailSubject.value || base,
      html: `<p>Please find the attached report: <strong>${base}</strong>.</p>`,
      attachments: [
        { filename: `${base}.csv`, type: 'text/csv', content: csvB64 },
        { filename: `${base}.pdf`, type: 'application/pdf', content: pdfB64 },
      ],
    })

    statusMsg.value = `Email sent to ${to.length} recipient(s).`
  } catch (e) {
    statusMsg.value = e?.message ?? String(e)
    console.error(e)
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="d-flex flex-wrap gap-2 align-items-center">
    <div class="input-group" style="max-width: 320px">
      <span class="input-group-text">Filename</span>
      <input
        v-model.trim="filename"
        type="text"
        class="form-control"
        placeholder="Enter filename"
        aria-label="Export filename (without extension)"
      />
    </div>

    <div class="input-group" style="max-width: 440px">
      <span class="input-group-text">To</span>
      <input
        v-model.trim="recipientsInput"
        type="text"
        class="form-control"
        placeholder="a@x.com, b@y.com"
        aria-label="Recipients (comma-separated emails)"
      />
    </div>
    <div class="input-group" style="max-width: 360px">
      <span class="input-group-text">Subject</span>
      <input
        v-model.trim="emailSubject"
        type="text"
        class="form-control"
        placeholder="Report subject"
        aria-label="Email subject"
      />
    </div>
  </div>

  <div class="btn-group">
    <button class="btn btn-sm btn-outline-primary" @click="exportCSV">Export CSV</button>
    <button class="btn btn-sm btn-outline-primary" @click="exportPDF">Export PDF</button>
    <button class="btn btn-sm btn-primary ms-2" :disabled="sending" @click="sendEmail">
      {{ sending ? 'Sending…' : 'Send Email (CSV + PDF)' }}
    </button>
  </div>
</template>
