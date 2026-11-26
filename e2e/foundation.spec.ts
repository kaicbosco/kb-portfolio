import { expect, test } from '@playwright/test'

test('redirects the root and provides a keyboard shortcut to the main content', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page).toHaveURL(/\/pt$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  await expect(page).toHaveTitle('Kaíque Bosco — Desenvolvedor Frontend')
  await expect(page.getByRole('heading', { level: 1, name: 'Kaíque Bosco.' })).toBeVisible()

  const skipLink = page.getByRole('link', { name: 'Pular para o conteúdo' })
  await page.keyboard.press('Tab')
  await expect(skipLink).toBeFocused()
  await expect(skipLink).toHaveCSS('outline-style', 'solid')
  await expect(skipLink).toHaveCSS('outline-width', '2px')
  await expect(skipLink).toHaveCSS('outline-color', 'rgb(248, 113, 113)')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
})

test('opens a deep link and preserves the project when switching language', async ({ page }) => {
  const englishURL = '/en/projects/codex%20usage?ref=portfolio#details'
  await page.goto(englishURL)

  await expect(page.getByRole('heading', { level: 1, name: 'Project' })).toBeVisible()
  await expect(page).toHaveTitle('Project | KB. Portfolio')
  await page.getByRole('link', { name: 'Português (Brasil)' }).click()

  await expect(page).toHaveURL('/pt/projetos/codex%20usage?ref=portfolio#details')
  await expect(page.getByRole('heading', { level: 1, name: 'Projeto' })).toBeVisible()
  await expect(page.getByRole('main')).toBeFocused()
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  await expect(page.getByText('codex usage', { exact: true })).toBeVisible()

  await page.goBack()
  await expect(page).toHaveURL(englishURL)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('heading', { level: 1, name: 'Project' })).toBeVisible()
})

test('shows a localized 404 with a link to the matching home', async ({ page }) => {
  await page.goto('/en/missing')

  await expect(page).toHaveURL(/\/en\/missing$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  const backLink = page.getByRole('link', { name: 'Back to home' })
  const backIcon = backLink.locator('svg')
  await expect(backIcon).toBeVisible()
  await expect(backIcon).toHaveAttribute('aria-hidden', 'true')
  await backLink.click()
  await expect(page).toHaveURL(/\/en$/)
})

test('evaluates the responsive grid and loads the Fontsource assets locally', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  const fontURLs: URL[] = []
  page.on('response', (response) => {
    if (response.ok() && response.request().resourceType() === 'font') {
      fontURLs.push(new URL(response.url()))
    }
  })
  await page.goto('/pt/projetos/codex-usage')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projeto')

  const grid = page.getByRole('main').locator('.site-grid')
  const columns = () =>
    grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length)

  await expect.poll(columns).toBe(4)
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)

  await page.setViewportSize({ width: 1440, height: 900 })
  await expect.poll(columns).toBe(12)
  await expect(grid).toHaveCSS('max-width', '1280px')

  const localFonts = () =>
    fontURLs
      .filter((url) => url.origin === new URL(page.url()).origin)
      .map((url) => url.pathname)
      .join(' ')

  await expect.poll(localFonts).toContain('inter-latin-wght-normal')
  await expect.poll(localFonts).toContain('space-grotesk-latin-wght-normal')
  await expect.poll(localFonts).toContain('jetbrains-mono-latin-wght-normal')
})
