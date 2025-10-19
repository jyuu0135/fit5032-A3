<template>
  <div class="p-4">
    <h2 class="text-xl font-semibold mb-3">Explore Map</h2>
    <div ref="mapEl" class="map-container"></div>
  </div>
  <section class="mt-3" aria-labelledby="route-summary-title">
    <h3 id="route-summary-title" class="h6">Route summary</h3>

    <p v-if="routeSummary" aria-live="polite">
      Distance: {{ routeSummary.distanceText }} • Duration: {{ routeSummary.durationText }}
    </p>
    <p v-else class="text-muted">Use the controls on the map to search and create a route.</p>

    <ol v-if="routeSteps.length">
      <li v-for="(s, i) in routeSteps" :key="i">{{ s.instruction }}</li>
    </ol>
  </section>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.js'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const routeSummary = ref(null) // { distanceText, durationText }
const routeSteps = ref([]) // [{ instruction }, ...]

function formatKm(meters) {
  return (meters / 1000).toFixed(1) + ' km'
}
function formatMin(seconds) {
  const m = Math.round(seconds / 60)
  return m + ' min'
}

function attachDirectionsEvents() {
  directions.on('route', (e) => {
    try {
      const route = e?.route?.[0]
      if (!route) return
      routeSummary.value = {
        distanceText: formatKm(route.distance),
        durationText: formatMin(route.duration),
      }
      const steps = []
      const legs = route.legs || []
      for (const leg of legs) {
        for (const step of leg.steps || []) {
          const inst = step?.maneuver?.instruction || ''
          if (inst) steps.push({ instruction: inst })
        }
      }
      routeSteps.value = steps
    } catch {
      routeSummary.value = null
      routeSteps.value = []
    }
  })

  directions.on('clear', () => {
    routeSummary.value = null
    routeSteps.value = []
  })
}

const mapEl = ref(null)
let map = null
let geocoder = null
let directions = null

const AU_BBOX = [112.9211, -43.7405, 153.6387, -10.6682]
const DEFAULT_PROXIMITY = { longitude: 144.9631, latitude: -37.8136 }

onMounted(() => {
  const token = import.meta.env.VITE_MAPBOX_TOKEN
  if (!token) {
    alert('Map is unavailable: missing VITE_MAPBOX_TOKEN')
    return
  }

  map = new mapboxgl.Map({
    container: mapEl.value,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [DEFAULT_PROXIMITY.longitude, DEFAULT_PROXIMITY.latitude],
    zoom: 11,
  })

  map.addControl(new mapboxgl.NavigationControl(), 'top-right')
  map.addControl(new mapboxgl.FullscreenControl(), 'top-right')
  map.on('load', () => setTimeout(() => map?.resize(), 0))

  geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl,
    marker: true,
    placeholder: 'Search places (AU) — more results',
    countries: 'au',
    types: 'poi,address,place,locality,neighborhood,region',
    language: 'en',
    minLength: 2,
    limit: 10,
    bbox: AU_BBOX,
    proximity: DEFAULT_PROXIMITY,
  })
  map.addControl(geocoder, 'top-left')

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords
        try {
          geocoder.setProximity({ longitude, latitude })
        } catch {}
      },
      () => {},
      { enableHighAccuracy: true, timeout: 5000 },
    )
  }

  directions = new MapboxDirections({
    accessToken: mapboxgl.accessToken,
    unit: 'metric',
    profile: 'mapbox/driving',
    alternatives: true,
    geometries: 'geojson',
    controls: {
      instructions: true,
      profileSwitcher: true,
      inputs: true,
    },
  })
  attachDirectionsEvents()
  map.addControl(directions, 'top-right')
})

onBeforeUnmount(() => {
  try {
    directions?.onRemove?.()
    geocoder?.onRemove?.()
    map?.remove?.()
  } finally {
    directions = null
    geocoder = null
    map = null
    if (mapEl.value) mapEl.value.innerHTML = ''
  }
})
</script>

<style scoped>
.map-container {
  width: 100%;
  min-height: 500px;
  height: 70vh;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
