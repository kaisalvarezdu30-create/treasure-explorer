/* ============================================================
   TREASURE EXPLORER — Interface : navigation, HUD, toasts
   ============================================================ */

const UI = (() => {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const esc = (str) => String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  function show(screenId) {
    $$('.screen').forEach(s => s.classList.remove('active'));
    const el = $('#screen-' + screenId);
    if (el) el.classList.add('active');
    window.scrollTo(0, 0);
  }

  /* ---------- HUD ---------- */
  function renderHUD(containerId) {
    const el = typeof containerId === 'string' ? $(containerId) : containerId;
    if (!el) return;
    const p = State.data.player;
    const ship = State.shipInfo();
    const xp = State.xpProgress();
    const pct = Math.round((xp.current / xp.needed) * 100);

    el.innerHTML = `
      <div class="hud-player">
        <span class="hud-avatar">${p ? avatarEmoji(p.avatarId) : '🧭'}</span>
        <span class="hud-name">${p ? esc(p.name) : 'Explorateur'}</span>
      </div>
      <div class="hud-stat" title="Pièces d'or">🪙 <span>${State.data.gold}</span></div>
      <div class="hud-stat" title="Navire">${ship.emoji} <span>${esc(ship.name)}</span></div>
      <div class="hud-stat" title="Niveau">⭐ <span>Niv. ${State.data.level}</span></div>
      <div class="hud-xp">
        <div class="xp-label"><span>XP</span><span>${xp.current} / ${xp.needed}</span></div>
        <div class="xp-bar"><div class="xp-fill" style="width:${pct}%"></div></div>
      </div>`;
  }

  function renderAllHUDs() {
    ['#hud', '#hud-island', '#hud-ship', '#hud-collection', '#hud-settings']
      .forEach(id => renderHUD(id));
  }

  function avatarEmoji(id) {
    const c = DATA.characters.find(c => c.id === id);
    return c ? c.emoji : '🧭';
  }

  /* ---------- Toasts ---------- */
  function toast(icon, title, text) {
    const container = $('#toasts');
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<span class="toast-icon">${icon}</span>
      <div><div class="toast-title">${esc(title)}</div>
      <div class="toast-text">${esc(text)}</div></div>`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 4200);
  }

  /* ---------- Modales ---------- */
  function openModal(id) { $(id).classList.add('open'); }
  function closeModal(id) { $(id).classList.remove('open'); }

  function confirm({ emoji = '❓', title, text, confirmText = 'Confirmer', cancelText = 'Annuler', danger = false }) {
    return new Promise(resolve => {
      const body = $('#generic-body');
      body.innerHTML = `
        <span class="generic-emoji">${emoji}</span>
        <div class="generic-title">${esc(title)}</div>
        <p class="generic-text">${text}</p>
        <div class="generic-actions">
          <button class="btn ${danger ? 'btn-danger' : 'btn-gold'}" id="gen-ok">${esc(confirmText)}</button>
          <button class="btn btn-parchment" id="gen-cancel">${esc(cancelText)}</button>
        </div>`;
      openModal('#modal-generic');
      $('#gen-ok').onclick = () => { closeModal('#modal-generic'); resolve(true); };
      $('#gen-cancel').onclick = () => { closeModal('#modal-generic'); resolve(false); };
    });
  }

  function info({ emoji = 'ℹ️', title, text, buttonText = 'Continuer' }) {
    return new Promise(resolve => {
      const body = $('#generic-body');
      body.innerHTML = `
        <span class="generic-emoji">${emoji}</span>
        <div class="generic-title">${esc(title)}</div>
        <p class="generic-text">${text}</p>
        <div class="generic-actions">
          <button class="btn btn-gold" id="gen-ok">${esc(buttonText)}</button>
        </div>`;
      openModal('#modal-generic');
      $('#gen-ok').onclick = () => { closeModal('#modal-generic'); resolve(true); };
    });
  }

  /* ---------- Coffre & récompenses ---------- */
  function openChestModal() {
    return new Promise(resolve => {
      const body = $('#reward-body');
      body.innerHTML = `
        <div class="reward-body-inner">
          <div class="reward-title">Un coffre !</div>
          <div class="chest-scene">
            <div class="chest" id="chest">
              <div class="chest-glow"></div>
              <div class="chest-lid"></div>
              <div class="chest-base"></div>
            </div>
          </div>
          <p class="chest-hint">Cliquez sur le coffre pour l'ouvrir…</p>
        </div>`;
      openModal('#modal-reward');
      $('#chest').addEventListener('click', () => {
        $('#chest').classList.add('open');
        SFX.chest();
        setTimeout(() => resolve(), 1100);
      }, { once: true });
    });
  }

  function showReward({ treasure, gold, xp, replay }) {
    const body = $('#reward-body');
    const t = treasure ? DATA.treasureById[treasure] : null;
    body.innerHTML = `
      <div class="reward-body-inner">
        <div class="reward-title">${replay ? 'Mission rejouée !' : 'Trésor découvert !'}</div>
        ${t ? `
        <div class="reward-treasure">
          <div class="reward-card ${t.rarity}">
            <span class="reward-emoji">${t.emoji}</span>
            <div class="reward-name">${esc(t.name)}</div>
            <div class="reward-rarity">${DATA.rarityNames[t.rarity]}</div>
          </div>
        </div>` : `
        <div class="reward-treasure"><div class="reward-card commun">
          <span class="reward-emoji">🌊</span>
          <div class="reward-name">Encore une belle expédition</div>
        </div></div>`}
        <div class="reward-loot">
          <span class="loot-pill">🪙 +${gold} or</span>
          <span class="loot-pill">⭐ +${xp} XP</span>
        </div>
        <button class="btn btn-gold" id="reward-ok">Continuer l'aventure</button>
      </div>`;
    return new Promise(resolve => {
      $('#reward-ok').onclick = () => { closeModal('#modal-reward'); resolve(); };
    });
  }

  function showFail({ title, text }) {
    const body = $('#reward-body');
    body.innerHTML = `
      <div class="reward-body-inner">
        <span class="generic-emoji">🌊</span>
        <div class="reward-title">${esc(title)}</div>
        <p class="chest-hint" style="margin-bottom:1.4rem">${esc(text)}</p>
        <button class="btn btn-parchment" id="fail-ok">Réessayer plus tard</button>
      </div>`;
    openModal('#modal-reward');
    return new Promise(resolve => {
      $('#fail-ok').onclick = () => { closeModal('#modal-reward'); resolve(); };
    });
  }

  return { $, $$, esc, show, renderHUD, renderAllHUDs, avatarEmoji, toast, openModal, closeModal, confirm, info, openChestModal, showReward, showFail };
})();
