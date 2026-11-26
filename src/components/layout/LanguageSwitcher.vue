<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute } from 'vue-router'
import { defaultLocale, localeDetails, supportedLocales } from '@/i18n/config'
import { languageTarget } from '@/router/languageTarget'

const route = useRoute()
const { t } = useI18n()
const activeLocale = computed(() => route.meta.locale ?? defaultLocale)
</script>

<template>
  <nav :aria-label="t('layout.languages')">
    <ul class="flex flex-wrap items-center gap-1">
      <li v-for="locale in supportedLocales" :key="locale">
        <span
          v-if="locale === activeLocale"
          :lang="localeDetails[locale].languageTag"
          aria-current="true"
          class="inline-flex min-h-target min-w-target items-center justify-center rounded-md border border-border bg-surface-elevated px-2 font-mono text-caption font-semibold text-foreground"
        >
          <span aria-hidden="true">{{ localeDetails[locale].shortLabel }}</span>
          <span class="sr-only"
            >{{ localeDetails[locale].shortLabel }} — {{ localeDetails[locale].label }}</span
          >
        </span>
        <RouterLink
          v-else
          :to="languageTarget(route, locale)"
          :lang="localeDetails[locale].languageTag"
          :hreflang="localeDetails[locale].languageTag"
          class="shell-nav-item px-2 font-mono"
        >
          <span aria-hidden="true">{{ localeDetails[locale].shortLabel }}</span>
          <span class="sr-only"
            >{{ localeDetails[locale].shortLabel }} — {{ localeDetails[locale].label }}</span
          >
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>
