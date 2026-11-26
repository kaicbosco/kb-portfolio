import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue'

export type HeroMotionPreference = 'enabled' | 'paused' | 'reduced' | 'unavailable'

// Keep the explicit choice across route changes for this page session.
const manuallyPaused = shallowRef(false)

export function useHeroMotionPreference() {
  const supported = shallowRef(false)
  const reduced = shallowRef(false)
  let query: MediaQueryList | undefined

  function onReducedMotion({ matches }: MediaQueryListEvent) {
    reduced.value = matches
  }

  onMounted(() => {
    query = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    reduced.value = query?.matches ?? false
    query?.addEventListener?.('change', onReducedMotion)
    supported.value =
      typeof query?.addEventListener === 'function' &&
      typeof IntersectionObserver === 'function' &&
      typeof document.visibilityState === 'string'
  })

  onBeforeUnmount(() => query?.removeEventListener?.('change', onReducedMotion))

  const preference = computed<HeroMotionPreference>(() => {
    if (reduced.value) return 'reduced'
    if (!supported.value) return 'unavailable'
    return manuallyPaused.value ? 'paused' : 'enabled'
  })

  function toggleMotion() {
    if (preference.value === 'enabled' || preference.value === 'paused') {
      manuallyPaused.value = !manuallyPaused.value
    }
  }

  return { preference, toggleMotion }
}
