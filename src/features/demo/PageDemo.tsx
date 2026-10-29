import { useState } from 'react'
import { Button } from '@/components/Button'
import { Card, TitreSection } from '@/components/Card'
import { CheckButton } from '@/components/CheckButton'
import { Chip } from '@/components/Chip'
import { InstallBanner } from '@/components/InstallBanner'
import { NumberInput } from '@/components/NumberInput'
import { PRBadge } from '@/components/PRBadge'
import { ProgressChart, Sparkline } from '@/components/ProgressChart'
import { RestTimerBar } from '@/components/RestTimerBar'
import { SetRow, SetRowHeader } from '@/components/SetRow'
import { IconePlus } from '@/components/Icones'

/**
 * Page de contrôle visuel des composants. Elle n'est pas reliée à la
 * navigation de l'appli : elle sert à vérifier les états côte à côte.
 */
export function PageDemo() {
  const [poids, setPoids] = useState('85')
  const [reps, setReps] = useState('6')
  const [validee, setValidee] = useState(false)
  const [muscle, setMuscle] = useState('Pectoraux')

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <div className="flex-1 space-y-6 overflow-y-auto p-5">
        <h1 className="font-display text-d-4xl font-bold">Composants</h1>

        <section className="space-y-3">
          <TitreSection>Boutons</TitreSection>
          <Button variante="principal" taille="grande" pleineLargeur>
            <IconePlus taille={22} />
            Démarrer une séance
          </Button>
          <div className="flex gap-2">
            <Button variante="secondaire">Ajouter une série</Button>
            <Button variante="validation">Terminer</Button>
            <Button variante="principal" disabled>
              Désactivé
            </Button>
          </div>
          <Button variante="pointille" pleineLargeur>
            <IconePlus taille={18} />
            Ajouter un exercice
          </Button>
          <Button variante="discret">Passer</Button>
        </section>

        <section className="space-y-3">
          <TitreSection>Chips</TitreSection>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {['Tous', 'Pectoraux', 'Dos', 'Jambes', 'Épaules'].map((nom) => (
              <Chip key={nom} actif={muscle === nom} onClick={() => setMuscle(nom)}>
                {nom}
              </Chip>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <TitreSection>Lignes de série</TitreSection>
          <SetRowHeader />
          <SetRow
            numero={1}
            precedent="77,5 × 8"
            poids="80"
            reps="8"
            validee
            onPoidsChange={() => {}}
            onRepsChange={() => {}}
            onToggle={() => {}}
          />
          <SetRow
            numero={2}
            precedent="80 × 8"
            poids="82,5"
            reps="8"
            validee
            record
            onPoidsChange={() => {}}
            onRepsChange={() => {}}
            onToggle={() => {}}
          />
          <SetRow
            numero={3}
            precedent="80 × 6"
            poids={poids}
            reps={reps}
            validee={validee}
            onPoidsChange={setPoids}
            onRepsChange={setReps}
            onToggle={() => setValidee((v) => !v)}
          />
          <SetRow
            numero={4}
            precedent={null}
            poids=""
            reps=""
            validee={false}
            onPoidsChange={() => {}}
            onRepsChange={() => {}}
            onToggle={() => {}}
          />
        </section>

        <section className="space-y-3">
          <TitreSection>États unitaires</TitreSection>
          <div className="flex items-center gap-3">
            <CheckButton numero={1} validee={false} onToggle={() => {}} />
            <CheckButton numero={2} validee={false} prete onToggle={() => {}} />
            <CheckButton numero={3} validee onToggle={() => {}} />
            <PRBadge />
            <PRBadge variante="etiquette">2 records</PRBadge>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-[84px]">
              <NumberInput valeur="" onValeurChange={() => {}} placeholder="kg" aria-label="Champ vide" />
            </div>
            <div className="w-[84px]">
              <NumberInput valeur="82,5" onValeurChange={() => {}} aria-label="Champ rempli" />
            </div>
            <div className="w-[84px]">
              <NumberInput valeur="85" onValeurChange={() => {}} actif aria-label="Champ actif" />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <TitreSection>Cartes et courbes</TitreSection>
          <Card className="flex items-end justify-between">
            <div>
              <p className="text-sm text-muted">Poids de corps</p>
              <p className="font-display text-d-5xl font-bold">78,4 kg</p>
              <p className="text-base font-semibold text-ok">−1,2 kg en 30 jours</p>
            </div>
            <Sparkline valeurs={[80.2, 79.8, 79.9, 79.1, 78.7, 78.8, 78.4]} />
          </Card>
          <ProgressChart
            titre="Poids max par séance, en kg"
            unite="kg"
            points={[
              { etiquette: '9 sept.', valeur: 67.5 },
              { etiquette: '16 sept.', valeur: 70 },
              { etiquette: '23 sept.', valeur: 70 },
              { etiquette: '30 sept.', valeur: 72.5 },
              { etiquette: '7 oct.', valeur: 75 },
              { etiquette: '14 oct.', valeur: 77.5 },
              { etiquette: '21 oct.', valeur: 80 },
              { etiquette: '29 oct.', valeur: 82.5, record: true },
            ]}
          />
        </section>

        <section className="space-y-3">
          <TitreSection>Installation</TitreSection>
          <InstallBanner />
        </section>
      </div>

      <RestTimerBar restantMs={72_000} totalMs={160_000} onAjuster={() => {}} onPasser={() => {}} />
    </div>
  )
}
