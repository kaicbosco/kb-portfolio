import { START_LOCATION, type RouterScrollBehavior } from 'vue-router'

export function getFragmentTarget(hash: string) {
  // Vue Router already decodes normalized hashes. An ID need not be a valid CSS selector.
  return hash.startsWith('#') ? document.getElementById(hash.slice(1)) : null
}

export const scrollBehavior: RouterScrollBehavior = async (to, from, savedPosition) => {
  if (savedPosition) return savedPosition

  const initialNavigation = from === START_LOCATION
  if (to.path !== from.path || to.hash !== from.hash) {
    if (initialNavigation && to.hash) {
      // main.ts mounts after router.isReady(); the initial scroll hook runs before then.
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    }
    const target = getFragmentTarget(to.hash)
    if (target) {
      const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
      const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0
      return { el: target, top: padding + margin }
    }
  }

  return !initialNavigation && to.path !== from.path ? { top: 0, left: 0 } : false
}
