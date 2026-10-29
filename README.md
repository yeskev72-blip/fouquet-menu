# Fonte

**Note ta série, vois ta progression.**

Application web de suivi de performances en salle de musculation, pensée pour
une utilisation entre deux séries : rapide, à une main, et entièrement hors
ligne après la première visite. Interface en français, sans compte, sans
publicité, sans aucune donnée envoyée à un serveur.

Installable sur l'écran d'accueil d'un Android ou d'un iPhone, où elle s'ouvre
en plein écran comme une application native.

---

## Démarrer

```bash
npm install
npm run dev          # serveur de développement sur http://localhost:5173
```

| Commande           | Ce qu'elle fait                                             |
| ------------------ | ----------------------------------------------------------- |
| `npm run dev`      | Serveur de développement. Le service worker y est désactivé. |
| `npm run build`    | Vérification des types puis build de production dans `dist/` |
| `npm run preview`  | Sert le build sur http://localhost:4173                      |
| `npm run typecheck`| TypeScript seul                                              |
| `npm test`         | Tests unitaires (Vitest)                                     |
| `npm run test:e2e` | Parcours de bout en bout (Playwright) sur un vrai build       |

Le mode hors ligne et l'installation ne se testent que sur un build servi par
`npm run preview` : en développement, le service worker n'est pas actif.

Les icônes sont régénérées depuis le logo du design avec
`node scripts/generer-icones.mjs` (nécessite Playwright, déjà en dépendance de
développement).

## Structure

```
public/            icônes, robots.txt, _redirects et _headers pour Cloudflare
                   (le manifeste est généré au build)
scripts/           génération des icônes
src/
  components/      bibliothèque de composants du design system
  db/              schéma Dexie, catalogue d'exercices, réglages, requêtes
  features/        un dossier par écran (accueil, workout, exercices,
                   historique, profil, reglages, onboarding)
  lib/             calculs métier, formats français, sauvegarde, utilitaires
  pwa/             installation, mise à jour, wake lock, stockage, retours
  store/           état de la séance en cours (Zustand)
  styles/          jetons de design et feuille globale
tests/unite/       tests Vitest
tests/e2e/         tests Playwright
```

## Choix techniques

**Tout en statique, rien côté serveur.** Vite + React 18 + TypeScript strict.
L'application se réduit à des fichiers posés sur un hébergement statique ;
aucune API à maintenir, aucun compte à créer, rien à payer pour faire tourner
le service.

**IndexedDB via Dexie.** Les données vivent sur l'appareil. Le schéma est
versionné : une version publiée ne se modifie jamais, on en ajoute une
nouvelle avec sa migration. Les identifiants sont des UUID, pour qu'un import
de sauvegarde venu d'un autre téléphone ne puisse pas entrer en collision.

**Zustand pour la séance en cours, pas pour les données.** Ce qui est validé
part aussitôt en base. Le store ne garde que les chiffres en train d'être
tapés et le chrono de repos, persistés dans `localStorage` : fermer l'onglet
en pleine série et revenir restitue la séance telle quelle.

**Les durées se calculent, elles ne se comptent pas.** Le chrono de séance et
le chrono de repos dérivent d'un horodatage de départ, jamais d'un compteur
incrémenté chaque seconde. C'est la seule façon d'afficher le bon temps quand
l'application passe en arrière-plan, ce qui arrive à chaque fois que l'écran
s'éteint entre deux séries.

**Un seul endroit pour les valeurs de design.** `src/styles/tokens.css` définit
les couleurs en variables CSS ; `tailwind.config.ts` les expose en classes et
ferme les échelles d'espacement, de rayon et de typographie sur celles du
design system. Changer de thème ne change que des variables.

Deux jetons ont été ajoutés au design fourni, pour le thème clair seulement :
l'ambre `#FF9F1C` ne donne que 1,8:1 sur le fond crème, trop peu pour du texte,
et 2,1:1 pour un trait de courbe, sous le plancher de 3:1 des objets
graphiques. `--fonte-accent-text` (4,8:1) et `--fonte-chart-line` (4,0:1)
prennent le relais dans ces deux cas. Le thème sombre garde `#FF9F1C` partout.

**Graphiques faits main en SVG.** Une seule série par courbe, donc pas de
légende : le titre nomme la série. Un appui affiche la valeur du point le plus
proche, et un tableau dépliable donne les mêmes chiffres au clavier et au
lecteur d'écran. Aucune librairie de graphiques à télécharger.

**Polices servies depuis le paquet.** Barlow Condensed et Inter via
`@fontsource`, jamais depuis un CDN : l'application doit démarrer sans réseau,
et les données mobiles coûtent cher.

**Mise à jour proposée, jamais imposée.** Le service worker attend ; un bandeau
propose. Recharger la page au milieu d'une série ferait perdre la saisie.

## Ce que le navigateur ne garantit pas

Cette section existe parce qu'une application locale promet facilement plus
qu'elle ne peut tenir.

- **Tes données peuvent être effacées.** Fonte demande un stockage durable
  (`navigator.storage.persist()`), mais le navigateur peut refuser. Sur iPhone,
  les données d'un site **non installé** sur l'écran d'accueil peuvent être
  effacées après quelques semaines sans visite. D'où l'invitation à installer
  l'application, et le rappel d'export toutes les dix séances. L'export est le
  seul vrai filet de sécurité.
- **Pas de notification en arrière-plan.** La fin du repos est signalée par une
  vibration et un bip, qui ne marchent que si l'application est au premier
  plan. Les notifications d'une PWA ne sont pas fiables : iOS ne les délivre
  pas pour un site non installé, Android les coupe quand l'onglet dort. Fonte
  n'en promet donc aucune, et affiche le temps écoulé au retour dans
  l'application.
- **L'écran ne reste allumé que si le navigateur le veut bien.** Le verrou
  d'écran (Screen Wake Lock) manque à Safari iOS avant la version 16.4 et peut
  être refusé quand la batterie est faible.
- **La vibration n'existe pas sur iPhone.** L'API Vibration n'est pas
  implémentée par Safari ; seul le bip subsiste.
- **L'installation n'est pas programmable sur iPhone.** Safari n'expose pas
  `beforeinstallprompt` : Fonte affiche donc le geste à faire (Partager, puis
  « Sur l'écran d'accueil ») au lieu d'un bouton.

## Déploiement

L'application doit être servie **en HTTPS** et **à la racine d'un domaine** :
`start_url` et `scope` valent `/`, et un service worker ne s'enregistre pas en
HTTP. Les fichiers de configuration des trois hébergeurs gratuits les plus
simples sont déjà dans le dépôt ; il n'y a rien à régler à la main.

### Cloudflare Pages — recommandé

Le réseau de diffusion de Cloudflare a des points de présence en Afrique de
l'Ouest, ce qui compte pour le public visé : la première visite, la seule qui
passe par le réseau, arrive de plus près. L'offre gratuite n'a pas de limite de
bande passante.

```bash
npm run build
npx wrangler pages deploy
```

La première exécution ouvre une page de connexion, puis crée le projet. Le site
est ensuite servi sur `fonte.pages.dev`, et un domaine à toi s'ajoute depuis le
tableau de bord.

Par l'interface web (Workers & Pages → Create → Pages → Connect to Git), les
réglages sont : commande de build `npm run build`, dossier de sortie `dist`.
Chaque poussée sur la branche redéploie.

La configuration tient dans `wrangler.toml`, plus deux fichiers de `public/`
que Cloudflare lit dans le build : `_redirects` pour le repli SPA et `_headers`
pour les durées de cache.

### Vercel

```bash
npm run build
npx vercel --prod
```

### Netlify

```bash
npm run build
npx netlify deploy --prod
```

Dans les trois cas, importer le dépôt depuis l'interface web marche aussi : la
commande de build et le dossier de sortie sont déjà déclarés. Les trois
configurations font les mêmes trois choses, nécessaires : rendre `index.html`
pour toute URL inconnue (sans quoi un lien profond ouvert à froid renvoie une
404), ne jamais mettre `sw.js` en cache long (c'est lui qui porte la mise à
jour de tout le reste), et garder les fichiers de `assets/` indéfiniment,
puisqu'ils portent une empreinte dans leur nom.

Une fois le site en ligne, ouvre le lien sur un téléphone et vérifie que
l'installation est proposée, puis passe en mode avion et recharge.

> Le déploiement lui-même demande un compte chez l'hébergeur : il n'a donc pas
> été fait ici. Tout le reste est prêt.

## Qualité

```bash
npm test          # 31 tests unitaires
npm run test:e2e  # 7 parcours Playwright, dont un en mode avion complet
```

Les tests unitaires couvrent la logique métier (1RM d'Epley, volume, détection
des records sur la charge, le 1RM et les répétitions à un poids donné), la
base locale et son amorçage, et l'aller-retour export/import. Les tests de
bout en bout tournent sur un vrai build, parce que le service worker n'existe
pas en développement.

Dernier audit Lighthouse sur le build de production : **performance 97,
accessibilité 100, bonnes pratiques 100, SEO 100**. Lighthouse 12 ayant retiré
la catégorie PWA, les conditions d'installation sont vérifiées par les tests
de `tests/e2e/installable.spec.ts`.

## Pistes pour une v2

- **Sauvegarde dans le nuage, en option.** Un compte facultatif, pour
  retrouver ses séances en changeant de téléphone sans penser à exporter. À
  construire en gardant le mode local comme défaut, pas comme repli.
- **Abonnement premium réglé en mobile money.** Les paiements par lien web
  d'Orange Money, MTN MoMo ou Wave s'intègrent sans application native ; la
  difficulté est la vérification du paiement, qui demande un petit service
  côté serveur, le premier de l'application.
- **Coach IA.** Suggestion de charge pour la série suivante à partir de
  l'historique, repérage des stagnations, programmes adaptés au matériel
  réellement disponible dans la salle.
- **Publication sur le Play Store.** Un empaquetage de la PWA (Trusted Web
  Activity, via Bubblewrap) permet de publier sans réécrire l'application.
- **Plus petit mais utile :** modèles créés par l'utilisateur à partir d'une
  séance terminée, notes par exercice, minuteur par exercice plutôt que global,
  et graphiques de volume par groupe musculaire.
