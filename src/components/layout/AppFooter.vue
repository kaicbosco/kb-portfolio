<script setup lang="ts">
import { ArrowUpRight } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import BaseButton from '@/components/ui/BaseButton.vue'
import { siteMark, siteOwner, siteProfiles } from '@/constants/site'
import AppContainer from './AppContainer.vue'

const { t } = useI18n()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-border bg-surface">
    <AppContainer class="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4">
      <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span aria-hidden="true" class="font-display text-card-title font-bold tracking-heading"
          >{{ siteMark.slice(0, -1)
          }}<span class="text-accent">{{ siteMark.slice(-1) }}</span></span
        >
        <small class="text-caption text-muted">{{
          t('layout.copyright', { year, name: siteOwner })
        }}</small>
      </div>

      <ul class="flex flex-wrap gap-1">
        <li v-for="profile in siteProfiles" :key="profile.name">
          <BaseButton variant="ghost" size="sm" :action="{ kind: 'external', href: profile.href }">
            {{ profile.name }}
            <template #trailing><ArrowUpRight /></template>
          </BaseButton>
        </li>
      </ul>
    </AppContainer>
  </footer>
</template>
