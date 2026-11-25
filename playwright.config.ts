import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

const isCI = Boolean(process.env.CI)
const port = isCI ? 4173 : 4174

const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL
const baseURL = externalBaseURL ?? `http://127.0.0.1:${port}`
const isProductionTarget = isCI || Boolean(externalBaseURL)
const chromium = {
  ...devices['Desktop Chrome'],
  launchOptions: {
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
  },
}

export default defineConfig({
  testDir: './e2e',
  forbidOnly: isCI,
  workers: isCI ? 1 : undefined,
  reporter: 'list',

  use: {
    baseURL,
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      testIgnore: [
        '**/design-system.spec.ts',
        ...(!isProductionTarget ? ['**/production.spec.ts'] : []),
      ],
      use: chromium,
    },
    ...(!isProductionTarget
      ? [{ name: 'design-system', testMatch: '**/design-system.spec.ts', use: chromium }]
      : []),
  ],

  webServer: externalBaseURL
    ? undefined
    : {
        command: `pnpm ${isCI ? 'preview' : 'dev'} --host 127.0.0.1 --port ${port} --strictPort`,
        url: baseURL,
        reuseExistingServer: false,
      },
})
