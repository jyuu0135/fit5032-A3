<template>
  <DataTable title="Services" :columns="cols" :rows="rows" :pageLength="10" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DataTable from './DataTable.vue'

const cols = [
  { title: 'SID', data: 'sid' },
  { title: 'Title', data: 'title' },
  { title: 'Category', data: 'category' },
  { title: 'City', data: 'city' },
]

const rows = ref([])

onMounted(async () => {
  const data = await import('@/mock/services.json')
  rows.value = data.default
})
</script>
