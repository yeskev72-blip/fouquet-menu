import { expect, test } from '@playwright/test'

/**
 * Lighthouse 12 a retiré la catégorie PWA : les conditions d'installation
 * sont donc vérifiées ici, une par une.
 */
test.describe('installation', () => {
  test('le manifeste décrit une appli installable', async ({ page, request }) => {
    await page.goto('/')

    const lien = page.locator('link[rel="manifest"]')
    await expect(lien).toHaveCount(1)
    const href = await lien.getAttribute('href')
    expect(href).toBeTruthy()

    const reponse = await request.get(href!)
    expect(reponse.status()).toBe(200)
    const manifeste = JSON.parse(await reponse.text())

    expect(manifeste.name).toBe('Fonte')
    expect(manifeste.short_name).toBe('Fonte')
    expect(manifeste.lang).toBe('fr')
    expect(manifeste.display).toBe('standalone')
    expect(manifeste.orientation).toBe('portrait')
    expect(manifeste.start_url).toBeTruthy()
    expect(manifeste.theme_color).toBe('#0E0F11')
    expect(manifeste.background_color).toBe('#0E0F11')

    // Android exige au moins une icône 192 et une 512, plus une « maskable »
    // pour éviter que le système ne rogne les coins.
    const tailles: string[] = manifeste.icons.map((icone: { sizes: string }) => icone.sizes)
    expect(tailles).toContain('192x192')
    expect(tailles).toContain('512x512')
    expect(
      manifeste.icons.some((icone: { purpose?: string }) => icone.purpose === 'maskable'),
    ).toBe(true)

    // Chaque icône doit réellement être servie.
    for (const icone of manifeste.icons as Array<{ src: string; type: string }>) {
      const image = await request.get(icone.src)
      expect(image.status(), `icône ${icone.src}`).toBe(200)
      expect(image.headers()['content-type']).toContain('image/png')
    }
  })

  test('iPhone a ce qu’il lui faut pour l’écran d’accueil', async ({ page, request }) => {
    await page.goto('/')

    await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute(
      'content',
      'yes',
    )
    await expect(page.locator('meta[name="apple-mobile-web-app-title"]')).toHaveAttribute(
      'content',
      'Fonte',
    )
    await expect(page.locator('meta[name="apple-mobile-web-app-status-bar-style"]')).toHaveCount(1)

    const icone = page.locator('link[rel="apple-touch-icon"]')
    await expect(icone).toHaveAttribute('sizes', '180x180')
    const reponse = await request.get((await icone.getAttribute('href'))!)
    expect(reponse.status()).toBe(200)

    // viewport-fit=cover : l'appli dessine sous l'encoche en plein écran.
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
      'content',
      /viewport-fit=cover/,
    )
  })

  test('le service worker prend la main et précache le shell', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => navigator.serviceWorker.ready)
    await page.waitForTimeout(1500)

    const enregistre = await page.evaluate(async () => {
      const inscriptions = await navigator.serviceWorker.getRegistrations()
      return inscriptions.length > 0
    })
    expect(enregistre).toBe(true)

    // Les polices sont dans le cache : l'appli doit s'afficher correctement
    // hors ligne, pas seulement se charger.
    const policesEnCache = await page.evaluate(async () => {
      const noms = await caches.keys()
      for (const nom of noms) {
        const cache = await caches.open(nom)
        const clefs = await cache.keys()
        if (clefs.some((requete) => requete.url.endsWith('.woff2'))) return true
      }
      return false
    })
    expect(policesEnCache).toBe(true)
  })
})
