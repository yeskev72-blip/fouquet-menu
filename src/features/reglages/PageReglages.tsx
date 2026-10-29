import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Card, TitreSection } from '@/components/Card'
import { IconeChevronGauche } from '@/components/Icones'
import { InstallBanner } from '@/components/InstallBanner'
import { ecrireReglage } from '@/db/reglages'
import { useInstallation } from '@/pwa/installation'
import { useStockageDurable } from '@/pwa/stockageDurable'
import { applyTheme, type ThemePreference } from '@/styles/theme'
import { cn } from '@/lib/cn'
import { dateCompacte } from '@/lib/dates'
import { exporterVersFichier, importerDepuisTexte } from '@/lib/sauvegarde'
import { useSeanceStore } from '@/store/seance'
import type { Unite } from '@/db/types'
import { useReglages } from './useReglages'

const THEMES: Array<{ cle: ThemePreference; libelle: string }> = [
  { cle: 'system', libelle: 'Système' },
  { cle: 'dark', libelle: 'Sombre' },
  { cle: 'light', libelle: 'Clair' },
]

const UNITES: Array<{ cle: Unite; libelle: string }> = [
  { cle: 'kg', libelle: 'Kilos' },
  { cle: 'lb', libelle: 'Livres' },
]

const REPOS_POSSIBLES = [60, 90, 120, 150, 180, 240]

/**
 * Groupe de boutons exclusifs, réutilisé par chaque réglage. La grille est
 * à colonnes fixes plutôt qu'en flex : les libellés gardent la même largeur
 * et ne passent pas à la ligne au milieu d'un mot.
 */
function Choix<T extends string | number>({
  libelle,
  options,
  valeur,
  colonnes,
  onChoisir,
}: {
  libelle: string
  options: Array<{ cle: T; libelle: string }>
  valeur: T
  colonnes: 2 | 3
  onChoisir: (cle: T) => void
}) {
  return (
    <div
      role="group"
      aria-label={libelle}
      className={cn('grid gap-2', colonnes === 2 ? 'grid-cols-2' : 'grid-cols-3')}
    >
      {options.map(({ cle, libelle: texte }) => (
        <button
          key={String(cle)}
          type="button"
          aria-pressed={valeur === cle}
          onClick={() => onChoisir(cle)}
          className={cn(
            'min-h-touch whitespace-nowrap rounded-btn px-3 text-md',
            valeur === cle
              ? 'bg-accent font-bold text-on-accent'
              : 'bg-field font-semibold text-text active:bg-border',
          )}
        >
          {texte}
        </button>
      ))}
    </div>
  )
}

export function PageReglages() {
  const navigate = useNavigate()
  const reglages = useReglages()
  const stockage = useStockageDurable()
  const installation = useInstallation()
  const reinitialiserSeance = useSeanceStore((etat) => etat.reinitialiser)

  const champFichier = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ ton: 'ok' | 'erreur'; texte: string } | null>(null)

  const exporter = async (): Promise<void> => {
    await exporterVersFichier()
    await ecrireReglage('dernierExport', Date.now())
    await ecrireReglage('seancesDepuisExport', 0)
    setMessage({ ton: 'ok', texte: 'Sauvegarde téléchargée. Garde-la en lieu sûr.' })
  }

  const importer = async (fichier: File): Promise<void> => {
    const resultat = await importerDepuisTexte(await fichier.text())
    if (!resultat.ok) {
      setMessage({ ton: 'erreur', texte: resultat.raison })
      return
    }
    // Les identifiants de séries ont changé : les brouillons en mémoire ne
    // correspondent plus à rien.
    reinitialiserSeance()
    setMessage({
      ton: 'ok',
      texte: `Sauvegarde importée : ${resultat.resume.seances} séances, ${resultat.resume.series} séries.`,
    })
  }

  return (
    <div className="flex flex-col gap-5 bg-bg pb-10 text-text">
      <header className="px-5 pt-7">
        <button
          type="button"
          onClick={() => navigate('/profil')}
          className="inline-flex min-h-11 items-center gap-1 text-md font-semibold text-muted"
        >
          <IconeChevronGauche taille={20} />
          Profil
        </button>
        <h1 className="font-display text-d-4xl font-bold">Réglages</h1>
      </header>

      <section className="px-5">
        <TitreSection className="mb-3">Apparence</TitreSection>
        <Choix
          libelle="Thème"
          options={THEMES}
          colonnes={3}
          valeur={reglages.theme}
          onChoisir={(cle) => {
            applyTheme(cle)
            void ecrireReglage('theme', cle)
          }}
        />
      </section>

      <section className="px-5">
        <TitreSection className="mb-3">Unités</TitreSection>
        <Choix
          libelle="Unité de charge"
          options={UNITES}
          colonnes={2}
          valeur={reglages.unite}
          onChoisir={(cle) => void ecrireReglage('unite', cle)}
        />
        <p className="mt-2 text-sm text-muted">
          Les charges restent enregistrées en kilos ; seul l'affichage change.
        </p>
      </section>

      <section className="px-5">
        <TitreSection className="mb-3">Repos par défaut</TitreSection>
        <Choix
          libelle="Durée de repos par défaut"
          options={REPOS_POSSIBLES.map((secondes) => ({
            cle: secondes,
            libelle: secondes >= 60 ? `${Math.round(secondes / 60 * 10) / 10} min`.replace('.', ',') : `${secondes} s`,
          }))}
          colonnes={3}
          valeur={reglages.reposParDefaut}
          onChoisir={(cle) => void ecrireReglage('reposParDefaut', cle)}
        />
      </section>

      {installation.plateforme === 'invite' || installation.plateforme === 'ios' ? (
        <section className="px-5">
          <TitreSection className="mb-3">Installation</TitreSection>
          <InstallBanner />
        </section>
      ) : null}

      <section className="px-5">
        <TitreSection className="mb-3">Sauvegarde</TitreSection>
        <Card className="flex flex-col gap-3">
          <p className="text-base text-muted">
            {reglages.dernierExport
              ? `Dernier export : ${dateCompacte(new Date(reglages.dernierExport))}.`
              : "Aucun export pour l'instant."}{' '}
            Tes données ne quittent jamais ce téléphone : l'export est le seul moyen de les
            retrouver si tu changes d'appareil.
          </p>

          <Button variante="principal" pleineLargeur onClick={() => void exporter()}>
            Exporter mes données
          </Button>

          <Button
            variante="secondaire"
            pleineLargeur
            onClick={() => champFichier.current?.click()}
          >
            Importer une sauvegarde
          </Button>
          <p className="text-sm text-muted">
            Un import remplace toutes les données de cet appareil par celles du fichier.
          </p>

          <input
            ref={champFichier}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(evenement) => {
              const fichier = evenement.target.files?.[0]
              evenement.target.value = ''
              if (fichier) void importer(fichier)
            }}
          />

          {message ? (
            <p
              role="status"
              className={cn(
                'rounded-field p-3 text-base',
                message.ton === 'ok' ? 'bg-ok-soft text-ok' : 'bg-accent-soft text-accent-text',
              )}
            >
              {message.texte}
            </p>
          ) : null}
        </Card>
      </section>

      <section className="px-5">
        <TitreSection className="mb-3">Stockage</TitreSection>
        <Card>
          <p className="text-base text-muted">
            {stockage.etat === 'durable'
              ? "Le navigateur s'est engagé à garder tes données tant que tu ne les effaces pas toi-même."
              : stockage.etat === 'fragile'
                ? "Le navigateur n'a pas accordé de stockage durable : si l'espace vient à manquer, ou si tu laisses l'appli de côté plusieurs semaines sur iPhone, il peut effacer tes données. Installe Fonte sur l'écran d'accueil et exporte de temps en temps."
                : "Ce navigateur ne dit pas si tes données sont à l'abri d'un effacement automatique. Exporte régulièrement."}
          </p>
          {stockage.etat === 'fragile' ? (
            <Button
              variante="secondaire"
              pleineLargeur
              className="mt-3"
              onClick={() => void stockage.demander()}
            >
              Demander un stockage durable
            </Button>
          ) : null}
        </Card>
      </section>

      <p className="px-5 text-sm text-muted">
        Fonte · données locales, aucun compte, aucune publicité.
      </p>
    </div>
  )
}
