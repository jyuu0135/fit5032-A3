import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'

import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

// ---- DataTables + Bootstrap 5 CSS ----
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css'
import 'datatables.net-responsive-bs5/css/responsive.bootstrap5.min.css'

// ---- A11y baseline ----
import './styles/a11y.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
