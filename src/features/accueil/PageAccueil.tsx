import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { IconePlus } from '@/components/Icones'
import { base } from '@/db'
import { seanceEnCours } from '@/db/requetes'
import { demarrerDepuisModele, demarrerSeance } from '@/features/workout/actions'

/** Accueil provisoire : juste de quoi ouvrir une séance le temps de l'étape 6. */
export function PageAccueil() {
  const navigate = useNavigate()
  const modeles = useLiveQuery(() => base.templates.toArray(), [], [])
  const courante = useLiveQuery(() => seanceEnCours(), [])

  return (
    <div className="flex flex-col gap-4 p-5">
      <h1 className="font-display text-d-4xl font-bold">Prêt à soulever ?</h1>

      {courante ? (
        <Button variante="principal" taille="grande" pleineLargeur onClick={() => navigate('/seance')}>
          Reprendre « {courante.name} »
        </Button>
      ) : (
        <Button
          variante="principal"
          taille="grande"
          pleineLargeur
          onClick={() =>
            void demarrerSeance({}).then(() => navigate('/seance'))
          }
        >
          <IconePlus taille={22} />
          Démarrer une séance
        </Button>
      )}

      <div className="flex flex-col gap-2">
        {modeles.map((modele) => (
          <Button
            key={modele.id}
            variante="secondaire"
            pleineLargeur
            disabled={courante != null}
            onClick={() =>
              void demarrerDepuisModele(modele.id).then((id) => {
                if (id) navigate('/seance')
              })
            }
          >
            {modele.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
