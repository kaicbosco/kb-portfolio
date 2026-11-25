<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string
    title: string
    eyebrow?: string
    description?: string
    level?: 1 | 2 | 3 | 4 | 5 | 6
    size?: 'section' | 'display'
  }>(),
  { level: 2, size: 'section' },
)
</script>

<template>
  <div class="space-y-2 wrap-anywhere">
    <p v-if="eyebrow" class="font-mono text-caption tracking-eyebrow text-accent">{{ eyebrow }}</p>
    <component
      :is="`h${level}`"
      :id="id"
      class="font-display font-bold tracking-heading"
      :class="
        size === 'display'
          ? 'text-display md:text-display-wide'
          : 'text-section md:text-section-wide'
      "
    >
      {{ title }}
    </component>
    <p v-if="description" class="max-w-prose text-body text-muted">{{ description }}</p>
  </div>
</template>
