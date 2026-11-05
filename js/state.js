/* ============================================================
   TREASURE EXPLORER — État du jeu & sauvegarde localStorage
   ============================================================ */

const State = (() => {
  const SAVE_KEY = 'treasureExplorerSave_v1';
  const XP_PER_LEVEL = 120;

  function defaultData() {
    return {
      player: null,              // { name, avatarId }
      gold: 0,
      totalGold: 0,
      xp: 0,
      level: 1,
      ship: 1,
      treasures: [],             // ids de trésors
      missions: [],              // 'islandId-index'
      badges: [],                // ids de badges
      stats: { riddle: 0, code: 0, map: 0, path: 0 },
      settings: { sound: true, animations: true },
    };
  }

  const S = { data: defaultData() };

  S.load = function () {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      S.data = Object.assign(defaultData(), parsed);
      S.data.stats = Object.assign(defaultData().stats, parsed.stats || {});
      S.data.settings = Object.assign(defaultData().settings, parsed.settings || {});
      S.data.level = levelFromXp(S.data.xp);
      return true;
    } catch (e) {
      return false;
    }
  };

  S.save = function () {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(S.data)); } catch (e) {}
  };

  S.reset = function () {
    S.data = defaultData();
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  };

  S.hasPlayer = () => !!S.data.player;

  function levelFromXp(xp) {
    return Math.min(20, Math.floor(xp / XP_PER_LEVEL) + 1);
  }

  S.xpProgress = function () {
    return { current: S.data.xp % XP_PER_LEVEL, needed: XP_PER_LEVEL };
  };

  S.addGold = function (n) {
    S.data.gold += n;
    S.data.totalGold += n;
  };

  S.spendGold = function (n) {
    if (S.data.gold < n) return false;
    S.data.gold -= n;
    return true;
  };

  // Retourne le nouveau niveau si level up, sinon null
  S.addXp = function (n) {
    const before = S.data.level;
    S.data.xp += n;
    S.data.level = levelFromXp(S.data.xp);
    return S.data.level > before ? S.data.level : null;
  };

  S.addTreasure = function (id) {
    if (!S.data.treasures.includes(id)) S.data.treasures.push(id);
  };

  S.isMissionDone = (islandId, idx) => S.data.missions.includes(islandId + '-' + idx);
  S.completeMission = (islandId, idx) => {
    const key = islandId + '-' + idx;
    if (!S.data.missions.includes(key)) S.data.missions.push(key);
  };

  S.islandDone = (island) => island.missions.every((_, i) => S.isMissionDone(island.id, i));
  S.islandProgress = (island) => island.missions.filter((_, i) => S.isMissionDone(island.id, i)).length;

  // Île accessible selon niveau + navire
  S.islandUnlocked = function (island) {
    return S.data.level >= island.minLevel && S.data.ship >= island.minShip;
  };

  // Conditions manquantes pour débloquer une île
  S.islandRequirements = function (island) {
    const req = [];
    if (S.data.level < island.minLevel) req.push('Niveau ' + island.minLevel + ' requis');
    if (S.data.ship < island.minShip) req.push('Navire « ' + DATA.ships[island.minShip - 1].name + ' » requis');
    return req;
  };

  S.shipInfo = () => DATA.ships[S.data.ship - 1];
  S.nextShip = () => (S.data.ship < DATA.ships.length ? DATA.ships[S.data.ship] : null);

  S.upgradeShip = function () {
    const next = S.nextShip();
    if (!next || S.data.gold < next.cost) return false;
    S.data.gold -= next.cost;
    S.data.ship = next.level;
    return true;
  };

  S.hasBadge = (id) => S.data.badges.includes(id);
  S.earnBadge = function (id) {
    if (S.data.badges.includes(id)) return false;
    S.data.badges.push(id);
    return true;
  };

  S.applySettings = function () {
    document.body.classList.toggle('no-anim', !S.data.settings.animations);
  };

  return S;
})();
