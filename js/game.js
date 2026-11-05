/* ============================================================
   TREASURE EXPLORER — Logique du jeu
   ============================================================ */

const Game = (() => {
  let currentIsland = null;

  /* ============ CARTE DU MONDE ============ */

  function renderMap() {
    UI.renderAllHUDs();
    const wrap = UI.$('#map-islands');
    const routes = UI.$('#map-routes');
    wrap.innerHTML = '';
    routes.innerHTML = '';

    // Routes en pointillés entre îles consécutives
    for (let i = 0; i < DATA.islands.length - 1; i++) {
      const a = DATA.islands[i], b = DATA.islands[i + 1];
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
      line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
      line.setAttribute('class', 'map-route-line');
      line.setAttribute('vector-effect', 'non-scaling-stroke');
      routes.appendChild(line);
    }

    DATA.islands.forEach(island => {
      const unlocked = State.islandUnlocked(island);
      const done = State.islandDone(island);
      const btn = document.createElement('button');
      btn.className = 'island-node' + (unlocked ? '' : ' locked') + (done ? ' completed' : '');
      btn.style.left = island.x + '%';
      btn.style.top = island.y + '%';
      btn.innerHTML = `
        <span class="island-emoji">${island.emoji}</span>
        ${unlocked ? '' : '<span class="island-lock">🔒</span>'}
        ${done ? '<span class="island-complete-star">⭐</span>' : ''}
        <span class="island-label">
          ${UI.esc(island.name)}
          <span class="island-diff">${'★'.repeat(island.difficulty)}${'☆'.repeat(6 - island.difficulty)}</span>
        </span>`;
      btn.addEventListener('click', () => {
        if (!unlocked) {
          SFX.fail();
          const req = State.islandRequirements(island);
          UI.info({
            emoji: '🔒', title: island.name,
            text: 'Cette île est encore hors de portée…<br><br>' + req.map(r => '• ' + UI.esc(r)).join('<br>'),
            buttonText: 'Compris',
          });
          return;
        }
        SFX.click();
        openIsland(island);
      });
      wrap.appendChild(btn);
    });

    // Position du navire : sur la dernière île débloquée ayant des missions
    let shipIsland = DATA.islands[0];
    for (const isl of DATA.islands) {
      if (State.islandUnlocked(isl) && !State.islandDone(isl)) { shipIsland = isl; break; }
      if (State.islandUnlocked(isl)) shipIsland = isl;
    }
    const shipEl = UI.$('#map-ship');
    shipEl.textContent = State.shipInfo().emoji;
    shipEl.style.left = (shipIsland.x - 6) + '%';
    shipEl.style.top = (shipIsland.y + 8) + '%';
  }

  /* ============ ÉCRAN ÎLE ============ */

  function openIsland(island) {
    currentIsland = island;
    UI.renderAllHUDs();
    const panel = UI.$('#island-panel');
    const progress = State.islandProgress(island);
    const total = island.missions.length;

    const missionCards = island.missions.map((m, i) => {
      const done = State.isMissionDone(island.id, i);
      const unlocked = i === 0 || State.isMissionDone(island.id, i - 1);
      const cls = done ? 'done' : unlocked ? 'available' : 'locked-mission';
      const status = done ? '✅' : unlocked ? '⚔️' : '🔒';
      return `
        <div class="mission-card ${cls}" data-idx="${i}">
          <div class="mission-icon">${m.icon}</div>
          <div class="mission-info">
            <div class="mission-title">${UI.esc(m.title)}</div>
            <div class="mission-desc">${UI.esc(m.desc)}</div>
            <div class="mission-rewards">
              <span>🪙 ${done ? '+' + Math.floor(m.gold / 4) + ' or (rejeu)' : '+' + m.gold + ' or'}</span>
              <span>⭐ ${done ? '+10 XP' : '+' + m.xp + ' XP'}</span>
              ${done ? '' : `<span>🎁 ${UI.esc(DATA.treasureById[m.treasure].name)}</span>`}
            </div>
          </div>
          <div class="mission-status">${status}</div>
        </div>`;
    }).join('');

    panel.innerHTML = `
      <div class="island-header">
        <span class="island-big-emoji">${island.emoji}</span>
        <h2 class="island-name">${UI.esc(island.name)}</h2>
        <div class="island-stars">${'★'.repeat(island.difficulty)}${'☆'.repeat(6 - island.difficulty)} <span style="letter-spacing:0;font-size:.85rem">— difficulté ${island.difficulty}/6</span></div>
        <p class="island-desc">${UI.esc(island.desc)}</p>
        <div class="island-progress">📜 Progression : ${progress} / ${total} missions ${State.islandDone(island) ? '— ÎLE TERMINÉE ⭐' : ''}</div>
      </div>
      <div class="mission-list">${missionCards}</div>
      <div class="island-back-row">
        <button class="btn btn-parchment" id="btn-island-back">← Retour à la carte</button>
      </div>`;

    panel.querySelectorAll('.mission-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = +card.dataset.idx;
        const unlocked = idx === 0 || State.isMissionDone(island.id, idx - 1);
        if (!unlocked) {
          SFX.fail();
          UI.toast('🔒', 'Mission verrouillée', 'Terminez d\'abord la mission précédente.');
          return;
        }
        startMission(island, idx);
      });
    });

    UI.$('#btn-island-back').addEventListener('click', () => {
      SFX.click();
      showMap();
    });

    UI.show('island');
  }

  /* ============ MISSIONS ============ */

  async function startMission(island, idx) {
    const m = island.missions[idx];
    const alreadyDone = State.isMissionDone(island.id, idx);
    const result = await Minigames.play(m.type, island.difficulty);

    if (result === 'abort') return;
    if (result === 'fail') {
      await UI.showFail({
        title: 'Expédition échouée',
        text: 'La mer est capricieuse… Revenez tenter votre chance quand vous serez prêt.',
      });
      return;
    }

    // Victoire — ouverture du coffre
    await UI.openChestModal();

    const gold = alreadyDone ? Math.floor(m.gold / 4) : m.gold;
    const xp = alreadyDone ? 10 : m.xp;
    const treasure = alreadyDone ? null : m.treasure;

    State.addGold(gold);
    const newLevel = State.addXp(xp);
    if (treasure) State.addTreasure(treasure);
    if (!alreadyDone) {
      State.completeMission(island.id, idx);
      State.data.stats[m.type] = (State.data.stats[m.type] || 0) + 1;
    }
    SFX.coin();
    checkBadges();
    State.save();

    await UI.showReward({ treasure, gold, xp, replay: alreadyDone });

    if (newLevel) {
      SFX.levelup();
      const unlockedIslands = DATA.islands.filter(i =>
        i.minLevel === newLevel && State.data.ship >= i.minShip);
      await UI.info({
        emoji: '⭐',
        title: 'Niveau ' + newLevel + ' atteint !',
        text: 'Votre renommée grandit sur les sept mers !' +
          (unlockedIslands.length
            ? '<br><br>🏝️ Nouvelle destination à portée : <b>' + UI.esc(unlockedIslands.map(i => i.name).join(', ')) + '</b>'
            : ''),
        buttonText: 'En avant !',
      });
    }

    renderAllHUDs();
    if (State.islandDone(island)) {
      SFX.fanfare();
      await UI.info({
        emoji: '⭐',
        title: island.name + ' conquise !',
        text: 'Vous avez accompli toutes les missions de cette île. L\'équipage hisse les voiles vers de nouveaux horizons !',
        buttonText: 'Vers la carte',
      });
      showMap();
    } else {
      openIsland(island);
    }
  }

  /* ============ BADGES ============ */

  function checkBadges() {
    DATA.badges.forEach(b => {
      if (!State.hasBadge(b.id) && b.cond(State.data)) {
        State.earnBadge(b.id);
        SFX.unlock();
        UI.toast(b.emoji, 'Badge débloqué : ' + b.name, b.desc);
      }
    });
  }

  /* ============ NAVIRE ============ */

  function renderShip() {
    UI.renderAllHUDs();
    const panel = UI.$('#ship-panel');
    const cur = State.shipInfo();
    const next = State.nextShip();

    const steps = DATA.ships.map(s => {
      let cls = '';
      if (s.level === State.data.ship) cls = 'current';
      else if (s.level < State.data.ship) cls = 'owned';
      else if (s.level === State.data.ship + 1) cls = 'next';
      return `
        <div class="ship-step ${cls}">
          <span class="s-emoji">${s.emoji}</span>
          <span class="s-name">${UI.esc(s.name)}</span>
          <span class="s-cost">${s.level <= State.data.ship ? '✓' : '🪙 ' + s.cost}</span>
        </div>`;
    }).join('');

    const islandsUnlockedByNext = next
      ? DATA.islands.filter(i => i.minShip === next.level).map(i => i.name)
      : [];

    panel.innerHTML = `
      <h2 class="panel-title">⛵ Votre navire</h2>
      <div class="ship-showcase">
        <span class="ship-big">${cur.emoji}</span>
        <div class="ship-name">${UI.esc(cur.name)}</div>
        <div class="ship-desc">« ${UI.esc(cur.desc)} »</div>
      </div>
      <div class="ship-track">${steps}</div>
      <div class="upgrade-row">
        ${next ? `
          <button class="btn btn-gold btn-big" id="btn-upgrade" ${State.data.gold < next.cost ? 'disabled' : ''}>
            Améliorer → ${next.emoji} ${UI.esc(next.name)} (🪙 ${next.cost})
          </button>
          ${State.data.gold < next.cost ? `<p class="upgrade-note">Il vous manque ${next.cost - State.data.gold} pièces d'or.</p>` : ''}
          ${islandsUnlockedByNext.length ? `<p class="unlocks-list">🗺️ Débloque : ${islandsUnlockedByNext.map(UI.esc).join(', ')}</p>` : ''}
        ` : `
          <p class="upgrade-note">🏆 Vous possédez le plus grand navire des sept mers !</p>
        `}
      </div>
      <div class="island-back-row">
        <button class="btn btn-parchment" id="btn-ship-back">← Retour à la carte</button>
      </div>`;

    const upBtn = UI.$('#btn-upgrade');
    if (upBtn) {
      upBtn.addEventListener('click', async () => {
        if (!State.upgradeShip()) return;
        SFX.fanfare();
        checkBadges();
        State.save();
        renderShip();
        await UI.info({
          emoji: next.emoji,
          title: 'Navire amélioré !',
          text: `L'équipage acclame <b>${UI.esc(next.name)}</b> ! De nouvelles îles mystérieuses sont désormais à votre portée.`,
          buttonText: 'Lever l\'ancre',
        });
      });
    }
    UI.$('#btn-ship-back').addEventListener('click', () => { SFX.click(); showMap(); });
    UI.show('ship');
  }

  /* ============ COLLECTION ============ */

  let collectionTab = 'treasures';

  function renderCollection() {
    UI.renderAllHUDs();
    const panel = UI.$('#collection-panel');
    const found = State.data.treasures.length;
    const total = DATA.treasures.length;

    let content = '';
    if (collectionTab === 'treasures') {
      const cards = DATA.treasures.map(t => {
        const owned = State.data.treasures.includes(t.id);
        return `
          <div class="treasure-card ${owned ? t.rarity : 'undiscovered'}">
            <span class="t-emoji">${owned ? t.emoji : '❓'}</span>
            <div class="t-name">${owned ? UI.esc(t.name) : '???'}</div>
            <div class="t-rarity">${DATA.rarityNames[t.rarity]}</div>
            <div class="t-desc">${owned ? UI.esc(t.desc) : 'Encore à découvrir…'}</div>
          </div>`;
      }).join('');
      content = `<p class="collection-count">${found} / ${total} trésors découverts</p><div class="treasure-grid">${cards}</div>`;
    } else {
      const cards = DATA.badges.map(b => {
        const earned = State.hasBadge(b.id);
        return `
          <div class="badge-card ${earned ? 'earned' : 'locked-badge'}">
            <span class="b-emoji">${b.emoji}</span>
            <div class="b-name">${UI.esc(b.name)}</div>
            <div class="b-desc">${earned ? UI.esc(b.desc) : '🔒 ' + UI.esc(b.desc)}</div>
          </div>`;
      }).join('');
      content = `<p class="collection-count">${State.data.badges.length} / ${DATA.badges.length} badges obtenus</p><div class="badge-grid">${cards}</div>`;
    }

    panel.innerHTML = `
      <h2 class="panel-title" style="color:var(--parchment-light);text-shadow:0 2px 8px rgba(0,0,0,.5)">🗝️ Collection</h2>
      <div class="collection-tabs">
        <button class="tab-btn ${collectionTab === 'treasures' ? 'active' : ''}" data-tab="treasures">💎 Trésors</button>
        <button class="tab-btn ${collectionTab === 'badges' ? 'active' : ''}" data-tab="badges">🏅 Badges</button>
      </div>
      ${content}
      <div class="island-back-row">
        <button class="btn btn-parchment" id="btn-coll-back">← ${State.hasPlayer() ? 'Retour à la carte' : 'Retour'}</button>
      </div>`;

    panel.querySelectorAll('.tab-btn').forEach(b => {
      b.addEventListener('click', () => { collectionTab = b.dataset.tab; SFX.click(); renderCollection(); });
    });
    UI.$('#btn-coll-back').addEventListener('click', () => {
      SFX.click();
      State.hasPlayer() ? showMap() : UI.show('home');
    });
    UI.show('collection');
  }

  /* ============ PARAMÈTRES ============ */

  function renderSettings() {
    UI.renderAllHUDs();
    const panel = UI.$('#settings-panel');
    panel.innerHTML = `
      <h2 class="panel-title">⚙️ Paramètres</h2>
      <p class="panel-sub">Ajustez les instruments de bord.</p>

      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-name">🔊 Effets sonores</div>
          <div class="setting-desc">Sons synthétisés en direct : pièces, vagues et fanfares.</div>
        </div>
        <button class="toggle ${State.data.settings.sound ? 'on' : ''}" id="toggle-sound" aria-label="Son"></button>
      </div>
      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-name">✨ Animations</div>
          <div class="setting-desc">Vagues, navires et effets visuels.</div>
        </div>
        <button class="toggle ${State.data.settings.animations ? 'on' : ''}" id="toggle-anim" aria-label="Animations"></button>
      </div>
      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-name">🗑️ Réinitialiser la partie</div>
          <div class="setting-desc">Efface toute votre progression. Irréversible !</div>
        </div>
        <button class="btn btn-danger" id="btn-reset" style="padding:.6rem 1.2rem">Effacer</button>
      </div>

      <p class="panel-sub" style="margin-top:1.6rem">TREASURE EXPLORER v1.0 — Une aventure au temps des grandes découvertes.<br>Votre progression est sauvegardée automatiquement sur cet appareil. 🏴‍☠️</p>
      <div class="island-back-row">
        <button class="btn btn-parchment" id="btn-set-back">← ${State.hasPlayer() ? 'Retour à la carte' : 'Retour'}</button>
      </div>`;

    UI.$('#toggle-sound').addEventListener('click', (e) => {
      State.data.settings.sound = !State.data.settings.sound;
      e.target.classList.toggle('on', State.data.settings.sound);
      State.save();
      SFX.click();
    });
    UI.$('#toggle-anim').addEventListener('click', (e) => {
      State.data.settings.animations = !State.data.settings.animations;
      e.target.classList.toggle('on', State.data.settings.animations);
      State.applySettings();
      State.save();
      SFX.click();
    });
    UI.$('#btn-reset').addEventListener('click', async () => {
      const ok = await UI.confirm({
        emoji: '⚠️', title: 'Couler la partie ?',
        text: 'Toute votre progression, vos trésors et vos badges seront perdus à jamais dans les abysses.',
        confirmText: 'Oui, tout effacer', danger: true,
      });
      if (!ok) return;
      State.reset();
      SFX.splash();
      renderSettings();
      UI.toast('🌊', 'Partie effacée', 'Une nouvelle aventure vous attend !');
      setTimeout(() => UI.show('home'), 600);
    });
    UI.$('#btn-set-back').addEventListener('click', () => {
      SFX.click();
      State.hasPlayer() ? showMap() : UI.show('home');
    });
    UI.show('settings');
  }

  function showMap() {
    renderMap();
    UI.show('map');
  }

  return { showMap, renderShip, renderCollection, renderSettings, openIsland };
})();
