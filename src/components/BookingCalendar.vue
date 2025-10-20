<template>
  <section style="padding: 16px">
    <h2 style="margin-bottom: 8px">Booking Calendar Mounted</h2>

    <FullCalendar
      :plugins="[dayGridPlugin]"
      :initial-view="'dayGridMonth'"
      :events="[{ title: 'Demo', start: new Date().toISOString() }]"
      :height="700"
    />

    <pre style="margin-top: 12px; background: #f8fafc; padding: 8px">{{ debug }}</pre>
  </section>
</template>

<script setup>
//import { ref } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
//import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
//import interactionPlugin from '@fullcalendar/interaction'
//import listPlugin from '@fullcalendar/list'

//const calendarRef = ref(null)

// ★ 定義 staticEvents（可以是陣列或 ref）
//const staticEvents = [{ title: 'Demo Event', start: new Date().toISOString() }]

//const debug = ref('mounted: ok')
//const onSelect = (info) => {
//debug.value = `select: ${info.start.toISOString()} ~ ${info.end.toISOString()}`
//console.log('select', info.start, info.end)
//}
</script>
