// ═══════════════════════════════════════════════════════════
// v4 ADDITIONS — XP, Music, Food Game, Floss, Map, Streak, Cert
// ═══════════════════════════════════════════════════════════

(function(){
"use strict";

// ── XP & LEVEL ──
var xp = parseInt(localStorage.getItem('dentalXP') || '0');
var level = Math.floor(xp / 200) + 1;

function addXP(amount, reason) {
  xp += amount;
  if (xp > 10000) xp = 10000;
  localStorage.setItem('dentalXP', String(xp));
  var newLevel = Math.floor(xp / 200) + 1;
  updateXPUI();
  if (newLevel > level) {
    level = newLevel;
    showLevelUp(level);
  }
  // floating +XP indicator
  var el = document.createElement('div');
  el.textContent = '+' + amount + ' XP';
  el.style.cssText = 'position:fixed;top:50%;left:50%;transform:translateX(-50%);color:#818CF8;font-weight:900;font-size:1.1rem;z-index:2500;animation:xpFloat 1s forwards;pointer-events:none;text-shadow:0 2px 4px rgba(0,0,0,.2)';
  document.body.appendChild(el);
  setTimeout(function(){ el.remove(); }, 1000);
}

function updateXPUI() {
  var fill = document.getElementById('xpFill');
  var txt = document.getElementById('xpText');
  var lvl = document.getElementById('xpLevel');
  if (!fill) return;
  var inLevel = xp % 200;
  fill.style.width = (inLevel / 200 * 100) + '%';
  if (txt) txt.textContent = xp + ' / ' + (level * 200);
  if (lvl) lvl.textContent = 'Lv.' + level;
}

function showLevelUp(lv) {
  playSound('victory');
  createConfetti();
  var ov = document.getElementById('levelUpOverlay');
  var num = document.getElementById('levelUpNum');
  if (num) num.textContent = lv;
  if (ov) ov.classList.add('show');
  setTimeout(function(){ if (ov) ov.classList.remove('show'); }, 3000);
}

// ── DAILY STREAK ──
function getStreak() {
  var last = localStorage.getItem('dentalLastVisit');
  var streak = parseInt(localStorage.getItem('dentalStreak') || '0');
  var today = new Date().toDateString();
  var yesterday = new Date(Date.now() - 86400000).toDateString();
  if (last === today) return streak;
  if (last === yesterday) {
    streak += 1;
    localStorage.setItem('dentalLastVisit', today);
    localStorage.setItem('dentalStreak', String(streak));
    return streak;
  }
  // reset
  streak = 1;
  localStorage.setItem('dentalLastVisit', today);
  localStorage.setItem('dentalStreak', '1');
  return streak;
}

function updateStreakUI() {
  var streak = getStreak();
  var el = document.getElementById('streakDisplay');
  if (el && streak > 1) {
    el.innerHTML = '<span class="fire">🔥</span> ' + streak + ' hari';
    el.style.display = '';
  }
}

// ── BACKGROUND MUSIC (Web Audio) ──
var musicPlaying = false;
var musicOsc = null;
var musicGain = null;
var musicTimer = null;
var musicIdx = 0;

// Pentatonic scale in C4 - kid-friendly cheerful melody
var MELODY = [
  523.25, 587.33, 659.25, 783.99, 880.00, // C5 D5 E5 G5 A5
  783.99, 659.25, 587.33, 523.25, 659.25,
  783.99, 880.00, 783.99, 659.25, 523.25,
  587.33, 523.25, 659.25, 783.99, 659.25,
  523.25, 587.33, 783.99, 880.00, 783.99,
  659.25, 587.33, 523.25, 659.25, 587.33
];
var BEAT_MS = 300; // tempo

function startMusic() {
  if (musicPlaying) return;
  try {
    var ctx = getAudioCtx();
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.08;
    musicGain.connect(ctx.destination);
    musicPlaying = true;
    musicIdx = 0;
    playMusicNote();
    var btn = document.getElementById('musicToggle');
    if (btn) btn.classList.add('playing');
    if (btn) btn.textContent = '🎵';
  } catch(e) {}
}

function playMusicNote() {
  if (!musicPlaying) return;
  try {
    var ctx = getAudioCtx();
    var osc = ctx.createOscillator();
    var noteGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = MELODY[musicIdx % MELODY.length];
    noteGain.gain.setValueAtTime(0.06, ctx.currentTime);
    noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + BEAT_MS/1000 * 0.9);
    osc.connect(noteGain);
    noteGain.connect(musicGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + BEAT_MS/1000);
    musicIdx++;
    musicTimer = setTimeout(playMusicNote, BEAT_MS);
  } catch(e) {}
}

function stopMusic() {
  musicPlaying = false;
  if (musicTimer) clearTimeout(musicTimer);
  if (musicGain) { try { musicGain.disconnect(); } catch(e){} }
  var btn = document.getElementById('musicToggle');
  if (btn) btn.classList.remove('playing');
  if (btn) btn.textContent = '🎶';
}

function toggleMusic() {
  if (musicPlaying) stopMusic(); else startMusic();
}

// ── FOOD SORTING GAME ──
var FOODS = [
  { emoji: '🍎', name: 'Apel', type: 'sehat' },
  { emoji: '🥦', name: 'Brokoli', type: 'sehat' },
  { emoji: '🥕', name: 'Wortel', type: 'sehat' },
  { emoji: '🍌', name: 'Pisang', type: 'sehat' },
  { emoji: '🍬', name: 'Permen', type: 'manis' },
  { emoji: '🍭', name: 'Lollipop', type: 'manis' },
  { emoji: '🍪', name: 'Kue Kering', type: 'manis' },
  { emoji: '🍫', name: 'Cokelat', type: 'manis' }
];

var foodState = { idx: 0, score: 0, done: false, shuffled: [] };

function shuffleFoods() {
  foodState.shuffled = FOODS.slice();
  for (var i = foodState.shuffled.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = foodState.shuffled[i];
    foodState.shuffled[i] = foodState.shuffled[j];
    foodState.shuffled[j] = tmp;
  }
}

function startFoodGame() {
  foodState.idx = 0;
  foodState.score = 0;
  foodState.done = false;
  shuffleFoods();
  showFoodQuestion();
}

function showFoodQuestion() {
  if (foodState.idx >= foodState.shuffled.length) { endFoodGame(); return; }
  var f = foodState.shuffled[foodState.idx];
  var emoji = document.getElementById('foodEmoji');
  var name = document.getElementById('foodName');
  var score = document.getElementById('foodScore');
  var result = document.getElementById('foodResult');
  var complete = document.getElementById('foodComplete');
  if (emoji) emoji.textContent = f.emoji;
  if (name) name.textContent = f.name;
  if (score) score.textContent = (foodState.idx + 1) + '/' + FOODS.length + ' — Skor: ' + foodState.score;
  if (result) result.textContent = '';
  if (complete) complete.textContent = '';
}

function answerFood(choice) {
  if (foodState.done) return;
  var f = foodState.shuffled[foodState.idx];
  var correct = (f.type === choice);
  var result = document.getElementById('foodResult');
  if (correct) {
    foodState.score += 10;
    if (result) { result.textContent = '✅ Benar!'; result.style.color = '#059669'; }
    playSound('ding');
  } else {
    if (result) { result.textContent = '❌ ' + f.name + ' adalah makanan ' + (f.type === 'sehat' ? 'sehat!' : 'manis!'); result.style.color = '#DC2626'; }
    playSound('germHit');
  }
  foodState.idx++;
  setTimeout(showFoodQuestion, 1000);
}

function endFoodGame() {
  foodState.done = true;
  var complete = document.getElementById('foodComplete');
  var emoji = document.getElementById('foodEmoji');
  if (emoji) emoji.textContent = '🎉';
  if (complete) complete.textContent = 'Selesai! Skor: ' + foodState.score + '/80 — ' + (foodState.score >= 60 ? 'Luar biasa!' : 'Semangat lagi!');
  if (foodState.score >= 40) addXP(30, 'Food Game');
  // show restart
  var wrap = document.getElementById('foodGameWrap');
  if (wrap) {
    var btn = document.createElement('button');
    btn.className = 'mini-btn';
    btn.style.marginTop = '.5rem';
    btn.textContent = '🔄 Main Lagi';
    btn.onclick = function(){ startFoodGame(); if(btn.parentNode) btn.remove(); };
    wrap.appendChild(btn);
  }
}

// ── FLOSSING GAME ──
var FL = { active: false, done: false, time: 0, timer: null, current: 0, teeth: 12, flossed: [], started: false };

function initFlossGame() {
  FL.teeth = 12; FL.current = 0; FL.flossed = []; FL.active = false; FL.done = false; FL.time = 0;
  var wrap = document.getElementById('flossWrap');
  if (!wrap) return;
  wrap.innerHTML = '';
  var w = wrap.offsetWidth || 340;
  var gap = (w - 20) / FL.teeth;
  for (var i = 0; i < FL.teeth; i++) {
    var t = document.createElement('div');
    t.className = 'floss-tooth';
    t.dataset.idx = i;
    t.style.left = (10 + i * gap) + 'px';
    t.style.height = (40 + Math.random() * 30) + 'px';
    t.onclick = function() { flossTap(parseInt(this.dataset.idx)); };
    wrap.appendChild(t);
  }
  // floss line
  var line = document.createElement('div');
  line.className = 'floss-line';
  line.id = 'flossLine';
  line.style.display = 'none';
  wrap.appendChild(line);
  updateFlossUI();
}

function startFlossGame() {
  if (FL.started) return;
  FL.started = true; FL.active = true; FL.current = 0; FL.time = 0;
  var btn = document.getElementById('flossStartBtn');
  if (btn) btn.style.display = 'none';
  FL.timer = setInterval(function(){
    FL.time += 10;
    var el = document.getElementById('flossTimer');
    if (el) el.textContent = (FL.time / 1000).toFixed(1) + 's';
  }, 10);
  highlightFloss();
}

function highlightFloss() {
  var teeth = document.querySelectorAll('.floss-tooth');
  teeth.forEach(function(t, i) {
    t.classList.remove('current-tooth');
    if (i === FL.current) t.classList.add('current-tooth');
  });
  // show floss line between current and next
  var line = document.getElementById('flossLine');
  if (line && FL.current < FL.teeth) {
    line.style.display = 'block';
    line.style.left = (10 + FL.current * (320 / FL.teeth)) + 'px';
    line.style.bottom = '0px';
    line.style.height = '80px';
  }
}

function flossTap(idx) {
  if (!FL.active || FL.done) return;
  if (idx === FL.current) {
    FL.flossed.push(idx);
    playSound('brush');
    var teeth = document.querySelectorAll('.floss-tooth');
    if (teeth[idx]) teeth[idx].classList.add('flossed');
    FL.current++;
    if (FL.current >= FL.teeth) {
      endFlossGame(true);
    } else {
      highlightFloss();
    }
  } else {
    // wrong tooth - flash red
    var teeth = document.querySelectorAll('.floss-tooth');
    if (teeth[idx]) { teeth[idx].style.background = '#FEE2E2'; setTimeout(function(){ teeth[idx].style.background = ''; }, 300); }
    playSound('germHit');
  }
}

function endFlossGame(won) {
  FL.done = true; FL.active = false;
  clearInterval(FL.timer);
  var line = document.getElementById('flossLine');
  if (line) line.style.display = 'none';
  document.querySelectorAll('.floss-tooth').forEach(function(t) { t.classList.remove('current-tooth'); });
  var score = document.getElementById('flossScore');
  if (won) {
    var timeStr = (FL.time / 1000).toFixed(1);
    if (score) score.textContent = '🎉 Selesai dalam ' + timeStr + ' detik!';
    playSound('victory');
    addXP(40, 'Floss Game');
  } else {
    if (score) score.textContent = FL.flossed.length + '/' + FL.teeth + ' gigi dibersihkan';
  }
  FL.started = false;
  var btn = document.getElementById('flossStartBtn');
  if (btn) { btn.style.display = ''; btn.textContent = '🔄 Main Lagi'; }
}

// ── PROGRESS MAP ──
var SCENE_INFO = [
  { num: 0, title: '🏠 Hero', sub: 'Selamat datang!' },
  { num: 1, title: '🌅 Pagi Cerah', sub: 'Bangun pagi' },
  { num: 2, title: '😅 Malas Gosok', sub: 'Uh oh...' },
  { num: 3, title: '🦠 Kuman Menyerang', sub: 'Bahaya!' },
  { num: 4, title: '😣 Lubang Gigi', sub: 'Sakit!' },
  { num: 5, title: '👨‍⚕️ Dokter Gigi', sub: 'Bantuan' },
  { num: 6, title: '🦸 Boss Battle', sub: 'vs Cavitarus' },
  { num: 7, title: '🎮 Mini Game', sub: 'Sikat & Benang' },
  { num: 8, title: '🧠 Kuis', sub: 'Uji diri' },
  { num: 9, title: '🎉 Selesai', sub: 'Selamat!' }
];

var visitedScenes = {};
try { visitedScenes = JSON.parse(localStorage.getItem('dentalVisited') || '{}'); } catch(e) { visitedScenes = {}; }

function markSceneVisited(idx) {
  if (!visitedScenes[idx]) {
    visitedScenes[idx] = true;
    localStorage.setItem('dentalVisited', JSON.stringify(visitedScenes));
    addXP(10, 'Scene visit');
  }
}

function openMap() {
  playSound('click');
  var grid = document.getElementById('mapNodes');
  if (!grid) return;
  grid.innerHTML = '';
  var cs = typeof currentScene !== 'undefined' ? currentScene : 0;
  for (var i = 0; i < SCENE_INFO.length; i++) {
    var s = SCENE_INFO[i];
    var isVisited = visitedScenes[i];
    var isCurrent = (i === cs);
    var node = document.createElement('div');
    node.className = 'map-node' + (isVisited ? ' visited' : '') + (isCurrent ? ' current' : '');
    node.onclick = (function(idx) {
      return function() { playSound('click'); closeMap(); scrollToScene(idx); };
    })(s.num);

    var dot = document.createElement('div');
    dot.className = 'map-node-dot' + (isVisited ? ' visited-dot' : (isCurrent ? ' current-dot' : ' unvisited'));
    dot.textContent = isVisited ? '✓' : (s.num + 1);

    var label = document.createElement('div');
    label.style.cssText = 'flex:1;text-align:left';
    var title = document.createElement('div');
    title.className = 'map-node-label';
    title.textContent = s.title;
    var sub = document.createElement('div');
    sub.className = 'map-node-sub';
    sub.textContent = s.sub;
    label.appendChild(title);
    label.appendChild(sub);

    node.appendChild(dot);
    node.appendChild(label);
    grid.appendChild(node);

    // connector
    if (i < SCENE_INFO.length - 1) {
      var conn = document.createElement('div');
      conn.className = 'map-connector' + (isVisited ? ' visited-conn' : '');
      grid.appendChild(conn);
    }
  }
  document.getElementById('progressMap').classList.add('show');
}

function closeMap() {
  playSound('click');
  document.getElementById('progressMap').classList.remove('show');
}

// ── CERTIFICATE ──
function generateCert() {
  var nameInput = document.getElementById('certName');
  var name = nameInput ? nameInput.value.trim() : '';
  if (!name) { name = 'Petualang Gigi'; }

  var preview = document.getElementById('certPreview');
  if (!preview) return;
  preview.style.display = 'block';

  var starCount = 0;
  for (var i = 0; i < 10; i++) {
    try { if (document.getElementById('star'+i) && document.getElementById('star'+i).style.opacity === '1') starCount++; } catch(e){}
  }
  var badgeCount = typeof earnedBadges !== 'undefined' ? earnedBadges.length : 0;

  document.getElementById('certNameDisplay').textContent = name;
  document.getElementById('certStars').textContent = '⭐'.repeat(starCount) + (starCount === 10 ? ' Sempurna!' : ' (' + starCount + '/10)');
  document.getElementById('certBadgeText').textContent = badgeCount + '/10 piala terkumpul';
  document.getElementById('certDate').textContent = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  addXP(50, 'Certificate');
  playSound('victory');
  createConfetti();
}

// ── GLOBAL HOOKS ──
// Hook into earnStar to add XP and mark scenes
var _origEarnStar = window.earnStar;
window.earnStar = function(i) {
  if (_origEarnStar) _origEarnStar(i);
  addXP(10, 'Star ' + i);
  markSceneVisited(i);
};

// Hook into earnBadge for XP
var _origEarnBadge = window.earnBadge;
window.earnBadge = function(id) {
  if (_origEarnBadge) _origEarnBadge(id);
  addXP(50, 'Badge: ' + id);
};

// ── INIT ──
function initV4() {
  // Create XP bar HTML
  var xpBar = document.createElement('div');
  xpBar.className = 'xp-bar';
  xpBar.innerHTML = '<div class="xp-level" id="xpLevel">Lv.1</div><div class="xp-progress-wrap"><div class="xp-progress-fill" id="xpFill"></div></div><span class="xp-text" id="xpText">0 / 200</span><span class="xp-streak" id="streakDisplay"></span>';
  document.body.appendChild(xpBar);

  // Level up overlay
  var lvUp = document.createElement('div');
  lvUp.className = 'levelup-overlay';
  lvUp.id = 'levelUpOverlay';
  lvUp.innerHTML = '<div class="levelup-card"><h2>🎉 Level Up!</h2><div class="level-num" id="levelUpNum">2</div><p>Kamu makin jago jaga gigi!</p><button class="start-btn" onclick="document.getElementById(\'levelUpOverlay\').classList.remove(\'show\')" style="font-size:.85rem;padding:8px 20px">Lanjut!</button></div>';
  document.body.appendChild(lvUp);

  // Music toggle
  var mBtn = document.createElement('button');
  mBtn.className = 'music-toggle';
  mBtn.id = 'musicToggle';
  mBtn.textContent = '🎶';
  mBtn.onclick = toggleMusic;
  mBtn.title = 'Musik Latar';
  document.body.appendChild(mBtn);

  // Progress map button
  var mapBtn = document.createElement('button');
  mapBtn.className = 'map-toggle';
  mapBtn.innerHTML = '🗺️ Peta';
  mapBtn.onclick = openMap;
  document.body.appendChild(mapBtn);

  // Progress map modal
  var mapModal = document.createElement('div');
  mapModal.className = 'progress-map';
  mapModal.id = 'progressMap';
  mapModal.innerHTML = '<div class="progress-map-content"><button class="close-btn" onclick="closeMap()">✕</button><h3>🗺️ Peta Petualangan</h3><div class="map-path" id="mapNodes"></div></div>';
  document.body.appendChild(mapModal);

  // Click outside to close map
  mapModal.addEventListener('click', function(e) { if (e.target === mapModal) closeMap(); });

  updateXPUI();
  updateStreakUI();
  markSceneVisited(typeof currentScene !== 'undefined' ? currentScene : 0);
}

// Expose globals
window.addXP = addXP;
window.toggleMusic = toggleMusic;
window.startFoodGame = startFoodGame;
window.answerFood = answerFood;
window.startFlossGame = startFlossGame;
window.initFlossGame = initFlossGame;
window.openMap = openMap;
window.closeMap = closeMap;
window.generateCert = generateCert;

// Run init when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initV4);
} else {
  setTimeout(initV4, 100);
}

})();
