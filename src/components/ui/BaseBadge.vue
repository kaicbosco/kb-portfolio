<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'neutral' | 'accent' }>(), { variant: 'neutral' })

defineSlots<{ default(): unknown }>()
</script>

<template>
  <span
    class="inline-block max-w-full rounded-md border border-border bg-surface-elevated px-2 py-1 font-mono text-caption wrap-anywhere"
    :class="variant === 'accent' ? 'text-accent' : 'text-muted'"
  >
    <slot />
  </span>
</template>
