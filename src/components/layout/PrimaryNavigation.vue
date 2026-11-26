<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink, type RouteLocationRaw } from 'vue-router'

defineProps<{ home: RouteLocationRaw; vertical?: boolean }>()
const emit = defineEmits<{ select: [event: MouseEvent] }>()

const { t } = useI18n()
</script>

<template>
  <nav :aria-label="t('layout.primaryNavigation')">
    <ul class="flex flex-wrap gap-2" :class="{ 'flex-col': vertical }">
      <li>
        <RouterLink
          :to="home"
          class="shell-nav-item px-3 font-semibold aria-[current=page]:text-foreground aria-[current=page]:underline aria-[current=page]:decoration-accent aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-6"
          :class="{ 'w-full justify-start': vertical }"
          @click="emit('select', $event)"
        >
          {{ t('layout.home') }}
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>
