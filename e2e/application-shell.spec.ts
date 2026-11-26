import process from 'node:process'
import { expect, test, type Locator } from '@playwright/test'
import { readContrast } from './contrast'

const widths = [320, 375, 768, 1024, 1440] as const
const desktop = 1024

async function expectTarget(control: Locator) {
  const box = await control.boundingBox()
  expect(box?.width).toBeGreaterThanOrEqual(44)
  expect(box?.height).toBeGreaterThanOrEqual(44)
}

for (const width of widths) {
  test(`reflows both languages and keeps the short-page footer at ${width}px`, async ({ page }) => {
    const height = 850
    await page.setViewportSize({ width, height })
    for (const locale of ['pt', 'en']) {
      await page.goto(`/${locale}`)
      await expect(page.getByRole('main')).toHaveCount(1)
      const pt = locale === 'pt'
      const home = page
        .getByRole('navigation', { name: pt ? 'Navegação principal' : 'Main navigation' })
        .getByRole('link', { name: pt ? 'Início' : 'Home' })
      const button = page.getByRole('button', {
        name: pt ? 'Abrir menu de navegação' : 'Open navigation menu',
      })
      const languages = page.getByRole('navigation', { name: pt ? 'Idiomas' : 'Languages' })
      const footer = page.getByRole('contentinfo')
      const brand = page.getByRole('link', { name: 'KB. Portfolio' })
      await expect(brand).toHaveAttribute('href', `/${locale}`)
      await expect(page.getByRole('banner')).toHaveCSS('position', 'sticky')
      await expect(page.getByRole('banner')).toHaveCSS('height', width < desktop ? '65px' : '73px')
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
      expect((await footer.boundingBox())?.y).toBeGreaterThan(0)
      expect(await footer.evaluate((el) => el.getBoundingClientRect().bottom)).toBe(height)
      await expectTarget(brand)
      await expectTarget(languages.getByRole('link'))
      await expectTarget(footer.getByRole('link', { name: 'LinkedIn' }))
      if (width < desktop) {
        await expect(home).toHaveCount(0)
        await expectTarget(button)
        await button.click()
      } else {
        await expect(button).toHaveCount(0)
      }
      await expect(home).toHaveAttribute('aria-current', 'page')
      await expect(home).toHaveCSS('text-decoration-line', 'underline')
      await expectTarget(home)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    }
  })
}

test('opens by keyboard, closes on Escape, and skips the closed panel in Tab order', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/pt')
  const skip = page.getByRole('link', { name: 'Pular para o conteúdo' })
  const brand = page.getByRole('link', { name: 'KB. Portfolio' })
  const language = page.getByRole('link', { name: 'English' })
  const toggle = page.getByRole('button', { name: /menu de navegação/ })
  const home = page.getByRole('link', { name: 'Início', exact: true })
  for (const target of [skip, brand, language, toggle]) {
    await page.keyboard.press('Tab')
    await expect(target).toBeFocused()
    await expect(target).toHaveCSS('outline-width', '2px')
    expect((await readContrast(target)).focus).toBeGreaterThanOrEqual(3)
  }
  await expect(toggle).toHaveAccessibleName('Abrir menu de navegação')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'GitHub' })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Space')
  await expect(toggle).toHaveAccessibleName('Fechar menu de navegação')
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  const panelId = await toggle.getAttribute('aria-controls')
  await expect(page.locator(`#${panelId}`).getByRole('link')).toHaveCount(1)
  await page.keyboard.press('Tab')
  await expect(home).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(toggle).toBeFocused()
  await expect(home).toHaveCount(0)

  await page.keyboard.press('Enter')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(toggle).toBeFocused()
  await expect(page).toHaveURL('/pt')
})

test('closes and transfers focus between responsive controls on breakpoint changes', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1023, height: 850 })
  await page.goto('/en')
  const toggle = page.getByRole('button', { name: /navigation menu/ })
  const home = page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link')
  await toggle.click()
  await page.keyboard.press('Tab')
  await expect(home).toBeFocused()
  await page.setViewportSize({ width: 1024, height: 850 })
  await expect(home).toBeFocused()
  await expect(toggle).toHaveCount(0)
  await page.setViewportSize({ width: 1023, height: 850 })
  await expect(toggle).toBeFocused()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(home).toHaveCount(0)
  const footerLink = page.getByRole('link', { name: 'GitHub' })
  await footerLink.focus()
  await page.setViewportSize({ width: 1024, height: 850 })
  await expect(home).toBeVisible()
  await expect(footerLink).toBeFocused()
})

test('handles Home, localized 404, projects and language changes with the mobile panel open', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/en/missing')
  const main = page.getByRole('main')
  const toggle = page.getByRole('button', { name: /menu de navegação|navigation menu/ })
  const primary = page.getByRole('navigation', { name: /Navegação principal|Main navigation/ })
  await toggle.click()
  await expect(primary.getByRole('link')).not.toHaveAttribute('aria-current', 'page')
  await primary.getByRole('link', { name: 'Home' }).press('Enter')
  await expect(page).toHaveURL('/en')
  await expect(main).toBeFocused()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')

  await page.goto('/pt/projetos/codex%20usage?ref=profile#main-content')
  await toggle.click()
  await expect(primary.getByRole('link')).not.toHaveAttribute('aria-current', 'page')
  await page.getByRole('link', { name: 'English' }).press('Enter')
  await expect(page).toHaveURL('/en/projects/codex%20usage?ref=profile#main-content')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Project')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(main).toBeFocused()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await page.goBack()
  await expect(main).toBeFocused()
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  await page.goForward()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
})

test('restores history scroll and does not reset focus or scroll on query-only navigation', async ({
  page,
}) => {
  await page.goto('/en?ref=history')
  await page.addStyleTag({ content: 'main { min-height: 300vh; }' })
  const home = page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link')
  await home.focus()
  await page.evaluate(() => window.scrollTo(0, 600))
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL('/en')
  await expect(home).toBeFocused()
  expect(await page.evaluate(() => window.scrollY)).toBe(600)
  const banner = page.getByRole('banner')
  expect((await banner.boundingBox())?.y).toBe(0)

  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Português (Brasil)' })).toBeFocused()
  await page.evaluate(() => window.scrollTo(0, 600))
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL('/pt')
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  await page.goBack()
  await expect(page).toHaveURL('/en')
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(600)
  await expect(page.getByRole('main')).toBeFocused()
  await page.goForward()
  await expect(page).toHaveURL('/pt')
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
})

test('keeps focus visible beneath the sticky header and releases stickiness on low viewports', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/pt')
  // A long page and two adjacent controls without introducing public demo destinations.
  await page.getByRole('main').evaluate((main) => {
    const items = document.createElement('div')
    items.style.cssText = 'margin: 100vh 1rem; display: flex; gap: 1rem'
    for (const label of ['First focus target', 'Next focus target']) {
      const button = document.createElement('button')
      button.textContent = label
      items.append(button)
    }
    main.append(items)
  })
  const first = page.getByRole('button', { name: 'First focus target' })
  const next = page.getByRole('button', { name: 'Next focus target' })
  await first.evaluate((el) => {
    const top = el.getBoundingClientRect().top + window.scrollY - 45
    ;(el as HTMLButtonElement).focus({ preventScroll: true })
    window.scrollTo(0, top)
  })
  await page.keyboard.press('Tab')
  await expect(next).toBeFocused()
  const banner = page.getByRole('banner')
  await expect
    .poll(async () => (await next.boundingBox())!.y - (await banner.boundingBox())!.height)
    .toBeGreaterThanOrEqual(4)

  await page.setViewportSize({ width: 375, height: 350 })
  await expect(banner).toHaveCSS('position', 'static')
  expect((await banner.boundingBox())?.y).toBeLessThan(0)
})

test('reflows long content and shell controls at 200% root text size', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  const slug = 'nome-de-projeto-muito-longo-'.repeat(8)
  await page.goto(`/pt/projetos/${slug}`)
  await page.addStyleTag({ content: ':root { font-size: 200%; }' })
  await page.getByRole('button', { name: 'Abrir menu de navegação' }).click()
  await expect(page.getByRole('link', { name: 'Início' })).toBeVisible()
  await expect(page.getByText(slug, { exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
  expect(
    await page.getByRole('contentinfo').evaluate((el) => el.getBoundingClientRect().top),
  ).toBeGreaterThanOrEqual(
    await page.getByRole('main').evaluate((el) => el.getBoundingClientRect().bottom),
  )
})

test('preserves Crimson Void contrast, interaction states and reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/en')
  const banner = page.getByRole('banner')
  const home = banner.getByRole('link', { name: 'Home', exact: true })
  await expect(home).not.toHaveCSS('transition-duration', '0s')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(home).toHaveCSS('transition-duration', '0s')
  const initial = await readContrast(home)
  await home.hover()
  const hover = await readContrast(home)
  await page.mouse.down()
  const active = await readContrast(home)
  await page.mouse.up()
  expect(hover.fill).not.toBe(initial.fill)
  expect(active.fill).not.toBe(hover.fill)
  for (const state of [initial, hover, active]) {
    expect(state.text).toBeGreaterThanOrEqual(4.5)
    expect(state.decoration).toBeGreaterThanOrEqual(3)
  }
  await page.mouse.move(0, 0)
  for (const item of [
    banner.getByText('.', { exact: true }),
    banner.getByRole('link', { name: 'Português (Brasil)' }),
    banner.locator('[aria-current="true"]'),
    page.getByRole('contentinfo').locator('small'),
    page.getByRole('link', { name: 'GitHub' }),
  ]) {
    expect((await readContrast(item)).text).toBeGreaterThanOrEqual(4.5)
  }
  await page.setViewportSize({ width: 375, height: 812 })
  const toggle = page.getByRole('button', { name: /navigation menu/ })
  await expect(toggle).toHaveCSS('transition-duration', '0s')
  await toggle.press('Space')
  await expect(home).toBeVisible()
  expect((await readContrast(home)).decoration).toBeGreaterThanOrEqual(3)
})

if (process.env.PLAYWRIGHT_SHELL_SCREENSHOTS === '1') {
  const screenshots = [
    { name: 'desktop-1440-pt', width: 1440, height: 900, url: '/pt' },
    { name: 'tablet-768-en', width: 768, height: 1024, url: '/en' },
    { name: 'mobile-375-closed-pt', width: 375, height: 812, url: '/pt' },
    { name: 'mobile-375-open-pt-focus', width: 375, height: 812, url: '/pt', open: true },
    { name: 'mobile-320-en-404', width: 320, height: 720, url: '/en/missing' },
    { name: 'desktop-1440-en-project', width: 1440, height: 900, url: '/en/projects/codex-usage' },
    { name: 'desktop-1440-en-skip-focus', width: 1440, height: 900, url: '/en', skip: true },
  ]
  for (const { name, width, height, url, open, skip } of screenshots) {
    test(`captures ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto(url)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      if (open) {
        await page.getByRole('button', { name: 'Abrir menu de navegação' }).press('Space')
        await page.keyboard.press('Tab')
        await expect(page.getByRole('link', { name: 'Início' })).toBeFocused()
      }
      if (skip) {
        await page.keyboard.press('Tab')
        await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
      }
      await page.screenshot({
        path: `review-receipts/application-shell/${name}.png`,
        fullPage: true,
        animations: 'disabled',
      })
    })
  }
}
