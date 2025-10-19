import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'

import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import PrimeVue from 'primevue/config'

import 'datatables.net-dt/css/dataTables.dataTables.css'

import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
app.use(PrimeVue)
