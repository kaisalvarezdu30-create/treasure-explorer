/* ============================================================
   TREASURE EXPLORER — Point d'entrée
   ============================================================ */

(() => {
  let selectedChar = null;

  /* ---------- Écran de création ---------- */

  function renderCharacterSelect() {
    const grid = UI.$('#character-grid');
    grid.innerHTML = DATA.characters.map(c => `
      <div class="character-card ${selectedChar === c.id ? 'selected' : ''}" data-id="${c.id}">
        <span class="character-emoji">${c.emoji}</span>
        <div class="character-name">${UI.esc(c.name)}</div>
        <div class="character-trait">${UI.esc(c.trait)}</div>
      </div>`).join('');

    grid.querySelectorAll('.character-card').forEach(card => {
      card.addEventListener('click', () => {
        selectedChar = card.dataset.id;
        SFX.click();
        renderCharacterSelect();
      });
    });
  }

  function startNewGame() {
    const name = UI.$('#input-name').value.trim();
    if (!name) {
      SFX.fail();
      UI.toast('✍️', 'Un nom, Capitaine !', 'Choisissez un nom d\'explorateur pour votre légende.');
      UI.$('#input-name').focus();
      return;
    }
    if (!selectedChar) {
      SFX.fail();
      UI.toast('🧭', 'Choisissez un explorateur', 'Qui prendra la barre de cette expédition ?');
      return;
    }
    // Nouvelle partie : on repart de zéro en gardant les réglages
    const settings = State.data.settings;
    State.reset();
    State.data.settings = settings;
    State.data.player = { name, avatarId: selectedChar };
    State.save();
    SFX.fanfare();
    Game.showMap();
    UI.toast('🌊', 'Bienvenue à bord, ' + name + ' !', 'L\'Île aux Coquillages vous attend.');
  }

  // Chaque visite = une nouvelle partie : on va toujours à la création du personnage
  function goToCharacterCreation() {
    selectedChar = null;
    UI.$('#input-name').value = '';
    renderCharacterSelect();
    UI.show('character');
  }

  /* ---------- Accueil ---------- */

  function refreshHomeHint() {
    const hint = UI.$('#home-save-hint');
    if (State.hasPlayer()) {
      const p = State.data.player;
      hint.textContent = `⚓ Partie en cours : ${p.name} — Niveau ${State.data.level}, ${State.data.gold} 🪙`;
    } else {
      hint.textContent = 'Une nouvelle aventure vous attend sur les sept mers…';
    }
  }

  /* ---------- Câblage ---------- */

  function bind() {
    UI.$('#btn-play').addEventListener('click', () => {
      SFX.click();
      goToCharacterCreation();
    });

    UI.$('#btn-home-collection').addEventListener('click', () => {
      SFX.click();
      Game.renderCollection();
    });

    UI.$('#btn-home-settings').addEventListener('click', () => {
      SFX.click();
      Game.renderSettings();
    });

    UI.$('#btn-char-back').addEventListener('click', () => {
      SFX.click();
      UI.show('home');
    });

    UI.$('#btn-char-start').addEventListener('click', startNewGame);

    UI.$('#input-name').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') startNewGame();
    });

    UI.$('#btn-nav-ship').addEventListener('click', () => { SFX.click(); Game.renderShip(); });
    UI.$('#btn-nav-collection').addEventListener('click', () => { SFX.click(); Game.renderCollection(); });
    UI.$('#btn-nav-settings').addEventListener('click', () => { SFX.click(); Game.renderSettings(); });
    UI.$('#btn-nav-home').addEventListener('click', () => {
      SFX.click();
      refreshHomeHint();
      UI.show('home');
    });

    // Sauvegarde à la fermeture
    window.addEventListener('beforeunload', () => State.save());
  }

  /* ---------- Init ---------- */

  // Pas de reprise de partie : chaque ouverture repart sur une nouvelle aventure
  State.reset();
  State.applySettings();
  bind();
  refreshHomeHint();
  UI.show('home');
})();
