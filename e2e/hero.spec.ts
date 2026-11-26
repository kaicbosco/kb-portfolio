import process from 'node:process'
import { expect, test, type Locator, type Page } from '@playwright/test'
import { readContrast } from './contrast'

const sizes = [
  { width: 1920, height: 1080, cards: 4, device: 'desktop' },
  { width: 1440, height: 900, cards: 4, device: 'desktop' },
  { width: 1024, height: 768, cards: 4, device: 'desktop' },
  { width: 768, height: 1024, cards: 2, device: 'tablet' },
  { width: 375, height: 812, cards: 1, device: 'mobile' },
  { width: 320, height: 568, cards: 1, device: 'mobile' },
  { width: 1440, height: 350, cards: 4, device: 'short-desktop' },
] as const
const heroHeading = { level: 1, name: 'Kaíque Bosco.' }
const receipts = 'review-receipts/hero-digital-core'
const capture = process.env.PLAYWRIGHT_HERO_SCREENSHOTS === '1'

async function expectReflow(page: Page, cardsPerRow: number) {
  const main = page.getByRole('main')
  await expect(main).toHaveCount(1)
  await expect(main.getByRole('heading', heroHeading)).toBeVisible()
  await expect(main.getByRole('listitem')).toHaveCount(4)
  await page.evaluate(() => document.fonts.ready)

  const layout = await main.evaluate((element) => {
    const { clientWidth, scrollWidth } = document.documentElement
    const visibleContent = Array.from(
      element.querySelectorAll('h1, h2, p, a, button, .core-stage, [role="listitem"]'),
    )
    const overflows = visibleContent
      .filter((item) => {
        const box = item.getBoundingClientRect()
        return item.scrollWidth > item.clientWidth + 1 || box.left < 0 || box.right > clientWidth
      })
      .map((item) => item.textContent)
    const cardRows = new Map<number, Set<string>>()
    for (const card of element.querySelectorAll('[role="listitem"]')) {
      const row = card.getBoundingClientRect().top
      const textPositions = Array.from(
        card.querySelectorAll('h2, p'),
        (line) => line.getBoundingClientRect().top,
      )
      const positions = cardRows.get(row) ?? new Set<string>()
      positions.add(textPositions.join(','))
      cardRows.set(row, positions)
    }
    const heading = element.querySelector('h1')!
    const headingLines =
      heading.getBoundingClientRect().height / parseFloat(getComputedStyle(heading).lineHeight)
    const primaryGrid = element.querySelector('.hero-intro')!.parentElement!
    const columns = getComputedStyle(primaryGrid).gridTemplateColumns.split(' ').length
    return {
      clientWidth,
      scrollWidth,
      overflows,
      rows: cardRows.size,
      alignedCardText: Array.from(cardRows.values()).every((positions) => positions.size === 1),
      headingLines,
      columns,
    }
  })
  expect(layout.scrollWidth).toBe(layout.clientWidth)
  expect(layout.overflows).toEqual([])
  expect(layout.rows).toBe(4 / cardsPerRow)
  expect(layout.alignedCardText).toBe(true)
  expect(layout.headingLines).toBeCloseTo(2, 1)
  expect(layout.columns).toBe({ 1: 4, 2: 8, 4: 12 }[cardsPerRow])
}

for (const { width, height, cards, device } of sizes) {
  test(`reflows the bilingual Hero at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    for (const locale of ['pt', 'en']) {
      await page.goto(`/${locale}`)
      await expect(page.locator('html')).toHaveAttribute('lang', locale === 'pt' ? 'pt-BR' : 'en')
      await expect(page).toHaveTitle(
        locale === 'pt'
          ? 'Kaíque Bosco — Desenvolvedor Frontend'
          : 'Kaíque Bosco — Frontend Developer',
      )
      await expectReflow(page, cards)
      if (
        capture &&
        device !== 'short-desktop' &&
        !(locale === 'en' && [1920, 1024].includes(width))
      ) {
        await page.emulateMedia({ reducedMotion: 'no-preference' })
        await expect(
          page.getByRole('button', {
            name: locale === 'pt' ? 'Pausar animações' : 'Pause animations',
          }),
        ).toBeEnabled()
        await page.screenshot({
          path: `${receipts}/${device}-${width}-${locale}.png`,
          fullPage: true,
          animations: 'disabled',
        })
        await page.emulateMedia({ reducedMotion: 'reduce' })
      }
      await page.addStyleTag({ content: ':root { font-size: 200%; }' })
      await expectReflow(page, cards)
    }
  })
}

test('reflows at 320px with the root text size doubled', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const locale of ['pt', 'en']) {
    await page.goto(`/${locale}`)
    await page.addStyleTag({ content: ':root { font-size: 200%; }' })
    await expectReflow(page, 1)
    const eyebrow = page.locator('.hero-intro-eyebrow')
    await expect(eyebrow).toHaveCSS('font-size', '28px')
    await expect(page.locator('.hero-intro-description')).toHaveCSS('font-size', '32px')
  }
})

test('keeps the same figure and pause choice through a keyboard interaction and locale switch', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/pt')
  const main = page.getByRole('main')
  const primary = main.getByRole('link', { name: 'Ver GitHub' })
  const secondary = main.getByRole('link', { name: 'Conectar no LinkedIn' })
  const core = page.locator('.digital-core')
  const orbit = page.locator('.orbital-arcs')
  const control = main.getByRole('button')
  const skip = page.getByRole('link', { name: 'Pular para o conteúdo' })
  await expect(skip).toBeAttached()
  await page.keyboard.press('Tab')
  await expect(skip).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(main).toBeFocused()
  for (const [target, focusPath] of [
    [primary, 'desktop-primary-cta-focus'],
    [secondary, null],
    [control, 'desktop-motion-control-focus'],
  ] as const) {
    await page.keyboard.press('Tab')
    await expect(target).toBeFocused()
    await expect(target).toHaveCSS('outline-color', 'rgb(248, 113, 113)')
    expect(await target.evaluate((el) => el.matches(':focus-visible'))).toBe(true)
    expect((await target.boundingBox())!.height).toBeGreaterThanOrEqual(44)
    expect((await target.boundingBox())!.width).toBeGreaterThanOrEqual(44)
    expect((await target.boundingBox())!.y).toBeGreaterThan(
      (await page.getByRole('banner').boundingBox())!.height,
    )
    if (capture && focusPath) {
      await page.screenshot({ path: `${receipts}/${focusPath}.png`, animations: 'disabled' })
    }
  }
  for (const [link, href] of [
    [primary, 'https://github.com/kaicbosco'],
    [secondary, 'https://www.linkedin.com/in/kaique-bosco-araujo/'],
  ] as const) {
    await expect(link).toHaveAttribute('href', href)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  }
  await expect(control).toHaveAccessibleName('Pausar animações')
  await expect(core).toHaveAttribute('data-motion-running', 'true')
  await page.keyboard.press('Space')
  await expect(control).toHaveAccessibleName('Ativar animações')
  await expect(orbit).toHaveCSS('animation-play-state', 'paused')
  expect(
    await page.locator('.magnetic-core').evaluate((el) => getComputedStyle(el).transform),
  ).toBe('none')
  if (capture) {
    await page.screenshot({
      path: `${receipts}/desktop-motion-paused.png`,
      fullPage: true,
      animations: 'disabled',
    })
  }
  await page.keyboard.press('Enter')
  await expect(orbit).toHaveCSS('animation-play-state', 'running')
  await page.keyboard.press('Space')

  const frame = await page.locator('.static-frame').elementHandle()
  await page.getByRole('link', { name: 'English' }).press('Enter')
  await expect(page).toHaveURL('/en')
  await expect(main).toBeFocused()
  await expect(main.getByRole('link', { name: 'View GitHub' })).toBeVisible()
  await expect(main.getByRole('link', { name: 'Connect on LinkedIn' })).toBeVisible()
  await expect(control).toHaveAccessibleName('Enable animations')
  await expect(orbit).toHaveCSS('animation-play-state', 'paused')
  expect(await frame!.evaluate((el) => el === document.querySelector('.static-frame'))).toBe(true)
  await expect(page.locator('.hero')).toHaveAttribute('data-entering', 'false')
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
})

test('pauses Precision Motion when the Core leaves the viewport and resumes only when allowed', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 350 })
  await page.goto('/en')
  const stage = page.locator('.core-stage')
  const orbit = page.locator('.orbital-arcs')
  await expect(orbit).toHaveCSS('animation-play-state', 'running')
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await expect(stage).not.toBeInViewport()
  for (const layer of [
    '.orbital-arcs',
    '.ambient-glow',
    '.energy-signal',
    '.energy-node',
    '.central-energy',
  ]) {
    await expect(page.locator(layer).first()).toHaveCSS('animation-play-state', 'paused')
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect(orbit).toHaveCSS('animation-play-state', 'running')
  await page.getByRole('button', { name: 'Pause animations' }).press('Space')
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await expect(stage).not.toBeInViewport()
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect(stage).toBeInViewport()
  await expect(orbit).toHaveCSS('animation-play-state', 'paused')
  await expect(page.getByRole('button', { name: 'Enable animations' })).toBeEnabled()
})

test('keeps complete static geometry under system reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/en')
  const stage = page.locator('.core-stage')
  await expect(
    page.getByRole('button', { name: 'Animations disabled by system preference' }),
  ).toBeDisabled()
  await expect(page.locator('.hero')).toHaveAttribute('data-entering', 'false')
  for (const [selector, count] of [
    ['.static-frame text', 2],
    ['.magnetic-core > svg > g:first-of-type > circle', 2],
    ['.connectivity-mesh path', 4],
    ['.energy-node', 6],
    ['.orbital-arcs path', 1],
    ['.central-energy', 1],
  ] as const) {
    await expect(stage.locator(selector)).toHaveCount(count)
  }
  expect(await stage.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0)
  await stage.hover({ position: { x: 30, y: 30 } })
  await expect(stage).toHaveAttribute('data-magnetic-enabled', 'false')
  await expect(stage.locator('.magnetic-core')).toHaveCSS('transform', 'none')
  if (capture) {
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: `${receipts}/desktop-reduced-motion.png`, fullPage: true })
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(stage.locator('.orbital-arcs')).toHaveCSS('animation-play-state', 'running')
  await expect(page.locator('.hero')).toHaveAttribute('data-entering', 'false')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(stage.locator('.orbital-arcs')).toHaveCSS('animation-name', 'none')
})

async function measureFrame(stage: Locator) {
  return stage.evaluate((element) =>
    ['.static-frame', '.frame-outline', '.grid-matrix', '.technical-labels'].map((selector) => {
      const layer = element.querySelector(selector)!
      const { x, y, width, height } = layer.getBoundingClientRect()
      return { bounds: [x, y, width, height], transform: getComputedStyle(layer).transform }
    }),
  )
}

async function expectSettledMagnet(core: Locator, neutral: boolean) {
  await expect
    .poll(() =>
      core.evaluate((element) => {
        return {
          neutral: getComputedStyle(element).transform === 'none',
          changing: element.getAnimations().some((animation) => animation.playState === 'running'),
        }
      }),
    )
    .toEqual({ neutral, changing: false })
}

test('tilts only MagneticCore while orbital rotation runs independently of the frame', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/pt')
  await page.evaluate(() => document.fonts.ready)
  const stage = page.locator('.core-stage')
  const magnet = stage.locator('.magnetic-core')
  const orbit = stage.locator('.orbital-arcs')
  await expect(page.locator('.hero')).toHaveAttribute('data-entering', 'false')
  await expect(stage).toHaveAttribute('data-magnetic-enabled', 'true')
  await expect(orbit).toHaveCSS('animation-duration', '32s')
  await expect(orbit).toHaveCSS('animation-play-state', 'running')
  const rect = (await stage.boundingBox())!
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2)
  await expect(magnet).toHaveAttribute('data-tracking', '')
  await expectSettledMagnet(magnet, false)
  const staticFrame = await measureFrame(stage)
  const orbitalTime = await orbit.evaluate((el) => Number(el.getAnimations()[0]?.currentTime))

  if (capture) {
    // Freeze only the CSS orbit at a comparable phase. Leave the magnetic interaction active.
    await stage.evaluate((element) => {
      for (const animation of element.getAnimations({ subtree: true })) {
        animation.currentTime = 0
        animation.pause()
      }
    })
    await stage.screenshot({ path: `${receipts}/digital-core-neutral.png` })
  }

  for (const [fraction, label] of [
    [0.06, 'top-left'],
    [0.94, 'bottom-right'],
  ] as const) {
    const previous = await magnet.evaluate((el) => (el as HTMLElement).style.transform)
    await page.mouse.move(rect.x + rect.width * fraction, rect.y + rect.height * fraction)
    await expect
      .poll(() => magnet.evaluate((el) => (el as HTMLElement).style.transform))
      .not.toBe(previous)
    await expectSettledMagnet(magnet, false)
    const circle = (await magnet.locator('circle[r="161"]').boundingBox())!
    expect(circle.x).toBeGreaterThan(rect.x)
    expect(circle.y).toBeGreaterThan(rect.y)
    expect(circle.x + circle.width).toBeLessThan(rect.x + rect.width)
    expect(circle.y + circle.height).toBeLessThan(rect.y + rect.height)
    const currentFrame = await measureFrame(stage)
    currentFrame.forEach(({ bounds, transform }, index) => {
      expect(transform).toBe('none')
      bounds.forEach((coordinate, axis) =>
        expect(coordinate).toBeCloseTo(staticFrame[index]!.bounds[axis]!, 2),
      )
    })
    if (capture) await stage.screenshot({ path: `${receipts}/digital-core-magnetic-${label}.png` })
  }
  if (!capture) {
    await expect(orbit).toHaveCSS('animation-play-state', 'running')
    expect(
      await orbit.evaluate((el) => Number(el.getAnimations()[0]?.currentTime)),
    ).toBeGreaterThan(orbitalTime)
  }
  await page.mouse.move(0, 0)
  await expect(magnet).not.toHaveAttribute('data-tracking')
  await expectSettledMagnet(magnet, true)
  if (capture) await stage.screenshot({ path: `${receipts}/digital-core-returned-neutral.png` })
})

test('limits mobile motion to ambient glow and disables magnetic response on touch and tablet', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    hasTouch: true,
    viewport: { width: 375, height: 812 },
  })
  try {
    const page = await context.newPage()
    await page.goto('/pt')
    const stage = page.locator('.core-stage')
    await stage.scrollIntoViewIfNeeded()
    await expect(stage.locator('.ambient-glow')).toHaveCSS('animation-play-state', 'running')
    for (const layer of ['.orbital-arcs', '.energy-node', '.energy-signal']) {
      await expect(stage.locator(layer).first()).toHaveCSS('animation-name', 'none')
    }
    await expect(stage).toHaveAttribute('data-magnetic-enabled', 'false')
    await stage.tap()
    await expect(stage.locator('.magnetic-core')).toHaveCSS('transform', 'none')
    await page.setViewportSize({ width: 768, height: 1024 })
    await stage.scrollIntoViewIfNeeded()
    await expect(stage.locator('.orbital-arcs')).toHaveCSS('animation-play-state', 'running')
    await expect(stage).toHaveAttribute('data-magnetic-enabled', 'false')
    await page.setViewportSize({ width: 1440, height: 900 })
    await expect(stage).toHaveAttribute('data-magnetic-enabled', 'false')
  } finally {
    await context.close()
  }
})

test('measures rendered Hero contrast, including keyboard focus and button states', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/en')
  const main = page.getByRole('main')
  for (const text of [
    main.getByRole('heading', heroHeading),
    main.getByText('Frontend Developer', { exact: true }),
    main.getByText('Software Engineering Student'),
    main.getByText('01 / INTRODUCTION'),
    main.getByText('Open to work opportunities'),
    main.locator('.hero-intro-description'),
    ...(await main.locator('[role="listitem"] :is(h2, p)').all()),
  ]) {
    expect((await readContrast(text)).text).toBeGreaterThanOrEqual(4.5)
  }
  expect(
    (await readContrast(main.getByRole('heading', heroHeading).locator('span'))).text,
  ).toBeGreaterThanOrEqual(3)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const controls = [
    main.getByRole('link', { name: 'View GitHub' }),
    main.getByRole('link', { name: 'Connect on LinkedIn' }),
    main.getByRole('button'),
  ]
  for (const control of controls) {
    await page.mouse.move(0, 0)
    const resting = await readContrast(control)
    await control.hover()
    await expect.poll(async () => (await readContrast(control)).fill).not.toBe(resting.fill)
    const hover = await readContrast(control)
    await page.mouse.down()
    await expect.poll(async () => (await readContrast(control)).fill).not.toBe(hover.fill)
    const active = await readContrast(control)
    await page.mouse.move(0, 0)
    await page.mouse.up()
    for (const colors of [resting, hover, active]) expect(colors.text).toBeGreaterThanOrEqual(4.5)
    expect(resting.focus).toBeGreaterThanOrEqual(3)
    if (control !== controls[2]) expect(resting.border).toBeGreaterThanOrEqual(3)
  }
})
