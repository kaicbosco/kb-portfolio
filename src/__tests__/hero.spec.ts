import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { createMemoryHistory } from 'vue-router'
import App from '@/App.vue'
import DigitalCore from '@/components/hero/DigitalCore.vue'
import HeroSection from '@/components/hero/HeroSection.vue'
import { createPortfolioI18n } from '@/i18n'
import { createPortfolioRouter } from '@/router'

const motionControl = '.digital-core button'
const geometry = '.core-stage'

class MediaQuery extends EventTarget {
  constructor(public matches: boolean) {
    super()
  }

  change(matches: boolean) {
    this.matches = matches
    this.dispatchEvent(Object.assign(new Event('change'), { matches }))
  }
}

function mockBrowser({ reduced = false, preciseDesktop = true } = {}) {
  const system = new MediaQuery(reduced)
  const desktop = new MediaQuery(preciseDesktop)
  const removeSystemListener = vi.spyOn(system, 'removeEventListener')
  const removeDesktopListener = vi.spyOn(desktop, 'removeEventListener')
  const removeDocumentListener = vi.spyOn(document, 'removeEventListener')
  vi.stubGlobal('matchMedia', (query: string) => {
    if (query.includes('prefers-reduced-motion')) return system
    if (query.includes('pointer: fine')) return desktop
    return new MediaQuery(true)
  })

  const observers = new Map<Element, (entries: { isIntersecting: boolean }[]) => void>()
  const disconnect = vi.fn<() => void>()
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(private callback: (entries: { isIntersecting: boolean }[]) => void) {}

      observe(target: Element) {
        observers.set(target, this.callback)
      }

      disconnect = disconnect
    },
  )

  const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
  const frames = new Map<number, FrameRequestCallback>()
  let lastFrame = 0
  const requestFrame = vi.fn<(callback: FrameRequestCallback) => number>((callback) => {
    frames.set(++lastFrame, callback)
    return lastFrame
  })
  const cancelFrame = vi.fn<(id: number) => void>((id) => {
    frames.delete(id)
  })
  vi.stubGlobal('requestAnimationFrame', requestFrame)
  vi.stubGlobal('cancelAnimationFrame', cancelFrame)

  return {
    system,
    desktop,
    disconnect,
    removeSystemListener,
    removeDesktopListener,
    removeDocumentListener,
    requestFrame,
    cancelFrame,
    intersect: (target: Element, isIntersecting: boolean) =>
      observers.get(target)?.([{ isIntersecting }]),
    showPage(visible: boolean) {
      visibility.mockReturnValue(visible ? 'visible' : 'hidden')
      document.dispatchEvent(new Event('visibilitychange'))
    },
    paintFrame() {
      for (const [id, callback] of frames) {
        frames.delete(id)
        callback(0)
      }
    },
  }
}

function mountHero() {
  return mount(HeroSection, { global: { plugins: [createPortfolioI18n()] } })
}

function movePointer(stage: Element, clientX: number, clientY: number, pointerType = 'mouse') {
  stage.dispatchEvent(
    new PointerEvent('pointermove', { clientX, clientY, pointerType, bubbles: true }),
  )
}

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('Hero', () => {
  it('renders the approved content, semantics, status and CTA contracts in both routes', async () => {
    const router = createPortfolioRouter(createMemoryHistory())
    await router.push('/pt')
    const wrapper = mount(App, { global: { plugins: [createPortfolioI18n(), router] } })

    try {
      for (const [path, title, intro, cards, links] of [
        [
          '/pt',
          'Desenvolvedor Frontend',
          [
            'Disponível para oportunidades profissionais',
            '01 / APRESENTAÇÃO',
            'Estudante de Engenharia de Software',
            'Desenvolvo aplicações web com foco em arquitetura frontend, interfaces reutilizáveis e qualidade de software. Transformo requisitos complexos em experiências digitais funcionais e bem estruturadas.',
          ],
          [
            ['ÁREA DE ATUAÇÃO', 'Desenvolvimento Frontend', 'Arquitetura e interfaces'],
            ['STACK PRINCIPAL', 'Vue · TypeScript', 'Ecossistema web moderno'],
            ['FORMAÇÃO', 'Engenharia de Software', 'Graduação em andamento'],
            ['MODELO DE TRABALHO', 'Remoto', 'Oportunidades internacionais'],
          ],
          ['Ver GitHub', 'Conectar no LinkedIn'],
        ],
        [
          '/en',
          'Frontend Developer',
          [
            'Open to work opportunities',
            '01 / INTRODUCTION',
            'Software Engineering Student',
            'I build web applications focused on frontend architecture, reusable interfaces, and software quality. I turn complex requirements into functional, well-structured digital experiences.',
          ],
          [
            ['FOCUS', 'Frontend Development', 'Architecture & Interfaces'],
            ['PRIMARY STACK', 'Vue · TypeScript', 'Modern Web Ecosystem'],
            ['EDUCATION', 'Software Engineering', 'Undergraduate Student'],
            ['WORK MODEL', 'Remote', 'Open to Global Opportunities'],
          ],
          ['View GitHub', 'Connect on LinkedIn'],
        ],
      ] as const) {
        await router.push(path)
        await flushPromises()
        const hero = wrapper.get('main section')
        expect(wrapper.findAll('main')).toHaveLength(1)
        expect(hero.findAll('h1')).toHaveLength(1)
        expect(hero.findAll('h1 br')).toHaveLength(1)
        expect(hero.get('h1').text()).toMatch(/^Kaíque\s+Bosco\.$/)
        expect(hero.attributes('aria-labelledby')).toBe(hero.get('h1').attributes('id'))
        expect(document.title).toBe(`Kaíque Bosco — ${title}`)
        expect(document.documentElement.lang).toBe(path === '/pt' ? 'pt-BR' : 'en')
        const introduction = hero.get('.hero-intro')
        for (const text of [...intro, title]) expect(introduction.text()).toContain(text)
        expect(introduction.get('.bg-success').attributes('aria-hidden')).toBe('true')

        const items = hero.findAll('[role="list"] > [role="listitem"]')
        expect(items).toHaveLength(4)
        expect(items.map((item) => item.findAll('h2, p').map((text) => text.text()))).toEqual(cards)
        expect(hero.findAll('[role="list"] :is(a, button, [tabindex])')).toHaveLength(0)
        expect(
          introduction
            .findAll('a')
            .map((link) => [
              link.text(),
              link.attributes('href'),
              link.attributes('target'),
              link.attributes('rel'),
            ]),
        ).toEqual([
          [links[0], 'https://github.com/kaicbosco', '_blank', 'noopener noreferrer'],
          [
            links[1],
            'https://www.linkedin.com/in/kaique-bosco-araujo/',
            '_blank',
            'noopener noreferrer',
          ],
        ])
      }
    } finally {
      wrapper.unmount()
    }
  })

  it('preserves the manual choice through locale changes and a route remount', async () => {
    const browser = mockBrowser()
    const router = createPortfolioRouter(createMemoryHistory())
    await router.push('/pt')
    const wrapper = mount(App, { global: { plugins: [createPortfolioI18n(), router] } })
    await nextTick()
    try {
      const stage = wrapper.get(geometry).element
      browser.intersect(stage, true)
      await nextTick()
      expect(wrapper.get(motionControl).text()).toBe('Pausar animações')
      await wrapper.get(motionControl).trigger('click')
      expect(wrapper.get('.digital-core').attributes('data-motion-running')).toBe('false')
      await router.push('/en')
      await flushPromises()
      expect(wrapper.get(geometry).element).toBe(stage)
      expect(wrapper.get(motionControl).text()).toBe('Enable animations')
      await router.push('/en/projects/codex-usage')
      await router.push('/en')
      await flushPromises()
      expect(wrapper.get(geometry).element).not.toBe(stage)
      expect(wrapper.get('main section').attributes('data-entering')).toBe('false')
      expect(wrapper.get(motionControl).text()).toBe('Enable animations')
      browser.intersect(wrapper.get(geometry).element, true)
      await wrapper.get(motionControl).trigger('click')
      expect(wrapper.get('.digital-core').attributes('data-motion-running')).toBe('true')
      expect(wrapper.get(motionControl).text()).toBe('Pause animations')
    } finally {
      wrapper.unmount()
    }
  })

  it('combines intersection, tab visibility, manual pause and dynamic system preference', async () => {
    const browser = mockBrowser({ reduced: true })
    const wrapper = mountHero()
    const stage = wrapper.get(geometry).element
    const running = () => wrapper.get('.digital-core').attributes('data-motion-running')
    const control = wrapper.get<HTMLButtonElement>(motionControl)
    try {
      expect(running()).toBe('false')
      browser.intersect(stage, true)
      await nextTick()
      expect(running()).toBe('false')
      expect(control.element.disabled).toBe(true)
      expect(control.text()).toBe('Animações desativadas pelo sistema')

      browser.system.change(false)
      await nextTick()
      expect(running()).toBe('true')
      expect(wrapper.attributes('data-entering')).toBe('false')

      browser.showPage(false)
      await nextTick()
      expect(running()).toBe('false')
      expect(control.text()).toBe('Pausar animações')
      browser.intersect(stage, false)
      browser.showPage(true)
      await nextTick()
      expect(running()).toBe('false')
      browser.intersect(stage, true)
      await nextTick()
      expect(running()).toBe('true')

      await control.trigger('click')
      browser.system.change(true)
      await nextTick()
      expect(control.element.disabled).toBe(true)
      await control.trigger('click')
      browser.system.change(false)
      await nextTick()
      expect(control.text()).toBe('Ativar animações')
      expect(running()).toBe('false')
      await control.trigger('click')
      expect(running()).toBe('true')
    } finally {
      wrapper.unmount()
    }
  })

  it('updates only the magnetic layer once per frame, clamps motion and resets on interruption', async () => {
    const browser = mockBrowser()
    const wrapper = mountHero()
    const stage = wrapper.get(geometry).element
    const core = wrapper.get<HTMLElement>('.magnetic-core').element
    const frame = wrapper.get('.static-frame').element
    const orbit = wrapper.get('.orbital-arcs').element
    vi.spyOn(stage, 'getBoundingClientRect').mockReturnValue(new DOMRect(30, 40, 200, 100))
    try {
      browser.intersect(stage, true)
      await nextTick()
      movePointer(stage, 130, 90, 'touch')
      expect(browser.requestFrame).not.toHaveBeenCalled()
      movePointer(stage, 130, 90)
      browser.paintFrame()
      expect(core.style.transform).toBe('translate(0px, 0px) rotateX(0deg) rotateY(0deg)')
      movePointer(stage, 300, 20)
      movePointer(stage, 180, 65)
      expect(browser.requestFrame).toHaveBeenCalledTimes(2)
      browser.paintFrame()
      expect(core.style.transform).toBe('translate(2.5px, -2.5px) rotateX(3deg) rotateY(3deg)')
      movePointer(stage, 300, 20)
      browser.paintFrame()
      expect(core.style.transform).toBe('translate(5px, -5px) rotateX(6deg) rotateY(6deg)')
      expect(frame.parentElement).toBe(stage)
      expect(frame.getAttribute('style')).toBeNull()
      expect(stage.getAttribute('style')).toBeNull()
      expect(core.contains(orbit)).toBe(true)
      expect(orbit.getAttribute('style')).toBeNull()

      for (const [interrupt, resume] of [
        [() => stage.dispatchEvent(new Event('pointerleave')), () => {}],
        [() => stage.dispatchEvent(new Event('pointercancel')), () => {}],
        [() => browser.desktop.change(false), () => browser.desktop.change(true)],
        [() => browser.system.change(true), () => browser.system.change(false)],
        [() => browser.intersect(stage, false), () => browser.intersect(stage, true)],
        [() => browser.showPage(false), () => browser.showPage(true)],
        [
          () => wrapper.get(motionControl).trigger('click'),
          () => wrapper.get(motionControl).trigger('click'),
        ],
      ] as const) {
        movePointer(stage, 30, 40)
        browser.paintFrame()
        expect(core.style.transform).toBe('translate(-5px, -5px) rotateX(6deg) rotateY(-6deg)')
        movePointer(stage, 100, 100)
        await interrupt()
        await nextTick()
        browser.paintFrame()
        expect(core.style.transform).toBe('')
        expect(core.hasAttribute('data-tracking')).toBe(false)
        await resume()
        await nextTick()
      }

      movePointer(stage, 30, 40)
      browser.paintFrame()
      movePointer(stage, 100, 100)
    } finally {
      wrapper.unmount()
    }
    expect(core.style.transform).toBe('')
    expect(browser.cancelFrame).toHaveBeenCalledTimes(8)
    expect(browser.disconnect).toHaveBeenCalledOnce()
    expect(browser.removeSystemListener).toHaveBeenCalledWith('change', expect.any(Function))
    expect(browser.removeDesktopListener).toHaveBeenCalledWith('change', expect.any(Function))
    expect(browser.removeDocumentListener).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function),
    )
    const requestsBefore = browser.requestFrame.mock.calls.length
    movePointer(stage, 200, 80)
    expect(browser.requestFrame).toHaveBeenCalledTimes(requestsBefore)
  })

  it('keeps the full static figure without browser APIs and gives SVG paint servers unique IDs', () => {
    const wrapper = mountHero()
    const pair = mount(
      {
        components: { DigitalCore },
        template:
          '<DigitalCore motion-preference="reduced" /><DigitalCore motion-preference="reduced" />',
      },
      { global: { plugins: [createPortfolioI18n()] } },
    )
    try {
      expect(wrapper.get<HTMLButtonElement>(motionControl).element.disabled).toBe(true)
      expect(wrapper.get(motionControl).text()).toBe('Animações indisponíveis')
      expect(wrapper.get('.core-entrance').attributes('aria-hidden')).toBe('true')
      expect(wrapper.get('.static-frame').text()).toBe('FIG.01 / DIGITAL COREKB.CORE / 001')
      expect(wrapper.findAll('.energy-node')).toHaveLength(6)
      expect(wrapper.findAll('.orbital-arcs path')).toHaveLength(1)
      const ids = pair.findAll('defs [id]').map((definition) => definition.attributes('id'))
      expect(ids).toHaveLength(8)
      expect(new Set(ids).size).toBe(ids.length)
    } finally {
      wrapper.unmount()
      pair.unmount()
    }
  })
})
