<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{ slug: string }>()

const { t } = useI18n()
</script>

<template>
  <div class="col-span-full space-y-4">
    <h1>{{ t('pages.project.title') }}</h1>
    <p class="text-muted">{{ t('pages.project.description') }}</p>
    <p class="wrap-anywhere text-muted">
      {{ t('pages.project.identifier') }}
      <code
        ><bdi>{{ slug }}</bdi></code
      >
    </p>
  </div>
</template>
