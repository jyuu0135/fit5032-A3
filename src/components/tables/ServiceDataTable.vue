<template>
  <div class="mb-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
    <h3 class="h5 m-0">Services</h3>

    <ExportPanel
      defaultName="services"
      :columns="cols"
      :allRows="rows"
      :filteredRows="exportRows"
    />
  </div>

  <DataTable ref="tableRef" :title="'Services'" :columns="cols" :rows="rows" :pageLength="10" />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import DataTable from './DataTable.vue'
import ExportPanel from './ExportPanel.vue'

const cols = [
  { title: 'SID', data: 'sid' },
  { title: 'Title', data: 'title' },
  { title: 'Category', data: 'category' },
  { title: 'City', data: 'city' },
]

const rows = ref([])
const tableRef = ref(null)

const exportRows = computed(() => tableRef.value?.getFilteredRows() ?? rows.value)

onMounted(async () => {
  const data = await import('@/mock/services.json')
  rows.value = data.default
})
</script>
