<script setup lang="ts">
import { CodeXml, Globe, GraduationCap, Layers } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import BentoCard from '@/components/layout/BentoCard.vue'
import BentoGrid from '@/components/layout/BentoGrid.vue'

const { t } = useI18n()
const highlights = [
  { key: 'focus', number: '01', icon: CodeXml },
  { key: 'stack', number: '02', icon: Layers },
  { key: 'education', number: '03', icon: GraduationCap },
  { key: 'work', number: '04', icon: Globe },
] as const
</script>

<template>
  <BentoGrid
    role="list"
    :aria-label="t('pages.home.hero.highlights.label')"
    class="highlights-grid md:gap-5 lg:gap-grid-gap-wide"
  >
    <BentoCard
      v-for="{ key, number, icon } in highlights"
      :key="key"
      role="listitem"
      class="highlight-card"
      :tablet-span="4"
      :desktop-span="3"
    >
      <template #header>
        <div class="flex items-start justify-between gap-2" aria-hidden="true">
          <span
            class="flex size-10 items-center justify-center rounded-md bg-primary/10 text-accent"
          >
            <component :is="icon" class="size-5" />
          </span>
          <span class="font-mono text-caption text-muted">{{ number }}</span>
        </div>
      </template>
      <h2
        class="highlight-category font-sans text-caption font-semibold tracking-eyebrow text-accent"
      >
        {{ t(`pages.home.hero.highlights.${key}.category`) }}
      </h2>
      <p class="highlight-value mt-2 text-card-title font-semibold text-foreground">
        {{ t(`pages.home.hero.highlights.${key}.value`) }}
      </p>
      <p class="highlight-description mt-2 text-caption text-muted">
        {{ t(`pages.home.hero.highlights.${key}.description`) }}
      </p>
    </BentoCard>
  </BentoGrid>
</template>

<style scoped>
@supports (grid-template-rows: subgrid) {
  @media (min-width: 48rem) {
    .highlights-grid > .highlight-card {
      display: grid;
      grid-row: span 4;
      grid-template-rows: subgrid;
      row-gap: calc(var(--spacing) * 2);
    }

    /* Os wrappers dos slots de BaseCard não têm semântica própria. */
    .highlight-card > :deep(div) {
      display: contents;
    }

    .highlight-category {
      margin-block-start: calc(var(--spacing) * 2);
    }

    .highlight-value,
    .highlight-description {
      margin-block-start: 0;
    }
  }
}
</style>
