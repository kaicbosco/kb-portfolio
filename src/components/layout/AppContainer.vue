<script setup lang="ts">
withDefaults(defineProps<{ gutters?: boolean }>(), { gutters: true })

defineSlots<{ default(): unknown }>()
</script>

<template>
  <div class="mx-auto w-full max-w-site" :class="{ 'site-gutters': gutters }">
    <slot />
  </div>
</template>
