<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'

type ButtonAction =
  | { kind: 'button'; type?: 'button' | 'submit' | 'reset'; disabled?: boolean }
  | { kind: 'route'; to: RouteLocationRaw }
  | { kind: 'external'; href: string; newTab?: boolean }

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    action?: ButtonAction
  }>(),
  {
    variant: 'primary',
    size: 'md',
    action: () => ({ kind: 'button' }) satisfies ButtonAction,
  },
)

defineSlots<{
  default?(): unknown
  leading?(): unknown
  trailing?(): unknown
}>()

const emit = defineEmits<{ click: [event: MouseEvent] }>()
const attrs = useAttrs()
const actionAttrs = new Set([
  'href',
  'target',
  'rel',
  'to',
  'custom',
  'type',
  'disabled',
  'aria-disabled',
])

function forwardedAttrs() {
  return Object.fromEntries(Object.entries(attrs).filter(([key]) => !actionAttrs.has(key)))
}

function getExternalHref(value: unknown) {
  if (typeof value !== 'string') return undefined

  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : undefined
  } catch {
    return undefined
  }
}

const root = computed(() => {
  const { action } = props

  if (action.kind === 'route') {
    return { tag: RouterLink, attrs: { to: action.to }, interactive: true } as const
  }

  if (action.kind === 'external') {
    const href = getExternalHref(action.href)
    const newTab = href && action.newTab

    return {
      tag: 'a',
      attrs: {
        href,
        target: newTab ? '_blank' : undefined,
        rel: newTab ? 'noopener noreferrer' : undefined,
      },
      interactive: Boolean(href),
    } as const
  }

  return {
    tag: 'button',
    attrs: { type: action.type ?? 'button', disabled: action.disabled ?? false },
    interactive: !action.disabled,
  } as const
})

function handleClick(event: MouseEvent) {
  if (root.value.interactive) emit('click', event)
}
</script>

<template>
  <component
    :is="root.tag"
    v-bind="{ ...forwardedAttrs(), ...root.attrs }"
    class="base-button"
    :data-variant="variant"
    :data-size="size"
    @click="handleClick"
  >
    <span v-if="$slots.leading" class="base-button__icon" aria-hidden="true">
      <slot name="leading" />
    </span>
    <span v-if="$slots.default" class="base-button__label"><slot /></span>
    <span v-if="$slots.trailing" class="base-button__icon" aria-hidden="true">
      <slot name="trailing" />
    </span>
  </component>
</template>

<style scoped>
@reference '../../assets/styles/main.css';

.base-button {
  @apply inline-flex min-h-target min-w-target max-w-full items-center justify-center gap-2 rounded-md border border-transparent py-2 text-center text-caption font-semibold;
  --button-icon-size: calc(var(--spacing) * 4);
  background-color: var(--button-background);
  border-color: var(--button-border, transparent);
  color: var(--button-foreground, var(--color-foreground));
}

.base-button[data-size='sm'] {
  @apply px-3;
}

.base-button[data-size='md'] {
  @apply px-4;
  min-block-size: max(var(--spacing-target), calc(var(--spacing) * 12));
}

.base-button[data-size='lg'] {
  @apply px-5 text-body;
  min-block-size: max(var(--spacing-target), calc(var(--spacing) * 14));
  --button-icon-size: calc(var(--spacing) * 5);
}

.base-button__label {
  @apply min-w-0 wrap-anywhere;
}

.base-button__icon {
  @apply inline-flex shrink-0;
}

.base-button__icon :slotted(svg) {
  inline-size: var(--button-icon-size);
  block-size: var(--button-icon-size);
}

.base-button[data-variant='primary'] {
  --button-background: var(--color-primary);
  --button-hover: var(--color-primary-hover);
  --button-active: var(--color-primary-active);
  --button-border: var(--color-primary);
  --button-foreground: var(--color-on-primary);
}

.base-button[data-variant='secondary'] {
  --button-background: var(--color-surface);
  --button-border: var(--color-control-border);
}

.base-button[data-variant='ghost'] {
  --button-background: transparent;
}

a.base-button[data-variant='ghost'][href] {
  @apply underline underline-offset-4;
}

.base-button:where(button:enabled, a[href]) {
  cursor: pointer;
}

@media (hover: hover) {
  .base-button:where(button:enabled, a[href]):hover {
    background-color: var(--button-hover, var(--color-interactive-hover));
  }
}

.base-button:where(button:enabled, a[href]):active {
  background-color: var(--button-active, var(--color-interactive-active));
}

.base-button:where(:disabled, a:not([href])) {
  background-color: var(--color-disabled-surface);
  border-color: var(--color-border);
  color: var(--color-disabled-foreground);
  cursor: not-allowed;
}

@media (prefers-reduced-motion: no-preference) {
  .base-button {
    transition: background-color var(--duration-interaction) var(--ease-interaction);
  }
}
</style>
