/* ============================================================
   TREASURE EXPLORER — Données du jeu
   ============================================================ */

const DATA = {};

/* ---------- Personnages ---------- */
DATA.characters = [
  { id: 'marina', emoji: '👩‍✈️', name: 'Marina la Téméraire', trait: 'Née dans une tempête, elle ne craint aucune mer.' },
  { id: 'diego', emoji: '🧔', name: 'Diego le Navigateur', trait: 'Il lit les étoiles comme un livre ouvert.' },
  { id: 'lea', emoji: '👩‍🎨', name: 'Léa la Cartographe', trait: 'Aucune île n\'échappe à sa plume ni à sa boussole.' },
  { id: 'marco', emoji: '🧑‍🚀', name: 'Marco l\'Aventurier', trait: 'Son rire résonne plus fort que le tonnerre.' },
];

/* ---------- Navires ---------- */
DATA.ships = [
  { level: 1, name: 'La Chaloupe', emoji: '🛶', cost: 0, desc: 'Frêle embarcation, mais elle flotte. C\'est un début.' },
  { level: 2, name: 'La Caravelle', emoji: '⛵', cost: 150, desc: 'Rapide et agile, digne des premiers grands voyageurs.' },
  { level: 3, name: 'Le Galion', emoji: '🚢', cost: 350, desc: 'Un mastodonte des mers capable d\'affronter les brumes.' },
  { level: 4, name: 'La Frégate', emoji: '🛳️', cost: 700, desc: 'Fierté de la flotte, elle fend les vagues les plus hautes.' },
  { level: 5, name: 'Le Vaisseau Légendaire', emoji: '🚤', cost: 1100, desc: 'Le navire des légendes. Même Poséidon en est jaloux.' },
];

/* ---------- Trésors ---------- */
DATA.treasures = [
  // Commun
  { id: 'piece-or', name: 'Pièce d\'or ancienne', emoji: '🪙', rarity: 'commun', desc: 'Frappée il y a trois siècles sous un roi oublié.' },
  { id: 'coquillage', name: 'Coquillage nacré', emoji: '🐚', rarity: 'commun', desc: 'On entend l\'océan quand on l\'approche de l\'oreille.' },
  { id: 'rhum', name: 'Bouteille de rhum ambré', emoji: '🍾', rarity: 'commun', desc: 'Le carburant préféré de tout équipage qui se respecte.' },
  { id: 'carte-dechiree', name: 'Fragment de carte', emoji: '📄', rarity: 'commun', desc: 'Un morceau de parchemin qui semble mener quelque part…' },
  { id: 'dague', name: 'Dague rouillée', emoji: '🗡️', rarity: 'commun', desc: 'Elle a vu bien des abordages, à en juger par sa lame.' },
  // Rare
  { id: 'boussole', name: 'Boussole en laiton', emoji: '🧭', rarity: 'rare', desc: 'Son aiguille tremble quand un trésor est proche.' },
  { id: 'perle', name: 'Perle des abysses', emoji: '🦪', rarity: 'rare', desc: 'Pêchée à trente brassées par un plongeur intrépide.' },
  { id: 'anneau', name: 'Anneau du corsaire', emoji: '💍', rarity: 'rare', desc: 'Gravé d\'un crâne souriant et d\'une devise : « Tout ou rien ».' },
  { id: 'longue-vue', name: 'Longue-vue en laiton', emoji: '🔭', rarity: 'rare', desc: 'Avec elle, on voit les mouettes avant qu\'elles ne décollent.' },
  { id: 'emeraude', name: 'Émeraude marine', emoji: '💚', rarity: 'rare', desc: 'Verte comme le cœur d\'une vague au soleil levant.' },
  // Épique
  { id: 'couronne', name: 'Couronne du roi des mers', emoji: '👑', rarity: 'epique', desc: 'Perdue lors du naufrage du souverain des flots.' },
  { id: 'sabre', name: 'Sabre d\'abordage', emoji: '⚔️', rarity: 'epique', desc: 'La lame chantait au vent dans les batailles légendaires.' },
  { id: 'parchemin', name: 'Parchemin des Anciens', emoji: '📜', rarity: 'epique', desc: 'Des cartes oubliées, des routes que plus personne n\'ose suivre.' },
  { id: 'cristal', name: 'Cristal des tempêtes', emoji: '🔮', rarity: 'epique', desc: 'On dit qu\'il a capturé un éclair la nuit du grand raz-de-marée.' },
  // Légendaire
  { id: 'coeur-ocean', name: 'Cœur de l\'océan', emoji: '💠', rarity: 'legendaire', desc: 'Le plus grand saphir du monde, bleu comme l\'infini.' },
  { id: 'crane-or', name: 'Crâne d\'or de Barbe-Rousse', emoji: '💀', rarity: 'legendaire', desc: 'Le trophée du pirate le plus redouté des sept mers.' },
  { id: 'coffre-legende', name: 'Relique de l\'Atlantide', emoji: '⚱️', rarity: 'legendaire', desc: 'Un artefact remonté des ruines de la cité engloutie.' },
];

DATA.rarityNames = { commun: 'Commun', rare: 'Rare', epique: 'Épique', legendaire: 'Légendaire' };

/* ---------- Îles ---------- */
/* minLevel = niveau joueur requis, minShip = niveau de navire requis */
DATA.islands = [
  {
    id: 'coquillages', name: 'Île aux Coquillages', emoji: '🏝️', difficulty: 1,
    minLevel: 1, minShip: 1, x: 20, y: 66,
    desc: 'Une île paisible bordée de plages roses. Les pêcheurs racontent qu\'un vieux capitaine y aurait enterré son premier butin.',
    missions: [
      { type: 'riddle', icon: '🦜', title: 'L\'énigme du vieux pêcheur', desc: 'Un pêcheur au parler étrange garde le secret de la plage.', gold: 40, xp: 40, treasure: 'piece-or' },
      { type: 'path', icon: '🌴', title: 'Le sentier des palmiers', desc: 'Un dédale de palmiers cache un coffre ensablé.', gold: 50, xp: 45, treasure: 'coquillage' },
      { type: 'code', icon: '🗝️', title: 'Le coffre du capitaine', desc: 'Le vieux coffre du capitaine est scellé par un code de symboles.', gold: 60, xp: 55, treasure: 'carte-dechiree' },
    ],
  },
  {
    id: 'emeraude', name: 'Atoll d\'Émeraude', emoji: '🏖️', difficulty: 2,
    minLevel: 2, minShip: 1, x: 38, y: 38,
    desc: 'Un lagon turquoise où les récifs brillent comme des gemmes. Les perles y sont grosses comme des poings, dit-on.',
    missions: [
      { type: 'map', icon: '🗺️', title: 'La carte déchirée', desc: 'Les morceaux d\'une carte au trésor gisent sur le sable.', gold: 70, xp: 60, treasure: 'perle' },
      { type: 'riddle', icon: '🦀', title: 'Le devin du récif', desc: 'Un crabe philosophe pose une devinette à quiconque passe.', gold: 75, xp: 65, treasure: 'rhum' },
      { type: 'code', icon: '⚙️', title: 'Le mécanisme du phare', desc: 'Le vieux phare de l\'atoll renferme un mécanisme à symboles.', gold: 85, xp: 70, treasure: 'boussole' },
    ],
  },
  {
    id: 'crane', name: 'Île du Crâne', emoji: '💀', difficulty: 3,
    minLevel: 4, minShip: 2, x: 55, y: 68,
    desc: 'Une île sombre en forme de crâne. Les pirates y cachaient leurs prises les plus précieuses — et leurs pièges.',
    missions: [
      { type: 'path', icon: '🕳️', title: 'Les grottes piégées', desc: 'Des galeries obscures truffées de pièges mènent au trésor.', gold: 100, xp: 85, treasure: 'anneau' },
      { type: 'riddle', icon: '👻', title: 'Le fantôme du corsaire', desc: 'L\'esprit d\'un corsaire n\'accorde son aide qu\'aux esprits vifs.', gold: 110, xp: 90, treasure: 'longue-vue' },
      { type: 'code', icon: '📿', title: 'L\'autel des symboles', desc: 'Un autel ancien s\'ouvre par une combinaison oubliée.', gold: 120, xp: 100, treasure: 'emeraude' },
    ],
  },
  {
    id: 'brumes', name: 'Archipel des Brumes', emoji: '🌫️', difficulty: 4,
    minLevel: 6, minShip: 3, x: 70, y: 30,
    desc: 'Des îles fantomatiques qui apparaissent et disparaissent dans la brume. Seuls les meilleurs marins s\'y aventurent.',
    missions: [
      { type: 'map', icon: '🧩', title: 'La carte brisée', desc: 'Le brouillard a dispersé les fragments de la seule carte sûre.', gold: 140, xp: 115, treasure: 'parchemin' },
      { type: 'path', icon: '🌊', title: 'Le passage secret', desc: 'Un dédale de récifs affleure à marée basse.', gold: 150, xp: 125, treasure: 'cristal' },
      { type: 'riddle', icon: '🧜', title: 'Le chant de la sirène', desc: 'Une sirène ne libère son secret qu\'à qui résout sa devinette.', gold: 160, xp: 135, treasure: 'dague' },
    ],
  },
  {
    id: 'volcan', name: 'Île Volcanique', emoji: '🌋', difficulty: 5,
    minLevel: 8, minShip: 4, x: 84, y: 58,
    desc: 'Une montagne de feu au milieu des flots. Les trésors des conquistadors gisent dans ses entrailles brûlantes.',
    missions: [
      { type: 'code', icon: '🔥', title: 'La porte de lave', desc: 'Une porte gravée dans le basalte garde la chambre du trésor.', gold: 190, xp: 160, treasure: 'couronne' },
      { type: 'map', icon: '📜', title: 'Le plan du conquistador', desc: 'Reconstituez le plan laissé par le dernier conquistador.', gold: 200, xp: 170, treasure: 'sabre' },
      { type: 'riddle', icon: '🦅', title: 'L\'oracle du sommet', desc: 'Au sommet du volcan, un oracle teste votre sagesse.', gold: 210, xp: 180, treasure: 'coeur-ocean' },
    ],
  },
  {
    id: 'legende', name: 'Île Légendaire', emoji: '✨', difficulty: 6,
    minLevel: 10, minShip: 5, x: 88, y: 16,
    desc: 'L\'île que tous les explorateurs cherchent et que nul n\'a jamais trouvée. Jusqu\'à vous, peut-être.',
    missions: [
      { type: 'path', icon: '🏛️', title: 'Les ruines englouties', desc: 'Un labyrinthe de ruines atlantes recouvertes de corail.', gold: 250, xp: 220, treasure: 'crane-or' },
      { type: 'code', icon: '🔱', title: 'Le sceau de Poséidon', desc: 'Le sceau divin ne s\'ouvre qu\'à la combinaison sacrée.', gold: 270, xp: 240, treasure: 'coffre-legende' },
      { type: 'map', icon: '🌟', title: 'La carte des étoiles', desc: 'La dernière épreuve : recomposer la carte céleste des Anciens.', gold: 300, xp: 280, treasure: 'piece-or' },
    ],
  },
];

DATA.islandById = {};
DATA.islands.forEach(i => { DATA.islandById[i.id] = i; });
DATA.treasureById = {};
DATA.treasures.forEach(t => { DATA.treasureById[t.id] = t; });

/* ---------- Énigmes ---------- */
DATA.riddles = [
  { q: 'Je suis prise quand on me jette, abandonnée quand on me garde. Que suis-je ?',
    options: ['Le filet de pêche', 'L\'ancre', 'La voile', 'Le gouvernail'], answer: 1 },
  { q: 'J\'ai des mers sans eau, des montagnes sans pierre et des villes sans maisons. Que suis-je ?',
    options: ['Un rêve', 'Une carte', 'Un tableau', 'Une histoire'], answer: 1 },
  { q: 'Plus il y en a, moins on voit. De quoi s\'agit-il ?',
    options: ['Le brouillard et l\'obscurité', 'Les poissons', 'Les vagues', 'Les étoiles'], answer: 0 },
  { q: 'Je tourne la nuit sans jamais bouger de ma place et je guide les marins vers le port. Qui suis-je ?',
    options: ['La lune', 'L\'étoile polaire', 'La lumière du phare', 'La boussole'], answer: 2 },
  { q: 'Je suis toujours devant toi, mais tu ne pourras jamais me rattraper. Que suis-je ?',
    options: ['Le vent', 'L\'horizon', 'Un navire fantôme', 'Le courant'], answer: 1 },
  { q: 'Je suis plein de trous mais je peux quand même contenir de l\'eau. Que suis-je ?',
    options: ['Un tonneau percé', 'Une éponge', 'Une épuisette', 'Un corail'], answer: 1 },
  { q: 'Qu\'est-ce qui monte et descend sans jamais bouger de place ?',
    options: ['La marée', 'L\'ancre', 'L\'escalier', 'Le soleil'], answer: 2 },
  { q: 'J\'ai une aiguille qui ne coud pas et je montre toujours le nord. Qui suis-je ?',
    options: ['Une horloge', 'Un poisson-scie', 'La boussole', 'Le sextant'], answer: 2 },
  { q: 'Plus je sèche, plus je deviens mouillée. Qui suis-je ?',
    options: ['La serviette', 'L\'éponge', 'La voile', 'La corde'], answer: 0 },
  { q: 'Qu\'est-ce qui t\'appartient mais que les autres utilisent plus que toi ?',
    options: ['Ton navire', 'Ta carte', 'Ton nom', 'Ton trésor'], answer: 2 },
  { q: 'Le capitaine a 3 filles : Corail, Vague et… ?',
    options: ['Perle', 'Écume', 'On ne peut pas savoir', 'Lisez bien : le capitaine a 3 filles'], answer: 3 },
  { q: 'Je voyage autour du monde tout en restant dans mon coin. Que suis-je ?',
    options: ['Le timbre', 'Le courant marin', 'La mouette', 'Le drapeau'], answer: 0 },
];

/* ---------- Labyrinthes ---------- */
/* # = mur, . = chemin, S = départ, C = coffre, T = piège */
DATA.mazes = [
  [
    '#######',
    '#S....#',
    '#.###.#',
    '#.#T#C#',
    '#.#.#.#',
    '#...#.#',
    '#######',
  ],
  [
    '#########',
    '#S..#...#',
    '#.#.#.#.#',
    '#.#...#.#',
    '#.#####.#',
    '#....T#C#',
    '#.#.#.#.#',
    '#...#...#',
    '#########',
  ],
  [
    '#########',
    '#S..#...#',
    '#...#.#.#',
    '#.###.#.#',
    '#.#T#...#',
    '#.#.#...#',
    '#.#...#.#',
    '#...#.#C#',
    '#########',
  ],
];

/* ---------- Symboles du code secret ---------- */
DATA.codeSymbols = ['⚓', '🌴', '⭐', '💀', '🦜', '🐚'];

/* ---------- Carte du puzzle (SVG → data URI) ---------- */
DATA.mapSVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'>
<rect width='300' height='300' fill='#e8d5a3'/>
<rect x='8' y='8' width='284' height='284' fill='none' stroke='#8b6f3a' stroke-width='5'/>
<rect x='16' y='16' width='268' height='268' fill='none' stroke='#b09b62' stroke-width='2'/>
<path d='M10 40 Q30 30 50 40 M10 55 Q30 45 50 55' stroke='#7fa8c9' stroke-width='3' fill='none'/>
<path d='M250 260 Q265 252 280 260 M240 275 Q260 267 280 275' stroke='#7fa8c9' stroke-width='3' fill='none'/>
<path d='M40 250 Q90 210 100 170 T150 130 T235 80' stroke='#b5482e' stroke-width='5' fill='none' stroke-dasharray='14 9' stroke-linecap='round'/>
<circle cx='40' cy='250' r='12' fill='#3a6ea5' stroke='#2b5278' stroke-width='3'/>
<line x1='228' y1='60' x2='252' y2='84' stroke='#b5482e' stroke-width='8' stroke-linecap='round'/>
<line x1='252' y1='60' x2='228' y2='84' stroke='#b5482e' stroke-width='8' stroke-linecap='round'/>
<circle cx='70' cy='80' r='22' fill='none' stroke='#8b6f3a' stroke-width='3'/>
<path d='M70 62 L75 80 L70 98 L65 80 Z' fill='#b5482e'/>
<path d='M52 80 L70 75 L88 80 L70 85 Z' fill='#5c3d1e'/>
<path d='M180 200 L195 185 L210 200 Z M170 210 L195 175 L220 210 Z' fill='#6b8f5a' stroke='#4f6b42' stroke-width='2'/>
<path d='M120 60 Q130 40 140 60 M115 65 Q125 48 135 65' stroke='#4f6b42' stroke-width='4' fill='none'/>
<line x1='130' y1='60' x2='130' y2='90' stroke='#5c3d1e' stroke-width='4'/>
<circle cx='240' cy='140' r='5' fill='#8b6f3a'/><circle cx='255' cy='155' r='4' fill='#8b6f3a'/><circle cx='230' cy='160' r='4' fill='#8b6f3a'/>
<path d='M60 150 l8 -12 l8 12 Z' fill='#3a6ea5'/><rect x='66' y='150' width='4' height='10' fill='#5c3d1e'/>
<text x='160' y='285' font-family='Georgia' font-style='italic' font-size='14' fill='#8b6f3a'>Mare Incognita ~ 1519</text>
</svg>`;
DATA.mapURI = 'data:image/svg+xml,' + encodeURIComponent(DATA.mapSVG);

/* ---------- Badges ---------- */
DATA.badges = [
  { id: 'premier', emoji: '🏆', name: 'Premier Trésor', desc: 'Découvrez votre premier trésor.', cond: s => s.treasures.length >= 1 },
  { id: 'collect5', emoji: '🧳', name: 'Collectionneur', desc: 'Possédez 5 trésors différents.', cond: s => s.treasures.length >= 5 },
  { id: 'collect10', emoji: '🏅', name: 'Maître Collectionneur', desc: 'Possédez 10 trésors différents.', cond: s => s.treasures.length >= 10 },
  { id: 'legende3', emoji: '🌟', name: 'Chasseur de Légendes', desc: 'Possédez 2 trésors légendaires.', cond: s => s.treasures.filter(t => DATA.treasureById[t].rarity === 'legendaire').length >= 2 },
  { id: 'niveau5', emoji: '🐺', name: 'Loup de Mer', desc: 'Atteignez le niveau 5.', cond: s => s.level >= 5 },
  { id: 'niveau10', emoji: '🦈', name: 'Terreur des Océans', desc: 'Atteignez le niveau 10.', cond: s => s.level >= 10 },
  { id: 'fortune', emoji: '💰', name: 'Fortune', desc: 'Amassez 500 pièces d\'or au total.', cond: s => s.totalGold >= 500 },
  { id: 'enigmes', emoji: '🧠', name: 'Esprit Vif', desc: 'Résolvez 3 énigmes.', cond: s => s.stats.riddle >= 3 },
  { id: 'amiral', emoji: '⚓', name: 'Amiral', desc: 'Possédez le Vaisseau Légendaire.', cond: s => s.ship >= 5 },
  { id: 'cartographe', emoji: '🗺️', name: 'Grand Cartographe', desc: 'Débloquez toutes les îles du monde.', cond: s => s.level >= 10 && s.ship >= 5 },
  { id: 'legende-vivante', emoji: '👑', name: 'Légende Vivante', desc: 'Terminez toutes les missions du monde.', cond: s => s.missions.length >= DATA.islands.reduce((n, i) => n + i.missions.length, 0) },
];
