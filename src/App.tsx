import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { UpdateBanner } from '@/components/UpdateBanner'
import { amorcerBase } from '@/db'
import { lireReglages } from '@/db/reglages'
import { applyTheme, watchSystemTheme } from '@/styles/theme'
import { Layout } from '@/features/Layout'
import { PageAccueil } from '@/features/accueil/PageAccueil'
import { PageSeance } from '@/features/workout/PageSeance'

export function App() {
  const [pret, setPret] = useState(false)

  useEffect(() => {
    let annule = false
    const demarrer = async (): Promise<void> => {
      await amorcerBase()
      const reglages = await lireReglages()
      if (annule) return
      applyTheme(reglages.theme)
      setPret(true)
    }
    void demarrer()
    return () => {
      annule = true
    }
  }, [])

  // Le thème « système » suit la préférence de l'appareil en direct.
  useEffect(() => {
    return watchSystemTheme(() => {
      void lireReglages().then((reglages) => {
        if (reglages.theme === 'system') applyTheme('system')
      })
    })
  }, [])

  if (!pret) return null

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<PageAccueil />} />
        </Route>
        <Route path="/seance" element={<PageSeance />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <UpdateBanner />
    </BrowserRouter>
  )
}
