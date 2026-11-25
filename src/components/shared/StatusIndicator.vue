<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    tone?: 'neutral' | 'success' | 'unavailable'
  }>(),
  { tone: 'neutral' },
)

const dotColors = {
  neutral: 'bg-status-neutral',
  success: 'bg-success',
  unavailable: 'bg-status-unavailable',
} as const
</script>

<template>
  <span class="inline-flex max-w-full items-baseline gap-2 text-caption text-foreground">
    <span
      class="size-2 shrink-0 self-baseline rounded-full"
      :class="dotColors[tone]"
      aria-hidden="true"
    />
    <span class="min-w-0 wrap-anywhere">{{ label }}</span>
  </span>
</template>
