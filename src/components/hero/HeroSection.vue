<script setup lang="ts">
import { onMounted, shallowRef, useId, watch } from 'vue'
import AppContainer from '@/components/layout/AppContainer.vue'
import BentoGrid from '@/components/layout/BentoGrid.vue'
import DigitalCore from './DigitalCore.vue'
import HeroHighlights from './HeroHighlights.vue'
import HeroIntroduction from './HeroIntroduction.vue'
import { useHeroMotionPreference } from './useHeroMotionPreference'

const headingId = useId()
const { preference, toggleMotion } = useHeroMotionPreference()
const entering = shallowRef(false)

onMounted(() => {
  entering.value = preference.value === 'enabled'
})

watch(preference, (value) => {
  if (value !== 'enabled') entering.value = false
})
</script>

<template>
  <section :aria-labelledby="headingId" :data-entering="entering" class="hero">
    <AppContainer class="py-10 md:py-12 lg:py-16">
      <BentoGrid class="items-center md:gap-5 lg:gap-grid-gap-wide">
        <HeroIntroduction :heading-id="headingId" class="col-span-full lg:col-span-7" />
        <DigitalCore
          :motion-preference="preference"
          class="col-span-full mx-auto lg:col-span-5"
          @toggle-motion="toggleMotion"
        />
      </BentoGrid>
      <HeroHighlights class="hero-highlights mt-8 md:mt-12" @animationend.self="entering = false" />
    </AppContainer>
  </section>
</template>

<style scoped>
@media (prefers-reduced-motion: no-preference) {
  .hero[data-entering='true'] :deep(.hero-intro-availability),
  .hero[data-entering='true'] :deep(.hero-intro-eyebrow),
  .hero[data-entering='true'] :deep(.hero-intro-name),
  .hero[data-entering='true'] :deep(.hero-intro-role),
  .hero[data-entering='true'] :deep(.hero-intro-description),
  .hero[data-entering='true'] :deep(.hero-intro-actions:not(:focus-within)),
  .hero[data-entering='true'] .hero-highlights {
    animation: hero-enter var(--hero-enter, 300ms ease-out backwards);
  }

  .hero[data-entering='true'] :deep(.core-entrance) {
    animation: 300ms ease-out backwards hero-core-enter;
  }

  @media (min-width: 48rem) {
    .hero[data-entering='true'] :deep(.hero-intro-eyebrow) {
      --entrance-travel: 4px;
    }

    .hero[data-entering='true'] :deep(.hero-intro-name) {
      --hero-enter: 420ms ease-out 80ms backwards;
      --entrance-travel: 12px;
    }

    .hero[data-entering='true'] :deep(.hero-intro-role) {
      --hero-enter: 350ms ease-out 160ms backwards;
      --entrance-travel: 8px;
    }

    .hero[data-entering='true'] :deep(.hero-intro-description) {
      --hero-enter: 350ms ease-out 240ms backwards;
      --entrance-travel: 8px;
    }

    .hero[data-entering='true'] :deep(.hero-intro-actions) {
      --hero-enter: 320ms ease-out 320ms backwards;
      --entrance-travel: 6px;
    }

    .hero[data-entering='true'] :deep(.core-entrance) {
      animation-duration: 600ms;
      animation-delay: 80ms;
    }

    .hero[data-entering='true'] .hero-highlights {
      --hero-enter: 400ms ease-out 320ms backwards;
      --entrance-travel: 8px;
    }
  }
}

@keyframes hero-enter {
  from {
    opacity: 0.85;
    transform: translateY(var(--entrance-travel, 0));
  }
}

@keyframes hero-core-enter {
  from {
    opacity: 0.85;
    transform: scale(0.98);
  }
}
</style>
