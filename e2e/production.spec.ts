import { expect, test } from '@playwright/test'

test('does not register or advertise the development playground in production', async ({
  page,
}) => {
  await page.goto('/pt')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('KB. Portfolio')
  await expect(page.locator('a[href="/dev/design-system"]')).toHaveCount(0)

  const requestedAssets: string[] = []
  page.on('request', (request) => requestedAssets.push(request.url()))
  await page.goto('/dev/design-system')
  await expect(page).toHaveURL('/dev/design-system')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Página não encontrada')
  await expect(page.getByRole('heading', { name: 'Crimson Void' })).toHaveCount(0)
  expect(requestedAssets.some((url) => /designsystempage|specimens|playground/i.test(url))).toBe(
    false,
  )
})
