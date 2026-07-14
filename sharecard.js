/* ════════════════════════════════════════════════════════════════════
   sharecard.js — Kartu Share "Petualangan Gigi Sehat"
   Generator kartu berbasis Canvas untuk website kesehatan gigi anak.
   - Kartu share persegi (1080x1080) untuk Instagram / WhatsApp
   - Kartu tantangan harian (1080x1920) untuk Stories
   - Self-contained IIFE, tanpa dependensi eksternal.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ───────────────────────── Konfigurasi ───────────────────────── */
  var SITE_URL = "https://sigit4715.github.io/petualangan-gigi-sehat/";
  var SITE_SHORT = "sigit4715.github.io/petualangan-gigi-sehat";
  var TOTAL_BADGES = 10;
  var TOTAL_STARS = 10;

  /* Palet pastel ramah anak */
  var PASTEL = {
    pink:   "#FFD6E8",
    blue:   "#CDE7FF",
    mint:   "#C9F6E4",
    yellow: "#FFF2BF",
    purple: "#E7DBFF",
    orange: "#FFE0C2",
    ink:    "#4C1D95",   // ungu tua (teks utama)
    inkSoft:"#6D28D9",
    dark:   "#1E1B4B"
  };

  /* ─────────────────── Pembacaan state pemain ──────────────────── */
  /* State disimpan di localStorage oleh tooth4.js. Kita baca langsung
     dari layer persistensi agar bekerja terlepas dari scope IIFE. */
  function readState() {
    var xp = parseInt(localStorage.getItem("dentalXP") || "0", 10);
    if (isNaN(xp) || xp < 0) xp = 0;

    var level = parseInt(localStorage.getItem("dentalLevel") || "0", 10);
    if (!level || isNaN(level)) level = Math.floor(xp / 200) + 1;
    if (level < 1) level = 1;

    var badges = safeParse(localStorage.getItem("dentalBadges"), []);
    var stars = safeParse(localStorage.getItem("dentalStars"), []);
    if (!Array.isArray(badges)) badges = [];
    if (!Array.isArray(stars)) stars = [];

    return {
      xp: xp,
      level: level,
      badges: badges.length,
      stars: stars.length,
      streak: getStreak()
    };
  }

  function safeParse(str, fallback) {
    try {
      var v = JSON.parse(str);
      return (v === null || v === undefined) ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  /* Replika getStreak() dari tooth4.js (tanpa mutasi localStorage). */
  function getStreak() {
    var last = localStorage.getItem("dentalLastVisit");
    var streak = parseInt(localStorage.getItem("dentalStreak") || "0", 10);
    if (isNaN(streak)) streak = 0;
    var today = new Date().toDateString();
    var yesterday = new Date(Date.now() - 86400000).toDateString();
    if (last === today) return streak;
    if (last === yesterday) return streak + 1; // hari berurutan
    return 1; // kunjungan baru memulai streak
  }

  /* Pesan seru berdasarkan level. */
  function rankFor(level) {
    if (level <= 5) return { title: "Pemula Gigi", icon: "🌱" };
    if (level <= 10) return { title: "Ksatria Gigi", icon: "🛡️" };
    return { title: "Pahlawan Gigi", icon: "👑" };
  }

  /* ───────────────────── Util gambar canvas ────────────────────── */
  function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* Gambar satu gigi dekoratif (mahkota + 2 akar). */
  function drawTooth(ctx, cx, cy, scale, color, alpha) {
    ctx.save();
    ctx.globalAlpha = (alpha === undefined ? 1 : alpha);
    ctx.fillStyle = color;
    ctx.strokeStyle = "rgba(76,29,149,0.18)";
    ctx.lineWidth = 3 * scale;

    var cw = 90 * scale, ch = 70 * scale;   // mahkota
    // mahkota (rounded, sedikit lebar di bawah)
    ctx.beginPath();
    ctx.moveTo(cx - cw / 2, cy - ch / 2);
    ctx.quadraticCurveTo(cx - cw / 2, cy - ch, cx, cy - ch);
    ctx.quadraticCurveTo(cx + cw / 2, cy - ch, cx + cw / 2, cy - ch / 2);
    ctx.quadraticCurveTo(cx + cw / 2, cy + ch * 0.1, cx + cw * 0.18, cy + ch * 0.35);
    ctx.quadraticCurveTo(cx, cy + ch * 0.15, cx, cy + ch * 0.35);
    ctx.quadraticCurveTo(cx, cy + ch * 0.15, cx - cw * 0.18, cy + ch * 0.35);
    ctx.quadraticCurveTo(cx - cw / 2, cy + ch * 0.1, cx - cw / 2, cy - ch / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // akar kiri & kanan
    var rw = 26 * scale, rh = 55 * scale;
    roundRect(ctx, cx - cw * 0.22 - rw / 2, cy + ch * 0.2, rw, rh, 10 * scale);
    ctx.fill(); ctx.stroke();
    roundRect(ctx, cx + cw * 0.22 - rw / 2, cy + ch * 0.2, rw, rh, 10 * scale);
    ctx.fill(); ctx.stroke();

    ctx.restore();
  }

  function randomFromSeed(seed) {
    // generator deterministik sederhana (LCG)
    var s = (seed >>> 0) || 1;
    return function () {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
  }

  /* Hias latar belakang dengan gigi-gigi & titik pastel. */
  function decorateBackground(ctx, w, h, seedStr) {
    var seed = 0;
    for (var i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
    var rnd = randomFromSeed(seed);

    var colors = [PASTEL.pink, PASTEL.blue, PASTEL.mint, PASTEL.yellow, PASTEL.purple, PASTEL.orange];
    for (var n = 0; n < 14; n++) {
      var x = rnd() * w;
      var y = rnd() * h;
      var s = 0.4 + rnd() * 0.9;
      var c = colors[Math.floor(rnd() * colors.length)];
      drawTooth(ctx, x, y, s, c, 0.45);
    }
    // titik-titik lucu
    for (var d = 0; d < 40; d++) {
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = colors[Math.floor(rnd() * colors.length)];
      ctx.beginPath();
      ctx.arc(rnd() * w, rnd() * h, 4 + rnd() * 10, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ──────────────── Pembuat "QR" dekoratif ─────────────────────── */
  /* Bukan QR standar — matriks deterministik bergaya QR (finder +
     timing pattern + modul data acak) agar kartu punya elemen scan
     visual tanpa library. */
  function buildQrMatrix(text) {
    var n = 25;
    var m = [];
    var r, c;
    for (r = 0; r < n; r++) { m.push(new Array(n).fill(false)); }

    function placeFinder(top, left) {
      for (r = -1; r <= 7; r++) {
        for (c = -1; c <= 7; c++) {
          var rr = top + r, cc = left + c;
          if (rr < 0 || rr >= n || cc < 0 || cc >= n) continue;
          var border = (r === 0 || r === 6 || c === 0 || c === 6);
          var center = (r >= 2 && r <= 4 && c >= 2 && c <= 4);
          m[rr][cc] = border || center;
        }
      }
    }
    placeFinder(0, 0);
    placeFinder(0, n - 7);
    placeFinder(n - 7, 0);

    // timing pattern
    for (var i = 8; i < n - 8; i++) {
      m[6][i] = (i % 2 === 0);
      m[i][6] = (i % 2 === 0);
    }

    // modul data (acak deterministik dari teks)
    var seed = 0;
    for (var k = 0; k < text.length; k++) seed = (seed * 31 + text.charCodeAt(k)) >>> 0;
    var rnd = randomFromSeed(seed || 1);
    for (r = 0; r < n; r++) {
      for (c = 0; c < n; c++) {
        var reserved = m[r][c] ||
          (r < 8 && c < 8) || (r < 8 && c >= n - 8) || (r >= n - 8 && c < 8) ||
          r === 6 || c === 6;
        if (reserved) continue;
        m[r][c] = (rnd() < 0.5);
      }
    }
    return m;
  }

  function drawQr(ctx, x, y, size, text) {
    var m = buildQrMatrix(text);
    var n = m.length;
    var cell = size / n;
    // latar putih + border
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, x - 10, y - 10, size + 20, size + 20, 16);
    ctx.fill();
    ctx.fillStyle = PASTEL.ink;
    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        if (m[r][c]) {
          ctx.fillRect(x + c * cell, y + r * cell, Math.ceil(cell), Math.ceil(cell));
        }
      }
    }
  }

  /* ───────────────────── Kartu Persegi (1080) ──────────────────── */
  function renderSquareCard(canvas, state) {
    var w = 1080, h = 1080;
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext("2d");

    // latar gradient pastel
    var bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#FFE3F1");
    bg.addColorStop(0.5, "#EDE4FF");
    bg.addColorStop(1, "#DDF1FF");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    decorateBackground(ctx, w, h, "share-" + state.level + "-" + state.streak);

    // panel putih
    ctx.save();
    ctx.shadowColor = "rgba(76,29,149,0.25)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 16;
    ctx.fillStyle = "rgba(255,255,255,0.94)";
    roundRect(ctx, 48, 48, w - 96, h - 96, 48);
    ctx.fill();
    ctx.restore();

    var pad = 96;

    // Judul
    ctx.textAlign = "center";
    ctx.fillStyle = PASTEL.ink;
    ctx.font = "900 62px 'Trebuchet MS', 'Segoe UI', sans-serif";
    ctx.fillText("🦷 Petualangan Gigi Sehat", w / 2, pad + 18);

    // Rank pill
    var rank = rankFor(state.level);
    var pillText = rank.icon + " " + rank.title;
    ctx.font = "800 34px 'Trebuchet MS', 'Segoe UI', sans-serif";
    var pw = ctx.measureText(pillText).width + 64;
    var px = w / 2 - pw / 2, py = pad + 50;
    ctx.fillStyle = PASTEL.yellow;
    roundRect(ctx, px, py, pw, 60, 30); ctx.fill();
    ctx.fillStyle = PASTEL.dark;
    ctx.fillText(pillText, w / 2, py + 42);

    // Grid statistik 2x2
    var boxW = (w - pad * 2 - 30) / 2;
    var boxH = 168;
    var gx = pad, gy = py + 110;
    var stats = [
      { icon: "⭐", label: "LEVEL", value: state.level, color: PASTEL.pink },
      { icon: "💎", label: "XP", value: state.xp, color: PASTEL.blue },
      { icon: "🏅", label: "PIALA", value: state.badges + "/" + TOTAL_BADGES, color: PASTEL.mint },
      { icon: "🔥", label: "STREAK", value: state.streak + " hari", color: PASTEL.orange }
    ];
    for (var s = 0; s < stats.length; s++) {
      var col = s % 2, row = Math.floor(s / 2);
      var bx = gx + col * (boxW + 30);
      var by = gy + row * (boxH + 30);
      ctx.fillStyle = stats[s].color;
      roundRect(ctx, bx, by, boxW, boxH, 28); ctx.fill();
      ctx.textAlign = "left";
      ctx.font = "52px 'Segoe UI Emoji', sans-serif";
      ctx.fillText(stats[s].icon, bx + 28, by + 78);
      ctx.fillStyle = PASTEL.inkSoft;
      ctx.font = "800 26px 'Trebuchet MS', sans-serif";
      ctx.fillText(stats[s].label, bx + 110, by + 52);
      ctx.fillStyle = PASTEL.dark;
      ctx.font = "900 46px 'Trebuchet MS', sans-serif";
      ctx.fillText(String(stats[s].value), bx + 110, by + 110);
    }

    // Footer: QR + URL
    var footY = gy + 2 * (boxH + 30) + 30;
    var qrSize = 168;
    drawQr(ctx, pad, footY, qrSize, SITE_URL);
    ctx.textAlign = "left";
    ctx.fillStyle = PASTEL.inkSoft;
    ctx.font = "800 28px 'Trebuchet MS', sans-serif";
    ctx.fillText("Main di:", pad + qrSize + 36, footY + 50);
    ctx.fillStyle = PASTEL.ink;
    ctx.font = "800 30px 'Trebuchet MS', sans-serif";
    ctx.fillText(SITE_SHORT, pad + qrSize + 36, footY + 92);
    ctx.fillStyle = "#64748B";
    ctx.font = "600 24px 'Trebuchet MS', sans-serif";
    ctx.fillText("Scan untuk ikut petualangan! 🦷", pad + qrSize + 36, footY + 134);

    return canvas;
  }

  /* ───────────────────── Kartu Stories (1920) ──────────────────── */
  function renderStoriesCard(canvas, state) {
    var w = 1080, h = 1920;
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext("2d");

    var bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#FFD6EC");
    bg.addColorStop(0.45, "#E5DBFF");
    bg.addColorStop(1, "#C9B8FF");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    decorateBackground(ctx, w, h, "story-" + state.streak + "-" + state.level);

    // panel semi-transparan
    ctx.save();
    ctx.shadowColor = "rgba(76,29,149,0.25)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 16;
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    roundRect(ctx, 56, 90, w - 112, h - 180, 56);
    ctx.fill();
    ctx.restore();

    var pad = 110;
    ctx.textAlign = "center";
    ctx.fillStyle = PASTEL.ink;
    ctx.font = "900 50px 'Trebuchet MS', sans-serif";
    ctx.fillText("🦷 Petualangan Gigi Sehat", w / 2, pad + 20);

    // Streak hero
    ctx.font = "160px 'Segoe UI Emoji', sans-serif";
    ctx.fillText("🔥", w / 2, pad + 200);
    ctx.fillStyle = PASTEL.ink;
    ctx.font = "900 120px 'Trebuchet MS', sans-serif";
    ctx.fillText(state.streak + " Hari", w / 2, pad + 330);
    ctx.fillStyle = PASTEL.inkSoft;
    ctx.font = "800 40px 'Trebuchet MS', sans-serif";
    ctx.fillText("Streak beruntun! Jangan putus ya! 💪", w / 2, pad + 395);

    // CTA pill
    var cta = "Ayo gosok gigi hari ini!";
    ctx.font = "800 40px 'Trebuchet MS', sans-serif";
    var cw = ctx.measureText(cta).width + 80;
    var cx = w / 2 - cw / 2, cyy = pad + 450;
    ctx.fillStyle = PASTEL.mint;
    roundRect(ctx, cx, cyy, cw, 92, 46); ctx.fill();
    ctx.fillStyle = PASTEL.dark;
    ctx.fillText(cta, w / 2, cyy + 60);

    // mini stat row
    var miniY = cyy + 200;
    var labels = [
      { i: "⭐", t: "Lv." + state.level },
      { i: "💎", t: state.xp + " XP" },
      { i: "🏅", t: state.badges + "/" + TOTAL_BADGES }
    ];
    var mw = (w - pad * 2 - 40) / 3;
    for (var i = 0; i < labels.length; i++) {
      var mx = pad + i * (mw + 20);
      ctx.fillStyle = PASTEL.blue;
      roundRect(ctx, mx, miniY, mw, 150, 30); ctx.fill();
      ctx.textAlign = "center";
      ctx.font = "56px 'Segoe UI Emoji', sans-serif";
      ctx.fillText(labels[i].i, mx + mw / 2, miniY + 78);
      ctx.fillStyle = PASTEL.dark;
      ctx.font = "900 40px 'Trebuchet MS', sans-serif";
      ctx.fillText(labels[i].t, mx + mw / 2, miniY + 130);
    }

    // Footer QR + url
    var fY = h - 360;
    var qr = 190;
    drawQr(ctx, w / 2 - qr / 2, fY, qr, SITE_URL);
    ctx.fillStyle = PASTEL.inkSoft;
    ctx.font = "800 34px 'Trebuchet MS', sans-serif";
    ctx.fillText("Main di: " + SITE_SHORT, w / 2, fY + qr + 70);

    return canvas;
  }

  /* ─────────────────────── Modal preview ───────────────────────── */
  var modalEl = null;
  function ensureModal() {
    if (modalEl && document.body.contains(modalEl)) return modalEl;
    var overlay = document.createElement("div");
    overlay.id = "shareCardModal";
    overlay.style.cssText = [
      "position:fixed", "inset:0", "z-index:9999",
      "display:none", "align-items:center", "justify-content:center",
      "background:rgba(15,23,42,0.78)", "backdrop-filter:blur(6px)",
      "font-family:'Trebuchet MS','Segoe UI',sans-serif",
      "padding:16px", "box-sizing:border-box"
    ].join(";");

    var card = document.createElement("div");
    card.style.cssText = [
      "background:#fff", "border-radius:24px", "max-width:92vw", "max-height:92vh",
      "overflow:auto", "padding:18px", "text-align:center",
      "box-shadow:0 30px 80px rgba(0,0,0,0.4)"
    ].join(";");

    var title = document.createElement("h3");
    title.textContent = "📸 Kartu Share Gigi Sehat!";
    title.style.cssText = "margin:0 0 10px;color:#4C1D95;font-size:1.3rem;";

    var previewWrap = document.createElement("div");
    previewWrap.style.cssText = "max-height:60vh;overflow:auto;display:flex;justify-content:center;";

    var canvas = document.createElement("canvas");
    canvas.id = "shareCardCanvas";
    canvas.style.cssText = "max-width:100%;height:auto;border-radius:16px;box-shadow:0 8px 24px rgba(0,0,0,0.15);";

    var btnRow = document.createElement("div");
    btnRow.style.cssText = "display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:14px;";

    var dl = document.createElement("button");
    dl.id = "shareCardDownload";
    dl.textContent = "⬇️ Download";
    dl.style.cssText = btnStyle("#6366F1");

    var sh = document.createElement("button");
    sh.id = "shareCardShare";
    sh.textContent = "📤 Share";
    sh.style.cssText = btnStyle("#F472B6");

    var close = document.createElement("button");
    close.id = "shareCardClose";
    close.textContent = "✕ Tutup";
    close.style.cssText = btnStyle("#94A3B8");

    btnRow.appendChild(dl);
    btnRow.appendChild(sh);
    btnRow.appendChild(close);

    card.appendChild(title);
    previewWrap.appendChild(canvas);
    card.appendChild(previewWrap);
    card.appendChild(btnRow);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", function (e) { if (e.target === overlay) hideModal(); });
    close.addEventListener("click", hideModal);

    modalEl = overlay;
    return overlay;
  }

  function btnStyle(color) {
    return [
      "border:none", "border-radius:14px", "padding:12px 22px",
      "font-size:1rem", "font-weight:800", "color:#fff", "cursor:pointer",
      "background:" + color, "font-family:inherit"
    ].join(";");
  }

  function showModal() {
    ensureModal().style.display = "flex";
  }
  function hideModal() {
    if (modalEl) modalEl.style.display = "none";
  }

  /* ─────────────────── Aksi download / share ───────────────────── */
  function canvasToBlob(canvas) {
    return new Promise(function (resolve) {
      if (canvas.toBlob) canvas.toBlob(resolve, "image/png");
      else {
        var data = canvas.toDataURL("image/png");
        var bin = atob(data.split(",")[1]);
        var arr = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        resolve(new Blob([arr], { type: "image/png" }));
      }
    });
  }

  function doDownload(canvas, filename) {
    canvasToBlob(canvas).then(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = filename || "petualangan-gigi-sehat.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    });
  }

  function fallbackCopy(text) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    } catch (e) { /* abaikan */ }
  }

  function doShare(canvas) {
    canvasToBlob(canvas).then(function (blob) {
      var file = new File([blob], "petualangan-gigi-sehat.png", { type: "image/png" });
      var shareData = {
        title: "Petualangan Gigi Sehat",
        text: "Ayo jaga gigi sehat! 🦷 Main di " + SITE_URL,
        files: [file]
      };
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share(shareData).catch(function () { /* dibatalkan */ });
      } else if (navigator.share) {
        navigator.share({ title: shareData.title, text: shareData.text }).catch(function () {});
      } else {
        // fallback: salin link
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(SITE_URL).then(showCopied, function () {
            fallbackCopy(SITE_URL); showCopied();
          });
        } else {
          fallbackCopy(SITE_URL); showCopied();
        }
      }
    });
  }

  function showCopied() {
    var t = document.getElementById("shareCardCopyToast");
    if (!t) {
      t = document.createElement("div");
      t.id = "shareCardCopyToast";
      t.style.cssText = [
        "position:fixed", "bottom:24px", "left:50%", "transform:translateX(-50%)",
        "background:#10B981", "color:#fff", "padding:12px 22px", "border-radius:30px",
        "font-weight:800", "z-index:10000", "box-shadow:0 8px 24px rgba(0,0,0,0.25)",
        "font-family:'Trebuchet MS',sans-serif"
      ].join(";");
      document.body.appendChild(t);
    }
    t.textContent = "🔗 Link tersalin! Bagikan ke temanmu!";
    t.style.display = "block";
    setTimeout(function () { t.style.display = "none"; }, 2200);
  }

  /* ──────────────────── Buka kartu (modal) ────────────────────── */
  function openCard(kind) {
    var overlay = ensureModal();
    var canvas = document.getElementById("shareCardCanvas");
    var state = readState();
    if (kind === "story") {
      renderStoriesCard(canvas, state);
    } else {
      renderSquareCard(canvas, state);
    }
    showModal();
  }

  /* ─────────────────── Penyisipan UI ke situs ──────────────────── */
  function injectUI() {
    // 1) Tombol kamera melayang di scene sertifikat (scene 9)
    var scene9 = document.getElementById("scene9");
    if (scene9 && !document.getElementById("shareCardBtn")) {
      if (getComputedStyle(scene9).position === "static") {
        scene9.style.position = "relative";
      }
      var cam = document.createElement("button");
      cam.id = "shareCardBtn";
      cam.textContent = "📸";
      cam.title = "Buat Kartu Share!";
      cam.setAttribute("aria-label", "Buat Kartu Share");
      cam.style.cssText = [
        "position:absolute", "bottom:24px", "right:24px", "z-index:50",
        "width:64px", "height:64px", "border:none", "border-radius:50%",
        "background:linear-gradient(135deg,#F472B6,#A78BFA)", "color:#fff",
        "font-size:30px", "cursor:pointer", "box-shadow:0 8px 24px rgba(76,29,149,0.4)",
        "display:flex", "align-items:center", "justify-content:center",
        "transition:transform .15s"
      ].join(";");
      cam.onmouseenter = function () { cam.style.transform = "scale(1.08)"; };
      cam.onmouseleave = function () { cam.style.transform = "scale(1)"; };
      cam.addEventListener("click", function () { openCard("square"); });
      scene9.appendChild(cam);
    }

    // 2) Tombol kartu harian (Stories) di bagian streak (xp-bar)
    var streakEl = document.getElementById("streakDisplay");
    if (streakEl && !document.getElementById("shareStoryBtn")) {
      var parent = streakEl.parentElement || document.body;
      var story = document.createElement("button");
      story.id = "shareStoryBtn";
      story.textContent = "📲 Story";
      story.title = "Kartu Tantangan Harian";
      story.style.cssText = [
        "margin-left:14px", "border:none", "border-radius:14px",
        "padding:6px 14px", "font-weight:800", "font-size:.8rem", "cursor:pointer",
        "background:linear-gradient(135deg,#FBBF24,#FB7185)", "color:#fff",
        "font-family:inherit", "white-space:nowrap"
      ].join(";");
      story.addEventListener("click", function () { openCard("story"); });
      parent.appendChild(story);
    }
  }

  /* ─────────────────── Inisialisasi modal aksi ─────────────────── */
  function wireModalActions() {
    var overlay = ensureModal();
    overlay.addEventListener("click", function (e) {
      if (e.target && e.target.id === "shareCardDownload") {
        var c = document.getElementById("shareCardCanvas");
        doDownload(c, "petualangan-gigi-sehat.png");
      } else if (e.target && e.target.id === "shareCardShare") {
        var cv = document.getElementById("shareCardCanvas");
        doShare(cv);
      }
    });
  }

  /* ───────────────────────────── Boot ──────────────────────────── */
  function boot() {
    wireModalActions();
    injectUI();
    // injectUI bergantung pada xp-bar (dibuat oleh initV4 di tooth4.js).
    // Coba lagi beberapa saat kemudian bila streakDisplay belum ada.
    if (!document.getElementById("shareStoryBtn")) {
      setTimeout(injectUI, 600);
    }
    if (!document.getElementById("shareStoryBtn")) {
      setTimeout(injectUI, 1500);
    }
  }

  // Expose hook minimal (tidak wajib) untuk debugging/integrasi.
  window.ShareCard = {
    open: openCard,
    renderSquare: renderSquareCard,
    renderStories: renderStoriesCard,
    getState: readState
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
