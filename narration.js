/* =====================================================================
 * narration.js — Voice-over / narration module for
 * "Petualangan Gigi Sehat" (kids dental health site, ages 6–12, id-ID)
 *
 * Uses the Web Speech API (SpeechSynthesis) to read out loud a short
 * Indonesian narration line each time a scene scrolls into view.
 *
 * Self-contained IIFE. Hooks into the site's existing scene elements
 * (the same #scene0..#scene9 nodes the site's own IntersectionObservers
 * watch) and exposes:
 *      window.toggleNarration()   — flip narration on/off
 *      window.stopNarration()     — cancel any in-progress speech
 *
 * Preference is persisted in localStorage under "dentalNarration".
 * ===================================================================== */
(function () {
  'use strict';

  /* ── 1. NARRATION DATA (Indonesian, one line per scene) ────────── */
  var NARRATION = {
    0: 'Halo! Aku Riko! Yuk ikuti petualangan menjaga gigiku!',
    1: 'Selamat pagi! Riko bangun dengan ceria! Saatnya menjaga kesehatan gigi!',
    2: 'Riko malas gosok gigi... Tapi ini bahaya lho! Sisa makanan bisa membuat gigi sakit!',
    3: 'Kuman-kuman datang! Mereka suka gula dan akan membuat lubang di gigi!',
    4: 'Aduh! Gigi Riko berlubang! Sakitnya luar biasa! Kita harus ke dokter gigi!',
    5: 'Dokter gigi membantu Riko! Gosok gigi 2 kali sehari, 2 menit setiap kali!',
    6: 'Saatnya bertarung! Aktifkan semua pahlawan untuk mengalahkan Cavitarus!',
    7: 'Ayo berlatih! Gosok gigi dan gunakan benang gigi dengan benar!',
    8: 'Sudah siap diuji? Jawab pertanyaan ini untuk membuktikan kamu jago!',
    9: 'Selamat! Kamu sudah belajar banyak tentang kesehatan gigi! Buat sertifikatmu!'
  };

  /* ── 2. CONFIG ─────────────────────────────────────────────────── */
  var STORAGE_KEY = 'dentalNarration';
  var NARRATION_SPEED = 0.9;      // slightly slow, friendly for kids
  var NARRATION_LANG = 'id-ID';
  var SAY_THRESHOLD = 0.45;       // fraction of a scene that must be visible

  /* ── 3. FEATURE SUPPORT ────────────────────────────────────────── */
  var synth = window.speechSynthesis || null;
  var supported = !!synth && (typeof window.SpeechSynthesisUtterance !== 'undefined');

  /* ── 4. STATE ──────────────────────────────────────────────────── */
  var enabled = readPref();       // on by default for a kids site
  var activeScene = -1;           // scene index currently being narrated
  var indonesianVoice = null;     // preferred voice (resolved lazily)
  var btn = null;

  function readPref() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (v === null) return true;          // default ON
      return v === 'on';
    } catch (e) { return true; }
  }
  function writePref(on) {
    try { localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off'); } catch (e) {}
  }

  /* ── 5. VOICE SELECTION (prefer Indonesian) ───────────────────── */
  function pickVoice() {
    if (!supported) return;
    var voices = synth.getVoices() || [];
    if (!voices.length) return;
    // Exact / prefix match on language tag.
    for (var i = 0; i < voices.length; i++) {
      var lang = (voices[i].lang || '').toLowerCase();
      if (lang === 'id-id' || lang === 'id' || lang.indexOf('id-') === 0) {
        indonesianVoice = voices[i];
        return;
      }
    }
    // Fallback: a voice whose name mentions Indonesian / Bahasa.
    for (var j = 0; j < voices.length; j++) {
      if (/indonesia|bahasa/i.test(voices[j].name || '')) {
        indonesianVoice = voices[j];
        return;
      }
    }
    indonesianVoice = null; // let the browser pick its default voice
  }

  /* ── 6. SPEAK / STOP ───────────────────────────────────────────── */
  function speak(idx) {
    if (!supported || !enabled) return;
    var text = NARRATION[idx];
    if (!text) return;
    try { synth.cancel(); } catch (e) {}   // stop any previous line first

    var u = new SpeechSynthesisUtterance(text);
    u.lang = NARRATION_LANG;
    u.rate = NARRATION_SPEED;
    u.pitch = 1.0;
    if (indonesianVoice) u.voice = indonesianVoice;

    u.onstart = function () { if (btn) btn.classList.add('speaking'); };
    u.onend = function () { if (btn) btn.classList.remove('speaking'); };
    u.onerror = function () { if (btn) btn.classList.remove('speaking'); };

    try { synth.speak(u); } catch (e) {}
  }

  function stopNarration() {
    if (!supported) return;
    try { synth.cancel(); } catch (e) {}
    if (btn) btn.classList.remove('speaking');
  }

  /* ── 7. TOGGLE + BUTTON UI ─────────────────────────────────────── */
  function toggleNarration() {
    enabled = !enabled;
    writePref(enabled);
    updateButton();
    // friendly click feedback if the site's SFX helper exists
    if (typeof window.playSound === 'function') {
      try { window.playSound('click'); } catch (e) {}
    }
    if (enabled) {
      if (activeScene >= 0) speak(activeScene);   // (re)read the current scene
    } else {
      stopNarration();
    }
  }

  function updateButton() {
    if (!btn) return;
    btn.textContent = enabled ? '🔊' : '🔇';
    btn.title = enabled ? 'Narasi: Aktif (klik untuk matikan)' : 'Narasi: Mati (klik untuk nyalakan)';
    btn.setAttribute('aria-label', enabled ? 'Matikan narasi' : 'Nyalakan narasi');
    btn.classList.toggle('off', !enabled);
  }

  function buildButton() {
    // Inject styles so the module stays fully self-contained.
    var style = document.createElement('style');
    style.textContent =
      '.narration-toggle{position:fixed;top:9.5rem;right:1rem;z-index:1500;width:48px;height:48px;' +
      'background:rgba(255,255,255,.9);backdrop-filter:blur(10px);border:none;border-radius:50%;' +
      'font-size:1.5rem;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,.1);transition:transform .3s,opacity .3s}' +
      '.narration-toggle:hover{transform:scale(1.1)}' +
      '.narration-toggle.off{opacity:.5}' +
      '.narration-toggle.speaking{animation:narrPulse 1.4s infinite}' +
      '@keyframes narrPulse{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.45)}' +
      '50%{box-shadow:0 0 0 8px rgba(16,185,129,0)}}' +
      '@media(max-width:768px){.narration-toggle{width:40px;height:40px;font-size:1.2rem;top:9rem;right:.6rem}}';
    document.head.appendChild(style);

    btn = document.createElement('button');
    btn.className = 'narration-toggle';
    btn.id = 'narrationToggle'; btn.title = 'Narasi: aktifkan/matikan suara cerita';
    document.body.appendChild(btn);
    updateButton();
    var lbl = document.createElement('span'); lbl.textContent = 'Cerita'; lbl.style.cssText='font-size:.6rem;color:#334155;margin-top:2px'; btn.parentElement && btn.parentElement.appendChild(lbl); btn.addEventListener('click', toggleNarration);
  }

  /* ── 8. SCENE OBSERVER (registers with the existing scene nodes) ─ */
  function setupObserver() {
    // Collect the canonical scene elements (#scene0..#scene9).
    var targets = [];
    for (var i = 0; i < 10; i++) {
      var el = document.getElementById('scene' + i);
      if (el) targets.push(el);
    }
    if (!targets.length) {
      var fallback = document.querySelectorAll('.scene, [data-scene]');
      for (var k = 0; k < fallback.length; k++) targets.push(fallback[k]);
    }

    if (!('IntersectionObserver' in window)) {
      // Graceful fallback for very old browsers.
      window.addEventListener('scroll', onScrollFallback, { passive: true });
      window.addEventListener('resize', onScrollFallback, { passive: true });
      onScrollFallback();
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var idx = parseInt(entry.target.getAttribute('data-scene'), 10);
        if (isNaN(idx)) {
          // derive from id="sceneN" if data-scene is missing
          var m = /scene(\d+)/.exec(entry.target.id || '');
          if (m) idx = parseInt(m[1], 10);
        }
        if (isNaN(idx)) return;

        if (entry.isIntersecting && entry.intersectionRatio >= SAY_THRESHOLD) {
          if (idx !== activeScene) {
            activeScene = idx;
            speak(idx);                 // auto-play when scene becomes visible
          }
        } else if (!entry.isIntersecting && idx === activeScene) {
          // scrolled away from the scene that was being narrated
          activeScene = -1;
          stopNarration();             // stop narration when leaving the scene
        }
      });
    }, { threshold: [0, SAY_THRESHOLD, 0.6] });

    targets.forEach(function (el) { observer.observe(el); });
  }

  // Fallback visibility check used only when IntersectionObserver is absent.
  function onScrollFallback() {
    if (!supported || !enabled) return;
    var best = -1, bestRatio = 0;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var i = 0; i < 10; i++) {
      var el = document.getElementById('scene' + i);
      if (!el) continue;
      var r = el.getBoundingClientRect();
      var visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      var ratio = visible / Math.min(vh, r.height || vh);
      if (ratio > bestRatio) { bestRatio = ratio; best = i; }
    }
    if (bestRatio >= SAY_THRESHOLD && best !== activeScene) {
      activeScene = best; speak(best);
    } else if (bestRatio < SAY_THRESHOLD && activeScene !== -1) {
      activeScene = -1; stopNarration();
    }
  }

  /* ── 9. INTEGRATE WITH EXISTING scrollToScene (manual nav) ─────── */
  // When a user clicks a nav dot / "Mulai Petualangan" the site's
  // scrollToScene() runs. We wrap it so the previous scene's narration
  // stops immediately instead of talking over the new scene.
  //
  // Implemented with a property setter so it works REGARDLESS of script
  // load order (narration.js may load before the inline script that
  // defines window.scrollToScene — in that case we wrap it the moment it
  // is assigned).
  function wrapScrollToScene(fn) {
    if (fn && fn.__narrWrapped) return fn;
    var wrapped = function () {
      if (activeScene !== -1) { activeScene = -1; stopNarration(); }
      return fn.apply(this, arguments);
    };
    wrapped.__narrWrapped = true;
    return wrapped;
  }

  function hookScrollToScene() {
    if (typeof window.scrollToScene === 'function') {
      window.scrollToScene = wrapScrollToScene(window.scrollToScene);
      return;
    }
    // Not defined yet — intercept assignment via a setter.
    var desc = Object.getOwnPropertyDescriptor(window, 'scrollToScene');
    if (desc && desc.configurable) return; // already intercepted
    var val;
    Object.defineProperty(window, 'scrollToScene', {
      configurable: true,
      enumerable: true,
      get: function () { return val; },
      set: function (fn) { val = wrapScrollToScene(fn); }
    });
  }

  /* ── 10. INIT ──────────────────────────────────────────────────── */
  function init() {
    // Expose the API regardless of support so site integration is safe.
    window.toggleNarration = toggleNarration;
    window.stopNarration = stopNarration;

    if (!supported) {
      // No TTS: keep the API as a no-op so callers don't crash.
      window.toggleNarration = function () {};
      window.stopNarration = function () {};
      return;
    }

    pickVoice();
    if (synth.addEventListener) {
      synth.addEventListener('voiceschanged', pickVoice);
    } else {
      synth.onvoiceschanged = pickVoice;
    }

    buildButton();
    hookScrollToScene();
    setupObserver();
  }

  // Expose immediately (closure vars are live; real wiring happens in init).
  window.toggleNarration = toggleNarration;
  window.stopNarration = stopNarration;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
