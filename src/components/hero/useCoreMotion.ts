import { computed, onBeforeUnmount, onMounted, shallowRef, watch, type Ref } from 'vue'

const magneticQuery = '(min-width: 64rem) and (hover: hover) and (pointer: fine)'

function normalize(position: number, start: number, size: number) {
  return size > 0 ? Math.max(-1, Math.min(1, ((position - start) / size) * 2 - 1)) : 0
}

export function useCoreMotion(
  stage: Readonly<Ref<HTMLElement | null>>,
  magneticCore: Readonly<Ref<HTMLElement | null>>,
  motionAllowed: () => boolean,
) {
  const inViewport = shallowRef(false)
  const pageVisible = shallowRef(false)
  const preciseDesktop = shallowRef(false)
  const running = computed(() => motionAllowed() && inViewport.value && pageVisible.value)
  const magneticEnabled = computed(() => running.value && preciseDesktop.value)
  let observer: IntersectionObserver | undefined
  let desktop: MediaQueryList | undefined
  let pendingFrame: number | undefined
  let pointerX = 0
  let pointerY = 0

  function onVisibilityChange() {
    pageVisible.value = document.visibilityState === 'visible'
  }

  function onPointerCapabilityChange({ matches }: MediaQueryListEvent) {
    preciseDesktop.value = matches
  }

  function resetPointer() {
    if (pendingFrame !== undefined) {
      window.cancelAnimationFrame(pendingFrame)
      pendingFrame = undefined
    }
    magneticCore.value?.removeAttribute('data-tracking')
    magneticCore.value?.style.removeProperty('transform')
  }

  function applyPointer() {
    pendingFrame = undefined
    const core = magneticCore.value
    if (!magneticEnabled.value || !stage.value || !core) return

    // The stage is never tilted by the pointer, so its rect cannot feed back into the response.
    const { left, top, width, height } = stage.value.getBoundingClientRect()
    const x = normalize(pointerX, left, width)
    const y = normalize(pointerY, top, height)
    core.setAttribute('data-tracking', '')
    core.style.transform = `translate(${x * 5}px, ${y * 5}px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`
  }

  function trackPointer(event: PointerEvent) {
    if (!magneticEnabled.value || event.pointerType === 'touch') return
    pointerX = event.clientX
    pointerY = event.clientY
    pendingFrame ??= window.requestAnimationFrame(applyPointer)
  }

  watch(
    magneticEnabled,
    (enabled) => {
      if (!enabled) resetPointer()
    },
    { flush: 'sync' },
  )

  onMounted(() => {
    if (!stage.value || typeof IntersectionObserver !== 'function') return
    observer = new IntersectionObserver(([entry]) => {
      inViewport.value = Boolean(entry?.isIntersecting)
    })
    observer.observe(stage.value)

    onVisibilityChange()
    document.addEventListener('visibilitychange', onVisibilityChange)

    desktop = window.matchMedia?.(magneticQuery)
    if (
      typeof desktop?.addEventListener === 'function' &&
      typeof window.requestAnimationFrame === 'function' &&
      typeof window.cancelAnimationFrame === 'function'
    ) {
      preciseDesktop.value = desktop.matches
      desktop.addEventListener('change', onPointerCapabilityChange)
      stage.value.addEventListener('pointermove', trackPointer, { passive: true })
      stage.value.addEventListener('pointerleave', resetPointer)
      stage.value.addEventListener('pointercancel', resetPointer)
    }
  })

  onBeforeUnmount(() => {
    resetPointer()
    observer?.disconnect()
    desktop?.removeEventListener?.('change', onPointerCapabilityChange)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    stage.value?.removeEventListener('pointermove', trackPointer)
    stage.value?.removeEventListener('pointerleave', resetPointer)
    stage.value?.removeEventListener('pointercancel', resetPointer)
  })

  return { running, magneticEnabled }
}
