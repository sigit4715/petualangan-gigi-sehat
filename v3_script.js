// ═══ v3 ADDITIONS ═══
// Loaded as separate script to avoid HTML parser </ issues

// ── ANATOMY ──
var LAYER_INFO = {
  enamel: { title: '🦷 Email (Enamel)', desc: 'Lapisan terluar gigi. <b>Bahan terkeras di tubuh manusia!</b> Melindungi dari panas, dingin, gula. Kalau rusak, tidak bisa tumbuh sendiri.', fact: '💡 Setebal 2-3mm, warna putih kebiruan' },
  dentin: { title: '🟡 Dentin', desc: 'Di bawah email, berwarna kuning, <b>penuh saluran kecil ke saraf</b>. Email rusak, panas/dingin masuk, gigi ngilu!', fact: '💡 90% gigi terdiri dari dentin' },
  pulp: { title: '❤️ Saraf Gigi', desc: 'Di tengah gigi ada <b>jaringan hidup penuh saraf</b>. Kalau bakteri masuk ke sini, <b>SAKITNYA LUAR BIASA!</b>', fact: '💡 Memberi nutrisi agar gigi tetap hidup' },
  gum: { title: '💗 Gusi', desc: 'Menahan gigi tetap di tempat. Sehat = merah muda. Merah bengkak + berdarah = <b>radang gusi!</b>', fact: '💡 Menutupi leher gigi rapat-rapat' },
  root: { title: '🦴 Akar Gigi', desc: 'Di bawah gusi, <b>tertanam kuat di tulang rahang</b>. Gigi depan 1 akar, geraham 2-3 akar.', fact: '💡 Lebih panjang dari mahkota gigi' }
};

function openAnatomy() { playSound('click'); document.getElementById('anatomyModal').classList.add('show'); }
function closeAnatomy() { playSound('click'); document.getElementById('anatomyModal').classList.remove('show'); }
function showLayerInfo(layer) {
  playSound('click');
  var info = LAYER_INFO[layer];
  if (!info) return;
  document.querySelectorAll('.anatomy-layer').forEach(function(l) { l.classList.remove('active'); });
  var el = document.querySelector('.anatomy-layer[data-layer="' + layer + '"]');
  if (el) el.classList.add('active');
  var p = document.getElementById('anatomyInfo');
  p.innerHTML = '<h4>' + info.title + '</h4><p>' + info.desc + '</p><span class="layer-fact">' + info.fact + '</span>';
  p.style.background = '#F0F9FF';
  setTimeout(function() { p.style.background = '#F8FAFC'; }, 1500);
  earnBadge('anatomy');
}

// ── CAVITY TIMELINE ──
var TIMELINE_DATA = [
  { day: 0, emoji: '🦷', desc: 'Gigi bersih dan sehat! 😊', color: '#34D399' },
  { day: 1, emoji: '🦷', desc: 'Sisa makanan mulai menempel. 🦠', color: '#34D399' },
  { day: 3, emoji: '🦷', desc: 'Plak mulai terbentuk! 😬', color: '#FFE66D' },
  { day: 7, emoji: '😬', desc: 'Gigi ngilu saat makan manis! 😟', color: '#FF8C42' },
  { day: 14, emoji: '😣', desc: 'Lubang kecil mulai terbentuk! 😖', color: '#F87171' },
  { day: 21, emoji: '😭', desc: 'Lubang membesar! Harus ke dokter! 🏥', color: '#F87171' },
  { day: 30, emoji: '💀', desc: 'Lubang besar! Saraf terpapar! 😱', color: '#DC2626' }
];

function updateTimeline(val) {
  val = parseInt(val);
  var closest = TIMELINE_DATA[0];
  for (var i = 0; i < TIMELINE_DATA.length; i++) {
    if (val >= TIMELINE_DATA[i].day) closest = TIMELINE_DATA[i];
  }
  document.getElementById('timelineDay').textContent = 'Hari ' + val;
  document.getElementById('timelineDay').style.color = closest.color;
  document.getElementById('timelineTooth').textContent = closest.emoji;
  document.getElementById('timelineDesc').innerHTML = closest.desc;
}

// ── BADGE SYSTEM ──
var BADGES = [
  { id: 'start', icon: '🚀', name: 'Petualang' },
  { id: 'cavity', icon: '😨', name: 'Korban Kuman' },
  { id: 'dentist', icon: '🏥', name: 'Berani ke Dokter' },
  { id: 'anatomy', icon: '🔍', name: 'Ahli Anatom' },
  { id: 'boss', icon: '⚔️', name: 'Pembunuh Cavitarus' },
  { id: 'brush5', icon: '🪥', name: 'Sikat Sempurna' },
  { id: 'quiz4', icon: '🧠', name: 'Cerdas Gigi' },
  { id: 'quiz5', icon: '🏆', name: 'Master Gigi' },
  { id: 'complete', icon: '🌟', name: 'Selesai!' },
  { id: 'sound', icon: '🔊', name: 'DJ Gigiku' }
];

var earnedBadges = [];
try { earnedBadges = JSON.parse(localStorage.getItem('dentalBadges') || '[]'); } catch(e) { earnedBadges = []; }

function earnBadge(id) {
  if (earnedBadges.indexOf(id) >= 0) return;
  earnedBadges.push(id);
  try { localStorage.setItem('dentalBadges', JSON.stringify(earnedBadges)); } catch(e) {}
  updateBadgeUI();
  playSound('victory');
  var b = null;
  for (var i = 0; i < BADGES.length; i++) { if (BADGES[i].id === id) { b = BADGES[i]; break; } }
  if (b) showToast(b.icon + ' Piala: ' + b.name + '!');
}

function updateBadgeUI() {
  var cnt = document.getElementById('badgeCount');
  var prog = document.getElementById('badgeProgress');
  var grid = document.getElementById('badgesGrid');
  if (cnt) cnt.textContent = earnedBadges.length;
  if (prog) prog.textContent = earnedBadges.length + '/10 piala terkumpul';
  if (!grid) return;
  grid.innerHTML = '';
  for (var i = 0; i < BADGES.length; i++) {
    var b = BADGES[i];
    var earned = earnedBadges.indexOf(b.id) >= 0;
    var d = document.createElement('div');
    d.className = 'badge-item' + (earned ? ' earned' : '');
    d.innerHTML = '<div class="badge-icon">' + b.icon + '</div><div class="badge-name">' + b.name + '</div>';
    grid.appendChild(d);
  }
}

function showToast(msg) {
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;top:4rem;left:50%;transform:translateX(-50%);background:white;padding:0.8rem 1.5rem;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,0.15);z-index:3000;font-weight:700;font-size:1rem;animation:popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275);white-space:nowrap;';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function() { t.style.transition = 'all 0.3s'; t.style.opacity = '0'; }, 2500);
  setTimeout(function() { t.remove(); }, 3000);
}

function openBadges() { playSound('click'); updateBadgeUI(); document.getElementById('badgePanel').classList.add('show'); }
function closeBadges() { playSound('click'); document.getElementById('badgePanel').classList.remove('show'); }
updateBadgeUI();

// ── CANVAS DRAG-TO-BRUSH GAME ──
var CG = { started: false, done: false, timeLeft: 30, timer: null, zones: [false,false,false,false,false], ctx: null, canvas: null, isDrawing: false, lastX: 0, lastY: 0 };

function drawToothScene(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#FFF8F0'; ctx.fillRect(0, 0, w, h);
  var cx = w/2, cy = h/2, tw = 120, th = 150;
  // Roots
  ctx.fillStyle = '#FEF3C7';
  ctx.beginPath(); ctx.ellipse(cx-30, cy+th/2+15, 18, 35, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx+30, cy+th/2+15, 18, 35, 0, 0, Math.PI*2); ctx.fill();
  // Body
  ctx.fillStyle = '#F8FAFC'; ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 15; ctx.shadowOffsetY = 5;
  ctx.beginPath();
  ctx.moveTo(cx-tw/2, cy-th/2+15);
  ctx.quadraticCurveTo(cx-tw/2-5, cy-th/2, cx-tw/2+15, cy-th/2);
  ctx.lineTo(cx+tw/2-15, cy-th/2);
  ctx.quadraticCurveTo(cx+tw/2+5, cy-th/2, cx+tw/2, cy-th/2+15);
  ctx.lineTo(cx+tw/2, cy+th/2-10);
  ctx.quadraticCurveTo(cx+tw/2, cy+th/2, cx+tw/2-15, cy+th/2);
  ctx.lineTo(cx-tw/2+15, cy+th/2);
  ctx.quadraticCurveTo(cx-tw/2, cy+th/2, cx-tw/2, cy+th/2-10);
  ctx.closePath(); ctx.fill(); ctx.shadowColor = 'transparent';
  // Eyes
  ctx.fillStyle = '#475569';
  ctx.beginPath(); ctx.arc(cx-22, cy-25, 6, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx+22, cy-25, 6, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(cx-20, cy-27, 2.5, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx+24, cy-27, 2.5, 0, Math.PI*2); ctx.fill();
  // Smile
  ctx.strokeStyle = '#CBD5E1'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, cy, 18, 0.1*Math.PI, 0.9*Math.PI); ctx.stroke();
  // Zone circles
  var labels = ['Atas','Kanan','Kiri','Depan','Belakang'];
  var zx = [cx, cx+tw/2+30, cx-tw/2-30, cx, cx];
  var zy = [cy-th/2-20, cy-15, cy-15, cy+10, cy+th/2+55];
  for (var i = 0; i < 5; i++) {
    ctx.fillStyle = CG.zones[i] ? 'rgba(78,205,196,0.2)' : 'rgba(255,230,109,0.3)';
    ctx.strokeStyle = CG.zones[i] ? '#4ECDC4' : '#FFD166';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(zx[i], zy[i], 25, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = CG.zones[i] ? '#059669' : '#92400E';
    ctx.font = 'bold 10px Nunito'; ctx.textAlign = 'center';
    ctx.fillText(labels[i], zx[i], zy[i]+4);
  }
  if (!CG.started) {
    ctx.fillStyle = '#A78BFA'; ctx.font = 'bold 13px Nunito'; ctx.textAlign = 'center';
    ctx.fillText('Tekan Mulai Gosok lalu gerakkan', cx, h-20);
    ctx.fillText('mouse/finger di area kuning!', cx, h-5);
  }
}

function initCanvasGame() {
  var c = document.getElementById('brushCanvas');
  if (!c) return;
  c.width = 340; c.height = 340;
  CG.ctx = c.getContext('2d'); CG.canvas = c;
  drawToothScene(CG.ctx, 340, 340);
  var gp = function(e) {
    var r = c.getBoundingClientRect();
    var cx = e.touches ? e.touches[0].clientX : e.clientX;
    var cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (cx-r.left)*c.width/r.width, y: (cy-r.top)*c.height/r.height };
  };
  c.addEventListener('mousedown', function(e) { if(!CG.started||CG.done)return; CG.isDrawing=true; var p=gp(e); CG.lastX=p.x; CG.lastY=p.y; });
  c.addEventListener('mousemove', function(e) { if(!CG.isDrawing||CG.done)return; var p=gp(e); cleanZone(CG.lastX,CG.lastY,p.x,p.y); CG.lastX=p.x; CG.lastY=p.y; var cur=document.getElementById('brushCursor'); if(cur){var r=c.getBoundingClientRect(); cur.style.left=(e.clientX-r.left)+'px'; cur.style.top=(e.clientY-r.top)+'px';} });
  c.addEventListener('mouseup', function() { CG.isDrawing=false; });
  c.addEventListener('mouseleave', function() { CG.isDrawing=false; });
  c.addEventListener('touchstart', function(e) { if(!CG.started||CG.done)return; e.preventDefault(); CG.isDrawing=true; var p=gp(e); CG.lastX=p.x; CG.lastY=p.y; }, {passive:false});
  c.addEventListener('touchmove', function(e) { if(!CG.isDrawing||CG.done)return; e.preventDefault(); var p=gp(e); cleanZone(CG.lastX,CG.lastY,p.x,p.y); CG.lastX=p.x; CG.lastY=p.y; }, {passive:false});
  c.addEventListener('touchend', function() { CG.isDrawing=false; });
}

function cleanZone(x1,y1,x2,y2) {
  var cx=170,cy=170,tw=120,th=150;
  var zx=[cx,cx+tw/2+30,cx-tw/2-30,cx,cx];
  var zy=[cy-th/2-20,cy-15,cy-15,cy+10,cy+th/2+55];
  for (var s=0;s<=5;s++) {
    var px=x1+(x2-x1)*s/5, py=y1+(y2-y1)*s/5;
    for (var i=0;i<5;i++) {
      if(CG.zones[i])continue;
      var dx=px-zx[i],dy=py-zy[i];
      if(Math.sqrt(dx*dx+dy*dy)<40){CG.zones[i]=true;playSound('brush');}
    }
  }
  drawToothScene(CG.ctx,340,340);
  var next=-1; for(var i=0;i<5;i++){if(!CG.zones[i]){next=i;break;}}
  var labels=['Atas','Kanan','Kiri','Depan','Belakang'];
  document.getElementById('brushInstruction').textContent=next>=0?'Gosok area '+labels[next]+'! 🪥':'🎉 Semua bersih!';
  document.getElementById('brushProgress').style.width=(CG.zones.filter(function(z){return z}).length/5*100)+'%';
  var steps=document.querySelectorAll('#brushSteps .step');
  for(var i=0;i<steps.length;i++){steps[i].className='step';if(CG.zones[i])steps[i].className='step done';else{var allPrev=true;for(var j=0;j<i;j++){if(!CG.zones[j])allPrev=false;}if(allPrev)steps[i].className='step current';}}
  if(CG.zones.every(function(z){return z})){CG.done=true;clearInterval(CG.timer);endBrushGame(true);}
}

function startBrushGame() {
  if(CG.started||CG.done)return;
  CG.started=true; CG.timeLeft=30; CG.zones=[false,false,false,false,false];
  playSound('click');
  var c=document.getElementById('brushCanvas');
  if(c){c.width=340;c.height=340;CG.ctx=c.getContext('2d');drawToothScene(CG.ctx,340,340);}
  document.getElementById('brushStartBtn').style.display='none';
  document.getElementById('brushCursor').style.display='block';
  document.getElementById('timerCircle').classList.add('active');
  document.getElementById('brushInstruction').textContent='Gosok area Atas! 🪥';
  CG.timer=setInterval(function(){CG.timeLeft--;document.getElementById('timerDisplay').textContent=CG.timeLeft;if(CG.timeLeft<=10)document.getElementById('timerCircle').classList.add('warning');if(CG.timeLeft<=0){clearInterval(CG.timer);endBrushGame(false);}},1000);
}

function endBrushGame(won) {
  CG.done=true;
  document.getElementById('timerCircle').classList.remove('active','warning');
  document.getElementById('brushCursor').style.display='none';
  var cleaned=CG.zones.filter(function(z){return z}).length;
  if(won){document.getElementById('brushInstruction').textContent='🎉 Semua gigi bersih!';playSound('victory');createConfetti();showReward('🏆','Gigi Bersih Sempurna!','Kamu sikat gigi dengan gerakan nyata! 🛡️');earnBadge('brush5');}
  else{document.getElementById('brushInstruction').textContent=(cleaned>=3?'✨ ':'💪 ')+cleaned+'/5 area';showReward(cleaned>=3?'⭐':'💪',cleaned>=3?'Hampir Sempurna!':'Semangat!',cleaned+'/5 area dibersihkan.');}
  setTimeout(function(){CG.started=false;CG.done=false;CG.zones=[false,false,false,false,false];CG.timeLeft=30;document.getElementById('brushStartBtn').style.display='';document.getElementById('brushStartBtn').textContent='Mulai Gosok! 🪥';document.getElementById('timerDisplay').textContent='30';document.getElementById('timerCircle').classList.remove('active','warning');document.getElementById('brushProgress').style.width='0%';var steps=document.querySelectorAll('#brushSteps .step');for(var i=0;i<steps.length;i++){steps[i].className='step';if(i===0)steps[i].className='step current';}},3000);
}

// ── BADGE TRIGGERS ──
var _es = earnStar;
window.earnStar = function(i) { _es(i); if(i===1)earnBadge('start'); if(i===4)earnBadge('cavity'); if(i===5)earnBadge('dentist'); if(i===9)earnBadge('complete'); };
var _ah = activateHero;
window.activateHero = function(k) { _ah(k); if(bossDefeated)earnBadge('boss'); };
var _aq = answerQuiz;
window.answerQuiz = function(qi,oi) { _aq(qi,oi); if(quizCorrect>=4)earnBadge('quiz4'); if(quizCorrect>=5)earnBadge('quiz5'); };

setTimeout(function() { initCanvasGame(); }, 500);
