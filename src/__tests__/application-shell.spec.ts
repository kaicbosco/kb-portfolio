import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import App from '@/App.vue'
import { createPortfolioI18n } from '@/i18n'
import { createPortfolioRouter } from '@/router'
import { scrollBehavior } from '@/router/scroll'

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

async function mountShell(path: string) {
  const router = createPortfolioRouter(createMemoryHistory())
  await router.push(path)
  const wrapper = mount(App, {
    attachTo: document.body,
    global: { plugins: [createPortfolioI18n(), router] },
  })
  return { router, wrapper }
}

describe('application shell', () => {
  it('shares landmarks and exposes only published destinations', async () => {
    const { router, wrapper } = await mountShell('/pt/nao-existe')

    try {
      expect(wrapper.findAll('header')).toHaveLength(1)
      expect(wrapper.findAll('main')).toHaveLength(1)
      expect(wrapper.findAll('footer')).toHaveLength(1)
      const brand = wrapper.get('header a[aria-label="KB. Portfolio"]')
      expect(brand.text()).toBe('KB.')
      expect(brand.attributes('href')).toBe('/pt')
      const nav = wrapper.get('nav[aria-label="Navegação principal"]')
      expect(nav.findAll('a').map((link) => [link.text(), link.attributes('href')])).toEqual([
        ['Início', '/pt'],
      ])
      expect(nav.get('a').attributes('aria-current')).toBeUndefined()
      expect(wrapper.get('footer small').text()).toMatch(/^© \d{4} Kaíque Bosco$/)
      expect(wrapper.findAll('footer a').map((link) => link.attributes('href'))).toEqual([
        'https://github.com/kaicbosco',
        'https://www.linkedin.com/in/kaique-bosco-araujo/',
      ])

      await router.push('/en?ref=profile#missing')
      expect(brand.attributes('href')).toBe('/en')
      const home = wrapper.get('nav[aria-label="Main navigation"] a')
      expect(home.text()).toBe('Home')
      expect(home.attributes('aria-current')).toBe('page')
      const languages = wrapper.get('nav[aria-label="Languages"]')
      expect(languages.get('[aria-current="true"]').attributes('lang')).toBe('en')
      const alternate = languages.get('a')
      expect(alternate.attributes('hreflang')).toBe('pt-BR')
      expect(alternate.attributes('href')).toBe('/pt?ref=profile#missing')
      await alternate.trigger('click')
      await flushPromises()
      expect(document.documentElement.lang).toBe('pt-BR')
      expect(document.activeElement).toBe(wrapper.get('main').element)
    } finally {
      wrapper.unmount()
    }
  })

  it('closes the disclosure on Escape, reselection, and route or language changes', async () => {
    const { router, wrapper } = await mountShell('/pt')

    try {
      const toggle = wrapper.get<HTMLButtonElement>('button[aria-controls]')
      const panel = wrapper.get(`#${toggle.attributes('aria-controls')}`)
      const link = panel.get<HTMLAnchorElement>('a')
      expect(panel.isVisible()).toBe(false)
      expect(toggle.attributes('aria-expanded')).toBe('false')

      await toggle.trigger('click')
      expect(panel.isVisible()).toBe(true)
      expect(toggle.attributes('aria-label')).toBe('Fechar menu de navegação')
      expect(toggle.attributes('aria-expanded')).toBe('true')
      link.element.focus()
      await link.trigger('keydown', { key: 'Escape' })
      expect(document.activeElement).toBe(toggle.element)
      expect(panel.isVisible()).toBe(false)

      await toggle.trigger('click')
      link.element.focus()
      await link.trigger('click')
      await flushPromises()
      expect(panel.isVisible()).toBe(false)
      expect(document.activeElement).toBe(toggle.element)

      await toggle.trigger('click')
      await router.push('/pt?ref=menu')
      expect(panel.isVisible()).toBe(false)
      expect(document.activeElement).toBe(toggle.element)

      await toggle.trigger('click')
      await router.push('/en/projects/menu')
      expect(panel.isVisible()).toBe(false)
      expect(toggle.attributes('aria-label')).toBe('Open navigation menu')
      expect(document.activeElement).toBe(wrapper.get('main').element)
    } finally {
      wrapper.unmount()
    }
  })

  it('focuses a real fragment without adding a tab stop and leaves query-only focus intact', async () => {
    const { router, wrapper } = await mountShell('/pt')

    try {
      const heading = wrapper.get('h1')
      heading.element.id = 'seção:teste'
      await router.push('/pt#se%C3%A7%C3%A3o:teste')
      expect(heading.attributes('tabindex')).toBe('-1')
      expect(document.activeElement).toBe(heading.element)

      const link = wrapper.get<HTMLAnchorElement>('footer a')
      link.element.focus()
      await router.push('/pt?ref=footer#se%C3%A7%C3%A3o:teste')
      expect(document.activeElement).toBe(link.element)
      expect(heading.attributes('tabindex')).toBeUndefined()
      await router.push('/pt?ref=footer#missing')
      expect(document.activeElement).toBe(link.element)
    } finally {
      wrapper.unmount()
    }
  })
})

it('prioritizes saved positions, applies fragment offsets, and leaves query-only scroll intact', async () => {
  const { router, wrapper } = await mountShell('/pt')
  const root = document.documentElement
  root.style.scrollPaddingTop = '73px'

  try {
    const heading = wrapper.get('h1')
    heading.element.id = 'seção:teste'
    heading.element.style.scrollMarginTop = '4px'
    const from = router.currentRoute.value
    async function position(path: string, saved: { left: number; top: number } | null = null) {
      await router.push(path)
      return scrollBehavior(router.currentRoute.value, from, saved)
    }
    const saved = { left: 0, top: 200 }
    expect(await position('/pt#se%C3%A7%C3%A3o:teste', saved)).toBe(saved)
    expect(await position('/pt#se%C3%A7%C3%A3o:teste')).toEqual({ el: heading.element, top: 77 })
    expect(await position('/pt?ref=scroll')).toBe(false)
    expect(await position('/pt#missing')).toBe(false)
    expect(await position('/en#missing')).toEqual({ left: 0, top: 0 })
  } finally {
    root.style.removeProperty('scroll-padding-top')
    wrapper.unmount()
  }
})
