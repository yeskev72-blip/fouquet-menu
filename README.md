# Le Fouquet — Menu digital

Menu en ligne du restaurant **Le Fouquet** (Restaurant · Bar · Pizzeria · Pâtisserie),
avec envoi de la commande directement sur le **WhatsApp du restaurant**.

Le site est 100 % statique : trois fichiers, aucune dépendance, aucun serveur à installer.

## Utilisation

Ouvrez `index.html` dans un navigateur — c'est tout. Aucune construction préalable.

Pour le mettre en ligne, déposez le dossier sur n'importe quel hébergeur statique
(GitHub Pages, Netlify, Vercel, ou un simple dossier `public_html` chez un hébergeur classique).

## Ce que le client peut faire

- Parcourir les **199 articles** de la carte, répartis en 32 catégories et 3 parties
  (Restaurant · Bar · Carnet).
- **Rechercher** un plat ou une boisson (la recherche ignore les accents : « crepe » trouve « crêpe »).
- Filtrer par partie, sauter directement à une catégorie.
- **Ajouter au panier**, y compris les plats à déclinaisons (sandwich / assiette,
  poisson / viande, bouteille / conso, nombre de boules…).
- Choisir **sur place** (avec n° de table), **à emporter** ou **livraison** (avec adresse),
  indiquer une heure et une note pour la cuisine.
- **Envoyer la commande sur WhatsApp** : le message est pré-rédigé, il ne reste qu'à
  appuyer sur « Envoyer ». Un bouton « Copier le récapitulatif » sert de repli si
  WhatsApp n'est pas installé.

La commande est conservée dans le navigateur (`localStorage`) : le client peut fermer
la page et revenir sans tout ressaisir.

## Le message envoyé au restaurant

```
*NOUVELLE COMMANDE — Le Fouquet*

👤 Client : Kevin
📍 Sur place — Table 12
🕐 Pour : 19h30

*Commande :*
• 2 × Pizza Fouquet — 15.000 F
• 1 × Shawarma Poulet (Assiette) — 6.000 F

*TOTAL : 21.000 F*

📝 Note : Sans oignon svp

_Commande envoyée depuis le menu en ligne._
```

## Structure

```
index.html          Structure de la page
assets/styles.css   Mise en forme (mobile d'abord, feuille d'impression incluse)
assets/app.js       Rendu du menu, panier, génération du message WhatsApp
data/menu.js        Toutes les données de la carte — le seul fichier à modifier au quotidien
```

## Mettre la carte à jour

Tout se passe dans `data/menu.js`. Les prix sont des **nombres entiers** en francs CFA
(`7500` s'affiche `7.500 F`).

Un plat à prix unique :

```js
{ name: "Pizza Reine", desc: "Sauce tomate, jambon, poivron…", price: 6000 }
```

Un plat à plusieurs déclinaisons :

```js
{
  name: "Shawarma Poulet",
  desc: "Frite, poulet, laitue, choux, oignon",
  prices: [
    { label: "Sandwich", price: 3000 },
    { label: "Assiette",  price: 6000 }
  ]
}
```

Un plat dont le prix se demande au comptoir (non commandable en ligne) :

```js
{ name: "Moët & Chandon", price: null }
```

`desc` est facultatif. Une catégorie peut porter une `note` affichée sous son titre.

## Changer le numéro WhatsApp

En haut de `data/menu.js`, dans `restaurant` :

```js
whatsapp: "2290194942170",   // format international, sans "+", sans espaces
phones: ["+229 01 94 94 21 70", "+229 01 91 39 14 14"]
```

`whatsapp` alimente les liens `wa.me` ; `phones` alimente les liens d'appel et le pied de page.

## Points à confirmer avec le restaurant

Ces éléments proviennent du menu papier et méritent une vérification avant mise en ligne :

- **Champagnes** : les prix étaient manuscrits et illisibles sur le document source.
  Ils sont donc affichés « Prix sur demande » (`price: null`).
- **Partie C (Carnet)** : ces plats viennent d'un second carnet ; leur présence actuelle
  à la carte est à confirmer. Si elle est confirmée, on peut fusionner ces catégories
  dans la Partie A ; sinon, supprimer la section `carnet` de `data/menu.js`.
- Les prix corrigés au post-it sur le carnet (brochette de gambas, gambas grillée,
  gambas panées à 9.000 F) ont été retenus à la place des prix imprimés.
