/* ============================================================
   TREASURE EXPLORER — Effets sonores (WebAudio, sans fichiers)
   ============================================================ */

const SFX = (() => {
  let ctx = null;

  function ensure() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function enabled() {
    return !State.data || State.data.settings.sound !== false;
  }

  function tone(freq, dur, type, vol, delay, slide) {
    const c = ensure();
    if (!c || !enabled()) return;
    const t = c.currentTime + (delay || 0);
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(slide, t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  return {
    click() { tone(600, 0.08, 'triangle', 0.08); },
    coin() {
      tone(988, 0.1, 'square', 0.06);
      tone(1319, 0.18, 'square', 0.06, 0.08);
    },
    success() {
      tone(523, 0.12, 'triangle', 0.1);
      tone(659, 0.12, 'triangle', 0.1, 0.1);
      tone(784, 0.12, 'triangle', 0.1, 0.2);
      tone(1047, 0.3, 'triangle', 0.12, 0.3);
    },
    fail() {
      tone(300, 0.2, 'sawtooth', 0.07);
      tone(200, 0.35, 'sawtooth', 0.07, 0.15);
    },
    chest() {
      tone(180, 0.3, 'sine', 0.1, 0, 400);
      tone(659, 0.15, 'triangle', 0.08, 0.5);
      tone(784, 0.15, 'triangle', 0.08, 0.62);
      tone(1047, 0.35, 'triangle', 0.1, 0.74);
    },
    levelup() {
      [523, 587, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, 'square', 0.06, i * 0.09));
    },
    unlock() {
      tone(392, 0.15, 'triangle', 0.1);
      tone(523, 0.15, 'triangle', 0.1, 0.12);
      tone(784, 0.3, 'triangle', 0.1, 0.24);
    },
    splash() { tone(140, 0.4, 'sine', 0.08, 0, 60); },
    step() { tone(420, 0.05, 'triangle', 0.05); },
    trap() { tone(220, 0.25, 'sawtooth', 0.09, 0, 90); },
    fanfare() {
      [659, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, 0.16, 'square', 0.05, i * 0.12));
    },
  };
})();
