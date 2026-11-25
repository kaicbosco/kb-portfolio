<script setup lang="ts">
import type { CardProps } from './cardTypes'

withDefaults(defineProps<CardProps>(), { variant: 'standard', as: 'div' })

defineSlots<{
  default?(): unknown
  header?(): unknown
  footer?(): unknown
}>()
</script>

<template>
  <component :is="as" class="base-card" :data-variant="variant">
    <div v-if="$slots.header"><slot name="header" /></div>
    <div v-if="$slots.default"><slot /></div>
    <div v-if="$slots.footer"><slot name="footer" /></div>
  </component>
</template>

<style scoped>
@reference '../../assets/styles/main.css';

.base-card {
  @apply flex min-w-0 flex-col items-start gap-4 rounded-lg border border-border bg-surface p-card wrap-anywhere md:p-card-wide;
}

.base-card > div {
  @apply w-full min-w-0;
}

.base-card[data-variant='elevated'] {
  @apply bg-surface-elevated;
}

.base-card[data-variant='featured'] {
  border-block-start-color: var(--color-primary);
}
</style>
