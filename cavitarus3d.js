/**
 * Cavitarus — Detailed Germ Monster Boss
 * A menacing but kid-friendly 3D germ boss for the dental health site.
 * Three.js r128 • 320×320 • transparent bg • IntersectionObserver
 */
(function () {
  'use strict';

  /* ── lazy init on visibility ────────────────────────────────── */
  var container = document.getElementById('cavitarus3d');
  if (!container) return;

  var started = false;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && !started) {
        started = true;
        observer.disconnect();
        init();
      }
    });
  }, { threshold: 0.15 });
  observer.observe(container);

  /* ── shared state ───────────────────────────────────────────── */
  var renderer, scene, camera;
  var bossGroup, bodyMesh, eyes = [], brows = [], teeth = [];
  var tentacles = [], tentacleTips = [];
  var spores = [];
  var glowSphere;
  var mouseX = 0, mouseY = 0;
  var clock;
  var animId;
  /* approx displaced body surface radius in each axis (after scale) */
  var BODY_R = { x: 0.95, y: 0.85, z: 0.95 };

  function init() {
    /* renderer */
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(320, 320);
    renderer.setClearColor(0x000000, 0);
    renderer.sortObjects = true;
    container.appendChild(renderer.domElement);

    /* scene */
    scene = new THREE.Scene();

    /* camera */
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.2, 5.0);
    camera.lookAt(0, 0, 0);

    /* clock */
    clock = new THREE.Clock();

    /* lights */
    var ambientLight = new THREE.AmbientLight(0x332244, 0.6);
    scene.add(ambientLight);

    var keyLight = new THREE.DirectionalLight(0xffcccc, 1.0);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    var rimLight = new THREE.DirectionalLight(0x6644aa, 0.7);
    rimLight.position.set(-3, 1, -4);
    scene.add(rimLight);

    var fillLight = new THREE.PointLight(0xff4444, 0.6, 12);
    fillLight.position.set(0, -2, 3);
    scene.add(fillLight);

    var topLight = new THREE.PointLight(0xff6688, 0.4, 12);
    topLight.position.set(0, 3, 2);
    scene.add(topLight);

    /* boss group */
    bossGroup = new THREE.Group();
    scene.add(bossGroup);

    buildBody();
    buildTentacles();
    buildEyes();
    buildTeeth();
    buildCrownHorns();
    buildPulsingGlow();
    buildSpores();

    /* mouse tracking */
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    /* resize */
    window.addEventListener('resize', onResize, { passive: true });

    animate();
  }

  /* return the outward surface point on the scaled body for a given
     unit direction (approx — good enough for feature placement) */
  function surfacePoint(dir) {
    var d = dir.clone().normalize();
    /* invert ellipsoid: scale direction out to surface */
    var sx = d.x / BODY_R.x;
    var sy = d.y / BODY_R.y;
    var sz = d.z / BODY_R.z;
    var len = Math.sqrt(sx * sx + sy * sy + sz * sz);
    return new THREE.Vector3(d.x / len, d.y / len, d.z / len);
  }

  /* ═══════════════════════════════════════════════════════════════
     1. ORGANIC BODY — IcosahedronGeometry(1,3) + vertex displacement
     ═══════════════════════════════════════════════════════════════ */
  function buildBody() {
    var geo = new THREE.IcosahedronGeometry(1, 3);
    var pos = geo.attributes.position;

    /* store original positions + apply lumpy displacement */
    var origPositions = new Float32Array(pos.array.length);
    for (var i = 0; i < pos.count; i++) {
      var x = pos.getX(i);
      var y = pos.getY(i);
      var z = pos.getZ(i);
      origPositions[i * 3] = x;
      origPositions[i * 3 + 1] = y;
      origPositions[i * 3 + 2] = z;

      /* multi-octave noise-like displacement */
      var len = Math.sqrt(x * x + y * y + z * z) || 1;
      var nx = x / len, ny = y / len, nz = z / len;
      var disp =
        0.13 * Math.sin(nx * 5.0 + ny * 3.0) * Math.cos(nz * 4.0) +
        0.07 * Math.sin(ny * 8.0 + nz * 6.0) +
        0.05 * Math.cos(nx * 12.0 + nz * 9.0) +
        0.035 * Math.sin(ny * 15.0);
      pos.setXYZ(i, x * (1 + disp), y * (1 + disp), z * (1 + disp));
    }
    geo.computeVertexNormals();
    geo.setAttribute('origPos', new THREE.BufferAttribute(origPositions, 3));

    /* dark red-to-purple gradient via vertex colors */
    var colors = new Float32Array(pos.count * 3);
    for (var j = 0; j < pos.count; j++) {
      var yy = pos.getY(j);
      var t = (yy + 1.2) / 2.4; // 0 bottom, 1 top
      t = Math.max(0, Math.min(1, t));
      /* bottom: deep purple, top: dark blood red */
      colors[j * 3] = 0.40 + 0.30 * t;
      colors[j * 3 + 1] = 0.04 + 0.03 * t;
      colors[j * 3 + 2] = 0.38 - 0.18 * t;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    var mat = new THREE.MeshPhongMaterial({
      vertexColors: true,
      shininess: 28,
      emissive: 0x330018,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.96
    });

    bodyMesh = new THREE.Mesh(geo, mat);
    bodyMesh.scale.set(BODY_R.x, BODY_R.y, BODY_R.z);
    bossGroup.add(bodyMesh);
  }

  /* ═══════════════════════════════════════════════════════════════
     2. TENTACLES — TubeGeometry along wavy CatmullRom curves
     ═══════════════════════════════════════════════════════════════ */
  function buildTentacles() {
    var count = 6;
    for (var i = 0; i < count; i++) {
      var angle = (i / count) * Math.PI * 2;
      var tentacleData = createSingleTentacle(angle, i);
      tentacles.push(tentacleData.mesh);
      tentacleTips.push(tentacleData.tip);
      bossGroup.add(tentacleData.mesh);
      bossGroup.add(tentacleData.tip);
    }
  }

  function createSingleTentacle(angle, index) {
    var segs = 22;
    var points = [];
    var length = 1.15 + Math.random() * 0.35;

    for (var s = 0; s <= segs; s++) {
      var frac = s / segs;
      var r = 0.85 + frac * length;
      var wav = frac * 0.55;
      var x = Math.cos(angle) * r + Math.sin(frac * 4 + index) * wav;
      var y = Math.sin(angle) * r * 0.45 - frac * 0.7 + Math.cos(frac * 3 + index * 2) * wav * 0.5;
      var z = Math.sin(frac * 2 + index) * wav * 0.35 - frac * 0.25;
      points.push(new THREE.Vector3(x, y, z));
    }

    var curve = new THREE.CatmullRomCurve3(points);
    var tubeGeo = new THREE.TubeGeometry(curve, 18, 0.055 - 0.018, 8, false);
    var tubeMat = new THREE.MeshPhongMaterial({
      color: 0x551133,
      emissive: 0x330022,
      emissiveIntensity: 0.25,
      shininess: 20,
      transparent: true,
      opacity: 0.92
    });
    var mesh = new THREE.Mesh(tubeGeo, tubeMat);

    /* tip sphere that glows */
    var tipPos = points[points.length - 1];
    var tipGeo = new THREE.SphereGeometry(0.11, 14, 14);
    var tipMat = new THREE.MeshPhongMaterial({
      color: 0xff3355,
      emissive: 0xff2244,
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.95
    });
    var tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.copy(tipPos);

    return { mesh: mesh, tip: tip, curve: curve, index: index, baseAngle: angle };
  }

  /* ═══════════════════════════════════════════════════════════════
     3. THREE EYES — sclera, iris w/ texture, pupil, highlight, brows
     ═══════════════════════════════════════════════════════════════ */
  function buildEyes() {
    /* unit directions on the front hemisphere; features sit on surface */
    var eyeDefs = [
      { dir: new THREE.Vector3(0, 0.28, 1),   iris: 0x00cc44, size: 1.00 },
      { dir: new THREE.Vector3(-0.62, 0.02, 0.80), iris: 0xff8800, size: 0.80 },
      { dir: new THREE.Vector3(0.62, 0.02, 0.80),  iris: 0x2288ff, size: 0.80 }
    ];

    /* quaternion that aligns local +Y (cone/axis) to a direction */
    var UP = new THREE.Vector3(0, 1, 0);

    eyeDefs.forEach(function (def) {
      var surf = surfacePoint(def.dir);
      /* push eye outward so it clearly protrudes past the body */
      var center = surf.clone().multiplyScalar(1.06);
      var sizeScale = def.size;

      var eyeGroup = new THREE.Group();
      eyeGroup.position.copy(center);
      /* orient the eye so its face (+Z) points outward along def.dir */
      var lookTarget = center.clone().add(def.dir.clone().normalize());
      eyeGroup.lookAt(lookTarget);
      eyeGroup.scale.setScalar(sizeScale);

      /* sclera (white) */
      var scleraGeo = new THREE.SphereGeometry(0.20, 18, 18);
      var scleraMat = new THREE.MeshPhongMaterial({
        color: 0xf8f8f0,
        shininess: 90,
        emissive: 0x111100,
        emissiveIntensity: 0.06
      });
      var sclera = new THREE.Mesh(scleraGeo, scleraMat);
      sclera.scale.set(1, 1, 0.62);
      eyeGroup.add(sclera);

      /* iris with procedural texture */
      var irisGeo = new THREE.CircleGeometry(0.115, 28);
      var irisCanvas = document.createElement('canvas');
      irisCanvas.width = 64; irisCanvas.height = 64;
      var ictx = irisCanvas.getContext('2d');
      var ic = new THREE.Color(def.iris);
      ictx.fillStyle = 'rgb(' + Math.floor(ic.r * 255) + ',' + Math.floor(ic.g * 255) + ',' + Math.floor(ic.b * 255) + ')';
      ictx.fillRect(0, 0, 64, 64);
      ictx.strokeStyle = 'rgba(0,0,0,0.35)';
      ictx.lineWidth = 1;
      for (var a = 0; a < 360; a += 10) {
        var rad = a * Math.PI / 180;
        ictx.beginPath();
        ictx.moveTo(32, 32);
        ictx.lineTo(32 + Math.cos(rad) * 30, 32 + Math.sin(rad) * 30);
        ictx.stroke();
      }
      ictx.beginPath();
      ictx.arc(32, 32, 30, 0, Math.PI * 2);
      ictx.strokeStyle = 'rgba(0,0,0,0.55)';
      ictx.lineWidth = 3;
      ictx.stroke();
      ictx.beginPath();
      ictx.arc(32, 32, 10, 0, Math.PI * 2);
      ictx.fillStyle = 'rgba(0,0,0,0.25)';
      ictx.fill();

      var irisTex = new THREE.CanvasTexture(irisCanvas);
      var irisMat = new THREE.MeshBasicMaterial({ map: irisTex });
      var iris = new THREE.Mesh(irisGeo, irisMat);
      iris.position.z = 0.13;
      eyeGroup.add(iris);

      /* pupil */
      var pupilGeo = new THREE.CircleGeometry(0.052, 18);
      var pupilMat = new THREE.MeshBasicMaterial({ color: 0x040404 });
      var pupil = new THREE.Mesh(pupilGeo, pupilMat);
      pupil.position.z = 0.14;
      eyeGroup.add(pupil);

      /* specular highlight */
      var hlGeo = new THREE.CircleGeometry(0.024, 12);
      var hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
      var highlight = new THREE.Mesh(hlGeo, hlMat);
      highlight.position.set(0.028, 0.038, 0.15);
      eyeGroup.add(highlight);

      bossGroup.add(eyeGroup);
      eyes.push({ group: eyeGroup, pupil: pupil, iris: iris, highlight: highlight, center: center.clone(), dir: def.dir.clone().normalize() });

      /* angry eyebrow (thin box) placed above the eye, angled inward */
      var browGeo = new THREE.BoxGeometry(0.24 * sizeScale, 0.04, 0.05);
      var browMat = new THREE.MeshPhongMaterial({ color: 0x2a0a1a, emissive: 0x110008, emissiveIntensity: 0.25, shininess: 10 });
      var brow = new THREE.Mesh(browGeo, browMat);
      var browPos = center.clone().add(def.dir.clone().normalize().multiplyScalar(0.18));
      browPos.y += 0.16 * sizeScale;
      brow.position.copy(browPos);
      /* angle: inner end lower, outer end higher → angry V */
      var sign = def.dir.x >= 0 ? 1 : -1;
      brow.rotation.z = sign * 0.32;
      brow.lookAt(browPos.clone().add(def.dir.clone().normalize()));
      bossGroup.add(brow);
      brows.push(brow);
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     4. SHARP TEETH — cone geometries in a ring on the front maw
     ═══════════════════════════════════════════════════════════════ */
  function buildTeeth() {
    var toothCount = 16;
    var UP = new THREE.Vector3(0, 1, 0);

    for (var i = 0; i < toothCount; i++) {
      var a = (i / toothCount) * Math.PI * 2;
      /* oval ring on the front-lower "face" */
      var px = Math.cos(a) * 0.52;
      var py = -0.18 + Math.sin(a) * 0.42;
      var pz = 0.80;
      var p = new THREE.Vector3(px, py, pz);

      var toothH = 0.09 + Math.random() * 0.06;
      var toothGeo = new THREE.ConeGeometry(0.032, toothH, 7);
      var toothMat = new THREE.MeshPhongMaterial({
        color: 0xf6efdc,
        emissive: 0x332a10,
        emissiveIntensity: 0.08,
        shininess: 50
      });
      var tooth = new THREE.Mesh(toothGeo, toothMat);
      tooth.position.set(px, py, pz);

      /* point the tip outward from the body center */
      var outward = p.clone().normalize();
      /* bias slightly downward so it reads as a menacing jaw */
      outward.y -= 0.25;
      outward.normalize();
      tooth.quaternion.setFromUnitVectors(UP, outward);

      bossGroup.add(tooth);
      teeth.push(tooth);
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     5. CROWN / HORN — 3 prominent spikes on top
     ═══════════════════════════════════════════════════════════════ */
  function buildCrownHorns() {
    var hornDefs = [
      { x: 0,    z: 0,    h: 0.72, r: 0.10, color: 0x771133 },
      { x: -0.34, z: 0.10, h: 0.52, r: 0.065, color: 0x661022 },
      { x: 0.34,  z: 0.10, h: 0.52, r: 0.065, color: 0x661022 }
    ];

    hornDefs.forEach(function (cfg) {
      var hornGeo = new THREE.ConeGeometry(cfg.r, cfg.h, 10);
      var hornMat = new THREE.MeshPhongMaterial({
        color: cfg.color,
        emissive: 0x441122,
        emissiveIntensity: 0.4,
        shininess: 55
      });
      var horn = new THREE.Mesh(hornGeo, hornMat);
      /* base sits just above the body top (~0.85), tip points up */
      horn.position.set(cfg.x, BODY_R.y + cfg.h / 2 - 0.06, cfg.z);
      if (cfg.x !== 0) horn.rotation.z = cfg.x > 0 ? -0.18 : 0.18;
      horn.rotation.x = -0.12;
      bossGroup.add(horn);
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     7. PULSING RED GLOW — backside sphere + additive blending
     ═══════════════════════════════════════════════════════════════ */
  function buildPulsingGlow() {
    var glowGeo = new THREE.SphereGeometry(1.7, 20, 20);
    var glowMat = new THREE.MeshBasicMaterial({
      color: 0xff1133,
      transparent: true,
      opacity: 0.10,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    glowSphere = new THREE.Mesh(glowGeo, glowMat);
    glowSphere.scale.set(BODY_R.x * 1.15, BODY_R.y * 1.25, BODY_R.z * 1.15);
    bossGroup.add(glowSphere);
  }

  /* ═══════════════════════════════════════════════════════════════
     6. SPORE PARTICLES — 40 floating particles, additive blending
     ═══════════════════════════════════════════════════════════════ */
  function buildSpores() {
    var sporeCount = 40;
    for (var i = 0; i < sporeCount; i++) {
      var size = 0.03 + Math.random() * 0.05;
      var sporeGeo = new THREE.SphereGeometry(size, 8, 8);
      var hue = Math.random();
      var color = new THREE.Color().setHSL(hue * 0.12 + 0.93, 0.85, 0.55); /* red↔purple */
      var sporeMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.55 + Math.random() * 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      var spore = new THREE.Mesh(sporeGeo, sporeMat);

      /* start on a shell around the body */
      var phi = Math.random() * Math.PI * 2;
      var theta = Math.acos(2 * Math.random() - 1);
      var dist = 1.1 + Math.random() * 0.7;
      spore.position.set(
        dist * Math.sin(theta) * Math.cos(phi),
        dist * Math.sin(theta) * Math.sin(phi) * 0.8,
        dist * Math.cos(theta) * 0.6
      );

      spore.userData = {
        basePos: spore.position.clone(),
        speed: 0.25 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        drift: new THREE.Vector3(
          (Math.random() - 0.5) * 0.6,
          Math.random() * 0.4 + 0.15,
          (Math.random() - 0.5) * 0.4
        ).normalize(),
        baseOpacity: sporeMat.opacity
      };

      bossGroup.add(spore);
      spores.push(spore);
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     8. ANIMATION LOOP
     ═══════════════════════════════════════════════════════════════ */
  function animate() {
    animId = requestAnimationFrame(animate);
    var t = clock.getElapsedTime();

    /* ── menacing float + slight rotation ── */
    bossGroup.position.y = Math.sin(t * 1.1) * 0.09;
    bossGroup.rotation.y = Math.sin(t * 0.35) * 0.10;
    bossGroup.rotation.x = Math.sin(t * 0.28) * 0.03;

    /* ── body emissive pulse ── */
    if (bodyMesh) {
      bodyMesh.material.emissiveIntensity = 0.25 + 0.15 * Math.sin(t * 2.2);
    }

    /* ── tentacle wave ── */
    tentacles.forEach(function (mesh, i) {
      var ang = t * 1.4 + i * 1.1;
      mesh.rotation.z = Math.sin(ang) * 0.10;
      mesh.rotation.x = Math.cos(ang * 0.7) * 0.06;
    });

    /* ── tentacle tip glow ── */
    tentacleTips.forEach(function (tip, i) {
      tip.material.emissiveIntensity = 0.6 + 0.4 * Math.sin(t * 3 + i * 1.5);
      tip.scale.setScalar(0.85 + 0.3 * Math.sin(t * 2 + i));
    });

    /* ── eye tracking mouse ── */
    var targetX = (mouseX / window.innerWidth - 0.5) * 2;
    var targetY = -(mouseY / window.innerHeight - 0.5) * 2;
    eyes.forEach(function (eye) {
      eye.pupil.position.x += (targetX * 0.045 - eye.pupil.position.x) * 0.08;
      eye.pupil.position.y += (targetY * 0.045 - eye.pupil.position.y) * 0.08;
      eye.iris.position.x = eye.pupil.position.x * 0.92;
      eye.iris.position.y = eye.pupil.position.y * 0.92;
      eye.highlight.position.x = eye.pupil.position.x + 0.028;
      eye.highlight.position.y = eye.pupil.position.y + 0.038;
    });

    /* ── brow subtle menace ── */
    brows.forEach(function (brow, i) {
      brow.position.y += Math.sin(t * 1.6 + i * 2) * 0.0004;
    });

    /* ── spore drift outward + swirl ── */
    spores.forEach(function (spore) {
      var ud = spore.userData;
      var s = t * ud.speed + ud.phase;
      spore.position.x = ud.basePos.x + Math.sin(s) * 0.18 + ud.drift.x * t * 0.05;
      spore.position.y = ud.basePos.y + Math.cos(s * 0.8) * 0.14 + ud.drift.y * t * 0.05;
      spore.position.z = ud.basePos.z + Math.sin(s * 0.6 + 1) * 0.12 + ud.drift.z * t * 0.05;
      spore.material.opacity = ud.baseOpacity * (0.6 + 0.4 * Math.sin(s * 1.5));
    });

    /* ── glow pulse ── */
    if (glowSphere) {
      glowSphere.material.opacity = 0.08 + 0.06 * Math.sin(t * 2.0);
      glowSphere.scale.setScalar(1 + 0.04 * Math.sin(t * 1.5));
    }

    renderer.render(scene, camera);
  }

  /* ── events ────────────────────────────────────────────────── */
  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }
  function onTouchMove(e) {
    if (e.touches.length > 0) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    }
  }
  function onResize() { /* container fixed 320×320 */ }
})();
