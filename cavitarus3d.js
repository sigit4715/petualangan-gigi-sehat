/**
 * Cavitarus — 3D Germ Monster Boss for Kids Dental Health
 * Three.js r128 procedural geometry, self-contained IIFE
 * Container: #cavitarus3d (320×320, transparent background)
 */
;(function () {
  'use strict';

  var W = 320, H = 320;
  var container = document.getElementById('cavitarus3d');
  if (!container) return;

  /* ── State ─────────────────────────────────────────── */
  var running = false, frameId = 0;
  var mouseNorm = { x: 0, y: 0 };

  /* ── Renderer ──────────────────────────────────────── */
  var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0);
  renderer.sortObjects = true;
  container.appendChild(renderer.domElement);

  /* ── Scene + Camera ────────────────────────────────── */
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
  camera.position.set(0, 0.5, 7);
  camera.lookAt(0, 0, 0);

  /* ── Lights ────────────────────────────────────────── */
  var ambLight = new THREE.AmbientLight(0x8866aa, 0.5);
  scene.add(ambLight);

  var keyLight = new THREE.DirectionalLight(0xffddaa, 0.9);
  keyLight.position.set(3, 5, 4);
  scene.add(keyLight);

  var rimLight = new THREE.DirectionalLight(0xcc44ff, 0.6);
  rimLight.position.set(-3, 2, -3);
  scene.add(rimLight);

  var underLight = new THREE.PointLight(0xff2255, 0.8, 10);
  underLight.position.set(0, -2, 2);
  scene.add(underLight);

  /* ── Colour palette ────────────────────────────────── */
  var COL = {
    bodyMain:    0xcc2244,
    bodyDark:    0x881133,
    bodyLight:   0xdd4466,
    spike:       0xaa1155,
    spikeTip:    0xff3377,
    eyeWhite:    0xffffff,
    pupil:       0x110011,
    iris:        0xffcc00,
    tentacle:    0xbb2255,
    tentacleTip: 0xdd55aa,
    glow:        0xff1144,
    particle:    0xff6688,
  };

  /* ── Helper: emissive material ─────────────────────── */
  function mat(color, emissive, emissiveI) {
    return new THREE.MeshPhongMaterial({
      color: color,
      emissive: emissive || color,
      emissiveIntensity: emissiveI || 0.15,
      shininess: 60,
      specular: 0x442244,
    });
  }

  /* ── Monster group ─────────────────────────────────── */
  var monster = new THREE.Group();
  scene.add(monster);

  /* ═══════════════════════════════════════════════════
     BODY — lumpy sphere (icosahedron with noise)
     ═══════════════════════════════════════════════════ */
  var bodyGeo = new THREE.IcosahedronGeometry(1.5, 2);
  // deform vertices for organic feel
  var bPos = bodyGeo.attributes.position;
  for (var i = 0; i < bPos.count; i++) {
    var bx = bPos.getX(i), by = bPos.getY(i), bz = bPos.getZ(i);
    var noise = 1 + 0.18 * Math.sin(bx * 5.3 + by * 3.1) *
                     Math.cos(bz * 4.7 + bx * 2.9);
    bPos.setXYZ(i, bx * noise, by * noise * 1.1, bz * noise);
  }
  bodyGeo.computeVertexNormals();
  var bodyMesh = new THREE.Mesh(bodyGeo, mat(COL.bodyMain, COL.bodyDark, 0.25));
  monster.add(bodyMesh);

  /* ── Secondary inner glow sphere ───────────────────── */
  var glowGeo = new THREE.SphereGeometry(1.55, 16, 16);
  var glowMat = new THREE.MeshBasicMaterial({
    color: COL.glow,
    transparent: true,
    opacity: 0.12,
    side: THREE.BackSide,
  });
  var glowMesh = new THREE.Mesh(glowGeo, glowMat);
  monster.add(glowMesh);

  /* ═══════════════════════════════════════════════════
     SPIKES — cones radiating from body surface
     ═══════════════════════════════════════════════════ */
  var spikeGroup = new THREE.Group();
  var spikeCount = 22;
  for (var s = 0; s < spikeCount; s++) {
    var phi   = Math.acos(2 * (s + 0.5) / spikeCount - 1);
    var theta = Math.PI * (1 + Math.sqrt(5)) * s;
    var sLen  = 0.35 + Math.random() * 0.45;
    var sRad  = 0.06 + Math.random() * 0.06;

    var sGeo  = new THREE.ConeGeometry(sRad, sLen, 6);
    var sMat  = mat(COL.spike, COL.spikeTip, 0.4);
    sMat.color.setHSL(0.92 + Math.random() * 0.08, 0.6 + Math.random() * 0.3, 0.4 + Math.random() * 0.15);
    var sMesh = new THREE.Mesh(sGeo, sMat);

    var dist = 1.35;
    sMesh.position.set(
      dist * Math.sin(phi) * Math.cos(theta),
      dist * Math.sin(phi) * Math.sin(theta) * 1.1,
      dist * Math.cos(phi)
    );
    sMesh.lookAt(0, 0, 0);
    sMesh.rotateX(Math.PI); // point outward
    spikeGroup.add(sMesh);
  }
  monster.add(spikeGroup);

  /* ═══════════════════════════════════════════════════
     EYES — 3 big cute-but-angry eyes
     ═══════════════════════════════════════════════════ */
  var eyesGroup = new THREE.Group();
  var eyeData = [
    { x: 0,    y: 0.35, z: 1.38, s: 0.42 },   // center top
    { x: -0.6, y: -0.05, z: 1.2, s: 0.34 },   // left
    { x: 0.6,  y: -0.05, z: 1.2, s: 0.34 },   // right
  ];
  var eyeMeshes = [];
  var pupilMeshes = [];

  eyeData.forEach(function (e) {
    var eyeGrp = new THREE.Group();

    // white
    var wGeo = new THREE.SphereGeometry(e.s, 12, 12);
    var wMesh = new THREE.Mesh(wGeo, mat(COL.eyeWhite, 0xffffff, 0.1));
    eyeGrp.add(wMesh);

    // iris
    var iGeo = new THREE.SphereGeometry(e.s * 0.55, 10, 10);
    var iMesh = new THREE.Mesh(iGeo, mat(COL.iris, COL.iris, 0.5));
    iMesh.position.z = e.s * 0.45;
    eyeGrp.add(iMesh);

    // pupil
    var pGeo = new THREE.SphereGeometry(e.s * 0.28, 8, 8);
    var pMat = mat(COL.pupil, 0x000000, 0);
    pMat.specular.set(0xffffff);
    var pMesh = new THREE.Mesh(pGeo, pMat);
    pMesh.position.z = e.s * 0.65;
    eyeGrp.add(pMesh);
    pupilMeshes.push(pMesh);

    // angry brow (tilted flat box via cylinder)
    var browGeo = new THREE.CylinderGeometry(e.s * 0.08, e.s * 0.08, e.s * 1.2, 4);
    var browMesh = new THREE.Mesh(browGeo, mat(COL.bodyDark, COL.bodyDark, 0.3));
    browMesh.rotation.z = e.x < 0 ? 0.35 : (e.x > 0 ? -0.35 : 0);
    browMesh.position.set(0, e.s * 0.65, e.s * 0.35);
    browMesh.rotation.x = 0.2;
    eyeGrp.add(browMesh);

    eyeGrp.position.set(e.x, e.y, e.z);
    eyesGroup.add(eyeGrp);
    eyeMeshes.push(eyeGrp);
  });
  monster.add(eyesGroup);

  /* ═══════════════════════════════════════════════════
     MOUTH — angry frown (torus arc)
     ═══════════════════════════════════════════════════ */
  var mouthGeo = new THREE.TorusGeometry(0.4, 0.06, 8, 12, Math.PI);
  var mouthMat = mat(0x440022, 0x220011, 0.1);
  var mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
  mouthMesh.position.set(0, -0.5, 1.35);
  mouthMesh.rotation.x = 0.15; // default ∩ half-arc = angry frown
  monster.add(mouthMesh);

  // tiny fangs
  var fangGeo = new THREE.ConeGeometry(0.04, 0.18, 5);
  var fangMat = mat(0xffffff, 0xffffff, 0.3);
  [-0.12, 0.12].forEach(function (fx) {
    var f = new THREE.Mesh(fangGeo, fangMat);
    f.position.set(fx, -0.52, 1.5);
    f.rotation.x = -0.3;
    monster.add(f);
  });

  /* ═══════════════════════════════════════════════════
     TENTACLES — 5 wiggly tentacles from bottom
     ═══════════════════════════════════════════════════ */
  var tentacles = [];
  var tentGroup = new THREE.Group();
  var tentCount = 5;

  for (var t = 0; t < tentCount; t++) {
    var angle = (t / tentCount) * Math.PI * 2;
    var segments = 5;
    var tGrp = new THREE.Group();
    var tipPos = { x: 0, y: 0, z: 0 };

    for (var seg = 0; seg < segments; seg++) {
      var segLen = 0.45 - seg * 0.06;
      var segRad = 0.12 - seg * 0.015;
      if (segRad < 0.03) segRad = 0.03;
      var cylGeo = new THREE.CylinderGeometry(segRad, segRad * 1.15, segLen, 6);
      var tCol = new THREE.Color(COL.tentacle).lerp(
        new THREE.Color(COL.tentacleTip), seg / segments
      );
      var cylMesh = new THREE.Mesh(cylGeo, mat(tCol.getHex(), tCol.getHex(), 0.2));

      cylMesh.position.y = -segLen / 2;
      var segGrp = new THREE.Group();
      segGrp.add(cylMesh);
      segGrp.position.y = seg === 0 ? 0 : -segLen * 0.9;
      segGrp.userData.phase = seg * 0.8 + t * 1.2;
      segGrp.userData.amplitude = 0.15 + seg * 0.06;

      if (seg > 0) {
        // slight bend outward
        segGrp.rotation.x = 0.2;
      }
      tGrp.add(segGrp);
    }

    // tip sphere
    var tipGeo = new THREE.SphereGeometry(0.05, 6, 6);
    var tipMesh = new THREE.Mesh(tipGeo, mat(COL.tentacleTip, COL.tentacleTip, 0.6));
    tipMesh.position.y = -segments * 0.38;
    tGrp.add(tipMesh);

    tGrp.position.set(
      Math.cos(angle) * 0.8,
      -1.2,
      Math.sin(angle) * 0.8
    );
    tGrp.rotation.z = Math.cos(angle) * 0.4;
    tGrp.rotation.x = Math.sin(angle) * 0.4;

    tentGroup.add(tGrp);
    tentacles.push(tGrp);
  }
  monster.add(tentGroup);

  /* ═══════════════════════════════════════════════════
     PARTICLES — floating germs / sparkles
     ═══════════════════════════════════════════════════ */
  var particleCount = 40;
  var particleGeo = new THREE.BufferGeometry();
  var pPositions = new Float32Array(particleCount * 3);
  var pSizes = new Float32Array(particleCount);
  var particleData = [];

  for (var p = 0; p < particleCount; p++) {
    var px = (Math.random() - 0.5) * 5;
    var py = (Math.random() - 0.5) * 4;
    var pz = (Math.random() - 0.5) * 3;
    pPositions[p * 3]     = px;
    pPositions[p * 3 + 1] = py;
    pPositions[p * 3 + 2] = pz;
    pSizes[p] = 2 + Math.random() * 4;
    particleData.push({
      baseX: px, baseY: py, baseZ: pz,
      speed: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
      drift: 0.2 + Math.random() * 0.5,
    });
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(pSizes, 1));

  // Create a small circle texture for particles
  var pCanvas = document.createElement('canvas');
  pCanvas.width = 32; pCanvas.height = 32;
  var pCtx = pCanvas.getContext('2d');
  var grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255,150,180,1)');
  grad.addColorStop(0.4, 'rgba(255,80,120,0.6)');
  grad.addColorStop(1, 'rgba(255,50,80,0)');
  pCtx.fillStyle = grad;
  pCtx.fillRect(0, 0, 32, 32);
  var pTex = new THREE.CanvasTexture(pCanvas);

  var particleMat = new THREE.PointsMaterial({
    map: pTex,
    size: 0.15,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    color: COL.particle,
  });
  var particleMesh = new THREE.Points(particleGeo, particleMat);
  scene.add(particleMesh);

  /* ═══════════════════════════════════════════════════
     OUTER GLOW RING — pulsing halo
     ═══════════════════════════════════════════════════ */
  var ringGeo = new THREE.TorusGeometry(2.0, 0.04, 8, 64);
  var ringMat = new THREE.MeshBasicMaterial({
    color: COL.glow,
    transparent: true,
    opacity: 0.25,
  });
  var ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI / 2;
  monster.add(ringMesh);

  /* ── Mouse tracking ────────────────────────────────── */
  function onMouseMove(ev) {
    var rect = renderer.domElement.getBoundingClientRect();
    mouseNorm.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    mouseNorm.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
  }
  renderer.domElement.addEventListener('mousemove', onMouseMove, { passive: true });

  /* ── Animation loop ────────────────────────────────── */
  var clock = new THREE.Clock();

  function animate() {
    if (!running) return;
    frameId = requestAnimationFrame(animate);

    var t = clock.getElapsedTime();
    var dt = clock.getDelta();

    /* floating bob */
    monster.position.y = Math.sin(t * 1.8) * 0.25;

    /* gentle roll */
    monster.rotation.z = Math.sin(t * 1.1) * 0.08;

    /* mouse-following rotation */
    var targetRY = mouseNorm.x * 0.4;
    var targetRX = -mouseNorm.y * 0.25;
    monster.rotation.y += (targetRY - monster.rotation.y) * 0.06;
    monster.rotation.x += (targetRX - monster.rotation.x) * 0.06;

    /* spike pulse */
    spikeGroup.children.forEach(function (sp, i) {
      var pulse = 1 + Math.sin(t * 3 + i * 0.5) * 0.08;
      sp.scale.set(pulse, pulse, pulse);
    });

    /* tentacle wiggle */
    tentacles.forEach(function (tGrp) {
      tGrp.children.forEach(function (seg, si) {
        if (seg.userData && seg.userData.amplitude) {
          seg.rotation.x = seg.userData.amplitude * Math.sin(t * 2.5 + seg.userData.phase);
          seg.rotation.z = seg.userData.amplitude * 0.6 * Math.cos(t * 2.0 + seg.userData.phase + 1);
        }
      });
    });

    /* eye pupil tracking — follow mouse subtly */
    pupilMeshes.forEach(function (pm, i) {
      pm.position.x = mouseNorm.x * 0.06;
      pm.position.y = mouseNorm.y * 0.05;
    });

    /* glow pulse */
    glowMat.opacity = 0.08 + Math.sin(t * 2.2) * 0.06;
    glowMesh.scale.setScalar(1 + Math.sin(t * 1.5) * 0.04);

    /* ring pulse + rotation */
    ringMesh.rotation.z = t * 0.3;
    ringMat.opacity = 0.15 + Math.sin(t * 2) * 0.12;
    var ringPulse = 1 + Math.sin(t * 1.8) * 0.06;
    ringMesh.scale.set(ringPulse, ringPulse, ringPulse);

    /* particles drift */
    var pPos = particleGeo.attributes.position;
    for (var i = 0; i < particleCount; i++) {
      var pd = particleData[i];
      pPos.setXYZ(i,
        pd.baseX + Math.sin(t * pd.speed + pd.phase) * pd.drift,
        pd.baseY + Math.cos(t * pd.speed * 0.7 + pd.phase) * pd.drift,
        pd.baseZ + Math.sin(t * pd.speed * 0.5 + pd.phase * 2) * 0.3
      );
    }
    pPos.needsUpdate = true;
    particleMat.opacity = 0.5 + Math.sin(t * 3) * 0.2;

    /* body emissive throb */
    bodyMesh.material.emissiveIntensity = 0.2 + Math.sin(t * 2.5) * 0.1;

    renderer.render(scene, camera);
  }

  /* ── IntersectionObserver for perf ─────────────────── */
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        if (!running) {
          running = true;
          clock.start();
          animate();
        }
      } else {
        running = false;
        if (frameId) cancelAnimationFrame(frameId);
        frameId = 0;
      }
    });
  }, { threshold: 0.1 });

  observer.observe(renderer.domElement);

  /* ── Resize handling ───────────────────────────────── */
  function onResize() {
    var w = container.clientWidth || W;
    var h = container.clientHeight || H;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize, { passive: true });

  /* ── Cleanup API ───────────────────────────────────── */
  window.Cavitarus = {
    destroy: function () {
      running = false;
      cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      scene.traverse(function (obj) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (obj.material.map) obj.material.map.dispose();
          obj.material.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    }
  };
})();
