/* ============================================================
   TREASURE EXPLORER — Mini-jeux
   Chaque jeu retourne une Promise : 'win' | 'fail' | 'abort'
   ============================================================ */

const Minigames = (() => {
  let currentResolve = null;
  let cleanupFns = [];

  function open(title, html) {
    UI.$('#minigame-title').innerHTML = title;
    UI.$('#minigame-body').innerHTML = html;
    UI.openModal('#modal-minigame');
  }

  function cleanup() {
    cleanupFns.forEach(fn => { try { fn(); } catch (e) {} });
    cleanupFns = [];
  }

  function finish(result) {
    if (!currentResolve) return;
    const r = currentResolve;
    currentResolve = null;
    cleanup();
    UI.closeModal('#modal-minigame');
    r(result);
  }

  UI.$('#btn-minigame-close').addEventListener('click', () => finish('abort'));

  function play(type, difficulty) {
    return new Promise(resolve => {
      currentResolve = resolve;
      if (type === 'riddle') playRiddle(difficulty);
      else if (type === 'code') playCode(difficulty);
      else if (type === 'map') playMapPuzzle(difficulty);
      else if (type === 'path') playMaze(difficulty);
      else finish('win');
    });
  }

  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  /* ==================================================
     1. ÉNIGME — 4 options, 2 erreurs max
     ================================================== */
  function playRiddle(difficulty) {
    const riddle = DATA.riddles[Math.floor(Math.random() * DATA.riddles.length)];
    // Mélanger les options en gardant la trace de la bonne
    const opts = shuffle(riddle.options.map((text, i) => ({ text, correct: i === riddle.answer })));
    let errors = 0;
    const maxErrors = 2;

    open('🦜 Énigme du vieux sage', `
      <p class="mg-instructions">Répondez correctement à la devinette. Attention : ${maxErrors} erreurs et le sage vous chasse !</p>
      <p class="mg-attempts" id="riddle-attempts">Erreurs : 0 / ${maxErrors}</p>
      <div class="riddle-text">« ${UI.esc(riddle.q)} »</div>
      <div class="riddle-options" id="riddle-opts">
        ${opts.map((o, i) => `<button class="riddle-opt" data-i="${i}">${UI.esc(o.text)}</button>`).join('')}
      </div>`);

    UI.$$('#riddle-opts .riddle-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const opt = opts[+btn.dataset.i];
        if (opt.correct) {
          btn.classList.add('correct');
          SFX.success();
          setTimeout(() => finish('win'), 700);
        } else {
          btn.classList.add('wrong');
          btn.disabled = true;
          SFX.fail();
          errors++;
          UI.$('#riddle-attempts').textContent = `Erreurs : ${errors} / ${maxErrors}`;
          if (errors >= maxErrors) setTimeout(() => finish('fail'), 800);
        }
      });
    });
  }

  /* ==================================================
     2. CODE SECRET — Mastermind à symboles, 6 essais
     ================================================== */
  function playCode(difficulty) {
    const codeLen = 4;
    const maxTries = 6;
    const secret = shuffle(DATA.codeSymbols).slice(0, codeLen);
    let slots = new Array(codeLen).fill(null);
    let tries = 0;

    open('🗝️ Le code du coffre', `
      <p class="mg-instructions">Devinez la combinaison de ${codeLen} symboles. 🔵 = bien placé, 🟡 = présent ailleurs. ${maxTries} essais maximum.</p>
      <p class="mg-attempts" id="code-attempts">Essai 1 / ${maxTries}</p>
      <div class="code-history" id="code-history"></div>
      <div class="code-slots code-symbols" id="code-slots"></div>
      <div class="symbol-palette" id="symbol-palette"></div>
      <div class="code-actions">
        <button class="btn btn-parchment" id="code-clear">Effacer</button>
        <button class="btn btn-gold" id="code-submit" disabled>Valider</button>
      </div>`);

    const renderSlots = () => {
      UI.$('#code-slots').innerHTML = slots.map((s, i) =>
        `<div class="code-slot ${s ? 'filled' : ''}" data-i="${i}">${s || ''}</div>`).join('');
      UI.$$('#code-slots .code-slot').forEach(slot => {
        slot.addEventListener('click', () => { slots[+slot.dataset.i] = null; SFX.click(); renderSlots(); });
      });
      UI.$('#code-submit').disabled = slots.some(s => !s);
    };

    UI.$('#symbol-palette').innerHTML = DATA.codeSymbols.map(s =>
      `<button class="symbol-btn" data-s="${s}">${s}</button>`).join('');

    UI.$$('#symbol-palette .symbol-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const empty = slots.indexOf(null);
        if (empty === -1) return;
        if (slots.includes(btn.dataset.s)) return;
        slots[empty] = btn.dataset.s;
        SFX.click();
        renderSlots();
      });
    });

    UI.$('#code-clear').addEventListener('click', () => {
      slots = new Array(codeLen).fill(null);
      SFX.click();
      renderSlots();
    });

    UI.$('#code-submit').addEventListener('click', () => {
      if (slots.some(s => !s)) return;
      tries++;
      const guess = slots.slice();
      let exact = 0, present = 0;
      guess.forEach((g, i) => {
        if (g === secret[i]) exact++;
        else if (secret.includes(g)) present++;
      });

      const pegs = Array(exact).fill('<span class="peg exact"></span>')
        .concat(Array(present).fill('<span class="peg present"></span>'))
        .concat(Array(codeLen - exact - present).fill('<span class="peg miss"></span>')).join('');

      const hist = UI.$('#code-history');
      const row = document.createElement('div');
      row.className = 'code-try';
      row.innerHTML = `<span class="try-symbols">${guess.join(' ')}</span><span>${pegs}</span>`;
      hist.appendChild(row);

      if (exact === codeLen) {
        SFX.unlock();
        setTimeout(() => finish('win'), 700);
        return;
      }
      SFX.step();
      if (tries >= maxTries) {
        setTimeout(() => finish('fail'), 900);
        return;
      }
      UI.$('#code-attempts').textContent = `Essai ${tries + 1} / ${maxTries}`;
      slots = new Array(codeLen).fill(null);
      renderSlots();
    });

    renderSlots();
  }

  /* ==================================================
     3. PUZZLE DE LA CARTE — 3×3, permuter les tuiles
     ================================================== */
  function playMapPuzzle(difficulty) {
    const N = 3;
    // Ordre des tuiles affichées : permutation des indices 0..8
    let order;
    do { order = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]); }
    while (order.every((v, i) => v === i));

    let selected = -1;
    let moves = 0;

    open('🗺️ La carte déchirée', `
      <p class="mg-instructions">La carte au trésor est en morceaux ! Cliquez sur deux fragments pour les échanger et reconstituez la carte.</p>
      <p class="puzzle-moves" id="puzzle-moves">Échanges : 0</p>
      <div class="map-puzzle" id="map-puzzle"></div>`);

    const tileStyle = (idx) => {
      const col = idx % N, row = Math.floor(idx / N);
      return `background-image:url("${DATA.mapURI}");background-position:${col / (N - 1) * 100}% ${row / (N - 1) * 100}%;`;
    };

    const render = () => {
      const wrap = UI.$('#map-puzzle');
      wrap.innerHTML = order.map((idx, pos) =>
        `<div class="puzzle-tile ${pos === selected ? 'selected' : ''}" data-pos="${pos}" style="${tileStyle(idx)}"></div>`).join('');
      UI.$$('#map-puzzle .puzzle-tile').forEach(tile => {
        tile.addEventListener('click', () => {
          const pos = +tile.dataset.pos;
          SFX.click();
          if (selected === -1) { selected = pos; render(); return; }
          if (selected === pos) { selected = -1; render(); return; }
          [order[selected], order[pos]] = [order[pos], order[selected]];
          selected = -1;
          moves++;
          UI.$('#puzzle-moves').textContent = `Échanges : ${moves}`;
          render();
          checkWin();
        });
      });
    };

    const checkWin = () => {
      if (order.every((v, i) => v === i)) {
        UI.$$('#map-puzzle .puzzle-tile').forEach(t => t.classList.add('solved-anim'));
        SFX.success();
        setTimeout(() => finish('win'), 900);
      }
    };

    render();
  }

  /* ==================================================
     4. LABYRINTHE — atteindre le coffre
     ================================================== */
  function playMaze(difficulty) {
    const mazeIdx = Math.min(DATA.mazes.length - 1, Math.floor(Math.random() * DATA.mazes.length));
    const grid = DATA.mazes[mazeIdx].map(r => r.split(''));
    const H = grid.length, W = grid[0].length;

    let px = 0, py = 0, cx = 0, cy = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (grid[y][x] === 'S') { px = x; py = y; }
      if (grid[y][x] === 'C') { cx = x; cy = y; }
    }
    const start = { x: px, y: py };
    let steps = 0, maxSteps = 80;

    open('🌴 Le chemin perdu', `
      <p class="mg-instructions">Guidez l'explorateur 🧭 jusqu'au coffre. Évitez les pièges 🕳️ qui vous renvoient au départ !</p>
      <p class="maze-steps" id="maze-steps">Pas : 0 / ${maxSteps}</p>
      <div class="maze-wrap">
        <div class="maze" id="maze" style="grid-template-columns:repeat(${W},1fr)"></div>
        <div class="maze-controls">
          <button class="maze-btn empty"></button>
          <button class="maze-btn" data-dx="0" data-dy="-1">▲</button>
          <button class="maze-btn empty"></button>
          <button class="maze-btn" data-dx="-1" data-dy="0">◀</button>
          <button class="maze-btn" data-dx="0" data-dy="1">▼</button>
          <button class="maze-btn" data-dx="1" data-dy="0">▶</button>
        </div>
      </div>`);

    const render = () => {
      const el = UI.$('#maze');
      let html = '';
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const cell = grid[y][x];
        let cls = 'maze-cell ', content = '';
        if (x === px && y === py) { cls += 'player'; content = '🧭'; }
        else if (cell === '#') cls += 'wall';
        else if (cell === 'T') cls += 'trap';
        else if (cell === 'C') { cls += 'path chest'; content = '🎁'; }
        else cls += 'path';
        html += `<div class="${cls}" data-x="${x}" data-y="${y}">${content}</div>`;
      }
      el.innerHTML = html;
      UI.$$('#maze .maze-cell').forEach(cell => {
        cell.addEventListener('click', () => {
          const tx = +cell.dataset.x, ty = +cell.dataset.y;
          const dx = tx - px, dy = ty - py;
          if (Math.abs(dx) + Math.abs(dy) === 1) move(dx, dy);
        });
      });
    };

    const move = (dx, dy) => {
      const nx = px + dx, ny = py + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) return;
      const cell = grid[ny][nx];
      if (cell === '#') return;
      px = nx; py = ny;
      steps++;
      UI.$('#maze-steps').textContent = `Pas : ${steps} / ${maxSteps}`;

      if (px === cx && py === cy) {
        render();
        SFX.success();
        setTimeout(() => finish('win'), 700);
        return;
      }
      if (cell === 'T') {
        SFX.trap();
        px = start.x; py = start.y;
      } else {
        SFX.step();
      }
      render();
      if (steps >= maxSteps) setTimeout(() => finish('fail'), 600);
    };

    const keyHandler = (e) => {
      const map = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
      const d = map[e.key];
      if (d) { e.preventDefault(); move(d[0], d[1]); }
    };
    document.addEventListener('keydown', keyHandler);
    cleanupFns.push(() => document.removeEventListener('keydown', keyHandler));

    UI.$$('.maze-btn:not(.empty)').forEach(btn => {
      btn.addEventListener('click', () => move(+btn.dataset.dx, +btn.dataset.dy));
    });

    render();
  }

  return { play, finish };
})();
