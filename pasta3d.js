/**
 * Pasta Ajaib - Toothpaste Hero
 * Kids Dental Health Website - Boss Battle Character
 * Three.js r128 | IIFE | Transparent BG | IntersectionObserver | Mouse-following
 */
(function () {
  "use strict";

  var container = document.getElementById("pasta3d");
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
  dirLight.position.set(3, 5, 4);
  scene.add(dirLight);
  var rimLight = new THREE.DirectionalLight(0xdd88ff, 0.55);
  rimLight.position.set(-4, 2, -3);
  scene.add(rimLight);
  var magicLight = new THREE.PointLight(0xcc88ff, 0.4, 12);
  magicLight.position.set(2, 3, 2);
  scene.add(magicLight);
  scene.add((function () { var l = new THREE.PointLight(0xffffff, 0.15, 8); l.position.set(0, -3, 3); return l; })());

  /* ── Materials ── */
  var tubeMat = new THREE.MeshPhongMaterial({
    color: 0xdd44ff, specular: 0xffffff, shininess: 90, emissive: 0x551166, emissiveIntensity: 0.2
  });
  var labelMat = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xffffff, shininess: 100, emissive: 0xeeeeee, emissiveIntensity: 0.1 });
  var stripeMat = new THREE.MeshPhongMaterial({ color: 0xffdd00, specular: 0xffffff, shininess: 110, emissive: 0xccaa00, emissiveIntensity: 0.3 });
  var stripeMat2 = new THREE.MeshPhongMaterial({ color: 0x44bbff, specular: 0xffffff, shininess: 100, emissive: 0x2288cc, emissiveIntensity: 0.25 });
  var capMat = new THREE.MeshPhongMaterial({ color: 0xcc33cc, specular: 0xffffff, shininess: 100, emissive: 0x661166, emissiveIntensity: 0.2 });
  var pasteMat = new THREE.MeshPhongMaterial({ color: 0x88ddff, specular: 0xffffff, shininess: 120, emissive: 0x44aacc, emissiveIntensity: 0.25, transparent: true, opacity: 0.9 });
  var pasteStripeMat = new THREE.MeshPhongMaterial({ color: 0xff66aa, specular: 0xffffff, shininess: 110, emissive: 0xcc3366, emissiveIntensity: 0.2, transparent: true, opacity: 0.85 });
  var eyeWhiteMat = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xffffff, shininess: 130 });
  var eyePupilMat = new THREE.MeshPhongMaterial({ color: 0x111111, specular: 0xffffff, shininess: 160 });
  var capeMat = new THREE.MeshPhongMaterial({ color: 0x7722cc, specular: 0xffffff, shininess: 50, emissive: 0x331166, emissiveIntensity: 0.25, side: THREE.DoubleSide });

  /* ── Hero Group ── */
  var heroGroup = new THREE.Group();

  /* ── Cylindrical Tube Body ── */
  heroGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 3.2, 20), tubeMat));

  // Cap
  var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.4, 12), capMat);
  cap.position.y = 1.8;
  heroGroup.add(cap);
  for (var cri = 0; cri < 16; cri++) {
    var ca = (cri / 16) * Math.PI * 2;
    var ridge = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.35, 0.06), new THREE.MeshPhongMaterial({ color: 0xbb22bb, specular: 0xffffff, shininess: 60 }));
    ridge.position.set(Math.cos(ca) * 0.33, 1.8, Math.sin(ca) * 0.33);
    ridge.rotation.y = -ca;
    heroGroup.add(ridge);
  }

  // Bottom crimp
  var crimp = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 0.2), new THREE.MeshPhongMaterial({ color: 0xaaaaaa, specular: 0xffffff, shininess: 100 }));
  crimp.position.y = -1.65;
  heroGroup.add(crimp);

  // Label
  heroGroup.add((function () { var m = new THREE.Mesh(new THREE.CylinderGeometry(0.67, 0.72, 1.2, 20, 1, true), labelMat); m.position.y = -0.2; return m; })());

  // Label stripes
  for (var si = 0; si < 4; si++) {
    var sg = new THREE.CylinderGeometry(0.68 + si * 0.001, 0.73 + si * 0.001, 0.12, 20, 1, true, (si * Math.PI) / 2, Math.PI * 0.3);
    var stripe = new THREE.Mesh(sg, si % 2 === 0 ? stripeMat : stripeMat2);
    stripe.position.y = -0.2;
    heroGroup.add(stripe);
  }

  /* ── Paste Extrusion ── */
  var pasteGroup = new THREE.Group();
  pasteGroup.position.y = 2.0;
  var pasteCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.05, 0.3, 0.05),
    new THREE.Vector3(-0.08, 0.7, -0.03), new THREE.Vector3(0.1, 1.1, 0.08),
    new THREE.Vector3(-0.05, 1.4, -0.05), new THREE.Vector3(0.15, 1.6, 0.1),
    new THREE.Vector3(0.0, 1.3, 0.0)
  ]);
  var pasteMesh = new THREE.Mesh(new THREE.TubeGeometry(pasteCurve, 20, 0.18, 10, false), pasteMat);
  pasteGroup.add(pasteMesh);

  var swirlCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.1, 0.1, 0.1), new THREE.Vector3(-0.05, 0.5, 0.12),
    new THREE.Vector3(0.12, 0.9, -0.05), new THREE.Vector3(-0.08, 1.2, 0.08),
    new THREE.Vector3(0.1, 1.5, -0.03)
  ]);
  pasteGroup.add(new THREE.Mesh(new THREE.TubeGeometry(swirlCurve, 15, 0.07, 6, false), pasteStripeMat));

  var pasteTip = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), pasteMat);
  pasteTip.position.set(0, 1.5, 0);
  pasteTip.scale.y = 0.6;
  pasteGroup.add(pasteTip);
  heroGroup.add(pasteGroup);

  /* ── Eyes ── */
  function makeEye(x, z) {
    var g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), new THREE.MeshPhongMaterial({ color: 0xcc33cc, specular: 0xffffff, shininess: 80 })));
    var white = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), eyeWhiteMat);
    white.position.z = 0.12;
    g.add(white);
    var pupil = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyePupilMat);
    pupil.position.z = 0.22;
    g.add(pupil);
    var glint = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.6 }));
    glint.position.set(0.04, 0.05, 0.26);
    g.add(glint);
    g.position.set(x, 0.5, z);
    return g;
  }
  var leftEye = makeEye(-0.55, 0.35);
  var rightEye = makeEye(0.55, 0.35);
  heroGroup.add(leftEye);
  heroGroup.add(rightEye);

  /* ── Brows & Smile ── */
  var browMat = new THREE.MeshPhongMaterial({ color: 0x551155 });
  var lbrow = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.05, 0.06), browMat);
  lbrow.position.set(-0.55, 0.78, 0.4);
  lbrow.rotation.z = -0.15;
  heroGroup.add(lbrow);
  var rbrow = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.05, 0.06), browMat);
  rbrow.position.set(0.55, 0.78, 0.4);
  rbrow.rotation.z = 0.15;
  heroGroup.add(rbrow);

  var smile = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 6, 8, Math.PI), new THREE.MeshPhongMaterial({ color: 0xcc3366 }));
  smile.position.set(0, 0.25, 0.6);
  smile.rotation.x = Math.PI;
  heroGroup.add(smile);

  /* ── Rosy Cheeks ── */
  var cheekMat = new THREE.MeshPhongMaterial({ color: 0xff88aa, emissive: 0xcc5577, emissiveIntensity: 0.3, transparent: true, opacity: 0.5 });
  var lcheek = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), cheekMat);
  lcheek.position.set(-0.6, 0.3, 0.42);
  lcheek.scale.set(1, 0.6, 0.5);
  heroGroup.add(lcheek);
  var rcheek = lcheek.clone();
  rcheek.position.set(0.6, 0.3, 0.42);
  heroGroup.add(rcheek);

  /* ── Purple Cape ── */
  var capePts = [];
  for (var ci = 0; ci <= 12; ci++) {
    var t = ci / 12;
    capePts.push(new THREE.Vector3(Math.sin(t * 0.7) * 0.5, 0.6 - t * 2.8, -0.6 + Math.sin(t * 1.8) * 0.2));
  }
  var cape = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(capePts), 20, 0.55, 8, false), capeMat);
  cape.position.set(0, 0.3, -0.6);
  cape.scale.set(1, 1, 0.22);
  heroGroup.add(cape);

  /* ── Arms ── */
  var armMat = tubeMat.clone();
  var handMat = new THREE.MeshPhongMaterial({ color: 0xdd55ff, specular: 0xffffff, shininess: 80 });
  function makeArm(rz, px, py) {
    var g = new THREE.Group();
    g.add((function () { var m = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.45, 8), armMat); m.position.y = 0.225; return m; })());
    var hand = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), handMat);
    hand.position.y = 0.5;
    g.add(hand);
    g.position.set(px, py, 0.2);
    g.rotation.z = rz;
    return g;
  }
  var leftArm = makeArm(1.2, -0.8, 0.1);
  heroGroup.add(leftArm);
  var rightArm = makeArm(-0.3, 0.8, -0.1);
  heroGroup.add(rightArm);

  /* ── Legs ── */
  var legMat = new THREE.MeshPhongMaterial({ color: 0x9933cc, specular: 0xffffff, shininess: 50 });
  var shoeMat = new THREE.MeshPhongMaterial({ color: 0x7722aa, specular: 0xffffff, shininess: 80 });
  var ll = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.5, 8), legMat);
  ll.position.set(-0.2, -1.9, 0);
  heroGroup.add(ll);
  var rl = ll.clone();
  rl.position.set(0.2, -1.9, 0);
  heroGroup.add(rl);
  var ls = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.22), shoeMat);
  ls.position.set(-0.2, -2.22, 0.05);
  heroGroup.add(ls);
  var rs = ls.clone();
  rs.position.set(0.2, -2.22, 0.05);
  heroGroup.add(rs);

  /* ── Wand Star ── */
  var wandStar = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.1, 0),
    new THREE.MeshPhongMaterial({ color: 0xffee44, emissive: 0xccaa00, emissiveIntensity: 0.6, specular: 0xffffff, shininess: 150 })
  );
  wandStar.position.set(1.15, 0.2, 0.2);
  heroGroup.add(wandStar);

  heroGroup.position.set(0, -0.3, 0);
  scene.add(heroGroup);

  /* ── Magical Sparkle Particles ── */
  var sparkCount = 40;
  var sparkPositions = new Float32Array(sparkCount * 3);
  var sparkData = [];
  for (var ski = 0; ski < sparkCount; ski++) {
    var sa = Math.random() * Math.PI * 2;
    var sr = 1.5 + Math.random() * 2.5;
    sparkPositions[ski * 3] = Math.cos(sa) * sr;
    sparkPositions[ski * 3 + 1] = (Math.random() - 0.5) * 4;
    sparkPositions[ski * 3 + 2] = Math.sin(sa) * sr;
    sparkData.push({ angle: sa, radius: sr, speed: 0.3 + Math.random() * 1.5, ySpeed: 0.2 + Math.random() * 0.8 });
  }
  var sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));
  var sparkMat2 = new THREE.PointsMaterial({ color: 0xeebbff, size: 0.12, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending });
  scene.add(new THREE.Points(sparkGeo, sparkMat2));

  // Glow particles
  var glowCount = 12;
  var glowPositions = new Float32Array(glowCount * 3);
  var glowData = [];
  for (var gi = 0; gi < glowCount; gi++) {
    glowPositions[gi * 3] = (Math.random() - 0.5) * 5;
    glowPositions[gi * 3 + 1] = (Math.random() - 0.5) * 4;
    glowPositions[gi * 3 + 2] = (Math.random() - 0.5) * 3;
    glowData.push({ ySpeed: 0.3 + Math.random() * 0.6, xDrift: (Math.random() - 0.5) * 0.3, phase: Math.random() * Math.PI * 2 });
  }
  var glowGeo = new THREE.BufferGeometry();
  glowGeo.setAttribute("position", new THREE.BufferAttribute(glowPositions, 3));
  var glowMat = new THREE.PointsMaterial({ color: 0xff88ff, size: 0.25, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending });
  scene.add(new THREE.Points(glowGeo, glowMat));

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
    heroGroup.rotation.x += (mouseY * 0.2 - heroGroup.rotation.x) * 0.06;
    heroGroup.position.y = -0.3 + Math.sin(t * 2) * 0.18;
    heroGroup.rotation.z = Math.sin(t * 1.5) * 0.05;

    tubeMat.emissiveIntensity = 0.2 + Math.sin(t * 3) * 0.1;

    pasteGroup.rotation.z = Math.sin(t * 4) * 0.08;
    pasteGroup.rotation.x = Math.cos(t * 3) * 0.06;
    pasteMesh.scale.x = 1 + Math.sin(t * 5) * 0.05;
    pasteMesh.scale.z = 1 + Math.cos(t * 5) * 0.05;

    cap.rotation.y = t * 1.5;
    wandStar.rotation.y = t * 2;
    wandStar.rotation.x = t * 1.5;
    var wsc = 1 + Math.sin(t * 6) * 0.15;
    wandStar.scale.set(wsc, wsc, wsc);

    cape.rotation.y = Math.sin(t * 3) * 0.15;
    cape.scale.x = 1 + Math.sin(t * 2.5) * 0.08;
    leftArm.rotation.z = 1.2 + Math.sin(t * 2) * 0.2;
    leftArm.rotation.x = Math.sin(t * 3 + 1) * 0.15;
    rightArm.rotation.z = -0.3 + Math.sin(t * 2.5 + 0.5) * 0.15;

    // Eye tracking
    leftEye.children[2].position.x = mouseX * 0.04;
    leftEye.children[2].position.y = mouseY * 0.04;
    rightEye.children[2].position.x = mouseX * 0.04;
    rightEye.children[2].position.y = mouseY * 0.04;

    stripeMat.emissiveIntensity = 0.3 + Math.sin(t * 4) * 0.15;
    stripeMat2.emissiveIntensity = 0.25 + Math.cos(t * 4) * 0.15;

    // Sparkles spiral
    var sp = sparkGeo.attributes.position.array;
    for (var ski2 = 0; ski2 < sparkCount; ski2++) {
      var sd = sparkData[ski2];
      sd.angle += sd.speed * 0.02;
      sp[ski2 * 3] = Math.cos(sd.angle) * sd.radius;
      sp[ski2 * 3 + 1] += sd.ySpeed * 0.012;
      sp[ski2 * 3 + 2] = Math.sin(sd.angle) * sd.radius;
      if (sp[ski2 * 3 + 1] > 3.5) { sp[ski2 * 3 + 1] = -3.5; sd.angle = Math.random() * Math.PI * 2; sd.radius = 1.5 + Math.random() * 2.5; }
    }
    sparkGeo.attributes.position.needsUpdate = true;
    sparkMat2.opacity = 0.4 + Math.sin(t * 3) * 0.35;

    // Glows drift
    var gp = glowGeo.attributes.position.array;
    for (var gi2 = 0; gi2 < glowCount; gi2++) {
      var gd = glowData[gi2];
      gp[gi2 * 3 + 1] += gd.ySpeed * 0.008;
      gp[gi2 * 3] += Math.sin(t * 2 + gd.phase) * gd.xDrift * 0.01;
      if (gp[gi2 * 3 + 1] > 3) gp[gi2 * 3 + 1] = -3;
    }
    glowGeo.attributes.position.needsUpdate = true;
    glowMat.opacity = 0.3 + Math.sin(t * 2) * 0.2;
    magicLight.intensity = 0.3 + Math.sin(t * 4) * 0.15;

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
