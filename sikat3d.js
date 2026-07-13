/**
 * Kapten Sikat - Toothbrush 3D Hero
 * Kid-friendly toothbrush superhero with colorful handle, bristle head, cape, star emblem, hovering animation.
 * Self-contained IIFE, Three.js r128, transparent bg, IntersectionObserver, mouse-following.
 */
(function () {
  const CONTAINER_ID = 'sikat3d';
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
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(3, 5, 4);
  scene.add(dir);
  const point = new THREE.PointLight(0xffd700, 0.5, 10);
  point.position.set(-2, 3, 2);
  scene.add(point);

  // --- Hero group ---
  const hero = new THREE.Group();

  // Handle - colorful toothbrush handle (cylinder with gradient-like colors)
  const handleGeo = new THREE.CylinderGeometry(0.22, 0.18, 2.8, 16);
  const handleMat = new THREE.MeshPhongMaterial({
    color: 0x2196f3,
    shininess: 80,
    specular: 0x88ccff
  });
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.position.y = -0.3;
  hero.add(handle);

  // Handle grip stripes
  const stripeColors = [0xff5722, 0xffeb3b, 0x4caf50, 0xff5722, 0xffeb3b];
  stripeColors.forEach((col, i) => {
    const stripeGeo = new THREE.TorusGeometry(0.21, 0.025, 8, 16);
    const stripeMat = new THREE.MeshPhongMaterial({ color: col, shininess: 60 });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.y = -0.3 + (i - 2) * 0.4;
    stripe.rotation.x = Math.PI / 2;
    hero.add(stripe);
  });

  // Bristle head (rounded rectangle-ish)
  const bristleGeo = new THREE.BoxGeometry(0.6, 0.8, 0.35, 2, 2, 2);
  const bristleMat = new THREE.MeshPhongMaterial({ color: 0xf5f5f5, shininess: 30 });
  const bristleHead = new THREE.Mesh(bristleGeo, bristleMat);
  bristleHead.position.y = 1.65;
  hero.add(bristleHead);

  // Individual bristle tufts (colorful)
  const bristleTufts = [];
  const tuftColors = [0x42a5f5, 0xef5350, 0x66bb6a, 0xffee58, 0x42a5f5, 0xef5350, 0x66bb6a, 0xffee58,
    0x42a5f5, 0xef5350, 0x66bb6a, 0xffee58, 0x42a5f5, 0xef5350, 0x66bb6a, 0xffee58];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const tuftGeo = new THREE.CylinderGeometry(0.03, 0.02, 0.25, 6);
      const tuftMat = new THREE.MeshPhongMaterial({ color: tuftColors[row * 4 + col] });
      const tuft = new THREE.Mesh(tuftGeo, tuftMat);
      tuft.position.set(-0.15 + col * 0.1, 1.65 + 0.35, -0.1 + row * 0.07);
      hero.add(tuft);
      bristleTufts.push(tuft);
    }
  }

  // Star emblem on handle
  const starShape = new THREE.Shape();
  const outerR = 0.15, innerR = 0.06, points = 5;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    if (i === 0) starShape.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
    else starShape.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
  }
  starShape.closePath();
  const starGeo = new THREE.ExtrudeGeometry(starShape, { depth: 0.05, bevelEnabled: false });
  const starMat = new THREE.MeshPhongMaterial({ color: 0xffd700, emissive: 0x996600, shininess: 100 });
  const star = new THREE.Mesh(starGeo, starMat);
  star.position.set(0, 0, 0.23);
  hero.add(star);

  // Cape (flowing behind)
  const capeGeo = new THREE.PlaneGeometry(0.8, 1.2, 8, 8);
  const capeMat = new THREE.MeshPhongMaterial({
    color: 0xe53935,
    side: THREE.DoubleSide,
    shininess: 40,
    transparent: true,
    opacity: 0.9
  });
  const cape = new THREE.Mesh(capeGeo, capeMat);
  cape.position.set(0, 0.2, -0.35);
  cape.rotation.x = 0.15;
  hero.add(cape);
  const capeOriginalPositions = capeGeo.attributes.position.array.slice();

  // Eyes (on bristle head)
  const eyeGeo = new THREE.SphereGeometry(0.07, 12, 12);
  const eyeMat = new THREE.MeshPhongMaterial({ color: 0x212121 });
  const eyeWhiteGeo = new THREE.SphereGeometry(0.1, 12, 12);
  const eyeWhiteMat = new THREE.MeshPhongMaterial({ color: 0xffffff });

  [-1, 1].forEach(side => {
    const eyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    eyeWhite.position.set(side * 0.14, 1.75, 0.2);
    hero.add(eyeWhite);
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(side * 0.14, 1.77, 0.26);
    hero.add(eye);
  });

  // Smile
  const smileGeo = new THREE.TorusGeometry(0.1, 0.025, 8, 12, Math.PI);
  const smileMat = new THREE.MeshPhongMaterial({ color: 0xff5722 });
  const smile = new THREE.Mesh(smileGeo, smileMat);
  smile.position.set(0, 1.62, 0.24);
  smile.rotation.z = Math.PI;
  hero.add(smile);

  // Tiny arms (simple cylinders)
  [-1, 1].forEach(side => {
    const armGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.6, 8);
    const armMat = new THREE.MeshPhongMaterial({ color: 0x2196f3 });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.set(side * 0.38, 0.3, 0);
    arm.rotation.z = side * 0.6;
    hero.add(arm);
    // Fist
    const fistGeo = new THREE.SphereGeometry(0.07, 8, 8);
    const fist = new THREE.Mesh(fistGeo, new THREE.MeshPhongMaterial({ color: 0xfce4ec }));
    fist.position.set(side * 0.6, 0.55, 0);
    hero.add(fist);
  });

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
    hero.position.y = 0.2 + Math.sin(time * 2) * 0.2;

    // Gentle rotation
    hero.rotation.y += (mouseX * 0.5 - hero.rotation.y) * 0.05;
    hero.rotation.x += (mouseY * 0.3 - hero.rotation.x) * 0.05;

    // Cape wave
    const cPos = cape.geometry.attributes.position;
    for (let i = 0; i < cPos.count; i++) {
      const ox = capeOriginalPositions[i * 3];
      const oy = capeOriginalPositions[i * 3 + 1];
      cPos.setZ(i, Math.sin(time * 3 + ox * 5 + oy * 3) * 0.08);
    }
    cPos.needsUpdate = true;

    // Bristle sparkle
    bristleTufts.forEach((t, i) => {
      t.scale.y = 1 + Math.sin(time * 4 + i * 0.5) * 0.15;
    });

    // Star glow pulse
    star.material.emissiveIntensity = 0.5 + Math.sin(time * 3) * 0.3;

    renderer.render(scene, camera);
  }

  // --- IntersectionObserver for visibility ---
  const obs = new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
  }, { threshold: 0.1 });
  obs.observe(container);

  animate();
})();
