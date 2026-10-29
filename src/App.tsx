import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { UpdateBanner } from '@/components/UpdateBanner'
import { amorcerBase } from '@/db'
import { lireReglages, type Reglages } from '@/db/reglages'
import { applyTheme, watchSystemTheme } from '@/styles/theme'
import { Layout } from '@/features/Layout'
import { PageAccueil } from '@/features/accueil/PageAccueil'
import { PageAjoutExercice } from '@/features/exercices/PageAjoutExercice'
import { PageDetailExercice } from '@/features/exercices/PageDetailExercice'
import { PageHistorique } from '@/features/historique/PageHistorique'
import { EcranLancement } from '@/features/onboarding/EcranLancement'
import { PageOnboarding } from '@/features/onboarding/PageOnboarding'
import { PageProfil } from '@/features/profil/PageProfil'
import { useReglages } from '@/features/reglages/useReglages'
import { PageReglages } from '@/features/reglages/PageReglages'
import { PageSeance } from '@/features/workout/PageSeance'

/**
 * Routes de l'appli. Séparé de App pour que l'état de l'onboarding soit
 * suivi en direct : le terminer doit faire basculer l'appli tout de suite,
 * sans relancer le démarrage.
 */
function Routeur({ initiaux }: { initiaux: Reglages }) {
  const reglages = useReglages(initiaux)

  if (!reglages.onboardingTermine) {
    return (
      <Routes>
        <Route path="/bienvenue" element={<PageOnboarding />} />
        <Route path="*" element={<Navigate to="/bienvenue" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<PageAccueil />} />
        <Route path="/historique" element={<PageHistorique />} />
        <Route path="/exercice/:exerciceId" element={<PageDetailExercice />} />
        <Route path="/profil" element={<PageProfil />} />
        <Route path="/profil/reglages" element={<PageReglages />} />
      </Route>
      <Route path="/seance" element={<PageSeance />} />
      <Route path="/seance/exercices" element={<PageAjoutExercice />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export function App() {
  // null tant que la base n'est pas ouverte : l'écran de lancement tient
  // l'affiche, et le routeur démarre ensuite avec les vraies valeurs.
  const [reglagesInitiaux, setReglagesInitiaux] = useState<Reglages | null>(null)

  useEffect(() => {
    let annule = false
    const demarrer = async (): Promise<void> => {
      await amorcerBase()
      const reglages = await lireReglages()
      if (annule) return
      applyTheme(reglages.theme)
      setReglagesInitiaux(reglages)
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

  if (!reglagesInitiaux) return <EcranLancement />

  return (
    <BrowserRouter>
      <Routeur initiaux={reglagesInitiaux} />
      <UpdateBanner />
    </BrowserRouter>
  )
}
