/*
 * Riko - the HERO 3D tooth character for the kids' dental health site.
 * Three.js r128 (loaded globally via CDN). Self-contained; mounts into #tooth3d.
 *
 * Requirements covered:
 *   (1) Bulb-shaped crown  -> LatheGeometry with a smooth bell profile (no cylinder)
 *   (2) Two anatomic roots -> TubeGeometry along CatmullRomCurve3 (slight yellow tint)
 *   (3) Detailed face      -> big blinking eyes + eyelids, rosy cheeks, wide smile, moving brows
 *   (4) Golden star        -> ExtrudeGeometry star shape on top
 *   (5) Purple cape        -> cloth sim (sine-wave vertex displacement)
 *   (6) Sparkle particles  -> 25 mixed-colour floating points
 *   (7) Toothbrush + hand  -> tiny hand holding a small brush beside the tooth
 *   (8) Interaction        -> mouse-follow rotation, float bob, star pulse, blink cycle
 * Container #tooth3d, 320x320, transparent bg, IntersectionObserver-gated animation.
 */
(function () {
  'use strict';

  if (typeof THREE === 'undefined') {
    console.error('[Riko] THREE.js (r128) is required before tooth3d.js');
    return;
  }

  var container = document.getElementById('tooth3d');
  if (!container) {
    console.error('[Riko] #tooth3d container not found');
    return;
  }

  var W = 320, H = 320;

  // ---------------------------------------------------------------------------
  // Renderer / Scene / Camera
  // ---------------------------------------------------------------------------
  var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0); // transparent background
  if ('outputEncoding' in renderer && THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  var scene = new THREE.Scene();

  // Frame the whole figure (star top ~+3.85, root tips ~-3.27, brush to the right).
  // Camera looks slightly right of centre so the offstage brush balances the body.
  var camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
  camera.position.set(0, 0, 10.4);
  camera.lookAt(0.4, 0, 0);

  // ---------------------------------------------------------------------------
  // Lights (soft + specular highlights for the enamel)
  // ---------------------------------------------------------------------------
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));

  var key = new THREE.DirectionalLight(0xffffff, 0.85);
  key.position.set(3, 6, 5);
  scene.add(key);

  var rim = new THREE.DirectionalLight(0xbcd2ff, 0.35);
  rim.position.set(-4, 2, -4);
  scene.add(rim);

  var spec = new THREE.PointLight(0xcfe0ff, 0.7, 30);
  spec.position.set(2.5, 1.5, 4.5);
  scene.add(spec);

  var warm = new THREE.PointLight(0xffe6b0, 0.5, 30);
  warm.position.set(-2, -1, 3);
  scene.add(warm);

  // ---------------------------------------------------------------------------
  // Materials
  // ---------------------------------------------------------------------------
  var enamelMat = new THREE.MeshPhongMaterial({
    color: 0xf1f5ff,        // white with a subtle blue tint
    specular: 0x9fb8ff,
    shininess: 95,
    emissive: 0x1b2a4a,
    emissiveIntensity: 0.06
  });

  var rootMat = new THREE.MeshPhongMaterial({
    color: 0xfff0c2,        // slight yellow tint
    specular: 0xffe9a8,
    shininess: 45
  });

  var cheekMat = new THREE.MeshPhongMaterial({
    color: 0xff9ec2, transparent: true, opacity: 0.5, shininess: 12
  });

  var eyeWhiteMat = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x6688cc, shininess: 70 });
  var irisMat     = new THREE.MeshPhongMaterial({ color: 0x2f9bff, specular: 0xffffff, shininess: 80 });
  var pupilMat    = new THREE.MeshPhongMaterial({ color: 0x10131a, shininess: 40 });
  var shineMat    = new THREE.MeshBasicMaterial({ color: 0xffffff });
  var mouthMat    = new THREE.MeshPhongMaterial({ color: 0xc0395b, specular: 0xffffff, shininess: 35 });
  var browMat     = new THREE.MeshPhongMaterial({ color: 0x9b6b3a, shininess: 20 });
  var starMat     = new THREE.MeshPhongMaterial({
    color: 0xffd24a, emissive: 0xffb300, emissiveIntensity: 0.45,
    specular: 0xffffff, shininess: 110
  });
  var capeMat = new THREE.MeshPhongMaterial({
    color: 0x7b3fbf, side: THREE.DoubleSide, transparent: true, opacity: 0.92,
    specular: 0xffffff, shininess: 22
  });
  var skinMat  = new THREE.MeshPhongMaterial({ color: 0xffe0b2, shininess: 25 });
  var handleMat = new THREE.MeshPhongMaterial({ color: 0x4fc3f7, shininess: 40 });
  var headMat  = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 30 });
  var bristleMat = new THREE.MeshPhongMaterial({ color: 0xffe082, shininess: 10 });

  // ---------------------------------------------------------------------------
  // Riko group  (vertical centre of the whole figure is ~0, so base y ~ -0.29)
  // ---------------------------------------------------------------------------
  var RIKO_BASE_Y = -0.29;
  var riko = new THREE.Group();
  riko.position.y = RIKO_BASE_Y;
  scene.add(riko);

  var HC = 2.8;   // crown height
  var MAXR = 1.7; // crown max radius

  // --- (1) Bulb-shaped crown via LatheGeometry --------------------------------
  function crownRadius(u) {
    // u in [0,1]; smooth bell: narrower cervix, bulge near middle, rounded top
    var bell = (u < 0.5)
      ? (0.55 + 0.45 * Math.sin((u / 0.5) * Math.PI * 0.5))
      : Math.pow(Math.cos(((u - 0.5) / 0.5) * Math.PI * 0.5), 0.8);
    var taper = Math.min(1, u / 0.06); // close the bottom to a smooth point
    return MAXR * bell * taper;
  }

  var profile = [];
  var STEPS = 80;
  for (var i = 0; i <= STEPS; i++) {
    var u = i / STEPS;
    profile.push(new THREE.Vector2(Math.max(0.0001, crownRadius(u)), u * HC));
  }
  var crownGeo = new THREE.LatheGeometry(profile, 64);
  crownGeo.computeVertexNormals();
  var crown = new THREE.Mesh(crownGeo, enamelMat);
  riko.add(crown);

  // --- (2) Two anatomic roots via TubeGeometry on CatmullRomCurve3 ------------
  function makeRoot(side) {
    var s = side; // -1 left, +1 right
    var pts = [
      new THREE.Vector3(0.05 * s, 0.05, 0.25),
      new THREE.Vector3(0.10 * s, -0.7, 0.18),
      new THREE.Vector3(0.55 * s, -1.5, 0.02),
      new THREE.Vector3(0.92 * s, -2.35, -0.10),
      new THREE.Vector3(1.12 * s, -2.95, -0.22)
    ];
    var curve = new THREE.CatmullRomCurve3(pts);
    var geo = new THREE.TubeGeometry(curve, 48, 0.32, 14, false);
    return new THREE.Mesh(geo, rootMat);
  }
  riko.add(makeRoot(-1));
  riko.add(makeRoot(1));

  // ---------------------------------------------------------------------------
  // (3) Detailed face
  // ---------------------------------------------------------------------------
  var face = new THREE.Group();
  riko.add(face);

  var eyeY = 0.58 * HC;
  var eyeR = crownRadius(0.58) * 0.9;
  var eyeX = 0.6;
  var eyeZ = eyeR;

  var blinkers = []; // for blink animation
  var eyelids = [];  // cosmetic upper-lid creases

  function makeEye(sx) {
    var g = new THREE.Group();
    g.position.set(sx * eyeX, eyeY, eyeZ);

    var white = new THREE.Mesh(new THREE.SphereGeometry(0.42, 28, 22), eyeWhiteMat);
    g.add(white);

    var iris = new THREE.Mesh(new THREE.SphereGeometry(0.24, 22, 18), irisMat);
    iris.position.z = 0.27;
    g.add(iris);

    var pupil = new THREE.Mesh(new THREE.SphereGeometry(0.12, 18, 14), pupilMat);
    pupil.position.z = 0.42;
    g.add(pupil);

    // little shine highlight
    var shine = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), shineMat);
    shine.position.set(-0.07, 0.09, 0.5);
    g.add(shine);

    // upper-lid crease (cosmetic) - a thin arc that also moves with the blink
    var lid = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.045, 10, 24, Math.PI),
      eyeWhiteMat
    );
    lid.position.y = 0.12;
    lid.rotation.z = Math.PI; // lower half -> forms the lid line over the eye top
    g.add(lid);

    face.add(g);
    blinkers.push(g);   // squash Y to blink
    eyelids.push(lid);
  }
  makeEye(-1);
  makeEye(1);

  // Rosy cheeks (translucent spheres)
  function makeCheek(sx) {
    var cY = 1.0;
    var cZ = crownRadius(cY / HC) * 0.85;
    var m = new THREE.Mesh(new THREE.SphereGeometry(0.30, 20, 16), cheekMat);
    m.position.set(sx * 0.95, cY, cZ);
    face.add(m);
  }
  makeCheek(-1);
  makeCheek(1);

  // Wide smile (torus arc, lower half)
  var mouthY = 0.55;
  var mouthZ = crownRadius(mouthY / HC) * 0.92;
  var smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.46, 0.085, 14, 40, Math.PI),
    mouthMat
  );
  smile.position.set(0, mouthY, mouthZ);
  smile.rotation.z = Math.PI; // flip so the arc opens upward -> a smile
  smile.rotation.x = -0.15;
  face.add(smile);

  // Eyebrows that move (CapsuleGeometry is NOT in r128 -> use cylinder fallback)
  var brows = [];
  function makeBrow(sx) {
    var browGeo = (typeof THREE.CapsuleGeometry === 'function')
      ? new THREE.CapsuleGeometry(0.06, 0.34, 4, 8)
      : new THREE.CylinderGeometry(0.06, 0.06, 0.42, 8);
    var b = new THREE.Mesh(browGeo, browMat);
    b.position.set(sx * eyeX, eyeY + 0.62, eyeZ + 0.05);
    b.rotation.z = sx * 0.18;
    face.add(b);
    brows.push({ mesh: b, base: sx * 0.18, side: sx });
  }
  makeBrow(-1);
  makeBrow(1);

  // ---------------------------------------------------------------------------
  // (4) Golden star on top (ExtrudeGeometry from a star Shape)
  // ---------------------------------------------------------------------------
  function makeStarShape(outer, inner, points) {
    var shape = new THREE.Shape();
    for (var k = 0; k < points * 2; k++) {
      var r = (k % 2 === 0) ? outer : inner;
      var a = (k / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      var x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (k === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }
  var starGeo = new THREE.ExtrudeGeometry(
    makeStarShape(0.62, 0.27, 5),
    { depth: 0.22, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 3 }
  );
  starGeo.center();
  var star = new THREE.Mesh(starGeo, starMat);
  star.position.set(0, HC + 0.45, 0.18);
  riko.add(star);

  // ---------------------------------------------------------------------------
  // (5) Purple cape with cloth simulation (sine-wave vertex displacement)
  // ---------------------------------------------------------------------------
  var capeGeo = new THREE.PlaneGeometry(3.3, 3.8, 26, 26);
  var capeBase = capeGeo.attributes.position.array.slice(0);
  var cape = new THREE.Mesh(capeGeo, capeMat);
  cape.position.set(0, -0.1, -1.65);
  riko.add(cape);

  function updateCape(t) {
    var pos = capeGeo.attributes.position;
    for (var i = 0; i < pos.count; i++) {
      var ix = i * 3;
      var x = capeBase[ix], y = capeBase[ix + 1];
      var sway = (y + 1.9) / 3.8; // 0 at bottom, 1 near top
      var z = Math.sin(x * 1.6 + t * 2.1) * 0.26 * (0.35 + sway)
            + Math.sin(y * 2.0 - t * 1.7) * 0.18 * (0.35 + sway);
      pos.array[ix + 2] = z;
      pos.array[ix] = x + Math.sin(t * 1.2 + y * 0.5) * 0.13 * sway;
    }
    pos.needsUpdate = true;
    capeGeo.computeVertexNormals();
  }

  // ---------------------------------------------------------------------------
  // (6) Sparkle particles (25, mixed colours)
  // ---------------------------------------------------------------------------
  var SPARK = 25;
  var sparkPos = new Float32Array(SPARK * 3);
  var sparkCol = new Float32Array(SPARK * 3);
  var sparkPhase = new Float32Array(SPARK);
  var palette = [
    new THREE.Color(0xff8ec8), // pink
    new THREE.Color(0xffd54a), // gold
    new THREE.Color(0x5ec8ff), // blue
    new THREE.Color(0xb86bff)  // purple
  ];
  for (var p = 0; p < SPARK; p++) {
    var rad = 2.0 + Math.random() * 1.6;
    var th = Math.random() * Math.PI * 2;
    var ph = Math.acos(2 * Math.random() - 1);
    sparkPos[p * 3]     = rad * Math.sin(ph) * Math.cos(th);
    sparkPos[p * 3 + 1] = (Math.random() * 2 - 1) * 2.6 + 0.3;
    sparkPos[p * 3 + 2] = rad * Math.sin(ph) * Math.sin(th) * 0.7 + 0.3;
    var c = palette[(Math.random() * palette.length) | 0];
    sparkCol[p * 3] = c.r; sparkCol[p * 3 + 1] = c.g; sparkCol[p * 3 + 2] = c.b;
    sparkPhase[p] = Math.random() * Math.PI * 2;
  }
  var sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
  sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkCol, 3));
  var sparkMat = new THREE.PointsMaterial({
    size: 0.2, vertexColors: true, transparent: true, opacity: 0.95,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
  });
  var sparkles = new THREE.Points(sparkGeo, sparkMat);
  scene.add(sparkles); // world-space so it floats around the whole hero

  // ---------------------------------------------------------------------------
  // (7) Toothbrush + tiny hand
  // ---------------------------------------------------------------------------
  var brushGroup = new THREE.Group();
  brushGroup.position.set(1.45, -0.05, 1.0);
  brushGroup.rotation.z = -0.32;
  riko.add(brushGroup);

  var handle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.35, 14), handleMat);
  handle.rotation.z = Math.PI / 2; // lie along X
  brushGroup.add(handle);

  var brushHead = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.20), headMat);
  brushHead.position.set(0.82, 0, 0);
  brushGroup.add(brushHead);

  for (var b = 0; b < 5; b++) {
    var bristle = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.16, 6), bristleMat);
    bristle.position.set(0.70 + b * 0.06, 0.13, 0);
    brushGroup.add(bristle);
  }

  // tiny hand gripping the handle
  var hand = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 14), skinMat);
  hand.position.set(-0.55, 0, 0);
  brushGroup.add(hand);

  // ---------------------------------------------------------------------------
  // (8) Interaction: mouse-follow rotation, float bob, star pulse, blink
  // ---------------------------------------------------------------------------
  var targetRotY = 0, targetRotX = 0;
  var mouseInside = false;
  var lastMove = -10;

  container.addEventListener('mousemove', function (e) {
    var r = container.getBoundingClientRect();
    var nx = (e.clientX - r.left) / r.width - 0.5;   // -0.5..0.5
    var ny = (e.clientY - r.top) / r.height - 0.5;
    targetRotY = nx * 1.1;
    targetRotX = ny * 0.5;
    mouseInside = true;
    lastMove = performance.now() / 1000;
  });
  container.addEventListener('mouseleave', function () { mouseInside = false; });

  // Blink state machine
  var elapsed = 0;
  var blinkPhase = 0;
  var nextBlink = 2 + Math.random() * 3;

  function updateFace(dt, t) {
    // idle auto-sway when the mouse has been still
    if (!mouseInside || (performance.now() / 1000 - lastMove) > 2.5) {
      targetRotY += Math.sin(t * 0.5) * 0.004;
      targetRotX = Math.sin(t * 0.37) * 0.12;
    }

    // blink cycle
    if (blinkPhase === 0 && t > nextBlink) blinkPhase = 0.0001;
    if (blinkPhase > 0) {
      blinkPhase += dt / 0.18;
      if (blinkPhase >= 1) { blinkPhase = 0; nextBlink = t + 2.5 + Math.random() * 3; }
    }
    var blink = blinkPhase > 0 ? Math.sin(blinkPhase * Math.PI) : 0;

    for (var i = 0; i < blinkers.length; i++) {
      blinkers[i].scale.y = 1 - 0.92 * blink; // eyelid closes
      eyelids[i].scale.y = 1 + 0.5 * blink;   // lid line drops a touch
    }

    // eyebrows move (subtle raise on blink + gentle idle bob)
    for (var j = 0; j < brows.length; j++) {
      var br = brows[j];
      br.mesh.rotation.z = br.base - blink * 0.25;
      br.mesh.position.y = (eyeY + 0.62) + Math.sin(t * 2 + (br.side > 0 ? 0 : 1)) * 0.04;
    }
  }

  // ---------------------------------------------------------------------------
  // Animation loop (gated by IntersectionObserver)
  // ---------------------------------------------------------------------------
  var clock = new THREE.Clock();
  var running = false;
  var rafId = null;

  function animate() {
    if (!running) return;
    rafId = requestAnimationFrame(animate);

    var dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt;
    var t = elapsed;

    // float bob
    riko.position.y = RIKO_BASE_Y + Math.sin(t * 1.5) * 0.13;

    // smooth mouse-follow rotation
    riko.rotation.y += (targetRotY - riko.rotation.y) * 0.06;
    riko.rotation.x += (targetRotX - riko.rotation.x) * 0.06;

    // star pulse
    var pulse = 1 + 0.14 * Math.sin(t * 3.2);
    star.scale.setScalar(pulse);
    star.rotation.z += dt * 0.6;

    updateFace(dt, t);
    updateCape(t);

    // sparkles: slow orbit + per-particle bob
    sparkles.rotation.y += dt * 0.25;
    var sp = sparkGeo.attributes.position.array;
    for (var s = 0; s < SPARK; s++) {
      sp[s * 3 + 1] = sparkPos[s * 3 + 1] + Math.sin(t * 1.3 + sparkPhase[s]) * 0.22;
    }
    sparkGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  function start() {
    if (running) return;
    running = true;
    clock.start();
    animate();
  }
  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  // IntersectionObserver: only animate while visible (perf + battery friendly)
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) start(); else stop();
      });
    }, { threshold: 0.05 });
    io.observe(container);
  } else {
    start(); // fallback: always animate
  }

  // Render one frame immediately so it isn't blank before scrolling into view.
  renderer.render(scene, camera);

  // Debug: expose the projected NDC bounds of the figure for framing checks.
  try {
    var bbox = new THREE.Box3().setFromObject(riko);
    var mn = bbox.min.clone().project(camera);
    var mx = bbox.max.clone().project(camera);
    window.__frame = { minx: mn.x, maxx: mx.x, miny: mn.y, maxy: mx.y };
  } catch (e) { window.__frame = { error: String(e) }; }
})();
