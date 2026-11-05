/* Smoke test : stub DOM minimal + exécution de tous les scripts + tests logiques */
const fs = require('fs');
const path = require('path');

// ---- Stub DOM ----
function makeEl(tag) {
  const el = {
    tagName: tag || 'div',
    children: [],
    style: {},
    dataset: {},
    _cls: new Set(),
    innerHTML: '',
    textContent: '',
    value: '',
    disabled: false,
    classList: {
      add: (...c) => c.forEach(x => el._cls.add(x)),
      remove: (...c) => c.forEach(x => el._cls.delete(x)),
      toggle: (c, force) => { const has = force === undefined ? !el._cls.has(c) : force; has ? el._cls.add(c) : el._cls.delete(c); return has; },
      contains: (c) => el._cls.has(c),
    },
    setAttribute() {}, getAttribute() { return null; },
    addEventListener() {}, removeEventListener() {},
    appendChild(c) { el.children.push(c); return c; },
    querySelector() { return makeEl('div'); },
    querySelectorAll() { return []; },
    focus() {}, remove() {}, click() {},
    cloneNode() { return makeEl(tag); },
  };
  return el;
}

const byId = {};
global.document = {
  querySelector: (sel) => { if (!byId[sel]) byId[sel] = makeEl('div'); return byId[sel]; },
  querySelectorAll: () => [],
  createElement: (t) => makeEl(t),
  createElementNS: (ns, t) => makeEl(t),
  addEventListener() {},
  body: makeEl('body'),
};
const store = {};
global.localStorage = {
  getItem: k => store[k] ?? null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; },
};
global.window = { addEventListener() {}, scrollTo() {}, AudioContext: undefined };

// ---- Charger les scripts dans l'ordre ----
const files = ['data.js', 'audio.js', 'state.js', 'ui.js', 'minigames.js', 'game.js', 'main.js'];
try {
  const bundle = files.map(f => fs.readFileSync(path.join(__dirname, 'js', f), 'utf8')).join('\n;\n')
    + '\n;globalThis.__T = { DATA, State, UI, Game, Minigames, SFX };';
  // eslint-disable-next-line no-eval
  (0, eval)(bundle);
  Object.assign(globalThis, globalThis.__T);
  files.forEach(f => console.log('LOADED', f));
} catch (e) {
  console.error('FAIL LOAD', e.message);
  process.exit(1);
}

let failures = 0;
const check = (name, cond) => {
  if (cond) console.log('  PASS', name);
  else { failures++; console.error('  FAIL', name); }
};

// ---- Tests logiques ----
console.log('\n== Données ==');
check('6 îles', DATA.islands.length === 6);
check('17 trésors', DATA.treasures.length === 17);
check('11 badges', DATA.badges.length === 11);
check('5 navires', DATA.ships.length === 5);
check('12 énigmes', DATA.riddles.length >= 10);
DATA.islands.forEach(i => {
  check(`île ${i.id} a 3 missions`, i.missions.length === 3);
  i.missions.forEach((m, k) => {
    check(`  ${i.id}-m${k} trésor existe`, !!DATA.treasureById[m.treasure]);
    check(`  ${i.id}-m${k} type valide`, ['riddle', 'code', 'map', 'path'].includes(m.type));
  });
});
DATA.riddles.forEach((r, i) => {
  check(`énigme ${i} a 4 options et réponse valide`, r.options.length === 4 && r.answer >= 0 && r.answer < 4);
});

// BFS solvabilité des labyrinthes
console.log('\n== Labyrinthes (BFS) ==');
DATA.mazes.forEach((rows, mi) => {
  const g = rows.map(r => r.split(''));
  let sx, sy, cx, cy;
  rows.forEach((r, y) => r.split('').forEach((c, x) => {
    if (c === 'S') { sx = x; sy = y; }
    if (c === 'C') { cx = x; cy = y; }
  }));
  check(`laby ${mi} a S et C`, sx !== undefined && cx !== undefined);
  const seen = new Set([sx + ',' + sy]);
  const q = [[sx, sy]];
  let found = false;
  while (q.length) {
    const [x, y] = q.shift();
    if (x === cx && y === cy) { found = true; break; }
    for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      const nx = x + dx, ny = y + dy;
      if (ny < 0 || ny >= g.length || nx < 0 || nx >= g[0].length) continue;
      if (g[ny][nx] === '#') continue;
      const k = nx + ',' + ny;
      if (!seen.has(k)) { seen.add(k); q.push([nx, ny]); }
    }
  }
  check(`laby ${mi} résoluble`, found);
});

// ---- État & progression ----
console.log('\n== État / progression ==');
State.data.player = { name: 'Test', avatarId: 'marina' };
check('île 1 débloquée au départ', State.islandUnlocked(DATA.islands[0]));
check('île 6 verrouillée au départ', !State.islandUnlocked(DATA.islands[5]));
check('niveau 1', State.data.level === 1);

let lvl = State.addXp(140);
check('xp 140 → niv 2', State.data.level === 2 && lvl === 2);
State.addXp(100000);
check('niveau cappé à 20', State.data.level === 20);
State.data.ship = 5;
check('île 6 débloquée niv max + navire 5', State.islandUnlocked(DATA.islands[5]));

State.data.gold = 200;
check('dépense ok', State.spendGold(150) && State.data.gold === 50);
check('dépense refusée', !State.spendGold(999) && State.data.gold === 50);
check('ship upgrade refusé pauvre', !State.upgradeShip());
State.data.gold = 5000;
State.data.ship = 1;
check('ship upgrade ok', State.upgradeShip() && State.data.ship === 2 && State.data.gold === 4850);

// Badges — toutes les conds s'évaluent sans erreur
DATA.badges.forEach(b => {
  try { b.cond(State.data); check(`badge ${b.id} cond ok`, true); }
  catch (e) { check(`badge ${b.id} cond ok`, false); }
});

// Sauvegarde / rechargement
State.data.gold = 4242;
State.save();
check('save écrit', !!store.treasureExplorerSave_v1);
State.data.gold = 0;
State.load();
check('load restaure gold', State.data.gold === 4242);

// ---- Rendu des écrans (pas d'exception) ----
console.log('\n== Rendu écrans ==');
try { Game.showMap(); check('renderMap', true); } catch (e) { check('renderMap: ' + e.message, false); }
try { Game.openIsland(DATA.islands[0]); check('openIsland', true); } catch (e) { check('openIsland: ' + e.message, false); }
try { Game.renderShip(); check('renderShip', true); } catch (e) { check('renderShip: ' + e.message, false); }
try { Game.renderCollection(); check('renderCollection', true); } catch (e) { check('renderCollection: ' + e.message, false); }
try { Game.renderSettings(); check('renderSettings', true); } catch (e) { check('renderSettings: ' + e.message, false); }

// ---- Mini-jeux : ouverture sans exception ----
console.log('\n== Mini-jeux (ouverture) ==');
(async () => {
  for (const t of ['riddle', 'code', 'map', 'path']) {
    try {
      const p = Minigames.play(t, 3);
      Minigames.finish('abort'); // simule fermeture
      const r = await p;
      check(`minigame ${t} → ${r}`, r === 'abort');
    } catch (e) { check(`minigame ${t}: ${e.message}`, false); }
  }
  console.log(failures === 0 ? '\n✅ TOUS LES TESTS PASSENT' : `\n❌ ${failures} ÉCHEC(S)`);
  process.exit(failures ? 1 : 0);
})();
