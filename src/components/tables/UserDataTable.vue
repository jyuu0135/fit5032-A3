<template>
  <section aria-labelledby="users-table-title" class="mb-3">
    <div class="mb-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
      <ExportPanel
        defaultName="users"
        :columns="cols"
        :allRows="rows"
        :filteredRows="exportRows"
        aria-label="Export users data"
      />
    </div>

    <!-- 對 DataTable 提供一段可讀描述（若 DataTable 本身不是 <table>），幫助理解 -->
    <p class="visually-hidden" id="users-table-desc">
      Interactive users table with sorting, column search and pagination of 10 rows per page.
    </p>

    <!-- 若你的 DataTable 支援傳 ariaLabel/ariaDescribedby props，請一併傳遞；否則這段也無礙 -->
    <DataTable
      ref="tableRef"
      :title="'Users'"
      :columns="cols"
      :rows="rows"
      :pageLength="10"
      :ariaLabel="'Users table'"
      :ariaDescribedby="'users-table-desc'"
    />
  </section>
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
