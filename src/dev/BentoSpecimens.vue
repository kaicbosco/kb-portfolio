<script setup lang="ts">
import AppContainer from '@/components/layout/AppContainer.vue'
import BentoCard from '@/components/layout/BentoCard.vue'
import BentoGrid from '@/components/layout/BentoGrid.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import SectionHeading from '@/components/shared/SectionHeading.vue'
</script>

<template>
  <section aria-labelledby="bento-title" class="bento-section">
    <SectionHeading
      id="bento-title"
      eyebrow="03 / COMPOSIÇÃO"
      title="Bento Grid"
      description="4, 8 e 12 colunas. As células crescem com o conteúdo e mantêm a ordem do documento."
    />

    <AppContainer :gutters="false">
      <BentoGrid data-testid="bento-grid">
        <BentoCard as="article" variant="featured" :tablet-span="5" :desktop-span="7">
          <template #header>
            <SectionHeading
              id="sample-pt-title"
              :level="3"
              eyebrow="01 / FEATURED"
              title="Componentes reutilizáveis com documentação e comportamento previsível"
            />
          </template>
          <p class="specimen-copy">
            Este exemplo combina título longo, metadados e uma ação explícita. O card não é um
            controle: a navegação pertence apenas ao link no rodapé.
          </p>
          <template #footer>
            <div class="bento-footer">
              <BaseBadge variant="accent">Span 4 / 5 / 7</BaseBadge>
              <BaseButton variant="secondary" :action="{ kind: 'route', to: '/pt' }">
                Abrir a inicial em português
              </BaseButton>
            </div>
          </template>
        </BentoCard>

        <BentoCard as="article" variant="elevated" :tablet-span="3" :desktop-span="5" lang="en">
          <template #header>
            <SectionHeading
              id="sample-en-title"
              :level="3"
              eyebrow="02 / ELEVATED"
              title="Long translated headings and unbroken technical identifiers"
            />
          </template>
          <p class="specimen-copy">The following identifier can wrap without widening its track:</p>
          <p class="specimen-code">
            <code
              >crimson-void.example/components/responsive-grid/extraordinarilyLongTranslatedIdentifier</code
            >
          </p>
          <template #footer>
            <div class="bento-footer">
              <BaseBadge>Span 4 / 3 / 5</BaseBadge>
              <BaseButton variant="secondary" :action="{ kind: 'route', to: '/en' }">
                Open the English home page
              </BaseButton>
            </div>
          </template>
        </BentoCard>

        <BentoCard :mobile-span="2" :tablet-span="4" :desktop-span="6">
          <template #header><h3 class="specimen-title">03 / Standard</h3></template>
          <BaseBadge>Span 2 / 4 / 6</BaseBadge>
        </BentoCard>
        <BentoCard :mobile-span="2" :tablet-span="4" :desktop-span="6">
          <template #header><h3 class="specimen-title" lang="en">04 / Standard</h3></template>
          <BaseBadge>Span 2 / 4 / 6</BaseBadge>
        </BentoCard>
        <BentoCard>
          <template #header><h3 class="specimen-title">05 / Largura padrão</h3></template>
          <BaseCard variant="elevated">
            <p class="specimen-copy">
              Sem largura explícita, a célula ocupa toda a linha. Este BaseCard interno não
              participa do grid.
            </p>
          </BaseCard>
        </BentoCard>
      </BentoGrid>
    </AppContainer>
  </section>
</template>

<style scoped>
@reference '../assets/styles/main.css';

.bento-section {
  @apply space-y-4;
}
.specimen-title {
  @apply font-display text-card-title font-semibold;
}
.specimen-copy {
  @apply max-w-prose text-body text-muted;
}
.specimen-code {
  @apply mt-2 text-caption;
}
.bento-footer {
  @apply flex flex-wrap items-center gap-2;
}
</style>
