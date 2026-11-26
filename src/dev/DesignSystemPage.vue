<script setup lang="ts">
import AppContainer from '@/components/layout/AppContainer.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import SectionHeading from '@/components/shared/SectionHeading.vue'
import TokenSpecimens from './TokenSpecimens.vue'
import ComponentSpecimens from './ComponentSpecimens.vue'
import BentoSpecimens from './BentoSpecimens.vue'
</script>

<template>
  <AppContainer class="crimson-void-playground">
    <header class="playground-intro">
      <BaseBadge>Catálogo de desenvolvimento</BaseBadge>
      <SectionHeading
        id="design-system-title"
        eyebrow="KB. / DESIGN SYSTEM"
        title="Crimson Void"
        description="A fundação visual do KB. Portfolio: superfícies escuras, tipografia técnica e vermelho reservado para hierarquia, ação e foco."
        :level="1"
        size="display"
      />
    </header>
    <TokenSpecimens />
    <ComponentSpecimens />
    <BentoSpecimens />
  </AppContainer>
</template>

<style scoped>
@reference '../assets/styles/main.css';

.crimson-void-playground {
  @apply min-w-0 space-y-section py-12 md:space-y-section-wide;
}

.playground-intro {
  @apply space-y-4 border-b border-border pb-8 md:pb-10;
}
</style>
