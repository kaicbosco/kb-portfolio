<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppContainer from '@/components/layout/AppContainer.vue'
import { siteName } from '@/constants/site'

const { t } = useI18n()
</script>

<template>
  <AppContainer class="site-grid py-12">
    <div class="col-span-full space-y-4">
      <h1>{{ siteName }}</h1>
      <p class="text-muted">{{ t('pages.home.description') }}</p>
    </div>
  </AppContainer>
</template>
