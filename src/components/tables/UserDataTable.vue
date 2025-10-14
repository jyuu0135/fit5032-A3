<template>
  <div class="mb-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
    <h3 class="h5 m-0">Users</h3>
    <ExportPanel defaultName="users" :columns="cols" :allRows="rows" :filteredRows="exportRows" />
  </div>

  <DataTable ref="tableRef" :title="'Users'" :columns="cols" :rows="rows" :pageLength="10" />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import DataTable from './DataTable.vue'
import ExportPanel from './ExportPanel.vue'

// Column definition：title= Head words、data= Key for each row
const cols = [
  { title: 'ID', data: 'id' },
  { title: 'Name', data: 'name' },
  { title: 'Email', data: 'email' },
  { title: 'Role', data: 'role' },
]

const rows = ref([])
const tableRef = ref(null)

const exportRows = computed(() => tableRef.value?.getFilteredRows() ?? rows.value)

onMounted(async () => {
  // import JSON file（Vite allowed）
  const data = await import('@/mock/user.json')
  rows.value = data.default
})
</script>
