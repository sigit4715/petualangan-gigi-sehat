/**
 * Sersan Benang - Floss Hero
 * Kids Dental Health Website - Boss Battle Character
 * Three.js r128 | IIFE | Transparent BG | IntersectionObserver | Mouse-following
 */
(function () {
  "use strict";

  var container = document.getElementById("benang3d");
  if (!container) return;

  var W = 200, H = 200;

  /* ── Renderer ── */
  var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  /* ── Scene & Camera ── */
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 100);
  camera.position.set(0, 0.5, 8);
  camera.lookAt(0, 0, 0);

  /* ── Lighting ── */
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  var dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
  dirLight.position.set(4, 5, 3);
  scene.add(dirLight);
  var rimLight = new THREE.DirectionalLight(0x6688ff, 0.6);
  rimLight.position.set(-4, 1, -4);
  scene.add(rimLight);
  scene.add((function () { var l = new THREE.PointLight(0xffffff, 0.2, 12); l.position.set(0, -3, 2); return l; })());

  /* ── Materials ── */
  var bodyMat = new THREE.MeshPhongMaterial({
    color: 0x22bbee, specular: 0xffffff, shininess: 90, emissive: 0x0a3344, emissiveIntensity: 0.2
  });
  var lidMat = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xffffff, shininess: 100, emissive: 0xdddddd, emissiveIntensity: 0.1 });
  var flossMat = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xffffff, shininess: 120, emissive: 0xcccccc, emissiveIntensity: 0.15, transparent: true, opacity: 0.9 });
  var metalMat = new THREE.MeshPhongMaterial({ color: 0xcccccc, specular: 0xffffff, shininess: 130, emissive: 0x555555, emissiveIntensity: 0.1 });
  var eyeWhiteMat = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xffffff, shininess: 130 });
  var eyePupilMat = new THREE.MeshPhongMaterial({ color: 0x111111, specular: 0xffffff, shininess: 160 });
  var capeMat = new THREE.MeshPhongMaterial({ color: 0x2255dd, specular: 0xffffff, shininess: 50, emissive: 0x112266, emissiveIntensity: 0.25, side: THREE.DoubleSide });
  var beltMat = new THREE.MeshPhongMaterial({ color: 0xddaa00, specular: 0xffffff, shininess: 100, emissive: 0x886600, emissiveIntensity: 0.3 });
  var fistMat = new THREE.MeshPhongMaterial({ color: 0x22ccee, specular: 0xffffff, shininess: 80, emissive: 0x115566, emissiveIntensity: 0.15 });

  /* ── Hero Group ── */
  var heroGroup = new THREE.Group();

  /* ── Rectangular Body with Rounded Edges ── */
  var bodyShape = new THREE.Shape();
  var bw = 1.4, bh = 1.8, br = 0.2;
  bodyShape.moveTo(-bw / 2 + br, -bh / 2);
  bodyShape.lineTo(bw / 2 - br, -bh / 2);
  bodyShape.quadraticCurveTo(bw / 2, -bh / 2, bw / 2, -bh / 2 + br);
  bodyShape.lineTo(bw / 2, bh / 2 - br);
  bodyShape.quadraticCurveTo(bw / 2, bh / 2, bw / 2 - br, bh / 2);
  bodyShape.lineTo(-bw / 2 + br, bh / 2);
  bodyShape.quadraticCurveTo(-bw / 2, bh / 2, -bw / 2, bh / 2 - br);
  bodyShape.lineTo(-bw / 2, -bh / 2 + br);
  bodyShape.quadraticCurveTo(-bw / 2, -bh / 2, -bw / 2 + br, -bh / 2);
  var body = new THREE.Mesh(new THREE.ExtrudeGeometry(bodyShape, { depth: 0.8, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.12, bevelSegments: 6 }), bodyMat);
  body.position.set(0, 0, -0.4);
  heroGroup.add(body);

  /* ── Lid ── */
  heroGroup.add((function () { var m = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 0.65), lidMat); m.position.y = 1.1; return m; })());
  heroGroup.add((function () { var m = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.06, 0.7), metalMat); m.position.y = 0.95; return m; })());
  heroGroup.add((function () { var m = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.04, 0.55), metalMat); m.position.y = 1.28; return m; })());

  /* ── Floss Whip ── */
  var flossCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.5, 1.2, 0),
    new THREE.Vector3(0.9, 1.8, 0.2),
    new THREE.Vector3(1.5, 2.2, 0.4),
    new THREE.Vector3(2.2, 1.8, 0.1),
    new THREE.Vector3(2.8, 2.5, -0.1),
    new THREE.Vector3(3.0, 3.0, 0.3),
    new THREE.Vector3(2.6, 3.5, 0.0)
  ]);
  var floss = new THREE.Mesh(new THREE.TubeGeometry(flossCurve, 30, 0.03, 6, false), flossMat);
  heroGroup.add(floss);

  var flossCurve2 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.5, 1.15, -0.1),
    new THREE.Vector3(1.2, 1.5, -0.3),
    new THREE.Vector3(2.0, 1.2, -0.5),
    new THREE.Vector3(2.5, 1.8, -0.2),
    new THREE.Vector3(2.8, 2.2, 0.1)
  ]);
  var floss2 = new THREE.Mesh(new THREE.TubeGeometry(flossCurve2, 20, 0.025, 6, false), flossMat);
  heroGroup.add(floss2);

  /* ── Eyes ── */
  function makeEye(x, z) {
    var g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), eyeWhiteMat));
    var pupil = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), eyePupilMat);
    pupil.position.z = 0.14;
    g.add(pupil);
    var glint = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.6 }));
    glint.position.set(0.05, 0.05, 0.17);
    g.add(glint);
    g.position.set(x, 0.5, z);
    return g;
  }
  var leftEye = makeEye(-0.25, 0.45);
  var rightEye = makeEye(0.25, 0.45);
  heroGroup.add(leftEye);
  heroGroup.add(rightEye);

  /* ── Brows & Mouth ── */
  var browMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
  var lbrow = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.08), browMat);
  lbrow.position.set(-0.25, 0.78, 0.47);
  lbrow.rotation.z = 0.25;
  heroGroup.add(lbrow);
  var rbrow = lbrow.clone();
  rbrow.position.set(0.25, 0.78, 0.47);
  rbrow.rotation.z = -0.25;
  heroGroup.add(rbrow);

  var mouth = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 6, 8, Math.PI), new THREE.MeshPhongMaterial({ color: 0x222222 }));
  mouth.position.set(0, 0.15, 0.47);
  mouth.rotation.x = Math.PI;
  heroGroup.add(mouth);

  /* ── Blue Cape ── */
  var capePts = [];
  for (var ci = 0; ci <= 12; ci++) {
    var t = ci / 12;
    capePts.push(new THREE.Vector3(Math.sin(t * 0.8) * 0.6, 0.8 - t * 3.0, -0.5 + Math.sin(t * 2) * 0.2));
  }
  var cape = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(capePts), 20, 0.6, 8, false), capeMat);
  cape.position.set(0, 0.3, -0.8);
  cape.scale.set(1, 1, 0.25);
  heroGroup.add(cape);

  /* ── Belt ── */
  var belt = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.18, 0.85), beltMat);
  belt.position.y = -0.3;
  heroGroup.add(belt);
  var buckle = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.1), new THREE.MeshPhongMaterial({ color: 0xffdd00, specular: 0xffffff, shininess: 120, emissive: 0xccaa00, emissiveIntensity: 0.4 }));
  buckle.position.set(0, -0.3, 0.46);
  heroGroup.add(buckle);

  /* ── Muscular Arms ── */
  function makeMuscularArm() {
    var g = new THREE.Group();
    g.add((function () { var m = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.55, 8), bodyMat); m.position.y = 0.275; return m; })());
    var fa = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.5, 8), bodyMat);
    fa.position.set(0, 0.8, 0.1);
    fa.rotation.x = -0.3;
    g.add(fa);
    g.add((function () { var m = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), fistMat); m.position.set(0, 1.1, 0.2); return m; })());
    g.add((function () { var m = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), metalMat); return m; })());
    return g;
  }
  var leftArm = makeMuscularArm();
  leftArm.position.set(-0.85, 0.3, 0);
  leftArm.rotation.z = 0.6;
  heroGroup.add(leftArm);
  var rightArm = makeMuscularArm();
  rightArm.position.set(0.85, 0.3, 0);
  rightArm.rotation.z = -0.4;
  heroGroup.add(rightArm);

  /* ── Legs & Boots ── */
  var legMat = new THREE.MeshPhongMaterial({ color: 0x1177aa, specular: 0xffffff, shininess: 50 });
  var bootMat = new THREE.MeshPhongMaterial({ color: 0x1a1a1a, specular: 0xffffff, shininess: 80 });
  var ll = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.6, 8), legMat);
  ll.position.set(-0.3, -1.2, 0);
  heroGroup.add(ll);
  var rl = ll.clone();
  rl.position.set(0.3, -1.2, 0);
  heroGroup.add(rl);
  var lb = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.3), bootMat);
  lb.position.set(-0.3, -1.58, 0.06);
  heroGroup.add(lb);
  var rb = lb.clone();
  rb.position.set(0.3, -1.58, 0.06);
  heroGroup.add(rb);

  /* ── Cutter ── */
  var cutter = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 8), new THREE.MeshPhongMaterial({ color: 0xaaaaaa, specular: 0xffffff, shininess: 150 }));
  cutter.position.set(0.75, 1.05, 0);
  cutter.rotation.z = Math.PI / 2;
  heroGroup.add(cutter);

  /* ── Energy Ring Particles ── */
  var ringCount = 30;
  var ringPositions = new Float32Array(ringCount * 3);
  var ringSpeeds = [];
  for (var ri = 0; ri < ringCount; ri++) {
    var angle = (ri / ringCount) * Math.PI * 2;
    var rad = 2.5 + Math.random() * 0.5;
    ringPositions[ri * 3] = Math.cos(angle) * rad;
    ringPositions[ri * 3 + 1] = Math.sin(angle) * rad * 0.3;
    ringPositions[ri * 3 + 2] = (Math.random() - 0.5) * 1;
    ringSpeeds.push({ angle: angle, rad: rad, speed: 0.5 + Math.random() * 1.0 });
  }
  var ringGeo = new THREE.BufferGeometry();
  ringGeo.setAttribute("position", new THREE.BufferAttribute(ringPositions, 3));
  var ringMat = new THREE.PointsMaterial({ color: 0x88ddff, size: 0.1, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending });
  var ringParticles = new THREE.Points(ringGeo, ringMat);
  scene.add(ringParticles);

  heroGroup.position.set(0, -0.3, 0);
  scene.add(heroGroup);

  /* ── Mouse ── */
  var mouseX = 0, mouseY = 0;
  container.addEventListener("mousemove", function (e) {
    var rect = container.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  });
  container.addEventListener("mouseleave", function () { mouseX = 0; mouseY = 0; });

  /* ── Animation ── */
  var clock = new THREE.Clock();
  var visible = false;
  var animId = null;

  function animate() {
    if (!visible) return;
    animId = requestAnimationFrame(animate);
    var t = clock.getElapsedTime();

    heroGroup.rotation.y += (mouseX * 0.35 - heroGroup.rotation.y) * 0.06;
    heroGroup.rotation.x += (mouseY * 0.2 - heroGroup.rotation.x) * 0.06;
    heroGroup.position.y = -0.3 + Math.sin(t * 2) * 0.1;
    heroGroup.scale.y = 1 + Math.sin(t * 3) * 0.015;

    leftArm.rotation.z = 0.6 + Math.sin(t * 2.5) * 0.12;
    rightArm.rotation.z = -0.4 - Math.sin(t * 2.5 + 0.5) * 0.1;
    cape.rotation.y = Math.sin(t * 3.5) * 0.12;
    cape.scale.x = 1 + Math.sin(t * 2.5) * 0.06;

    // Floss whip wave
    var fp = flossCurve.points;
    for (var fi = 2; fi < fp.length; fi++) {
      fp[fi].y = [1.8, 2.2, 1.8, 2.5, 3.0, 3.5][fi - 2] + Math.sin(t * 5 + fi * 0.8) * 0.2;
      fp[fi].x = [1.5, 2.2, 2.8, 3.0, 2.6][fi - 2] + Math.sin(t * 3 + fi) * 0.15;
    }
    floss.geometry.dispose();
    floss.geometry = new THREE.TubeGeometry(flossCurve, 30, 0.03, 6, false);

    var fp2 = flossCurve2.points;
    for (var fi2 = 2; fi2 < fp2.length; fi2++) {
      fp2[fi2].y = [1.5, 1.2, 1.8, 2.2][fi2 - 2] + Math.sin(t * 4 + fi2 * 1.2) * 0.15;
    }
    floss2.geometry.dispose();
    floss2.geometry = new THREE.TubeGeometry(flossCurve2, 20, 0.025, 6, false);

    // Eye tracking
    leftEye.children[1].position.x = mouseX * 0.04;
    leftEye.children[1].position.y = mouseY * 0.04;
    rightEye.children[1].position.x = mouseX * 0.04;
    rightEye.children[1].position.y = mouseY * 0.04;

    // Ring orbit
    var rp = ringParticles.geometry.attributes.position.array;
    for (var rk = 0; rk < ringCount; rk++) {
      ringSpeeds[rk].angle += ringSpeeds[rk].speed * 0.015;
      rp[rk * 3] = Math.cos(ringSpeeds[rk].angle) * ringSpeeds[rk].rad;
      rp[rk * 3 + 1] = Math.sin(ringSpeeds[rk].angle) * ringSpeeds[rk].rad * 0.3;
    }
    ringParticles.geometry.attributes.position.needsUpdate = true;
    ringMat.opacity = 0.4 + Math.sin(t * 4) * 0.3;

    renderer.render(scene, camera);
  }

  /* ── IntersectionObserver ── */
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        if (!visible) { visible = true; clock.start(); animate(); }
      } else {
        visible = false;
        if (animId) cancelAnimationFrame(animId);
      }
    });
  }, { threshold: 0.1 });
  observer.observe(container);
})();
