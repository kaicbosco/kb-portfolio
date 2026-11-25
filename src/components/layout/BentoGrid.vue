<script setup lang="ts">
defineSlots<{ default(): unknown }>()
</script>

<template>
  <div class="site-grid min-w-0">
    <slot />
  </div>
</template>
