import { createRouter, type RouterHistory } from 'vue-router'
import { routes } from './routes'
import { scrollBehavior } from './scroll'

export function createPortfolioRouter(history: RouterHistory) {
  return createRouter({
    history,
    routes,
    scrollBehavior,
  })
}
