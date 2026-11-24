import { createApp } from 'vue'
import { createWebHistory } from 'vue-router'
import App from './App.vue'
import { createPortfolioI18n } from './i18n'
import { createPortfolioRouter } from './router'
import './assets/styles/main.css'

const router = createPortfolioRouter(createWebHistory(import.meta.env.BASE_URL))
const app = createApp(App).use(createPortfolioI18n()).use(router)

await router.isReady()
app.mount('#app')
