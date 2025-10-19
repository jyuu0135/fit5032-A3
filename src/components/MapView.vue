<template>
  <div class="p-4">
    <h2 class="text-xl font-semibold mb-3">Explore Map</h2>
    <div ref="mapEl" class="map-container"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

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
      { enableHighAccuracy: true, timeout: 5000 }
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
