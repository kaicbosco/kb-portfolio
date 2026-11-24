<script setup lang="ts">
import { computed, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute } from 'vue-router'
import LanguageSwitcher from '@/components/layout/LanguageSwitcher.vue'
import { siteMark, siteName } from '@/constants/site'
import { defaultLocale } from '@/i18n/config'
import { localizedRouteName } from '@/router/routes'

const route = useRoute()
const { t } = useI18n()
const main = useTemplateRef<HTMLElement>('main')
const home = computed(() => localizedRouteName('home', route.meta.locale ?? defaultLocale))

watch(
  () => route.path,
  () => main.value?.focus({ preventScroll: true }),
  { flush: 'post' },
)
</script>

<template>
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-10 focus:rounded-md focus:bg-surface focus:px-4 focus:py-3"
    @click.prevent="main?.focus()"
  >
    {{ t('layout.skipToContent') }}
  </a>

  <header class="border-b border-border">
    <div
      class="mx-auto flex max-w-site flex-wrap items-center justify-between gap-x-4 px-4 py-2 lg:px-8"
    >
      <RouterLink
        :to="{ name: home }"
        :aria-label="siteName"
        class="inline-flex min-h-11 items-center font-display text-xl font-bold"
      >
        {{ siteMark }}
      </RouterLink>
      <LanguageSwitcher />
    </div>
  </header>

  <main
    id="main-content"
    ref="main"
    tabindex="-1"
    class="site-grid mx-auto max-w-site px-4 py-12 lg:px-8"
  >
    <slot />
  </main>
</template>
