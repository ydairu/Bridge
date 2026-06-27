import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './style.css'

const app = createApp(App)

app.use(router)
app.use(store)

// Initialize auth listener before mounting
store.dispatch('auth/initAuthListener')

app.mount('#app')
