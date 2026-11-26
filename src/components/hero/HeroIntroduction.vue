<script setup lang="ts">
import { ArrowUpRight } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import StatusIndicator from '@/components/shared/StatusIndicator.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { isOpenToWork, siteOwner, siteProfiles } from '@/constants/site'

defineProps<{ headingId: string }>()

const { t } = useI18n()
const [firstName, lastName] = siteOwner.split(' ')
const [github, linkedin] = siteProfiles
</script>

<template>
  <div class="hero-intro min-w-0 wrap-anywhere">
    <div class="mb-4 space-y-3 md:mb-6">
      <div v-if="isOpenToWork" class="hero-intro-availability">
        <StatusIndicator :label="t('pages.home.hero.availability')" tone="success" />
      </div>
      <p class="hero-intro-eyebrow font-mono text-caption font-medium tracking-eyebrow text-accent">
        {{ t('pages.home.hero.eyebrow') }}
      </p>
    </div>

    <h1 :id="headingId" class="hero-intro-name font-bold">
      {{ firstName }}<br />
      {{ lastName }}<span class="text-primary">.</span>
    </h1>

    <div class="hero-intro-role mt-4 space-y-2 md:mt-6">
      <p class="hero-intro-title font-display font-semibold tracking-heading">
        {{ t('pages.home.hero.role') }}
      </p>
      <p class="text-body font-medium text-accent md:text-lead">
        {{ t('pages.home.hero.education') }}
      </p>
    </div>

    <p class="hero-intro-description mt-4 max-w-[56ch] text-body text-muted md:mt-6">
      {{ t('pages.home.hero.description') }}
    </p>

    <div class="hero-intro-actions mt-8 flex flex-col gap-3 md:flex-row md:flex-wrap">
      <BaseButton size="lg" :action="{ kind: 'external', href: github.href, newTab: true }">
        {{ t('pages.home.hero.github') }}
        <template #trailing><ArrowUpRight /></template>
      </BaseButton>
      <BaseButton
        size="lg"
        variant="secondary"
        :action="{ kind: 'external', href: linkedin.href, newTab: true }"
      >
        {{ t('pages.home.hero.linkedin') }}
        <template #trailing><ArrowUpRight /></template>
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.hero-intro {
  container-type: inline-size;
  --hero-name-size: 3.5rem;
  --hero-role-size: var(--text-section);
}

.hero-intro-name {
  font-size: min(var(--hero-name-size), 32cqi);
  line-height: 1;
  letter-spacing: -0.05em;
}

.hero-intro-title {
  font-size: var(--hero-role-size);
  line-height: 1.2;
}

@media (min-width: 48rem) {
  .hero-intro {
    --hero-name-size: 5.5rem;
    --hero-role-size: 1.75rem;
  }
}

@media (min-width: 64rem) {
  .hero-intro {
    --hero-name-size: clamp(5.5rem, 2rem + 5.6vw, 7rem);
    --hero-role-size: var(--text-section-wide);
  }
}
</style>
