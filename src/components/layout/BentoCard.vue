<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import type { CardProps } from '@/components/ui/cardTypes'

type MobileSpan = 1 | 2 | 3 | 4
type TabletSpan = MobileSpan | 5 | 6 | 7 | 8
type DesktopSpan = TabletSpan | 9 | 10 | 11 | 12

const props = withDefaults(
  defineProps<
    CardProps & {
      mobileSpan?: MobileSpan
      tabletSpan?: TabletSpan
      desktopSpan?: DesktopSpan
    }
  >(),
  { mobileSpan: 4, tabletSpan: 8, desktopSpan: 12 },
)

defineSlots<{
  default?(): unknown
  header?(): unknown
  footer?(): unknown
}>()

function validSpan(value: unknown, columns: number) {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= columns
    ? value
    : columns
}

const spans = computed(() => ({
  '--bento-mobile': validSpan(props.mobileSpan, 4),
  '--bento-tablet': validSpan(props.tabletSpan, 8),
  '--bento-desktop': validSpan(props.desktopSpan, 12),
}))
</script>

<template>
  <BaseCard
    :as="as"
    :variant="variant"
    class="col-span-(--bento-mobile) md:col-span-(--bento-tablet) lg:col-span-(--bento-desktop)"
    :style="spans"
  >
    <template v-if="$slots.header" #header><slot name="header" /></template>
    <template v-if="$slots.default" #default><slot /></template>
    <template v-if="$slots.footer" #footer><slot name="footer" /></template>
  </BaseCard>
</template>
