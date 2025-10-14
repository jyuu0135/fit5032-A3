<script setup>
import { computed, toRaw, ref } from 'vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const props = defineProps({
  defaultName: { type: String, required: true },
  columns: { type: Array, required: true },
  allRows: { type: [Array, Object], required: true },
  filteredRows: { type: [Array, Object], required: true },
})

const filename = ref('')

const scope = ref('filtered') // 'filtered' | 'all'

const rowsAll = computed(() =>
  Array.isArray(props.allRows) ? props.allRows : (props.allRows?.value ?? []),
)
const rowsFiltered = computed(() =>
  Array.isArray(props.filteredRows) ? props.filteredRows : (props.filteredRows?.value ?? []),
)
const selectedRows = computed(() => (scope.value === 'all' ? rowsAll.value : rowsFiltered.value))

function toCSV(cols, rows) {
  const header = cols.map((c) => c.title)
  const lines = [header]
  for (const row of rows) {
    const raw = toRaw(row)
    const line = cols.map((c) => {
      let v = raw?.[c.data]
      if (v === null || v === undefined) v = ''
      v = String(v)
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

function exportPDF() {
  const name = (filename.value?.trim() || props.defaultName) + '.pdf'
  const doc = new jsPDF({ orientation: 'landscape' })
  const head = [props.columns.map((c) => c.title)]
  const body = selectedRows.value.map((row) =>
    props.columns.map((c) => String(row?.[c.data] ?? '')),
  )
  autoTable(doc, { head, body, styles: { fontSize: 9 } })
  doc.save(name)
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

    <div class="btn-group">
      <button class="btn btn-sm btn-outline-primary" @click="exportCSV">Export CSV</button>
      <button class="btn btn-sm btn-outline-primary" @click="exportPDF">Export PDF</button>
    </div>
  </div>
</template>
