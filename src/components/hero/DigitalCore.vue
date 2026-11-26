<script setup lang="ts">
import { Pause, Play } from '@lucide/vue'
import { computed, useId, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useCoreMotion } from './useCoreMotion'
import type { HeroMotionPreference } from './useHeroMotionPreference'

const props = defineProps<{ motionPreference: HeroMotionPreference }>()
defineEmits<{ toggleMotion: [] }>()

const { t } = useI18n()
const svgId = useId()
const stage = useTemplateRef<HTMLDivElement>('stage')
const magneticCore = useTemplateRef<HTMLDivElement>('magneticCore')
const { running, magneticEnabled } = useCoreMotion(
  stage,
  magneticCore,
  () => props.motionPreference === 'enabled',
)
const controlDisabled = computed(
  () => props.motionPreference === 'reduced' || props.motionPreference === 'unavailable',
)

const vertices = [
  { x: 200, y: 100 },
  { x: 286.6, y: 150 },
  { x: 286.6, y: 250 },
  { x: 200, y: 300 },
  { x: 113.4, y: 250 },
  { x: 113.4, y: 150 },
]
</script>

<template>
  <div class="digital-core w-full max-w-[27rem] min-w-0" :data-motion-running="running">
    <div class="core-entrance" aria-hidden="true">
      <div
        ref="stage"
        class="core-stage relative aspect-square"
        :data-magnetic-enabled="magneticEnabled"
      >
        <svg class="static-frame core-svg" viewBox="0 0 400 400" focusable="false">
          <defs>
            <pattern :id="`${svgId}-grid`" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M20 0H0V20" fill="none" stroke="var(--color-border)" stroke-width="1" />
            </pattern>
            <radialGradient :id="`${svgId}-ambient`">
              <stop stop-color="var(--color-primary)" stop-opacity=".19" />
              <stop offset=".6" stop-color="var(--color-primary)" stop-opacity=".07" />
              <stop offset="1" stop-color="var(--color-primary)" stop-opacity="0" />
            </radialGradient>
          </defs>

          <rect
            x="12"
            y="12"
            width="376"
            height="376"
            fill="var(--color-surface)"
            fill-opacity=".54"
          />
          <rect
            class="ambient-glow"
            x="14"
            y="14"
            width="372"
            height="372"
            :fill="`url(#${svgId}-ambient)`"
          />
          <rect
            class="grid-matrix"
            x="12"
            y="12"
            width="376"
            height="376"
            :fill="`url(#${svgId}-grid)`"
            opacity=".74"
          />
          <path
            d="M200 12V388 M12 200H388"
            fill="none"
            stroke="var(--color-border)"
            stroke-width="1"
          />
          <rect
            class="frame-outline"
            x="12"
            y="12"
            width="376"
            height="376"
            fill="none"
            stroke="var(--color-border)"
          />
          <path
            d="M12 34V12H34 M366 12H388V34 M388 366V388H366 M34 388H12V366
               M196 12H204 M200 12V23 M388 196V204 M377 200H388
               M196 388H204 M200 377V388 M12 196V204 M12 200H23"
            fill="none"
            stroke="var(--color-accent)"
            stroke-opacity=".62"
          />
          <path
            d="M369 29h4m-2-2v4 M27 371h4m-2-2v4"
            fill="none"
            stroke="var(--color-muted)"
            stroke-opacity=".6"
          />
          <g
            class="technical-labels font-mono"
            font-size="9"
            letter-spacing="1.05"
            fill="var(--color-muted)"
          >
            <text x="26" y="34">FIG.01 / DIGITAL CORE</text>
            <text x="375" y="373" text-anchor="end">KB.CORE / 001</text>
          </g>
        </svg>

        <div ref="magneticCore" class="magnetic-core absolute inset-0 pointer-events-none">
          <svg class="core-svg" viewBox="0 0 400 400" focusable="false">
            <defs>
              <radialGradient :id="`${svgId}-energy`">
                <stop stop-color="var(--color-accent)" stop-opacity=".45" />
                <stop offset=".34" stop-color="var(--color-primary)" stop-opacity=".26" />
                <stop offset="1" stop-color="var(--color-primary)" stop-opacity="0" />
              </radialGradient>
              <linearGradient :id="`${svgId}-framework`" x2="1" y2="1">
                <stop stop-color="var(--color-accent)" stop-opacity=".8" />
                <stop offset="1" stop-color="var(--color-primary)" stop-opacity=".45" />
              </linearGradient>
            </defs>

            <g fill="none">
              <circle
                cx="200"
                cy="200"
                r="161"
                stroke="var(--color-muted)"
                stroke-opacity=".5"
                stroke-dasharray="1 5"
              />
              <circle cx="200" cy="200" r="141" stroke="var(--color-muted)" stroke-opacity=".23" />
              <path
                d="M200 53v12 M200 335v12 M53 200h12 M335 200h12"
                stroke="var(--color-muted)"
                stroke-opacity=".5"
              />
              <g class="orbital-arcs" stroke="var(--color-primary)" stroke-width="2">
                <path
                  d="M200 39A161 161 0 0 1 310.89 83.27
                         M200 361A161 161 0 0 1 89.11 316.73"
                />
                <circle cx="313.84" cy="86.16" r="2" fill="var(--color-accent)" stroke="none" />
                <circle cx="86.16" cy="313.84" r="2" fill="var(--color-accent)" stroke="none" />
              </g>
            </g>

            <circle cx="200" cy="200" r="51" :fill="`url(#${svgId}-energy)`" />
            <g :stroke="`url(#${svgId}-framework)`" fill="none">
              <path d="M200 65 316.91 132.5V267.5L200 335 83.09 267.5V132.5Z" opacity=".49" />
              <path d="M200 100 286.6 150V250L200 300 113.4 250V150Z" stroke-width="1.3" />
              <path d="M200 142 250.23 171V229L200 258 149.77 229V171Z" opacity=".71" />
            </g>

            <g class="connectivity-mesh" fill="none" stroke="var(--color-accent)">
              <path d="M200 100V300 M113.4 150 286.6 250 M113.4 250 286.6 150" opacity=".36" />
              <path
                d="M200 142 286.6 150 250.23 229 200 300 149.77 229 113.4 150Z
                   M200 100 250.23 171 286.6 250 200 258 113.4 250 149.77 171Z"
                opacity=".21"
              />
              <path class="energy-signal" d="M113.4 250 286.6 150" pathLength="1" />
              <path class="energy-signal energy-signal-secondary" d="M200 100V300" pathLength="1" />
            </g>

            <g
              v-for="({ x, y }, index) in vertices"
              :key="index"
              class="energy-node"
              :style="{ '--node-delay': `${-index}s` }"
            >
              <circle :cx="x" :cy="y" r="9" :fill="`url(#${svgId}-energy)`" />
              <circle :cx="x" :cy="y" r="3.1" fill="var(--color-accent)" />
            </g>
            <g class="central-energy">
              <circle
                cx="200"
                cy="200"
                r="14"
                fill="none"
                stroke="var(--color-accent)"
                opacity=".42"
              />
              <circle cx="200" cy="200" r="6.5" fill="var(--color-primary)" />
              <circle cx="200" cy="200" r="3.25" fill="var(--color-on-primary)" />
            </g>
          </svg>
        </div>
      </div>
    </div>

    <div class="mt-2 flex justify-end">
      <BaseButton
        variant="ghost"
        size="sm"
        :action="{ kind: 'button', disabled: controlDisabled }"
        @click="$emit('toggleMotion')"
      >
        {{ t(`pages.home.hero.motion.${motionPreference}`) }}
        <template v-if="!controlDisabled" #leading>
          <Pause v-if="motionPreference === 'enabled'" />
          <Play v-else />
        </template>
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.core-stage {
  perspective: 800px;
}

.core-svg {
  position: absolute;
  inset: 0;
  inline-size: 100%;
  block-size: 100%;
  pointer-events: none;
}

.energy-signal {
  stroke-dasharray: 0.085 0.915;
  stroke-dashoffset: -0.24;
  stroke-width: 1.5;
  stroke-linecap: round;
  opacity: 0.5;
}

.energy-signal-secondary {
  stroke-dashoffset: -0.72;
}

.digital-core {
  --precision-play: paused;
}

.digital-core[data-motion-running='true'] {
  --precision-play: running;
}

@media (prefers-reduced-motion: no-preference) {
  .core-stage[data-magnetic-enabled='true'] .magnetic-core {
    transition: transform 300ms ease-out;
  }

  .core-stage[data-magnetic-enabled='true'] .magnetic-core[data-tracking] {
    transition-duration: 190ms;
  }

  .ambient-glow {
    animation: breathe 6s ease-in-out infinite var(--precision-play);
  }

  @media (min-width: 48rem) {
    .orbital-arcs {
      transform-origin: 50% 50%;
      animation: orbit 32s linear infinite var(--precision-play);
    }

    .central-energy {
      animation: breathe 6s ease-in-out infinite var(--precision-play);
    }

    .energy-signal {
      animation: signal 6s linear infinite var(--precision-play);
    }

    .energy-signal-secondary {
      animation-delay: -3s;
    }

    .energy-node {
      animation: node 6s ease-in-out var(--node-delay) infinite var(--precision-play);
    }
  }
}

@keyframes orbit {
  to {
    transform: rotate(1turn);
  }
}

@keyframes breathe {
  0%,
  100% {
    opacity: 0.76;
  }

  50% {
    opacity: 1;
  }
}

@keyframes signal {
  0% {
    stroke-dashoffset: 0.085;
    opacity: 0;
  }

  16%,
  72% {
    opacity: 0.72;
  }

  90%,
  100% {
    stroke-dashoffset: -0.92;
    opacity: 0;
  }
}

@keyframes node {
  0%,
  100% {
    opacity: 0.7;
  }

  33% {
    opacity: 1;
  }
}
</style>
