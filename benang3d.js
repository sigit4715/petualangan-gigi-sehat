/**
 * Sersan Benang - Floss 3D Hero
 * Kid-friendly floss superhero rope with floss strands, cape, determined face.
 * Self-contained IIFE, Three.js r128, transparent bg, IntersectionObserver, mouse-following.
 */
(function () {
  const CONTAINER_ID = 'benang3d';
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
  const point = new THREE.PointLight(0x64b5f6, 0.5, 10);
  point.position.set(-2, 2, 3);
  scene.add(point);

  const hero = new THREE.Group();

  // === Floss container (the body) - a stylized rounded box ===
  const bodyGeo = new THREE.CylinderGeometry(0.5, 0.45, 1.8, 16);
  const bodyMat = new THREE.MeshPhongMaterial({
    color: 0x81d4fa,
    shininess: 80,
    specular: 0xaaddff
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0;
  hero.add(body);

  // Container cap (top)
  const capGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.2, 16);
  const capMat = new THREE.MeshPhongMaterial({ color: 0x1565c0, shininess: 100 });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = 1.0;
  hero.add(cap);

  // Container bottom
  const botGeo = new THREE.CylinderGeometry(0.47, 0.5, 0.15, 16);
  const bot = new THREE.Mesh(botGeo, capMat);
  bot.position.y = -0.95;
  hero.add(bot);

  // Floss strands coming out from top (multiple curved lines)
  const flossGroup = new THREE.Group();
  flossGroup.position.y = 1.2;
  hero.add(flossGroup);

  const strandCurves = [];
  const strandColors = [0xf8f8f8, 0xe0f7fa, 0xfff9c4, 0xf3e5f5, 0xe8f5e9];
  for (let s = 0; s < 5; s++) {
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const x = Math.sin(t * Math.PI * 2 + s) * (0.3 + s * 0.08);
      const y = t * 1.2;
      const z = Math.cos(t * Math.PI * 2 + s) * 0.15;
      pts.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    strandCurves.push(curve);
    const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.015, 6, false);
    const tubeMat = new THREE.MeshPhongMaterial({
      color: strandColors[s],
      shininess: 60,
      transparent: true,
      opacity: 0.85
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    flossGroup.add(tube);
  }

  // === Face - determined expression ===
  // Eyes (angry-determined)
  [-1, 1].forEach(side => {
    const eyeWhiteGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const eyeWhiteMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const eyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    eyeWhite.position.set(side * 0.18, 0.3, 0.45);
    hero.add(eyeWhite);

    // Pupil
    const pupilGeo = new THREE.SphereGeometry(0.06, 10, 10);
    const pupilMat = new THREE.MeshPhongMaterial({ color: 0x1a237e });
    const pupil = new THREE.Mesh(pupilGeo, pupilMat);
    pupil.position.set(side * 0.18, 0.33, 0.53);
    hero.add(pupil);

    // Eyebrow (determined angle)
    const browGeo = new THREE.BoxGeometry(0.15, 0.03, 0.03);
    const browMat = new THREE.MeshPhongMaterial({ color: 0x1a237e });
    const brow = new THREE.Mesh(browGeo, browMat);
    brow.position.set(side * 0.18, 0.48, 0.48);
    brow.rotation.z = side * 0.3; // angled down toward center
    hero.add(brow);
  });

  // Determined mouth (firm line)
  const mouthGeo = new THREE.BoxGeometry(0.2, 0.03, 0.03);
  const mouthMat = new THREE.MeshPhongMaterial({ color: 0x4a148c });
  const mouth = new THREE.Mesh(mouthGeo, mouthMat);
  mouth.position.set(0, 0.1, 0.5);
  hero.add(mouth);

  // === Cape ===
  const capeGeo = new THREE.PlaneGeometry(0.9, 1.4, 10, 10);
  const capeMat = new THREE.MeshPhongMaterial({
    color: 0x0d47a1,
    side: THREE.DoubleSide,
    shininess: 40,
    transparent: true,
    opacity: 0.85
  });
  const cape = new THREE.Mesh(capeGeo, capeMat);
  cape.position.set(0, 0.1, -0.5);
  cape.rotation.x = 0.1;
  hero.add(cape);
  const capeOrigPos = capeGeo.attributes.position.array.slice();

  // === Arms with fists ===
  [-1, 1].forEach(side => {
    const armGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.7, 8);
    const armMat = new THREE.MeshPhongMaterial({ color: 0x81d4fa });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.set(side * 0.55, 0.1, 0);
    arm.rotation.z = side * 0.8;
    hero.add(arm);

    const fistGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const fistMat = new THREE.MeshPhongMaterial({ color: 0xf3e5f5 });
    const fist = new THREE.Mesh(fistGeo, fistMat);
    fist.position.set(side * 0.85, 0.45, 0);
    hero.add(fist);
  });

  // === Legs ===
  [-1, 1].forEach(side => {
    const legGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.5, 8);
    const legMat = new THREE.MeshPhongMaterial({ color: 0x1565c0 });
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(side * 0.2, -1.25, 0);
    hero.add(leg);

    const bootGeo = new THREE.BoxGeometry(0.14, 0.1, 0.18);
    const bootMat = new THREE.MeshPhongMaterial({ color: 0x0d47a1 });
    const boot = new THREE.Mesh(bootGeo, bootMat);
    boot.position.set(side * 0.2, -1.55, 0.03);
    hero.add(boot);
  });

  // Belt with emblem
  const beltGeo = new THREE.TorusGeometry(0.48, 0.04, 8, 16);
  const beltMat = new THREE.MeshPhongMaterial({ color: 0xffd700, shininess: 100 });
  const belt = new THREE.Mesh(beltGeo, beltMat);
  belt.position.y = -0.3;
  belt.rotation.x = Math.PI / 2;
  hero.add(belt);

  // Belt emblem (diamond shape)
  const emblemShape = new THREE.Shape();
  emblemShape.moveTo(0, 0.12);
  emblemShape.lineTo(0.08, 0);
  emblemShape.lineTo(0, -0.12);
  emblemShape.lineTo(-0.08, 0);
  emblemShape.closePath();
  const emblemGeo = new THREE.ExtrudeGeometry(emblemShape, { depth: 0.04, bevelEnabled: false });
  const emblemMat = new THREE.MeshPhongMaterial({ color: 0x00e5ff, emissive: 0x006064, shininess: 100 });
  const emblem = new THREE.Mesh(emblemGeo, emblemMat);
  emblem.position.set(0, -0.3, 0.5);
  hero.add(emblem);

  hero.position.y = 0.3;
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

    // Hovering bob
    hero.position.y = 0.3 + Math.sin(time * 1.8) * 0.15;

    // Mouse-following rotation
    hero.rotation.y += (mouseX * 0.6 - hero.rotation.y) * 0.05;
    hero.rotation.x += (mouseY * 0.3 - hero.rotation.x) * 0.05;

    // Cape wave
    const cPos = cape.geometry.attributes.position;
    for (let i = 0; i < cPos.count; i++) {
      const ox = capeOrigPos[i * 3];
      const oy = capeOrigPos[i * 3 + 1];
      cPos.setZ(i, Math.sin(time * 2.5 + ox * 4 + oy * 2) * 0.1);
    }
    cPos.needsUpdate = true;

    // Floss strand animation
    flossGroup.children.forEach((tube, s) => {
      const geo = tube.geometry;
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const origX = pos.getX(i);
        pos.setX(i, origX + Math.sin(time * 3 + i * 0.2 + s) * 0.002);
        pos.setZ(i, pos.getZ(i) + Math.cos(time * 2.5 + i * 0.15 + s) * 0.002);
      }
      pos.needsUpdate = true;
    });

    // Emblem glow
    emblem.material.emissiveIntensity = 0.5 + Math.sin(time * 2.5) * 0.3;

    renderer.render(scene, camera);
  }

  const obs = new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
  }, { threshold: 0.1 });
  obs.observe(container);

  animate();
})();
