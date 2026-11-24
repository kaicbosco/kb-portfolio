import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

const isCI = Boolean(process.env.CI)
const port = isCI ? 4173 : 4174
const baseURL = `http://127.0.0.1:${port}`

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
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE },
      },
    },
  ],
  webServer: {
    command: `pnpm ${isCI ? 'preview' : 'dev'} --host 127.0.0.1 --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: false,
  },
})
