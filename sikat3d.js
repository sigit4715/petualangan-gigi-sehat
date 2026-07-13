/**
 * Kapten Sikat - Toothbrush Hero
 * Kids Dental Health Website - Boss Battle Character
 * Three.js r128 | IIFE | Transparent BG | IntersectionObserver | Mouse-following
 */
(function () {
  "use strict";

  var container = document.getElementById("sikat3d");
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
  camera.position.set(0, 1, 8);
  camera.lookAt(0, 0, 0);

  /* ── Lighting ── */
  scene.add(new THREE.AmbientLight(0xffffff, 0.45));

  var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(3, 5, 4);
  scene.add(dirLight);

  var rimLight = new THREE.DirectionalLight(0xffcc44, 0.6);
  rimLight.position.set(-3, 2, -3);
  scene.add(rimLight);

  var fillLight = new THREE.PointLight(0xaaddff, 0.3, 15);
  fillLight.position.set(-2, -1, 3);
  scene.add(fillLight);

  /* ── Materials ── */
  var handleMat = new THREE.MeshPhongMaterial({
    color: 0x4488ff,
    specular: 0xffffff,
    shininess: 80,
    emissive: 0x112244,
    emissiveIntensity: 0.15
  });

  var bristleMat = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0xffffff,
    shininess: 60,
    emissive: 0xcccccc,
    emissiveIntensity: 0.1
  });

  var bristleTipMat = new THREE.MeshPhongMaterial({
    color: 0x66ddff,
    specular: 0xffffff,
    shininess: 90,
    emissive: 0x2299aa,
    emissiveIntensity: 0.2
  });

  var eyeWhiteMat = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xffffff, shininess: 120 });
  var eyePupilMat = new THREE.MeshPhongMaterial({ color: 0x111111, specular: 0xffffff, shininess: 150 });
  var eyeGlintMat = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5 });

  var capeMat = new THREE.MeshPhongMaterial({
    color: 0xdd2222,
    specular: 0xffffff,
    shininess: 40,
    emissive: 0x881111,
    emissiveIntensity: 0.2,
    side: THREE.DoubleSide
  });

  var starMat = new THREE.MeshPhongMaterial({
    color: 0xffdd00,
    specular: 0xffffff,
    shininess: 120,
    emissive: 0xccaa00,
    emissiveIntensity: 0.4
  });

  var gripMat = new THREE.MeshPhongMaterial({ color: 0x2266cc, specular: 0xffffff, shininess: 50 });

  /* ── Hero Group ── */
  var heroGroup = new THREE.Group();

  /* ── Curved Handle via TubeGeometry ── */
  var handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -2.8, 0),
    new THREE.Vector3(0.08, -2.0, 0.05),
    new THREE.Vector3(0.15, -1.2, 0.08),
    new THREE.Vector3(0.12, -0.3, 0.04),
    new THREE.Vector3(0.05, 0.5, 0),
    new THREE.Vector3(-0.02, 1.3, -0.03),
    new THREE.Vector3(-0.05, 2.0, 0)
  ]);
  var handleGeo = new THREE.TubeGeometry(handleCurve, 40, 0.22, 16, false);
  heroGroup.add(new THREE.Mesh(handleGeo, handleMat));

  /* ── Grip bands ── */
  for (var gi = 0; gi < 5; gi++) {
    var grip = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 8, 16), gripMat);
    var pt = handleCurve.getPointAt(0.15 + gi * 0.12);
    var tan = handleCurve.getTangentAt(0.15 + gi * 0.12);
    grip.position.copy(pt);
    grip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan.normalize());
    heroGroup.add(grip);
  }

  /* ── Bristle Head ── */
  var headGroup = new THREE.Group();
  headGroup.position.set(-0.05, 2.3, 0);

  var padMat = new THREE.MeshPhongMaterial({ color: 0xddeeff, specular: 0xffffff, shininess: 60 });
  var pad = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.45, 0.3, 16), padMat);
  pad.rotation.x = Math.PI / 2;
  headGroup.add(pad);

  var bristleCount = 0;
  for (var bx = -3; bx <= 3; bx++) {
    for (var bz = -3; bz <= 3; bz++) {
      if (bx * bx + bz * bz > 12) continue;
      var bMat = bristleCount % 3 === 0 ? bristleTipMat : bristleMat;
      var bristle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.015, 0.35 + Math.random() * 0.1, 4), bMat);
      bristle.position.set(bx * 0.1, 0.2, bz * 0.1);
      headGroup.add(bristle);
      bristleCount++;
    }
  }
  headGroup.rotation.x = -0.15;
  heroGroup.add(headGroup);

  /* ── Eyes ── */
  function makeEye(x, y, z) {
    var g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), eyeWhiteMat));
    var pupil = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), eyePupilMat);
    pupil.position.z = 0.1;
    g.add(pupil);
    var glint = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), eyeGlintMat);
    glint.position.set(0.03, 0.04, 0.13);
    g.add(glint);
    g.position.set(x, y, z);
    return g;
  }
  heroGroup.add(makeEye(-0.15, 1.6, 0.2));
  heroGroup.add(makeEye(0.15, 1.6, 0.2));

  /* ── Determined eyebrows ── */
  var browMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
  var lbrow = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.06), browMat);
  lbrow.position.set(-0.15, 1.78, 0.22);
  lbrow.rotation.z = 0.3;
  heroGroup.add(lbrow);
  var rbrow = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.06), browMat);
  rbrow.position.set(0.15, 1.78, 0.22);
  rbrow.rotation.z = -0.3;
  heroGroup.add(rbrow);

  /* ── Mouth ── */
  var mouthMat = new THREE.MeshPhongMaterial({ color: 0xcc3333 });
  var mouth = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.02, 6, 8, Math.PI), mouthMat);
  mouth.position.set(0, 1.42, 0.22);
  mouth.rotation.x = Math.PI;
  heroGroup.add(mouth);

  /* ── Red Cape ── */
  var capePoints = [];
  for (var ci = 0; ci <= 10; ci++) {
    var ct = ci / 10;
    capePoints.push(new THREE.Vector3(
      Math.sin(ct * 0.6) * 0.4, 1.8 - ct * 3.2, -0.15 + Math.sin(ct * 1.5) * 0.15
    ));
  }
  var capeGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(capePoints), 20, 0.55, 8, false);
  var cape = new THREE.Mesh(capeGeo, capeMat);
  cape.position.set(0, 0, -0.2);
  cape.scale.set(1, 1, 0.3);
  heroGroup.add(cape);

  /* ── Golden Star Emblem ── */
  function createStar(r, pts, depth) {
    var shape = new THREE.Shape();
    for (var si = 0; si < pts * 2; si++) {
      var angle = (si / (pts * 2)) * Math.PI * 2 - Math.PI / 2;
      var radius = si % 2 === 0 ? r : r * 0.45;
      if (si === 0) shape.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      else shape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 });
  }

  var star = new THREE.Mesh(createStar(0.2, 5, 0.06), starMat);
  star.position.set(0, 0.8, 0.24);
  heroGroup.add(star);
  var s1 = new THREE.Mesh(createStar(0.1, 5, 0.04), starMat);
  s1.position.set(-0.35, 0.5, 0.15);
  s1.rotation.z = 0.3;
  heroGroup.add(s1);
  var s2 = new THREE.Mesh(createStar(0.1, 5, 0.04), starMat);
  s2.position.set(0.35, 1.1, 0.15);
  s2.rotation.z = -0.3;
  heroGroup.add(s2);

  /* ── Arms & Legs ── */
  var limbMat = handleMat.clone();
  var leftArm = new THREE.Group();
  leftArm.add((function () { var m = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.5, 8), limbMat); m.position.y = 0.25; return m; })());
  var fist = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), limbMat);
  fist.position.y = 0.55;
  leftArm.add(fist);
  leftArm.position.set(-0.35, 0.2, 0.15);
  leftArm.rotation.z = 0.8;
  heroGroup.add(leftArm);

  var rightArm = leftArm.clone();
  rightArm.position.set(0.35, -0.2, 0.15);
  rightArm.rotation.z = -0.5;
  heroGroup.add(rightArm);

  var legMat = new THREE.MeshPhongMaterial({ color: 0x3366bb, specular: 0xffffff, shininess: 40 });
  var ll = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.5, 8), legMat);
  ll.position.set(-0.1, -3.05, 0.08);
  heroGroup.add(ll);
  var rl = ll.clone();
  rl.position.set(0.1, -3.05, 0.08);
  heroGroup.add(rl);

  var bootMat = new THREE.MeshPhongMaterial({ color: 0x222222, specular: 0xffffff, shininess: 80 });
  var lb = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.18), bootMat);
  lb.position.set(-0.1, -3.35, 0.12);
  heroGroup.add(lb);
  var rb = lb.clone();
  rb.position.set(0.1, -3.35, 0.12);
  heroGroup.add(rb);

  /* ── Sparkle particles ── */
  var sparkCount = 25;
  var sparkGeo = new THREE.BufferGeometry();
  var sparkPos = new Float32Array(sparkCount * 3);
  var sparkSpeeds = [];
  for (var si2 = 0; si2 < sparkCount; si2++) {
    sparkPos[si2 * 3] = (Math.random() - 0.5) * 4;
    sparkPos[si2 * 3 + 1] = (Math.random() - 0.5) * 4;
    sparkPos[si2 * 3 + 2] = (Math.random() - 0.5) * 2;
    sparkSpeeds.push(0.5 + Math.random() * 1.5);
  }
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
  var sparkMat2 = new THREE.PointsMaterial({
    color: 0xffdd44, size: 0.08, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending
  });
  scene.add(new THREE.Points(sparkGeo, sparkMat2));

  heroGroup.position.y = -0.5;
  heroGroup.rotation.z = 0.12;
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

    heroGroup.rotation.y += (mouseX * 0.4 - heroGroup.rotation.y) * 0.06;
    heroGroup.rotation.x += (mouseY * 0.25 - heroGroup.rotation.x) * 0.06;
    heroGroup.position.y = -0.5 + Math.sin(t * 2.5) * 0.15;
    heroGroup.rotation.z = 0.12 + Math.sin(t * 3) * 0.06;

    headGroup.children.forEach(function (child, idx) {
      if (idx > 0) {
        child.rotation.x = Math.sin(t * 8 + idx * 0.3) * 0.08;
        child.rotation.z = Math.cos(t * 6 + idx * 0.2) * 0.06;
      }
    });

    cape.rotation.y = Math.sin(t * 4) * 0.15;
    cape.scale.x = 1 + Math.sin(t * 3) * 0.08;
    leftArm.rotation.z = 0.8 + Math.sin(t * 4) * 0.2;
    star.rotation.z = t * 0.8;
    s1.rotation.z = 0.3 + t * 1.2;
    s2.rotation.z = -0.3 - t * 1.0;

    var sp = sparkGeo.attributes.position.array;
    for (var sk = 0; sk < sparkCount; sk++) {
      sp[sk * 3 + 1] += sparkSpeeds[sk] * 0.01;
      if (sp[sk * 3 + 1] > 3) sp[sk * 3 + 1] = -3;
      sp[sk * 3] += Math.sin(t + sk) * 0.003;
    }
    sparkGeo.attributes.position.needsUpdate = true;
    sparkMat2.opacity = 0.5 + Math.sin(t * 5) * 0.3;

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
