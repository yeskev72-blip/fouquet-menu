/* Données du menu — Restaurant Le Fouquet
 * Prix en francs CFA (XOF). Extraits du menu papier + carnet additionnel.
 * Un item a soit `price` (prix unique), soit `prices` (plusieurs déclinaisons).
 * price: null  => "prix sur demande" (non commandable directement)
 */
window.MENU_DATA = {
  restaurant: {
    name: "Le Fouquet",
    tagline: "Restaurant · Bar · Pizzeria · Pâtisserie",
    specialites: "Spécialités africaine · européenne · asiatique",
    currency: "F",
    // Numéro WhatsApp du restaurant au format international, sans "+" ni espaces
    whatsapp: "2290194942170",
    phones: ["+229 01 94 94 21 70", "+229 01 91 39 14 14"]
  },

  sections: [
    {
      id: "restaurant",
      label: "Partie A — Restaurant",
      short: "Restaurant",
      categories: [
        {
          id: "petit-dejeuner",
          label: "Petit Déjeuner",
          icon: "🍳",
          items: [
            { name: "Omelette nature", price: 2000 },
            { name: "Omelette jambon", price: 2500 },
            { name: "Omelette fromage", price: 2500 },
            { name: "Omelette jambon, fromage", price: 3000 },
            { name: "Œuf sur plat", price: 2000 },
            { name: "Œuf brouillé", price: 2000 },
            { name: "I – Spécial Fouquet", desc: "Boisson chaude, friand viande, jus de fruits nature", price: 3000 },
            { name: "II – Spécial Fouquet 1", desc: "Omelette nature, pain toasté, pancake, salade verte, beurre confiture, pain au chocolat, croissant, jus nature, boisson chaude", price: 5500 },
            { name: "III – Spécial Fouquet 2", desc: "Omelette nature, pain toasté, pancake, salade verte, beurre confiture, pain au chocolat, croissant, friand, poisson, jus nature au choix, boisson chaude, beignet de fruits au choix", price: 8500 }
          ]
        },
        {
          id: "paninis",
          label: "Nos Paninis",
          icon: "🥪",
          items: [
            { name: "Panini Fouquet", desc: "Jambon, viande hachée, emmental, mozza et tomate", price: 4000 },
            { name: "Panini Italien", desc: "Jambon, parmesan, emmental et tomate", price: 3000 },
            { name: "Panini Napoli", desc: "Thon, poulet, fromage et tomate", price: 3500 },
            { name: "Panini Mexicaine", desc: "Poulet fumé, crevette et fromage", price: 3500 }
          ]
        },
        {
          id: "burgers",
          label: "Nos Burgers",
          icon: "🍔",
          note: "Au choix : sandwich seul ou assiette avec frite.",
          items: [
            { name: "Hamburger", desc: "Viande, salade, frite", prices: [{ label: "Sandwich", price: 2500 }, { label: "Assiette + frite", price: 3500 }] },
            { name: "Cheese Burger", desc: "Viande, salade, fromage", prices: [{ label: "Sandwich", price: 3500 }, { label: "Assiette + frite", price: 4500 }] },
            { name: "Double Burger", desc: "2 viandes, tomate, laitue", prices: [{ label: "Sandwich", price: 3500 }, { label: "Assiette + frite", price: 5000 }] },
            { name: "Double Cheese Burger", desc: "2 viandes, 2 fromages, laitue", prices: [{ label: "Sandwich", price: 4000 }, { label: "Assiette + frite", price: 5000 }] },
            { name: "King Burger", desc: "Viande, œuf, fromage, laitue", prices: [{ label: "Sandwich", price: 4000 }, { label: "Assiette + frite", price: 5000 }] },
            { name: "Chicken Burger", desc: "Chicken, laitue, oignon, tomate", prices: [{ label: "Sandwich", price: 3000 }, { label: "Assiette + frite", price: 4500 }] },
            { name: "Fish Burger", desc: "Fish, laitue, tomate, oignon", prices: [{ label: "Sandwich", price: 3500 }, { label: "Assiette + frite", price: 4500 }] }
          ]
        },
        {
          id: "shawarmas",
          label: "Nos Shawarmas",
          icon: "🌯",
          items: [
            { name: "Shawarma Viande", desc: "Frite, viande, laitue, choux, oignon", prices: [{ label: "Sandwich", price: 2500 }, { label: "Assiette", price: 5000 }] },
            { name: "Shawarma Poulet", desc: "Frite, poulet, laitue, choux, oignon", prices: [{ label: "Sandwich", price: 3000 }, { label: "Assiette", price: 6000 }] },
            { name: "Shawarma Royal", desc: "Frite, poulet, crevette, laitue, oignon", prices: [{ label: "Sandwich", price: 3000 }, { label: "Assiette", price: 6000 }] },
            { name: "Shawarma Mixte", desc: "Frite, viande, poulet, laitue, oignon", prices: [{ label: "Sandwich", price: 3000 }, { label: "Assiette", price: 6000 }] }
          ]
        },
        {
          id: "entrees-froides",
          label: "Entrées Froides",
          icon: "🥗",
          items: [
            { name: "Salade du Chef", desc: "Laitue, tomate, cornichon, emmental, maïs doux, jambon, poulet, olive noire, sauce blanche, pain toasté", price: 6500 },
            { name: "Salade César", desc: "Laitue, croûton à l'ail, lardon, tranche de poulet, parmesan, sauce blanche", price: 6000 },
            { name: "Salade Fouquet", desc: "Laitue, tomate, poulet, viande bœuf, emmental, jambon, oignon, olive noire, sauce blanche", price: 7500 },
            { name: "Salade Gésier", desc: "Laitue, tomate toastée à l'ail, gésier, œuf, amande effilée grillée, sauce blanche", price: 6500 },
            { name: "Salade Niçoise", desc: "Laitue, tomate, pomme de terre, haricot vert, thon, anchois, poivron, œuf, olive noire, oignon vert, vinaigrette", price: 7000 }
          ]
        },
        {
          id: "entrees-chaudes",
          label: "Entrées Chaudes",
          icon: "🔥",
          items: [
            { name: "Salade Fouquet magnifique", desc: "Pomme de terre, haricot vert, carotte julienne, œufs durs, filet de poisson, sauce crème", price: 7000 },
            { name: "Crevette sautée aux nouilles", desc: "Crevette, carotte, haricot vert, moutarde, crème fraîche", price: 6000 }
          ]
        },
        {
          id: "sandwichs",
          label: "Sandwichs",
          icon: "🥖",
          items: [
            { name: "Club Sandwich", desc: "Pain de mie, laitue, tomate, œuf, poulet, frite, mayonnaise", price: 4000 },
            { name: "Chicken Sub", desc: "Poulet, maïs doux, laitue, mayonnaise", price: 4000 },
            { name: "Steak Sub", desc: "Viande de bœuf, oignon, poivron, champignon, soy sauce, fromage", price: 4000 },
            { name: "Sandwich Faitas", desc: "Poulet, oignon, poivron, champignon, maïs doux, sauce soy, mozzarella", price: 4500 }
          ]
        },
        {
          id: "pizzas",
          label: "Nos Pizzas",
          icon: "🍕",
          items: [
            { name: "Pizza Fouquet", desc: "Sauce crème, poulet fumé, viande hachée, champignon, olive noire, mozza", price: 7500 },
            { name: "Pizza du Chef", desc: "Sauce tomate, poulet haché, crème fraîche, champignon, olive noire, mozza", price: 6000 },
            { name: "Pizza Reine", desc: "Sauce tomate, jambon, poivron, champignon, œuf, olive noire, mozza", price: 6000 },
            { name: "Pizza Marguerite", desc: "Sauce tomate, jambon, basilic sec, mozza", price: 5500 },
            { name: "Pizza Pili-Pili", desc: "Sauce tomate, viande hachée, oignon, poivron, œuf, piment basilic, mozza", price: 6000 },
            { name: "Pizza Mexicaine", desc: "Sauce tomate, viande hachée, oignon, poivron, fromage", price: 6000 },
            { name: "Pizza Fruits de mer", desc: "Filet de poisson, calamar, crevette, fromage, œuf", price: 7500 },
            { name: "Pizza 4 fromages", desc: "Sauce tomate, emmental, roquefort, parmesan, mozza", price: 6000 },
            { name: "Pizza Royale", desc: "Sauce tomate, viande hachée, œuf, olive, mozza", price: 6000 },
            { name: "Pizza Océane", desc: "Sauce tomate, crevette, thon, poisson, fromage", price: 6000 },
            { name: "Pizza 4 saisons", desc: "Sauce tomate, jambon, artichaut, champignon, poivron, olive", price: 6000 }
          ]
        },
        {
          id: "nems",
          label: "Nos Nems",
          icon: "🥟",
          items: [
            { name: "Nems Viande", price: 4500 },
            { name: "Nems Poulet", price: 5000 }
          ]
        },
        {
          id: "crepes",
          label: "Nos Crêpes",
          icon: "🥞",
          items: [
            { name: "Crêpe au fromage", desc: "Crêpe salée", price: 3000 },
            { name: "Crêpe jambon-fromage", desc: "Crêpe salée", price: 3500 },
            { name: "Crêpe paysanne", desc: "Crêpe salée — champignon, jambon, fromage", price: 4000 },
            { name: "Crêpe au chocolat", desc: "Crêpe sucrée", price: 2500 },
            { name: "Crêpe au nutella", desc: "Crêpe sucrée", price: 3000 },
            { name: "Crêpe sucrée", desc: "Crêpe sucrée", price: 2000 }
          ]
        },
        {
          id: "fruits-de-mer",
          label: "Nos Fruits de Mer",
          icon: "🦐",
          items: [
            { name: "Filet de poisson", price: 7000 },
            { name: "Brochette de poisson grillé", price: 7000 },
            { name: "Filet de poisson sauce crème", price: 7000 },
            { name: "Filet de poisson sauce Marcelino", price: 6000 },
            { name: "Carpe, Bar ou Tilapia", desc: "Temps de préparation ~30 min", prices: [{ label: "500 g", price: 7500 }, { label: "800 g", price: 10000 }] },
            { name: "Crevette à l'indienne", price: 6000 },
            { name: "Gambas sautées à l'ail", price: 10000 },
            { name: "Brochette de gambas", price: 10000 },
            { name: "Gambas à la crème", price: 12000 }
          ]
        },
        {
          id: "viandes-rouges",
          label: "Nos Viandes Rouges",
          icon: "🥩",
          items: [
            { name: "Filet de bœuf grillé", price: 6000 },
            { name: "Filet de bœuf sauce crème champignon", price: 7000 },
            { name: "Filet de bœuf sauce chasseur", price: 7000 },
            { name: "Langue de bœuf grillée", price: 6000 },
            { name: "Langue de bœuf sauce crème champignon", price: 7000 },
            { name: "Brochette de bœuf", price: 6000 }
          ]
        },
        {
          id: "viandes-blanches",
          label: "Nos Viandes Blanches",
          icon: "🍗",
          items: [
            { name: "Escalope de poulet panné", price: 6500 },
            { name: "Escalope de poulet au fromage, sauce provençale", price: 6500 },
            { name: "Fricassé de poulet aux légumes", price: 6500 },
            { name: "Poulet Strogonov", price: 6500 },
            { name: "Brochette de poulet", price: 6000 }
          ]
        },
        {
          id: "plats-africains",
          label: "Nos Plats Africains",
          icon: "🍲",
          items: [
            { name: "Poulet braisé", prices: [{ label: "Demi", price: 4500 }, { label: "Entier", price: 7000 }] },
            { name: "Poulet Yassa", prices: [{ label: "Demi", price: 4500 }, { label: "Entier", price: 8000 }] },
            { name: "Dakouin", price: 7500 },
            { name: "Sauce poisson frais", price: 7500 },
            { name: "Lapin braisé", price: 6000 },
            { name: "Monyo", price: 7500 },
            { name: "Sauce mouton", price: 7500 },
            { name: "Choukouya bœuf", price: 7000 },
            { name: "Choukouya mouton", price: 8000 },
            { name: "Langue de bœuf braisée", price: 6500 },
            { name: "Sauce Blocoto", price: 6500 }
          ]
        },
        {
          id: "sauces",
          label: "Nos Sauces",
          icon: "🥣",
          note: "Chaque sauce est servie au choix avec du poisson ou de la viande.",
          items: [
            { name: "Gombo", prices: [{ label: "Poisson", price: 6000 }, { label: "Viande", price: 7000 }] },
            { name: "Crin-crin", prices: [{ label: "Poisson", price: 6000 }, { label: "Viande", price: 7000 }] },
            { name: "Asrokouin", prices: [{ label: "Poisson", price: 6000 }, { label: "Viande", price: 7000 }] },
            { name: "Sauce Gboma", prices: [{ label: "Poisson", price: 6000 }, { label: "Viande", price: 7000 }] },
            { name: "Sauce Tchiayo", prices: [{ label: "Poisson", price: 6000 }, { label: "Viande", price: 7000 }] },
            { name: "Sauce Amanvivè", prices: [{ label: "Poisson", price: 6000 }, { label: "Viande", price: 7000 }] }
          ]
        },
        {
          id: "accompagnements",
          label: "Nos Accompagnements",
          icon: "🍚",
          note: "Riz blanc, riz oriental, riz gras, riz au curcuma, piron rouge, pâte rouge, pâte blanche, aloko, frite, pâte noire, atiéké, pomme sautée, légume sauté, couscous — inclus avec le plat.",
          items: [
            { name: "Portion supplémentaire", desc: "Accompagnement au choix", price: 1000 }
          ]
        },
        {
          id: "glaces",
          label: "Nos Glaces",
          icon: "🍨",
          items: [
            { name: "Miss Fouquet", desc: "2 boules menthe, 1 boule chocolat, amande caramélisée, cacahouètes caramélisées, chantilly", price: 4500 },
            { name: "Irrésistible", desc: "1 boule chocolat, 1 boule vanille, cookies, sauce choco, chantilly", price: 4000 },
            { name: "Monsieur Mewoui", desc: "2 boules café ou choco, 1 boule vanille, sauce choco ou café, chantilly", price: 4000 },
            { name: "Oncle JO", desc: "1 vanille, 1 chocolat, rhum crème, sauce choco, chantilly, 1 stracciatella", price: 4500 },
            { name: "Dame Yovo", desc: "2 boules, sauce choco, 1 stracciatella, chantilly", price: 4000 },
            { name: "Imperial New", desc: "2 boules tiramisu, 1 boule caramel, sauce caramel, cacahouètes caramélisées", price: 4000 },
            { name: "Cornet", prices: [{ label: "1 boule", price: 1200 }, { label: "2 boules", price: 1900 }, { label: "3 boules", price: 2700 }] },
            { name: "Coupe", prices: [{ label: "1 boule", price: 900 }, { label: "2 boules", price: 1800 }, { label: "3 boules", price: 2700 }, { label: "4 boules", price: 3600 }] },
            { name: "Pot", prices: [{ label: "1 boule", price: 1000 }, { label: "2 boules", price: 1900 }, { label: "3 boules", price: 2800 }, { label: "4 boules", price: 3700 }] }
          ]
        },
        {
          id: "pates",
          label: "Nos Pâtes Alimentaires",
          icon: "🍝",
          items: [
            { name: "Spaghetti Bolognaise", desc: "Sauce tomate, viande hachée", price: 5000 },
            { name: "Spaghetti forestière", desc: "Sauce crème, champignon, oignon", price: 5500 },
            { name: "Penné forestière", desc: "Sauce crème, tomate, poivron, champignon", price: 5500 },
            { name: "Penné aux fruits de mer", desc: "Sauce crème, calamar, crevette, champignon", price: 6500 },
            { name: "Farfalle Fouquet", desc: "Sauce provençale, boulette de viande, emmental", price: 6500 }
          ]
        },
        {
          id: "menus-enfants",
          label: "Nos Menus Enfants",
          icon: "🧒",
          items: [
            { name: "Menu Nuggets", desc: "Nuggets de poulet, frite, 1 coca et 1 boule de glace", price: 5000 },
            { name: "Menu Spaghetti", desc: "Spaghetti Bolognaise, 1 coca, 1 boule de glace", price: 5000 }
          ]
        }
      ]
    },

    {
      id: "bar",
      label: "Partie B — Bar",
      short: "Bar",
      categories: [
        {
          id: "cocktails-alcool",
          label: "Cocktails Alcoolisés",
          icon: "🍹",
          items: [
            { name: "Fouquet", desc: "Vin mousseux, Malibu, ananas, sirop de fraise", price: 6000 },
            { name: "Antillais", desc: "Jus d'orange, ananas, goyave, citron et rhum", price: 6000 },
            { name: "Marseillais", desc: "Rhum, tequila, rhum Kamel, Malibu, gin, vodka, ananas, curaçao bleu", price: 6000 },
            { name: "Mojito", desc: "Rhum, feuille de menthe, eau gazeuse, citron, sucre de canne", price: 6000 },
            { name: "Margherita", desc: "Tequila, triple sec, citron", price: 6000 },
            { name: "Aphrodisiaque", desc: "Tequila, gingembre, sucre de canne, eau gazeuse, citron", price: 6000 },
            { name: "Fouquet Punch", desc: "Rhum, cointreau, jus d'orange, ananas, citron", price: 6000 },
            { name: "Monaco", desc: "Vodka, liqueur de pêche, jus d'ananas, sirop de cassis", price: 6000 },
            { name: "Blue Largon", desc: "Vodka, citron, sucre de canne, curaçao bleu", price: 6000 }
          ]
        },
        {
          id: "cocktails-sans-alcool",
          label: "Cocktails Sans Alcool",
          icon: "🍸",
          items: [
            { name: "Le Fouquet", desc: "Jus d'ananas, sirop de grenadine, lait entier", price: 4000 },
            { name: "Virgin Pina", desc: "Jus d'ananas, lait de coco, sirop de cassis", price: 4000 },
            { name: "Fraisette", desc: "Sirop de menthe, (option) lait entier", price: 4000 },
            { name: "Virgin Mojito", desc: "Feuille de menthe, eau gazeuse, citron, sucre de canne", price: 4000 },
            { name: "Chapman", desc: "Jus d'orange, Fanta orange, Sprite, citron, Angustura, sirop de grenadine", price: 4000 },
            { name: "Danseuse", desc: "Jus de pomme, mangue, citron, sirop de cassis", price: 4000 },
            { name: "Dreams Fouquet", desc: "Jus de mangue, Sprite, sirop de fraise, crème chantilly", price: 4000 },
            { name: "Arc-en-ciel", desc: "Jus de mangue, ananas, pamplemousse, sirop de grenadine, citron, curaçao blanc", price: 4000 }
          ]
        },
        {
          id: "boissons-chaudes",
          label: "Boissons Chaudes",
          icon: "☕",
          items: [
            { name: "Express", price: 1500 },
            { name: "Café allongé", price: 1500 },
            { name: "Thé infusion", price: 1500 },
            { name: "Thé au lait", price: 1500 },
            { name: "Cappuccino", price: 2000 },
            { name: "Frappuccino", price: 2000 },
            { name: "Thé Mojito", price: 2000 },
            { name: "Chocolat chaud", price: 2000 }
          ]
        },
        {
          id: "boissons-fraiches",
          label: "Boissons Fraîches",
          icon: "🥤",
          items: [
            { name: "Eau minérale 1,5 L", price: 1200 },
            { name: "Sirop", desc: "Menthe ou grenadine", price: 1500 },
            { name: "Jus nature (grenade)", price: 1500 },
            { name: "Jus nature", desc: "Ananas, pastèque, gingembre, etc.", price: 1000 },
            { name: "Jus importé", price: 800 },
            { name: "Sucrerie", price: 800 },
            { name: "Malta café", price: 1000 },
            { name: "Bière locale", price: 1000 },
            { name: "Bière importée", desc: "Heineken, Savannah, Desperado, etc.", price: 2000 },
            { name: "Guinness", price: 1500 },
            { name: "Boisson énergétique", desc: "XXL, Rox, Doppel", price: 2000 },
            { name: "Pression", prices: [{ label: "0,25 L", price: 1000 }, { label: "0,50 L", price: 2000 }, { label: "1 L", price: 3000 }] },
            { name: "Giraffe 3 L", price: 9000 }
          ]
        },
        {
          id: "digestifs",
          label: "Nos Digestifs",
          icon: "🥃",
          note: "Au choix : à la bouteille ou à la consommation.",
          items: [
            { name: "Hennessy VS", prices: [{ label: "Bouteille", price: 45000 }, { label: "Conso", price: 4000 }] },
            { name: "Cointreau", prices: [{ label: "Bouteille", price: 80000 }, { label: "Conso", price: 3000 }] },
            { name: "Baileys", prices: [{ label: "Bouteille", price: 40000 }, { label: "Conso", price: 3000 }] }
          ]
        },
        {
          id: "aperitifs",
          label: "Nos Apéritifs",
          icon: "🍷",
          note: "Au choix : à la bouteille ou à la consommation.",
          items: [
            { name: "Campari", prices: [{ label: "Bouteille", price: 35000 }, { label: "Conso", price: 3000 }] },
            { name: "Martini", desc: "Rouge, blanc ou rosé", prices: [{ label: "Bouteille", price: 35000 }, { label: "Conso", price: 3000 }] },
            { name: "Ricard / Pastis", prices: [{ label: "Bouteille", price: 30000 }, { label: "Conso", price: 2500 }] },
            { name: "Suze", prices: [{ label: "Bouteille", price: 35000 }, { label: "Conso", price: 3000 }] },
            { name: "Gin", prices: [{ label: "Bouteille", price: 20000 }, { label: "Conso", price: 2000 }] }
          ]
        },
        {
          id: "whiskys",
          label: "Nos Whiskys",
          icon: "🥃",
          note: "Au choix : à la bouteille ou à la consommation.",
          items: [
            { name: "Black Label", prices: [{ label: "Bouteille", price: 40000 }, { label: "Conso", price: 3000 }] },
            { name: "Red Label", prices: [{ label: "Bouteille", price: 35000 }, { label: "Conso", price: 2500 }] },
            { name: "Double Black", prices: [{ label: "Bouteille", price: 60000 }, { label: "Conso", price: 5000 }] },
            { name: "Gold Label", prices: [{ label: "Bouteille", price: 50000 }, { label: "Conso", price: 4500 }] },
            { name: "Chivas 12 ans", prices: [{ label: "Bouteille", price: 45000 }, { label: "Conso", price: 3000 }] },
            { name: "Chivas 15 ans", prices: [{ label: "Bouteille", price: 50000 }, { label: "Conso", price: 3500 }] },
            { name: "Chivas 18 ans", prices: [{ label: "Bouteille", price: 70000 }, { label: "Conso", price: 5000 }] },
            { name: "Glenfiddich 12 ans", prices: [{ label: "Bouteille", price: 50000 }, { label: "Conso", price: 4000 }] },
            { name: "Glenfiddich 18 ans", prices: [{ label: "Bouteille", price: 55000 }, { label: "Conso", price: 4500 }] },
            { name: "Jack Daniel", prices: [{ label: "Bouteille", price: 40000 }, { label: "Conso", price: 3000 }] },
            { name: "Jack Daniel Fire", prices: [{ label: "Bouteille", price: 45000 }, { label: "Conso", price: 4000 }] }
          ]
        },
        {
          id: "champagnes",
          label: "Nos Champagnes",
          icon: "🍾",
          note: "Prix sur demande — à confirmer avec le bar.",
          items: [
            { name: "Moët & Chandon", price: null },
            { name: "Belaire", price: null },
            { name: "Ruinart", price: null },
            { name: "Laurent Perrier", price: null },
            { name: "Veuve Clicquot", price: null }
          ]
        }
      ]
    },

    {
      id: "carnet",
      label: "Partie C — Carnet",
      short: "Carnet",
      note: "Plats additionnels issus du second carnet du restaurant. Disponibilité à confirmer au moment de la commande.",
      categories: [
        {
          id: "desserts",
          label: "Nos Desserts",
          icon: "🍰",
          items: [
            { name: "Salade de fruits", price: 1500 },
            { name: "Mousse au chocolat", price: 2500 },
            { name: "Gaufre au chocolat banane", price: 3000 },
            { name: "Gaufre au chocolat", price: 2500 }
          ]
        },
        {
          id: "croqs",
          label: "Nos Croqs",
          icon: "🧀",
          items: [
            { name: "Croque Monsieur", price: 2000 },
            { name: "Croque Madame", price: 2500 },
            { name: "Basque jambon", price: 2500 }
          ]
        },
        {
          id: "plats-panes",
          label: "Nos Plats Panés",
          icon: "🍤",
          items: [
            { name: "Brochette de crevette", price: 5000 },
            { name: "Brochette de gambas", price: 9000 },
            { name: "Crevette sautée au poivron vert", price: 5000 },
            { name: "Crevette provençale", price: 5000 },
            { name: "Gambas grillée", price: 9000 },
            { name: "Brochette de mélo-mélo", price: 5000 },
            { name: "Cuisse de grenouille sautée", price: 5000 },
            { name: "Escargot sauté à l'ail", price: 5000 },
            { name: "Brochette d'escargot", price: 5000 },
            { name: "Beignets de crevettes", price: 4000 }
          ]
        },
        {
          id: "crustaces",
          label: "Nos Crustacés",
          icon: "🦞",
          items: [
            { name: "Filet de poisson pané", price: 5000 },
            { name: "Sole colbert", price: 5500 },
            { name: "Gambas panées", price: 9000 }
          ]
        },
        {
          id: "plats-poisson",
          label: "Nos Plats de Poisson",
          icon: "🐟",
          items: [
            { name: "Suprême de dorade poêlé", price: 4500 },
            { name: "Filet de poisson à l'ail", price: 4500 },
            { name: "Filet de poisson sauce blanche au poivre vert", price: 5000 },
            { name: "Filet de poisson au curry", price: 4500 },
            { name: "Poisson mimosa", price: 6000 },
            { name: "Sole meunière", price: 4500 },
            { name: "Bar grillé", price: 5000 },
            { name: "Carpe braisée", price: 4500 },
            { name: "Brochette de poisson", price: 3500 }
          ]
        }
      ]
    }
  ]
};
