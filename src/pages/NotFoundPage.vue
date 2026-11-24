<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute } from 'vue-router'
import { defaultLocale } from '@/i18n/config'
import { localizedRouteName } from '@/router/routes'

const route = useRoute()
const { t } = useI18n()
const home = computed(() => localizedRouteName('home', route.meta.locale ?? defaultLocale))
</script>

<template>
  <div class="col-span-full space-y-4">
    <p class="font-mono text-accent">404</p>
    <h1>{{ t('pages.notFound.title') }}</h1>
    <p class="text-muted">{{ t('pages.notFound.description') }}</p>
    <RouterLink
      :to="{ name: home }"
      class="inline-flex min-h-11 items-center gap-2 text-accent underline underline-offset-4"
    >
      <ArrowLeft :size="16" aria-hidden="true" />
      {{ t('pages.notFound.backToHome') }}
    </RouterLink>
  </div>
</template>
