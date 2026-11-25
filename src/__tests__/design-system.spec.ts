import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import AppContainer from '@/components/layout/AppContainer.vue'
import BentoCard from '@/components/layout/BentoCard.vue'
import BentoGrid from '@/components/layout/BentoGrid.vue'
import SectionHeading from '@/components/shared/SectionHeading.vue'
import StatusIndicator from '@/components/shared/StatusIndicator.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'

enableAutoUnmount(afterEach)

describe('BaseButton', () => {
  it('defaults to a non-submitting primary button and preserves attributes and native clicks', async () => {
    const wrapper = mount(BaseButton, {
      attrs: { id: 'save', name: 'intent', 'aria-describedby': 'explanation' },
      slots: { default: 'Save' },
    })
    const button = wrapper.get('button')

    expect(button.text()).toBe('Save')
    expect(button.attributes()).toMatchObject({
      id: 'save',
      name: 'intent',
      type: 'button',
      'aria-describedby': 'explanation',
      'data-variant': 'primary',
      'data-size': 'md',
    })
    await button.trigger('click')
    expect(wrapper.emitted('click')).toEqual([[expect.any(MouseEvent)]])
  })

  it('supports an explicit submit type and does not emit activation when disabled', () => {
    const wrapper = mount(BaseButton, {
      props: { action: { kind: 'button', type: 'submit', disabled: true } },
      slots: { default: 'Send' },
    })
    const button = wrapper.get('button')

    expect(button.element.type).toBe('submit')
    expect(button.element.disabled).toBe(true)
    button.element.click()
    button.element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('names icon-only controls through the consumer and hides both icon slots', () => {
    const wrapper = mount(BaseButton, {
      props: { variant: 'ghost', size: 'sm' },
      attrs: { 'aria-label': 'Help' },
      slots: { leading: '<svg />', trailing: '<svg />' },
    })
    const button = wrapper.get('button')

    expect(button.attributes()).toMatchObject({
      'aria-label': 'Help',
      'data-variant': 'ghost',
      'data-size': 'sm',
    })
    expect(button.findAll('[aria-hidden="true"] svg')).toHaveLength(2)
  })

  it('renders an internal link and navigates with the router using a real href', async () => {
    const page = { render: () => null }
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: page },
        { path: '/pt', name: 'pt', component: page },
      ],
    })
    await router.push('/')

    const wrapper = mount(BaseButton, {
      props: { action: { kind: 'route', to: { name: 'pt', query: { ref: 'test' } } } },
      slots: { default: 'Início' },
      global: { plugins: [router] },
    })
    const link = wrapper.get('a')
    expect(link.attributes('href')).toBe('/pt?ref=test')
    expect(link.attributes('disabled')).toBeUndefined()

    await link.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe('/pt?ref=test')
  })

  it('lets external links use the current tab or open a new one with safe rel', async () => {
    const href = 'https://example.com/path'
    const wrapper = mount(BaseButton, {
      props: { action: { kind: 'external', href } },
      attrs: { hreflang: 'en', disabled: true, target: '_top', rel: 'opener' },
      slots: { default: 'Documentation' },
    })
    const link = wrapper.get('a')
    expect(link.attributes()).toMatchObject({ href, hreflang: 'en' })
    expect(link.attributes('target')).toBeUndefined()
    expect(link.attributes('disabled')).toBeUndefined()

    await wrapper.setProps({ action: { kind: 'external', href, newTab: true } })
    expect(link.attributes()).toMatchObject({ target: '_blank', rel: 'noopener noreferrer' })
  })

  it.each(['javascript:alert(1)', '/local', 'https://'])(
    'does not make an invalid external URL navigable: %s',
    async (href) => {
      const onClick = vi.fn<(event: MouseEvent) => void>()
      const wrapper = mount(BaseButton, {
        props: { action: { kind: 'external', href } },
        attrs: { href: 'https://example.com/', onClick },
        slots: { default: 'Invalid destination' },
      })
      const anchor = wrapper.get('a')
      expect(anchor.attributes('href')).toBeUndefined()
      expect(anchor.attributes('tabindex')).toBeUndefined()
      await anchor.trigger('click')
      expect(onClick).not.toHaveBeenCalled()
    },
  )
})

describe('presentation components', () => {
  it('renders a passive card with explicit element, variant and ordered slots', () => {
    const wrapper = mount(BaseCard, {
      props: { as: 'article', variant: 'featured' },
      attrs: { 'aria-labelledby': 'summary' },
      slots: { header: '<h2 id="summary">Summary</h2>', default: 'Content', footer: 'Metadata' },
    })
    const card = wrapper.get('article')

    expect(card.attributes()).toMatchObject({
      'aria-labelledby': 'summary',
      'data-variant': 'featured',
    })
    expect(card.attributes('tabindex')).toBeUndefined()
    expect(Array.from(card.element.children, (item) => item.textContent)).toEqual([
      'Summary',
      'Content',
      'Metadata',
    ])
  })

  it('renders a passive badge and allows its tone and language to be specified', async () => {
    const wrapper = mount(BaseBadge, { slots: { default: 'Layout' }, attrs: { lang: 'en' } })
    const badge = wrapper.get('span')
    expect(badge.text()).toBe('Layout')
    expect(badge.classes()).toContain('text-muted')
    expect(badge.attributes('lang')).toBe('en')
    expect(badge.attributes('role')).toBeUndefined()
    await wrapper.setProps({ variant: 'accent' })
    expect(badge.classes()).toContain('text-accent')
  })

  it('labels sections with a configurable heading, independent of its visual size', async () => {
    const wrapper = mount(SectionHeading, {
      props: { id: 'guide', title: 'Guide' },
    })
    expect(wrapper.get('h2#guide').text()).toBe('Guide')
    expect(wrapper.find('p').exists()).toBe(false)

    await wrapper.setProps({
      level: 3,
      size: 'display',
      eyebrow: 'Reference',
      description: 'Instructions and examples.',
    })
    expect(wrapper.get('h3#guide').text()).toBe('Guide')
    expect(wrapper.text()).toContain('Reference')
    expect(wrapper.text()).toContain('Instructions and examples.')
    expect(wrapper.find('h1').exists()).toBe(false)
  })

  it('uses readable status text without making the dot or a live region accessible', () => {
    const wrapper = mount(StatusIndicator, {
      props: { tone: 'success', label: 'Disponível' },
    })
    expect(wrapper.text()).toBe('Disponível')
    expect(wrapper.get('[aria-hidden="true"]').text()).toBe('')
    expect(wrapper.find('[role], [aria-live]').exists()).toBe(false)
  })
})

describe('layout components', () => {
  it('allows a nested non-landmark container to omit gutters', () => {
    const outer = mount(AppContainer, { slots: { default: 'Outer' } })
    const inner = mount(AppContainer, { props: { gutters: false }, slots: { default: 'Inner' } })
    expect(outer.get('div').classes()).toContain('site-gutters')
    expect(inner.get('div').classes()).not.toContain('site-gutters')
    expect(inner.text()).toBe('Inner')
  })

  it('keeps grid content in the supplied order', () => {
    const wrapper = mount(BentoGrid, {
      slots: { default: '<a href="/pt">A</a><a href="/en">B</a>' },
    })
    expect(wrapper.findAll('a').map((link) => link.text())).toEqual(['A', 'B'])
  })

  it('defaults to full-width spans and omits empty slots', () => {
    const wrapper = mount(BentoCard, { slots: { default: 'Content' } })
    const card = wrapper.get('div')
    expect(card.attributes('data-variant')).toBe('standard')
    expect(card.element.style.getPropertyValue('--bento-mobile')).toBe('4')
    expect(card.element.style.getPropertyValue('--bento-tablet')).toBe('8')
    expect(card.element.style.getPropertyValue('--bento-desktop')).toBe('12')
    expect(card.element.children).toHaveLength(1)
  })

  it('forwards custom spans, presentation and slots to one card', () => {
    const wrapper = mount(BentoCard, {
      props: { mobileSpan: 2, tabletSpan: 5, desktopSpan: 7, as: 'article', variant: 'elevated' },
      slots: { header: '<h2>Grid item</h2>', footer: '<a href="/en">Open</a>' },
    })
    const card = wrapper.get('article')
    expect(card.attributes('data-variant')).toBe('elevated')
    expect(card.element.style.getPropertyValue('--bento-mobile')).toBe('2')
    expect(card.element.style.getPropertyValue('--bento-tablet')).toBe('5')
    expect(card.element.style.getPropertyValue('--bento-desktop')).toBe('7')
    expect(card.get('h2').text()).toBe('Grid item')
    expect(card.get('a').attributes('href')).toBe('/en')
  })

  it('falls back to a full row if runtime values would make invalid spans', () => {
    const wrapper = mount(BentoCard, {
      attrs: { mobileSpan: 5, tabletSpan: 2.5, desktopSpan: -1 },
    })
    const style = wrapper.get('div').element.style
    expect(style.getPropertyValue('--bento-mobile')).toBe('4')
    expect(style.getPropertyValue('--bento-tablet')).toBe('8')
    expect(style.getPropertyValue('--bento-desktop')).toBe('12')
  })
})
