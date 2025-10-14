<template>
  <section class="mb-4">
    <h3 class="h5 mb-2">{{ title }}</h3>

    <div class="mb-2">
      <input
        ref="globalSearchEl"
        type="search"
        class="form-control"
        :placeholder="`Search in all columns...`"
        aria-label="Global search"
      />
    </div>

    <table
      ref="tableEl"
      class="display"
      style="width: 100%"
      :aria-label="`${title} interactive data table`"
    >
      <caption class="visually-hidden">
        {{
          title
        }}
        interactive data table
      </caption>

      <thead>
        <tr>
          <th v-for="c in columns" :key="c.data">{{ c.title }}</th>
        </tr>
        <tr>
          <th v-for="c in columns" :key="c.data">
            <input class="form-control form-control-sm" :placeholder="`Search ${c.title}`" />
          </th>
        </tr>
      </thead>

      <tbody></tbody>
    </table>
  </section>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import DataTable from 'datatables.net'

/**
 * props:
 * - title: Title for table
 * - columns: DataTables definition for column [{ title:'Name', data:'name' }, ...]
 * - rows:    Array document [{ name:'Alice', ... }, ...]
 * - pageLength: Number of lines for each pages（Default: 10）
 */
const props = defineProps({
  title: { type: String, required: true },
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
  pageLength: { type: Number, default: 10 },
})

const tableEl = ref(null)
const dt = ref(null)
const globalSearchEl = ref(null)

const initTable = () => {
  if (!tableEl.value) return

  // Initialize DataTable
  dt.value = new DataTable(tableEl.value, {
    data: props.rows,
    columns: props.columns,
    pageLength: props.pageLength,
    lengthChange: false,
    ordering: true,
    searching: true,
    info: true,
    paging: true,
    orderCellsTop: true,
    dom: 'lrtip',
    headerCallback: function (thead) {
      const ths = thead.querySelectorAll('tr:first-child th')
      ths.forEach((th) => th.setAttribute('scope', 'col'))
    },
  })

  // Column searching
  const header = tableEl.value.querySelectorAll('thead tr')[1]
  if (header) {
    const inputs = header.querySelectorAll('input')
    dt.value.columns().every(function (idx) {
      const column = this
      const input = inputs[idx]
      if (!input) return
      input.addEventListener('keyup', () => {
        column.search(input.value).draw()
      })
    })
  }

  // Enter block for global searching
  if (globalSearchEl.value) {
    globalSearchEl.value.addEventListener('keyup', () => {
      dt.value.search(globalSearchEl.value.value).draw()
    })
  }
}

// Support rows changed
watch(
  () => props.rows,
  (newRows) => {
    if (!dt.value) return
    dt.value.clear()
    dt.value.rows.add(newRows)
    dt.value.draw()
  },
)

onMounted(() => initTable())

onBeforeUnmount(() => {
  if (dt.value) {
    dt.value.destroy()
    dt.value = null
  }
})
</script>

<style scoped>
.visually-hidden {
  position: absolute !important;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  border: 0;
}
</style>
