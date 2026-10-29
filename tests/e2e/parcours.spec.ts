import { expect, test, type Page } from '@playwright/test'

/** Passe les trois écrans d'accueil pour arriver à l'appli. */
async function passerOnboarding(page: Page): Promise<void> {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Passer' })).toBeVisible()
  await page.getByRole('button', { name: 'Passer' }).click()
  await expect(page.getByRole('heading', { name: 'Prêt à soulever ?' })).toBeVisible()
}

/** Attend que le service worker ait pris la main sur le précache. */
async function attendreServiceWorker(page: Page): Promise<void> {
  await page.waitForFunction(() => navigator.serviceWorker?.controller != null || navigator.serviceWorker?.ready != null)
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.waitForTimeout(1500)
}

test.describe('parcours complet', () => {
  test('de l’onboarding à une séance terminée', async ({ page }) => {
    await passerOnboarding(page)

    // Lancer le modèle Push.
    await page.getByRole('button', { name: /^Push/ }).click()
    await expect(page).toHaveURL(/\/seance$/)
    await expect(page.getByRole('heading', { name: 'Push', level: 1 })).toBeVisible()

    // Valider une série : saisir les deux chiffres, puis la coche.
    await page.getByLabel('Poids de la série 1, en kilos').fill('80')
    await page.getByLabel('Répétitions de la série 1').fill('8')
    await page.getByRole('button', { name: 'Valider la série 1' }).click()

    // Première série sur cet exercice : c'est un record.
    await expect(page.getByRole('button', { name: 'Annuler la série 1' })).toBeVisible()
    await expect(page.locator('.animate-pr-pop')).toHaveCount(1)

    // Le chrono de repos démarre tout seul.
    await expect(page.getByRole('progressbar', { name: 'Avancement du repos' })).toBeVisible()

    // Terminer la séance : elle rejoint l'historique.
    await page.getByRole('button', { name: 'Terminer' }).click()
    await expect(page).toHaveURL(/\/$/)

    await page.getByRole('link', { name: /Historique/ }).click()
    await expect(page.getByText('1 séance ce mois-ci')).toBeVisible()
    await expect(page.getByText('1 record')).toBeVisible()
  })

  test('une séance interrompue est restaurée avec le bon temps écoulé', async ({ page }) => {
    await passerOnboarding(page)
    await page.getByRole('button', { name: /^Push/ }).click()

    await page.getByLabel('Poids de la série 1, en kilos').fill('100')
    await page.getByLabel('Répétitions de la série 1').fill('5')
    await page.getByRole('button', { name: 'Valider la série 1' }).click()

    const barre = page.getByRole('progressbar', { name: 'Avancement du repos' })
    await expect(barre).toBeVisible()
    const avant = Number(await barre.getAttribute('aria-valuenow'))

    // Fermer puis rouvrir l'appli en plein repos.
    await page.waitForTimeout(2500)
    await page.reload()

    await expect(page).toHaveURL(/\/seance$/)
    await expect(page.getByRole('button', { name: 'Annuler la série 1' })).toBeVisible()

    // Le repos est calculé sur un horodatage : il a avancé pendant l'absence.
    const apres = Number(await barre.getAttribute('aria-valuenow'))
    expect(apres).toBeGreaterThan(avant)
  })

  test('la deuxième séance se valide en un seul tap par série', async ({ page }) => {
    await passerOnboarding(page)

    // Première séance : on pose des chiffres.
    await page.getByRole('button', { name: /^Push/ }).click()
    await page.getByLabel('Poids de la série 1, en kilos').fill('60')
    await page.getByLabel('Répétitions de la série 1').fill('10')
    await page.getByRole('button', { name: 'Valider la série 1' }).click()
    await expect(page.getByRole('button', { name: 'Annuler la série 1' })).toBeVisible()
    await page.getByRole('button', { name: 'Terminer' }).click()
    await expect(page).toHaveURL(/\/$/)

    // Deuxième séance : les chiffres de la dernière fois sont déjà en place.
    await page.getByRole('button', { name: /^Push/ }).click()
    await expect(page.getByLabel('Poids de la série 1, en kilos')).toHaveValue('60')
    await expect(page.getByLabel('Répétitions de la série 1')).toHaveValue('10')
    await expect(page.getByText('60 × 10').first()).toBeVisible()

    // Un seul tap, sans aucune saisie.
    await page.getByRole('button', { name: 'Valider la série 1' }).click()
    await expect(page.getByRole('button', { name: 'Annuler la série 1' })).toBeVisible()
  })
})

test.describe('mode hors ligne', () => {
  test('tout fonctionne en mode avion après la première visite', async ({ page, context }) => {
    await passerOnboarding(page)
    await attendreServiceWorker(page)

    await context.setOffline(true)

    // Le rechargement passe par le précache, pas par le réseau.
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Prêt à soulever ?' })).toBeVisible()

    // Une séance complète se déroule sans réseau.
    await page.getByRole('button', { name: /^Push/ }).click()
    await expect(page).toHaveURL(/\/seance$/)
    await page.getByLabel('Poids de la série 1, en kilos').fill('75')
    await page.getByLabel('Répétitions de la série 1').fill('6')
    await page.getByRole('button', { name: 'Valider la série 1' }).click()
    await expect(page.getByRole('button', { name: 'Annuler la série 1' })).toBeVisible()

    await page.getByRole('button', { name: 'Ajouter un exercice' }).click()
    await expect(page).toHaveURL(/\/seance\/exercices$/)
    await page.getByLabel('Rechercher un exercice').fill('squat')
    await page.locator('ul li button:not([disabled])').first().click()
    await page.getByRole('button', { name: /^Ajouter 1 exercice/ }).click()
    await expect(page).toHaveURL(/\/seance$/)

    await page.getByRole('button', { name: 'Terminer' }).click()
    await expect(page).toHaveURL(/\/$/)

    // L'historique et le profil se consultent aussi hors ligne.
    await page.getByRole('link', { name: /Historique/ }).click()
    await expect(page.getByText('1 séance ce mois-ci')).toBeVisible()
    await page.getByRole('link', { name: /Profil/ }).click()
    await expect(page.getByRole('heading', { name: 'Profil et progrès' })).toBeVisible()
    await expect(page.getByText('Développé couché')).toBeVisible()

    // Un rechargement en pleine navigation profonde reste servi hors ligne.
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Profil et progrès' })).toBeVisible()
  })
})
