<script setup lang="ts">
import { Menu, X } from '@lucide/vue'
import { computed, onMounted, onUnmounted, shallowRef, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import { siteMark, siteName } from '@/constants/site'
import { defaultLocale } from '@/i18n/config'
import { localizedRouteName } from '@/router/routes'
import AppContainer from './AppContainer.vue'
import LanguageSwitcher from './LanguageSwitcher.vue'
import PrimaryNavigation from './PrimaryNavigation.vue'

const { t } = useI18n()
const route = useRoute()
const home = computed(() => ({
  name: localizedRouteName('home', route.meta.locale ?? defaultLocale),
}))

const isOpen = shallowRef(false)
const header = useTemplateRef<HTMLElement>('header')
const desktopNav = useTemplateRef<HTMLElement>('desktopNav')
const panel = useTemplateRef<HTMLElement>('panel')
const toggle = useTemplateRef<InstanceType<typeof BaseButton>>('toggle')
const panelId = 'mobile-primary-navigation'
const headerHeightProperty = '--shell-header-height'
let lastHeaderFocus: HTMLElement | null = null

function getToggle() {
  const element: unknown = toggle.value?.$el
  return element instanceof HTMLButtonElement ? element : null
}

function closeMenu(restoreFocus = false) {
  if (!isOpen.value) return
  isOpen.value = false
  if (restoreFocus) getToggle()?.focus({ preventScroll: true })
}

function onEscape(event: KeyboardEvent) {
  if (!isOpen.value || event.defaultPrevented) return
  event.preventDefault()
  event.stopPropagation()
  closeMenu(true)
}

function onFocusIn({ target }: FocusEvent) {
  if (target instanceof HTMLElement) lastHeaderFocus = target
}

function onFocusOut({ relatedTarget, target }: FocusEvent) {
  if (relatedTarget instanceof Node && !header.value?.contains(relatedTarget)) {
    lastHeaderFocus = null
    closeMenu()
  } else if (!relatedTarget && target instanceof HTMLElement && target.getClientRects().length) {
    lastHeaderFocus = null
  }
}

// RouterLink doesn't change the route when the current destination is selected again.
function onHomeClick(event: MouseEvent) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  if (route.name === home.value.name && !route.hash && !Object.keys(route.query).length) {
    closeMenu(Boolean(panel.value?.contains(document.activeElement)))
  }
}

function navigateFromBrand(event: MouseEvent, navigate: (event: MouseEvent) => void) {
  navigate(event)
  onHomeClick(event)
}

watch(
  [() => route.fullPath, () => route.path],
  ([, path], [, previousPath]) => {
    closeMenu(path === previousPath && Boolean(panel.value?.contains(document.activeElement)))
  },
  { flush: 'sync' },
)

// CSS controls visibility. The media query only resets the disclosure and transfers focus.
function onBreakpointChange({ matches: desktop }: MediaQueryListEvent) {
  // Some browsers blur a CSS-hidden control before dispatching the media-query change.
  const active = document.activeElement === document.body ? lastHeaderFocus : document.activeElement
  if (desktop && (active === getToggle() || panel.value?.contains(active))) {
    desktopNav.value?.querySelector('a')?.focus({ preventScroll: true })
  } else if (!desktop && desktopNav.value?.contains(active)) {
    getToggle()?.focus({ preventScroll: true })
  }
  // The mobile toggle can already be used before its media-query notification arrives.
  if (desktop) closeMenu()
}

let media: MediaQueryList | undefined
let observer: ResizeObserver | undefined

function updateHeaderHeight() {
  if (header.value) {
    document.documentElement.style.setProperty(
      headerHeightProperty,
      `${header.value.offsetHeight}px`,
    )
  }
}

onMounted(() => {
  media = window.matchMedia?.('(min-width: 64rem)')
  media?.addEventListener('change', onBreakpointChange)
  updateHeaderHeight()
  if (header.value && typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(updateHeaderHeight)
    observer.observe(header.value)
  }
})

onUnmounted(() => {
  observer?.disconnect()
  media?.removeEventListener('change', onBreakpointChange)
  document.documentElement.style.removeProperty(headerHeightProperty)
})
</script>

<template>
  <header
    ref="header"
    class="shell-header border-b border-border bg-surface"
    @focusin="onFocusIn"
    @keydown.esc="onEscape"
    @focusout="onFocusOut"
  >
    <AppContainer
      class="flex min-h-16 flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2 lg:grid lg:min-h-18 lg:grid-cols-[1fr_auto_1fr]"
    >
      <RouterLink :to="home" custom v-slot="{ href, navigate }">
        <a
          :href="href"
          :aria-label="siteName"
          class="inline-flex min-h-target min-w-target items-center justify-center justify-self-start rounded-md font-display text-section font-bold tracking-heading"
          @click="navigateFromBrand($event, navigate)"
        >
          <span aria-hidden="true"
            >{{ siteMark.slice(0, -1)
            }}<span class="text-accent">{{ siteMark.slice(-1) }}</span></span
          >
        </a>
      </RouterLink>

      <div ref="desktopNav" class="hidden lg:block">
        <PrimaryNavigation :home="home" />
      </div>

      <div class="flex min-w-0 flex-wrap items-center gap-2 lg:justify-self-end">
        <LanguageSwitcher />
        <div class="lg:hidden">
          <BaseButton
            ref="toggle"
            variant="ghost"
            size="sm"
            :aria-label="t(isOpen ? 'layout.closeMenu' : 'layout.openMenu')"
            :aria-expanded="isOpen"
            :aria-controls="panelId"
            @click="isOpen = !isOpen"
          >
            <template #leading>
              <X v-if="isOpen" />
              <Menu v-else />
            </template>
          </BaseButton>
        </div>
      </div>
    </AppContainer>

    <div
      v-show="isOpen"
      :id="panelId"
      ref="panel"
      class="border-t border-border bg-surface-elevated lg:hidden"
    >
      <AppContainer class="py-3">
        <PrimaryNavigation :home="home" vertical @select="onHomeClick" />
      </AppContainer>
    </div>
  </header>
</template>

<style scoped>
@media (min-height: 30rem) {
  .shell-header {
    position: sticky;
    inset-block-start: 0;
    z-index: 20;
  }
}
</style>
