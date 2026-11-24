import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import App from '@/App.vue'
import { createPortfolioI18n } from '@/i18n'
import { createPortfolioRouter } from '@/router'
import { languageTarget } from '@/router/languageTarget'

function createTestRouter() {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  return createPortfolioRouter(createMemoryHistory())
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('portfolio router', () => {
  it('redirects the root to Portuguese and retains the query and fragment', async () => {
    const router = createTestRouter()
    await router.push('/?ref=profile#top')

    const current = router.currentRoute.value
    expect(current.fullPath).toBe('/pt?ref=profile#top')
    expect(current.meta.locale).toBe('pt')
    expect(router.resolve(languageTarget(current, 'en')).fullPath).toBe('/en?ref=profile#top')
  })

  it.each([
    ['/en/unknown', 'en'],
    ['/pt/unknown', 'pt'],
    ['/outside', 'pt'],
  ])('resolves %s as a 404 without losing the original path', async (path, locale) => {
    const router = createTestRouter()
    await router.push(path)

    expect(router.currentRoute.value.path).toBe(path)
    expect(router.currentRoute.value.meta).toMatchObject({ locale, page: 'notFound' })
  })

  it('resolves the equivalent project URL, keeping its encoded slug, query and fragment', async () => {
    const router = createTestRouter()
    await router.push('/pt/projetos/projeto%20web?ref=profile#details')

    const current = router.currentRoute.value
    expect(current.params.slug).toBe('projeto web')
    expect(router.resolve(languageTarget(current, 'en')).fullPath).toBe(
      '/en/projects/projeto%20web?ref=profile#details',
    )
  })
})

describe('portfolio app', () => {
  it('synchronizes route, rendered messages and document metadata', async () => {
    const router = createTestRouter()
    await router.push('/en/projects/codex-usage')
    const wrapper = mount(App, {
      global: { plugins: [createPortfolioI18n(), router] },
    })

    try {
      expect(wrapper.get('h1').text()).toBe('Project')
      expect(wrapper.get('code').text()).toBe('codex-usage')
      expect(wrapper.get('nav').attributes('aria-label')).toBe('Languages')
      expect(document.documentElement.lang).toBe('en')
      expect(document.title).toBe('Project | KB. Portfolio')

      await router.push('/pt/nao-existe')

      expect(wrapper.get('h1').text()).toBe('Página não encontrada')
      expect(wrapper.get('main a').attributes('href')).toBe('/pt')
      expect(wrapper.get('nav a').attributes('href')).toBe('/en')
      expect(document.documentElement.lang).toBe('pt-BR')
      expect(document.title).toBe('Página não encontrada | KB. Portfolio')
    } finally {
      wrapper.unmount()
    }
  })
})
