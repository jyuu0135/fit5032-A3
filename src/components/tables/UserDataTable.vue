<template>
  <DataTable title="Users" :columns="cols" :rows="rows" :pageLength="10" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DataTable from './DataTable.vue'

// Column definition：title= Head words、data= Key for each row
const cols = [
  { title: 'ID', data: 'id' },
  { title: 'Name', data: 'name' },
  { title: 'Email', data: 'email' },
  { title: 'Role', data: 'role' },
]

const rows = ref([])

onMounted(async () => {
  // import JSON file（Vite allowed）
  const data = await import('@/mock/user.json')
  rows.value = data.default
})
</script>
