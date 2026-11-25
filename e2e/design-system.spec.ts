import process from 'node:process'
import { expect, test, type Locator } from '@playwright/test'

const path = '/dev/design-system'
const widths = [320, 375, 768, 1024, 1440] as const
const heights = { 320: 720, 375: 812, 768: 1024, 1024: 900, 1440: 900 }

for (const width of widths) {
  test(`lays out the components and long translations without overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: heights[width] })
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Crimson Void')
    await expect(page.getByRole('region', { name: 'Tokens visuais' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'StatusIndicator' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'BaseBadge' })).toBeVisible()
    await expect(page.getByText('Currently unavailable')).toBeVisible()
    await page.evaluate(() => document.fonts.ready)

    const grid = page.getByTestId('bento-grid')
    const count = width >= 1024 ? 12 : width >= 768 ? 8 : 4
    const expected = { 4: [4, 4, 2, 2, 4], 8: [5, 3, 4, 4, 8], 12: [7, 5, 6, 6, 12] }[count]
    const layout = await grid.evaluate((element) => ({
      columns: getComputedStyle(element).gridTemplateColumns.split(' ').length,
      flow: getComputedStyle(element).gridAutoFlow,
      gap: getComputedStyle(element).columnGap,
      items: Array.from(element.children, (item) => {
        const box = item.getBoundingClientRect()
        return {
          span: Number(getComputedStyle(item).gridColumnEnd.replace('span ', '')),
          contained: item.scrollWidth <= item.clientWidth,
          top: box.top,
          left: box.left,
        }
      }),
    }))

    expect(layout.columns).toBe(count)
    expect(layout.flow).toBe('row')
    expect(layout.gap).toBe(width >= 1024 ? '24px' : '16px')
    expect(layout.items.map((item) => item.span)).toEqual(expected)
    expect(layout.items.every((item) => item.contained)).toBe(true)
    const [first, second] = layout.items
    if (first && second) {
      if (count === 4) {
        expect(second.top).toBeGreaterThan(first.top)
      } else {
        expect(second.top).toBe(first.top)
        expect(second.left).toBeGreaterThan(first.left)
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)

    if (process.env.PLAYWRIGHT_DESIGN_SYSTEM_SCREENSHOTS === '1' && width !== 1024) {
      await page.screenshot({
        path: `review-receipts/crimson-void/design-system-${width}.png`,
        fullPage: true,
        animations: 'disabled',
      })
    }
  })
}

test('keeps native focus order, activations, accessible names and link destinations', async ({
  page,
}) => {
  await page.goto(path)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Crimson Void')
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Pular para o conteúdo' })
  await expect(skip).toBeFocused()
  await page.keyboard.press('Enter')
  const main = page.getByRole('main')
  await expect(main).toBeFocused()

  const buttons = main.getByRole('button', { name: /^(sm|md|lg) — (primary|secondary|ghost)$/ })
  await expect(buttons).toHaveCount(9)
  for (const button of await buttons.all()) {
    await page.keyboard.press('Tab')
    await expect(button).toBeFocused()
    await expect(button).toHaveCSS('outline-style', 'solid')
    await expect(button).toHaveCSS('outline-width', '2px')
    await expect(button).toHaveCSS('outline-offset', '2px')
    const result = await readContrast(button)
    expect(result.focus).toBeGreaterThanOrEqual(3)
    const rect = await button.boundingBox()
    expect(rect?.width).toBeGreaterThanOrEqual(44)
    expect(rect?.height).toBeGreaterThanOrEqual(44)
  }

  await page.keyboard.press('Space')
  await expect(page.getByText('Última ação: ghost · lg')).toBeVisible()
  const internal = main.getByRole('link', { name: 'Inicial PT' })
  const external = main.getByRole('link', { name: 'W3C WAI (nova aba)' })
  const disabled = main.getByRole('button', { name: 'Indisponível' })
  const iconOnly = main.getByRole('button', { name: 'Ajuda do playground' })
  const portuguese = main.getByRole('link', { name: 'Abrir a inicial em português' })
  const english = main.getByRole('link', { name: 'Open the English home page' })

  await expect(internal).toHaveAttribute('href', '/pt')
  await expect(external).toHaveAttribute('target', '_blank')
  await expect(external).toHaveAttribute('rel', 'noopener noreferrer')
  await expect(disabled).toBeDisabled()
  await expect(iconOnly.locator('[aria-hidden="true"] svg')).toHaveCSS('width', '16px')
  for (const item of [internal, external, iconOnly, portuguese, english]) {
    await page.keyboard.press('Tab')
    await expect(item).toBeFocused()
    expect((await readContrast(item)).focus).toBeGreaterThanOrEqual(3)
  }
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL('/en')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(main).toBeFocused()
})

test('reflows when the root text size is doubled', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto(path)
  await page.addStyleTag({ content: ':root { font-size: 200%; }' })
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open the English home page' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
})

test('disables button transitions for reduced motion without removing interaction', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto(path)
  const button = page.getByRole('button', { name: 'sm — primary', exact: true })
  await expect(button).toHaveCSS('transition-property', 'background-color')
  await expect(button).not.toHaveCSS('transition-duration', '0s')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(button).toHaveCSS('transition-duration', '0s')
  await button.click()
  await expect(page.getByText('Última ação: primary · sm')).toBeVisible()
})

async function readContrast(control: Locator) {
  return control.evaluate((element) => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) throw new Error('Cannot read rendered colors')
    const ctx = context

    function rgba(css: string) {
      ctx.clearRect(0, 0, 1, 1)
      ctx.fillStyle = css
      ctx.fillRect(0, 0, 1, 1)
      return ctx.getImageData(0, 0, 1, 1).data
    }

    function surface(node: Element | null): string {
      if (!node) throw new Error('Expected an opaque surface behind the control')
      const color = getComputedStyle(node).backgroundColor
      return rgba(color)[3] === 255 ? color : surface(node.parentElement)
    }

    function luminance(css: string) {
      const [r, g, b] = Array.from(rgba(css).slice(0, 3), (channel) => {
        const value = channel / 255
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
      })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    function ratio(a: string, b: string) {
      const [first, second] = [luminance(a), luminance(b)]
      return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
    }

    const style = getComputedStyle(element)
    const outside = surface(element.parentElement)
    return {
      fill: style.backgroundColor,
      text: ratio(style.color, surface(element)),
      border: ratio(style.borderTopColor, outside),
      focus: ratio(style.outlineColor, outside),
    }
  })
}

test('measures rendered text and control boundaries in the default, hover and active states', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(path)
  for (const variant of ['primary', 'secondary', 'ghost']) {
    const button = page.getByRole('button', { name: `md — ${variant}`, exact: true })
    await page.mouse.move(0, 0)
    const initial = await readContrast(button)
    await button.hover()
    const hover = await readContrast(button)
    await page.mouse.down()
    const active = await readContrast(button)
    await page.mouse.up()

    expect(hover.fill).not.toBe(initial.fill)
    expect(active.fill).not.toBe(hover.fill)
    for (const state of [initial, hover, active]) {
      expect(state.text).toBeGreaterThanOrEqual(4.5)
      if (variant !== 'ghost') expect(state.border).toBeGreaterThanOrEqual(3)
    }
  }

  const elevatedControl = page.getByRole('link', { name: 'Inicial PT' })
  expect((await readContrast(elevatedControl)).border).toBeGreaterThanOrEqual(3)
  for (const sample of [
    page.getByRole('button', { name: 'Indisponível' }),
    page.getByText('Acessibilidade', { exact: true }),
    page.getByText('Responsive layout', { exact: true }),
    page.getByText('Currently unavailable', { exact: true }),
    page.getByText('01 / FUNDAÇÃO', { exact: true }),
  ]) {
    expect((await readContrast(sample)).text).toBeGreaterThanOrEqual(4.5)
  }
})
