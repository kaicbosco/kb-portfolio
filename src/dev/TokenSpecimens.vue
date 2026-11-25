<script setup lang="ts">
import BentoCard from '@/components/layout/BentoCard.vue'
import BentoGrid from '@/components/layout/BentoGrid.vue'
import SectionHeading from '@/components/shared/SectionHeading.vue'

const colors = [
  { name: 'Background', token: 'background' },
  { name: 'Surface', token: 'surface' },
  { name: 'Elevated surface', token: 'surface-elevated' },
  { name: 'Foreground', token: 'foreground' },
  { name: 'Muted foreground', token: 'muted' },
  { name: 'Border', token: 'border' },
  { name: 'Control border', token: 'control-border' },
  { name: 'Primary', token: 'primary' },
  { name: 'Primary hover', token: 'primary-hover' },
  { name: 'Primary active', token: 'primary-active' },
  { name: 'On primary', token: 'on-primary' },
  { name: 'Accessible accent', token: 'accent' },
  { name: 'Focus', token: 'focus' },
  { name: 'Interactive hover', token: 'interactive-hover' },
  { name: 'Interactive active', token: 'interactive-active' },
  { name: 'Disabled surface', token: 'disabled-surface' },
  { name: 'Disabled foreground', token: 'disabled-foreground' },
  { name: 'Success', token: 'success' },
  { name: 'Neutral status', token: 'status-neutral' },
  { name: 'Unavailable status', token: 'status-unavailable' },
] as const

const spacingSteps = [1, 2, 3, 4, 6, 8, 10, 14] as const
const radii = ['md', 'lg'] as const
</script>

<template>
  <section aria-labelledby="tokens-title" class="token-section">
    <SectionHeading
      id="tokens-title"
      eyebrow="01 / FUNDAÇÃO"
      title="Tokens visuais"
      description="Cores por função, famílias tipográficas locais e espaçamento sobre um módulo de 4 px."
    />
    <BentoGrid>
      <BentoCard>
        <template #header><h3 class="specimen-title">Paleta semântica</h3></template>
        <dl class="swatches">
          <div v-for="{ name, token } in colors" :key="token" class="swatch">
            <span
              class="swatch-color"
              :style="{ '--sample': `var(--color-${token})` }"
              aria-hidden="true"
            />
            <dt lang="en">{{ name }}</dt>
            <dd>
              <code>--color-{{ token }}</code>
            </dd>
          </div>
        </dl>
      </BentoCard>

      <BentoCard :tablet-span="4" :desktop-span="7">
        <template #header><h3 class="specimen-title">Escala tipográfica</h3></template>
        <dl class="type-scale">
          <div>
            <dt>Display · Space Grotesk</dt>
            <dd class="type-display">Crimson Void</dd>
          </div>
          <div>
            <dt>Section · Space Grotesk</dt>
            <dd class="type-section">Hierarquia visual</dd>
          </div>
          <div>
            <dt>Card title · Space Grotesk</dt>
            <dd class="type-card-title" lang="en">Selected interface</dd>
          </div>
          <div>
            <dt>Lead · Inter</dt>
            <dd class="type-lead">Texto de abertura</dd>
          </div>
          <div>
            <dt>Body · Inter</dt>
            <dd class="type-body" lang="en">Clear, readable interface text.</dd>
          </div>
          <div>
            <dt>Caption · JetBrains Mono</dt>
            <dd class="type-caption"><code>crimson-void / metadata</code></dd>
          </div>
        </dl>
      </BentoCard>

      <BentoCard :tablet-span="4" :desktop-span="5">
        <template #header><h3 class="specimen-title">Espaçamento e raios</h3></template>
        <dl class="spacing-steps">
          <div v-for="step in spacingSteps" :key="step" class="spacing-row">
            <dt>
              <code>×{{ step }}</code>
            </dt>
            <dd class="spacing-bar" :style="{ '--step': step }" aria-hidden="true" />
          </div>
        </dl>
        <ul class="radii">
          <li v-for="radius in radii" :key="radius">
            <span
              class="radius-sample"
              :style="{ '--sample-radius': `var(--radius-${radius})` }"
              aria-hidden="true"
            />
            <code>radius-{{ radius }}</code>
          </li>
        </ul>
      </BentoCard>
    </BentoGrid>
  </section>
</template>

<style scoped>
@reference '../assets/styles/main.css';

.token-section {
  @apply space-y-4;
}
.specimen-title,
.type-card-title {
  @apply font-display text-card-title font-semibold;
}
.swatches {
  @apply grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5;
}
.swatch {
  @apply min-w-0 space-y-1 text-caption;
}
.swatch-color {
  @apply block h-9 rounded-md border border-border;
  background: var(--sample);
}
.swatch dd,
.type-scale dt,
.spacing-row dt,
.radii {
  @apply text-caption text-muted;
}
.type-scale,
.spacing-steps {
  @apply space-y-3;
}
.type-display {
  @apply font-display text-display font-bold tracking-heading md:text-display-wide;
}
.type-section {
  @apply font-display text-section font-bold tracking-heading md:text-section-wide;
}
.type-lead {
  @apply text-lead;
}
.type-body {
  @apply text-body;
}
.type-caption {
  @apply font-mono text-caption;
}
.spacing-row {
  @apply flex items-center gap-3;
}
.spacing-row dt {
  @apply w-9;
}
.spacing-bar {
  @apply h-2 max-w-full rounded-full bg-accent;
  inline-size: calc(var(--spacing) * var(--step));
}
.radii {
  @apply mt-6 flex flex-wrap gap-4 border-t border-border pt-4;
}
.radii > li {
  @apply space-y-2;
}
.radius-sample {
  @apply block size-10 border border-control-border bg-surface-elevated;
  border-radius: var(--sample-radius);
}
</style>
