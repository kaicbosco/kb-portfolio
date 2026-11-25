<script setup lang="ts">
import BaseBadge from '@/components/ui/BaseBadge.vue'
import SectionHeading from '@/components/shared/SectionHeading.vue'
import TokenSpecimens from './TokenSpecimens.vue'
import ComponentSpecimens from './ComponentSpecimens.vue'
import BentoSpecimens from './BentoSpecimens.vue'
</script>

<template>
  <div class="crimson-void-playground">
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
  </div>
</template>

<style scoped>
@reference '../assets/styles/main.css';

.crimson-void-playground {
  @apply col-span-full min-w-0 space-y-section md:space-y-section-wide;
}

.playground-intro {
  @apply space-y-4 border-b border-border pb-8 md:pb-10;
}
</style>
