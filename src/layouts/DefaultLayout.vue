<script setup lang="ts">
import { useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import { getFragmentTarget } from '@/router/scroll'

defineSlots<{ default(): unknown }>()

const route = useRoute()
const { t } = useI18n()
const main = useTemplateRef<HTMLElement>('main')

function focusFragment(target: HTMLElement) {
  target.focus({ preventScroll: true })
  if (document.activeElement === target) return true
  if (target.hasAttribute('tabindex')) return false

  target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })
  const cleanup = () => target.removeAttribute('tabindex')
  if (document.activeElement !== target) {
    cleanup()
    return false
  }

  target.addEventListener('blur', cleanup, { once: true })
  return true
}

watch(
  [() => route.path, () => route.hash],
  ([path, hash], [previousPath]) => {
    const content = main.value
    if (!content) return

    const target = getFragmentTarget(hash)
    if (target instanceof HTMLElement && content.contains(target) && focusFragment(target)) return
    if (path !== previousPath) content.focus({ preventScroll: true })
  },
  { flush: 'post' },
)

function skipToContent() {
  main.value?.focus({ preventScroll: true })
  main.value?.scrollIntoView()
}
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:inset-s-3 focus:inset-e-auto focus:top-3 focus:z-30 focus:max-w-[calc(100%-var(--spacing)*6)] focus:rounded-md focus:bg-surface focus:px-4 focus:py-3 focus:wrap-anywhere"
      @click.prevent="skipToContent"
    >
      {{ t('layout.skipToContent') }}
    </a>

    <AppHeader />
    <main id="main-content" ref="main" tabindex="-1" class="grow">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
