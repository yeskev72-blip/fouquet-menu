import { defineConfig, devices } from '@playwright/test'

/**
 * Parcours de bout en bout sur un build réel : le service worker et le
 * mode hors ligne ne se testent pas sur le serveur de développement.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    ...devices['Pixel 5'],
    // Un Android d'entrée de gamme en thème sombre, le cas d'usage visé.
    colorScheme: 'dark',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
})
