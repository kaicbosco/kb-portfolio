<script setup lang="ts">
import { ArrowRight, ArrowUpRight, CircleHelp } from '@lucide/vue'
import { shallowRef } from 'vue'
import BentoCard from '@/components/layout/BentoCard.vue'
import BentoGrid from '@/components/layout/BentoGrid.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SectionHeading from '@/components/shared/SectionHeading.vue'
import StatusIndicator from '@/components/shared/StatusIndicator.vue'

const variants = ['primary', 'secondary', 'ghost'] as const
const sizes = ['sm', 'md', 'lg'] as const
const selected = shallowRef<string>()
</script>

<template>
  <section aria-labelledby="components-title" class="component-section">
    <SectionHeading
      id="components-title"
      eyebrow="02 / INTERFACE"
      title="Primitivos e estados"
      description="Use Tab para focar e Espaço ou Enter para acionar. O botão desabilitado não participa da sequência."
    />

    <BentoGrid>
      <BentoCard :desktop-span="8">
        <template #header><h3 class="specimen-title">BaseButton</h3></template>
        <div class="button-rows">
          <div v-for="variant in variants" :key="variant" class="button-row">
            <code class="variant-label">{{ variant }}</code>
            <div class="specimen-group">
              <BaseButton
                v-for="size in sizes"
                :key="size"
                :variant="variant"
                :size="size"
                :aria-label="`${size} — ${variant}`"
                @click="selected = `${variant} · ${size}`"
              >
                {{ size }}
              </BaseButton>
            </div>
          </div>
        </div>
        <template #footer>
          <p class="button-feedback">
            Última ação: <code>{{ selected ?? 'nenhuma' }}</code>
          </p>
        </template>
      </BentoCard>

      <BentoCard variant="elevated" :desktop-span="4">
        <template #header><h3 class="specimen-title">Links e estados</h3></template>
        <div class="specimen-group">
          <BaseButton variant="secondary" :action="{ kind: 'route', to: '/pt' }">
            Inicial PT
            <template #trailing><ArrowRight /></template>
          </BaseButton>
          <BaseButton
            variant="ghost"
            :action="{ kind: 'external', href: 'https://www.w3.org/WAI/', newTab: true }"
          >
            W3C WAI (nova aba)
            <template #trailing><ArrowUpRight /></template>
          </BaseButton>
          <BaseButton size="sm" :action="{ kind: 'button', disabled: true }">
            Indisponível
          </BaseButton>
          <BaseButton size="sm" aria-label="Ajuda do playground" @click="selected = 'ajuda'">
            <template #leading><CircleHelp /></template>
          </BaseButton>
        </div>
        <template #footer>
          <p class="button-feedback">
            Passe o ponteiro ou pressione um controle para ver o estado.
          </p>
        </template>
      </BentoCard>

      <BentoCard :tablet-span="4" :desktop-span="6">
        <template #header><h3 class="specimen-title">BaseBadge</h3></template>
        <div class="specimen-group">
          <BaseBadge>TypeScript</BaseBadge>
          <BaseBadge variant="accent">Acessibilidade</BaseBadge>
          <BaseBadge lang="en">Responsive layout</BaseBadge>
        </div>
      </BentoCard>

      <BentoCard :tablet-span="4" :desktop-span="6" variant="elevated">
        <template #header><h3 class="specimen-title">StatusIndicator</h3></template>
        <ul class="status-list">
          <li><StatusIndicator tone="success" label="Disponível para contato" /></li>
          <li><StatusIndicator label="Em revisão" /></li>
          <li><StatusIndicator tone="unavailable" label="Currently unavailable" lang="en" /></li>
        </ul>
      </BentoCard>
    </BentoGrid>
  </section>
</template>

<style scoped>
@reference '../assets/styles/main.css';

.component-section,
.button-rows {
  @apply space-y-4;
}
.specimen-title {
  @apply font-display text-card-title font-semibold;
}
.button-row {
  @apply grid gap-2 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-center;
}
.variant-label,
.button-feedback {
  @apply text-caption text-muted;
}
.specimen-group {
  @apply flex flex-wrap items-center gap-2;
}
.status-list {
  @apply space-y-2;
}
</style>
