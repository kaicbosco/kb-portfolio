import { createRouter, type RouterHistory } from 'vue-router'
import { routes } from './routes'

export function createPortfolioRouter(history: RouterHistory) {
  return createRouter({
    history,
    routes,
    scrollBehavior: (_to, _from, savedPosition) => savedPosition ?? { top: 0 },
  })
}
