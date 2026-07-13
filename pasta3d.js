/**
 * Pasta Ajaib - Toothpaste 3D Hero
 * Kid-friendly toothpaste tube superhero with sparkle paste, cape, magical particle effects.
 * Self-contained IIFE, Three.js r128, transparent bg, IntersectionObserver, mouse-following.
 */
(function () {
  const CONTAINER_ID = 'pasta3d';
  const W = 200, H = 200;
  const container = document.getElementById(CONTAINER_ID);
  if (!container) return;
  container.style.position = 'relative';
  container.style.width = W + 'px';
  container.style.height = H + 'px';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
  camera.position.set(0, 0.5, 6);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(3, 5, 4);
  scene.add(dir);
  const point = new THREE.PointLight(0xce93d8, 0.6, 10);
  point.position.set(-2, 3, 2);
  scene.add(point);
  const magicLight = new THREE.PointLight(0xff80ab, 0.4, 8);
  magicLight.position.set(1, 2, 2);
  scene.add(magicLight);

  const hero = new THREE.Group();

  // === Toothpaste tube body ===
  const tubeGeo = new THREE.CylinderGeometry(0.45, 0.35, 2.2, 16);
  const tubeMat = new THREE.MeshPhongMaterial({
    color: 0xe1bee7,
    shininess: 80,
    specular: 0xffccff
  });
  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  tube.position.y = -0.1;
  hero.add(tube);

  // Tube stripes (decorative bands)
  const bandColors = [0xce93d8, 0xf48fb1, 0x80cbc4, 0xf48fb1, 0xce93d8];
  bandColors.forEach((col, i) => {
    const bandGeo = new THREE.TorusGeometry(0.39, 0.02, 8, 16);
    const bandMat = new THREE.MeshPhongMaterial({ color: col, shininess: 60 });
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.position.y = -0.1 + (i - 2) * 0.35;
    band.rotation.x = Math.PI / 2;
    hero.add(band);
  });

  // Tube cap (top - wider part where paste comes out)
  const capGeo = new THREE.CylinderGeometry(0.48, 0.45, 0.25, 16);
  const capMat = new THREE.MeshPhongMaterial({ color: 0x7b1fa2, shininess: 100 });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = 1.1;
  hero.add(cap);

  // Cap tip
  const tipGeo = new THREE.ConeGeometry(0.15, 0.2, 12);
  const tipMat = new THREE.MeshPhongMaterial({ color: 0x9c27b0, shininess: 80 });
  const tip = new THREE.Mesh(tipGeo, tipMat);
  tip.position.y = 1.3;
  hero.add(tip);

  // Tube bottom (crimped end)
  const botGeo = new THREE.BoxGeometry(0.65, 0.15, 0.35);
  const botMat = new THREE.MeshPhongMaterial({ color: 0x7b1fa2, shininess: 80 });
  const bot = new THREE.Mesh(botGeo, botMat);
  bot.position.y = -1.25;
  hero.add(bot);

  // === Sparkle paste coming out ===
  const pasteGroup = new THREE.Group();
  pasteGroup.position.y = 1.4;
  hero.add(pasteGroup);

  // Paste blob
  const pasteGeo = new THREE.SphereGeometry(0.2, 12, 12);
  const pasteMat = new THREE.MeshPhongMaterial({
    color: 0xf3e5f5,
    shininess: 100,
    transparent: true,
    opacity: 0.9
  });
  const pasteBlob = new THREE.Mesh(pasteGeo, pasteMat);
  pasteBlob.scale.set(1, 0.7, 1);
  pasteBlob.position.y = 0.15;
  pasteGroup.add(pasteBlob);

  // Sparkle particles on paste
  const sparkles = [];
  const sparkleColors = [0xff80ab, 0x80deea, 0xfff176, 0xb39ddb, 0x80cbc4, 0xffab91, 0xa5d6a7];
  for (let i = 0; i < 12; i++) {
    const sGeo = new THREE.OctahedronGeometry(0.03 + Math.random() * 0.02, 0);
    const sMat = new THREE.MeshPhongMaterial({
      color: sparkleColors[i % sparkleColors.length],
      emissive: sparkleColors[i % sparkleColors.length],
      emissiveIntensity: 0.6,
      shininess: 100
    });
    const sparkle = new THREE.Mesh(sGeo, sMat);
    const angle = (i / 12) * Math.PI * 2;
    const radius = 0.15 + Math.random() * 0.15;
    sparkle.position.set(
      Math.cos(angle) * radius,
      0.15 + Math.random() * 0.2,
      Math.sin(angle) * radius
    );
    sparkle.userData = { angle: angle, radius: radius, speed: 1 + Math.random() * 2 };
    pasteGroup.add(sparkle);
    sparkles.push(sparkle);
  }

  // === Face ===
  // Eyes (magical/star-like)
  [-1, 1].forEach(side => {
    const eyeWhiteGeo = new THREE.SphereGeometry(0.11, 12, 12);
    const eyeWhiteMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const eyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    eyeWhite.position.set(side * 0.17, 0.4, 0.38);
    hero.add(eyeWhite);

    // Iris (colorful)
    const irisGeo = new THREE.SphereGeometry(0.065, 10, 10);
    const irisMat = new THREE.MeshPhongMaterial({
      color: 0x9c27b0,
      emissive: 0x4a148c,
      emissiveIntensity: 0.3
    });
    const iris = new THREE.Mesh(irisGeo, irisMat);
    iris.position.set(side * 0.17, 0.42, 0.45);
    hero.add(iris);

    // Sparkle in eye
    const sparkleEyeGeo = new THREE.SphereGeometry(0.02, 6, 6);
    const sparkleEyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sparkleEye = new THREE.Mesh(sparkleEyeGeo, sparkleEyeMat);
    sparkleEye.position.set(side * 0.15, 0.44, 0.49);
    hero.add(sparkleEye);
  });

  // Magical smile
  const smileGeo = new THREE.TorusGeometry(0.1, 0.025, 8, 12, Math.PI);
  const smileMat = new THREE.MeshPhongMaterial({ color: 0xf48fb1 });
  const smile = new THREE.Mesh(smileGeo, smileMat);
  smile.position.set(0, 0.22, 0.4);
  smile.rotation.z = Math.PI;
  hero.add(smile);

  // Cheek blush
  [-1, 1].forEach(side => {
    const blushGeo = new THREE.CircleGeometry(0.06, 12);
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xf8bbd0, transparent: true, opacity: 0.6 });
    const blush = new THREE.Mesh(blushGeo, blushMat);
    blush.position.set(side * 0.3, 0.28, 0.4);
    hero.add(blush);
  });

  // === Cape ===
  const capeGeo = new THREE.PlaneGeometry(0.9, 1.3, 10, 10);
  const capeMat = new THREE.MeshPhongMaterial({
    color: 0xab47bc,
    side: THREE.DoubleSide,
    shininess: 50,
    transparent: true,
    opacity: 0.85
  });
  const cape = new THREE.Mesh(capeGeo, capeMat);
  cape.position.set(0, 0, -0.4);
  cape.rotation.x = 0.12;
  hero.add(cape);
  const capeOrigPos = capeGeo.attributes.position.array.slice();

  // === Magic wand (held by arm) ===
  [-1, 1].forEach(side => {
    // Arm
    const armGeo = new THREE.CylinderGeometry(0.055, 0.045, 0.55, 8);
    const armMat = new THREE.MeshPhongMaterial({ color: 0xe1bee7 });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.set(side * 0.5, 0, 0);
    arm.rotation.z = side * 0.7;
    hero.add(arm);

    // Hand
    const handGeo = new THREE.SphereGeometry(0.07, 8, 8);
    const handMat = new THREE.MeshPhongMaterial({ color: 0xf3e5f5 });
    const hand = new THREE.Mesh(handGeo, handMat);
    hand.position.set(side * 0.78, 0.3, 0);
    hero.add(hand);
  });

  // === Magical floating particles around hero ===
  const magicParticles = new THREE.Group();
  hero.add(magicParticles);
  const particles = [];
  for (let i = 0; i < 20; i++) {
    const pGeo = new THREE.OctahedronGeometry(0.025 + Math.random() * 0.02, 0);
    const pMat = new THREE.MeshBasicMaterial({
      color: sparkleColors[i % sparkleColors.length],
      transparent: true,
      opacity: 0.8
    });
    const p = new THREE.Mesh(pGeo, pMat);
    p.userData = {
      angle: (i / 20) * Math.PI * 2,
      radius: 1 + Math.random() * 0.8,
      yOff: (Math.random() - 0.5) * 2,
      speed: 0.5 + Math.random() * 1.5,
      ySpeed: 0.3 + Math.random() * 0.5
    };
    magicParticles.add(p);
    particles.push(p);
  }

  // Belt with magic star
  const beltGeo = new THREE.TorusGeometry(0.4, 0.035, 8, 16);
  const beltMat = new THREE.MeshPhongMaterial({ color: 0xffd700, shininess: 100 });
  const belt = new THREE.Mesh(beltGeo, beltMat);
  belt.position.y = -0.3;
  belt.rotation.x = Math.PI / 2;
  hero.add(belt);

  // Star emblem
  const starShape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 0.12 : 0.05;
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    if (i === 0) starShape.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
    else starShape.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
  }
  starShape.closePath();
  const starGeo = new THREE.ExtrudeGeometry(starShape, { depth: 0.04, bevelEnabled: false });
  const starMat = new THREE.MeshPhongMaterial({
    color: 0xff80ab,
    emissive: 0x880e4f,
    emissiveIntensity: 0.5,
    shininess: 100
  });
  const star = new THREE.Mesh(starGeo, starMat);
  star.position.set(0, -0.3, 0.42);
  hero.add(star);

  hero.position.y = 0.2;
  scene.add(hero);

  // --- Mouse tracking ---
  let mouseX = 0, mouseY = 0;
  container.addEventListener('mousemove', function (e) {
    const rect = container.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
  });
  container.addEventListener('mouseleave', function () { mouseX = 0; mouseY = 0; });

  // --- Animation ---
  let visible = true;
  let time = 0;

  function animate() {
    requestAnimationFrame(animate);
    if (!visible) return;
    time += 0.016;

    // Hovering
    hero.position.y = 0.2 + Math.sin(time * 2.2) * 0.18;

    // Mouse-following
    hero.rotation.y += (mouseX * 0.55 - hero.rotation.y) * 0.05;
    hero.rotation.x += (mouseY * 0.3 - hero.rotation.x) * 0.05;

    // Cape wave
    const cPos = cape.geometry.attributes.position;
    for (let i = 0; i < cPos.count; i++) {
      const ox = capeOrigPos[i * 3];
      const oy = capeOrigPos[i * 3 + 1];
      cPos.setZ(i, Math.sin(time * 2.8 + ox * 5 + oy * 3) * 0.09);
    }
    cPos.needsUpdate = true;

    // Sparkle particles orbit on paste
    sparkles.forEach((s) => {
      const d = s.userData;
      d.angle += 0.03 * d.speed;
      s.position.x = Math.cos(d.angle) * d.radius;
      s.position.z = Math.sin(d.angle) * d.radius;
      s.position.y = 0.15 + Math.sin(time * d.speed + d.angle) * 0.15;
      s.rotation.x += 0.05;
      s.rotation.y += 0.08;
    });

    // Paste blob pulse
    pasteBlob.scale.x = 1 + Math.sin(time * 3) * 0.08;
    pasteBlob.scale.z = 1 + Math.cos(time * 3) * 0.08;

    // Magic particles float around hero
    particles.forEach((p) => {
      const d = p.userData;
      d.angle += 0.01 * d.speed;
      p.position.x = Math.cos(d.angle) * d.radius;
      p.position.z = Math.sin(d.angle) * d.radius;
      p.position.y = d.yOff + Math.sin(time * d.ySpeed) * 0.3;
      p.rotation.x += 0.03;
      p.rotation.y += 0.05;
      p.material.opacity = 0.5 + Math.sin(time * 2 + d.angle) * 0.3;
    });

    // Star glow
    star.material.emissiveIntensity = 0.4 + Math.sin(time * 3) * 0.3;

    // Magic light pulse
    magicLight.intensity = 0.3 + Math.sin(time * 2) * 0.2;

    renderer.render(scene, camera);
  }

  const obs = new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
  }, { threshold: 0.1 });
  obs.observe(container);

  animate();
})();
