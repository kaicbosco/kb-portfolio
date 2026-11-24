<script setup lang="ts">
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterView, useRoute } from 'vue-router'
import { siteName } from '@/constants/site'
import { defaultLocale, localeDetails } from '@/i18n/config'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const route = useRoute()
const { locale, t } = useI18n({ useScope: 'global' })

watch(
  () => [route.meta.locale, route.meta.page] as const,
  ([activeLocale = defaultLocale, page]) => {
    locale.value = localeDetails[activeLocale].languageTag

    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale.value
      document.title =
        !page || page === 'home' ? siteName : `${t(`pages.${page}.title`)} | ${siteName}`
    }
  },
  { immediate: true },
)
</script>

<template>
  <DefaultLayout>
    <RouterView />
  </DefaultLayout>
</template>
