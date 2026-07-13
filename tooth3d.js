// ═══════════════════════════════════════════════════════════
// 3D TOOTH — Three.js interactive hero
// ═══════════════════════════════════════════════════════════

(function(){
"use strict";

var container = document.getElementById('tooth3d');
if (!container) return;

// ── Scene Setup ──
var W = container.offsetWidth || 320;
var H = container.offsetHeight || 320;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
camera.position.set(0, 0.5, 5);

var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(W, H);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
container.appendChild(renderer.domElement);

// ── Lights ──
var ambLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambLight);

var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(3, 5, 4);
scene.add(dirLight);

var rimLight = new THREE.DirectionalLight(0xA78BFA, 0.4);
rimLight.position.set(-2, 3, -3);
scene.add(rimLight);

// ── Materials ──
var toothMat = new THREE.MeshPhongMaterial({
  color: 0xF8FAFC,
  specular: 0xFFFFFF,
  shininess: 80,
  emissive: 0x1a1a2e,
  emissiveIntensity: 0.05
});

var rootMat = new THREE.MeshPhongMaterial({
  color: 0xFDE68A,
  specular: 0xFFD700,
  shininess: 40
});

var eyeWhite = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, shininess: 100 });
var eyePupil = new THREE.MeshPhongMaterial({ color: 0x1E293B, shininess: 100 });
var eyeHighlight = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
var mouthMat = new THREE.MeshPhongMaterial({ color: 0xF87171, shininess: 60 });
var capeMat = new THREE.MeshPhongMaterial({ color: 0x6366F1, side: THREE.DoubleSide, shininess: 30 });

// ── Tooth Body (main) ──
var toothGroup = new THREE.Group();

// Crown - slightly tapered rounded shape
var crownGeo = new THREE.CylinderGeometry(0.75, 0.65, 1.4, 32, 8);
// Round the top
var crownPositions = crownGeo.attributes.position;
for (var i = 0; i < crownPositions.count; i++) {
  var y = crownPositions.getY(i);
  var ratio = (y + 0.7) / 1.4; // 0 at bottom, 1 at top
  if (ratio > 0.7) {
    var squeeze = 1 - (ratio - 0.7) * 0.6;
    crownPositions.setX(i, crownPositions.getX(i) * squeeze);
    crownPositions.setZ(i, crownPositions.getZ(i) * squeeze);
    // Round the top
    var topPush = Math.max(0, (ratio - 0.75) * 1.2);
    crownPositions.setY(i, crownPositions.getY(i) + topPush * 0.3);
  }
}
crownGeo.computeVertexNormals();
var crown = new THREE.Mesh(crownGeo, toothMat);
crown.position.y = 0.3;
toothGroup.add(crown);

// ── Roots (2) ──
var rootGeo = new THREE.CylinderGeometry(0.18, 0.08, 1.0, 12);
var rootL = new THREE.Mesh(rootGeo, rootMat);
rootL.position.set(-0.25, -0.7, 0);
rootL.rotation.z = 0.15;
toothGroup.add(rootL);

var rootR = new THREE.Mesh(rootGeo, rootMat);
rootR.position.set(0.25, -0.7, 0);
rootR.rotation.z = -0.15;
toothGroup.add(rootR);

// ── Eyes ──
var eyeGeo = new THREE.SphereGeometry(0.12, 16, 16);
var pupilGeo = new THREE.SphereGeometry(0.06, 12, 12);
var highlightGeo = new THREE.SphereGeometry(0.03, 8, 8);

// Left eye
var eyeLGroup = new THREE.Group();
var eyeLWhite = new THREE.Mesh(eyeGeo, eyeWhite);
var eyeLPupil = new THREE.Mesh(pupilGeo, eyePupil);
eyeLPupil.position.z = 0.08;
var eyeLHigh = new THREE.Mesh(highlightGeo, eyeHighlight);
eyeLHigh.position.set(0.03, 0.04, 0.11);
eyeLGroup.add(eyeLWhite, eyeLPupil, eyeLHigh);
eyeLGroup.position.set(-0.22, 0.45, 0.62);
toothGroup.add(eyeLGroup);

// Right eye
var eyeRGroup = new THREE.Group();
var eyeRWhite = new THREE.Mesh(eyeGeo, eyeWhite);
var eyeRPupil = new THREE.Mesh(pupilGeo, eyePupil);
eyeRPupil.position.z = 0.08;
var eyeRHigh = new THREE.Mesh(highlightGeo, eyeHighlight);
eyeRHigh.position.set(0.03, 0.04, 0.11);
eyeRGroup.add(eyeRWhite, eyeRPupil, eyeRHigh);
eyeRGroup.position.set(0.22, 0.45, 0.62);
toothGroup.add(eyeRGroup);

// ── Smile ──
var smileShape = new THREE.Shape();
smileShape.moveTo(-0.2, 0);
smileShape.quadraticCurveTo(0, -0.15, 0.2, 0);
var smilePoints = smileShape.getPoints(20);
var smileLineGeo = new THREE.BufferGeometry().setFromPoints(
  smilePoints.map(function(p) { return new THREE.Vector3(p.x, p.y, 0); })
);
var smileLine = new THREE.Line(smileLineGeo, new THREE.LineBasicMaterial({ color: 0x94A3B8, linewidth: 2 }));
smileLine.position.set(0, 0.2, 0.66);
toothGroup.add(smileLine);

// ── Cheek blush ──
var blushGeo = new THREE.SphereGeometry(0.08, 12, 12);
var blushMat = new THREE.MeshBasicMaterial({ color: 0xFECDD3, transparent: true, opacity: 0.6 });
var blushL = new THREE.Mesh(blushGeo, blushMat);
blushL.position.set(-0.4, 0.28, 0.55);
blushL.scale.set(1.2, 0.8, 0.5);
toothGroup.add(blushL);

var blushR = new THREE.Mesh(blushGeo, blushMat);
blushR.position.set(0.4, 0.28, 0.55);
blushR.scale.set(1.2, 0.8, 0.5);
toothGroup.add(blushR);

// ── Cape (hero!) ──
var capeGeo = new THREE.PlaneGeometry(1.2, 1.4, 8, 8);
var capePositions = capeGeo.attributes.position;
for (var i = 0; i < capePositions.count; i++) {
  var cx = capePositions.getX(i);
  var cy = capePositions.getY(i);
  // Curve the cape backward
  capePositions.setZ(i, -0.3 - Math.abs(cx) * 0.4 - Math.max(0, -cy) * 0.3);
}
capeGeo.computeVertexNormals();
var cape = new THREE.Mesh(capeGeo, capeMat);
cape.position.set(0, 0.3, -0.7);
cape.rotation.x = 0.2;
toothGroup.add(cape);

// ── Star on top ──
var starShape = new THREE.Shape();
var outerR = 0.12, innerR = 0.05, points = 5;
for (var i = 0; i < points * 2; i++) {
  var angle = (i * Math.PI / points) - Math.PI / 2;
  var r = i % 2 === 0 ? outerR : innerR;
  if (i === 0) starShape.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
  else starShape.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
}
starShape.closePath();
var starGeo = new THREE.ExtrudeGeometry(starShape, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01 });
var starMat = new THREE.MeshPhongMaterial({ color: 0xFDE68A, emissive: 0xF59E0B, emissiveIntensity: 0.3, shininess: 100 });
var star = new THREE.Mesh(starGeo, starMat);
star.position.set(0.15, 1.15, 0);
star.rotation.z = 0.3;
toothGroup.add(star);

// ── Floating particles ──
var particles = [];
var particleGeo = new THREE.SphereGeometry(0.04, 8, 8);
var particleColors = [0xFF6B9D, 0x4ECDC4, 0xFDE68A, 0xA78BFA, 0x60A5FA];
for (var i = 0; i < 20; i++) {
  var pMat = new THREE.MeshBasicMaterial({
    color: particleColors[i % particleColors.length],
    transparent: true,
    opacity: 0.6
  });
  var p = new THREE.Mesh(particleGeo, pMat);
  p.position.set(
    (Math.random() - 0.5) * 4,
    (Math.random() - 0.5) * 3,
    (Math.random() - 0.5) * 2
  );
  p.userData = {
    speed: 0.003 + Math.random() * 0.005,
    offset: Math.random() * Math.PI * 2,
    radius: 1.5 + Math.random() * 1.5
  };
  scene.add(p);
  particles.push(p);
}

// ── Position tooth group ──
toothGroup.position.y = 0.2;
scene.add(toothGroup);

// ── Mouse tracking ──
var mouseX = 0, mouseY = 0;
var targetRotX = 0, targetRotY = 0;

document.addEventListener('mousemove', function(e) {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

// ── Animation Loop ──
var clock = new THREE.Clock();
var running = true;

function animate() {
  if (!running) return;
  requestAnimationFrame(animate);

  var t = clock.getElapsedTime();

  // Gentle float
  toothGroup.position.y = 0.2 + Math.sin(t * 1.5) * 0.1;

  // Follow mouse (smooth)
  targetRotY = mouseX * 0.3;
  targetRotX = mouseY * 0.15;
  toothGroup.rotation.y += (targetRotY - toothGroup.rotation.y) * 0.05;
  toothGroup.rotation.x += (targetRotX - toothGroup.rotation.x) * 0.05;

  // Idle rotation
  toothGroup.rotation.y += 0.003;

  // Cape wave
  var capePos = cape.geometry.attributes.position;
  for (var i = 0; i < capePos.count; i++) {
    var cx = capePos.getX(i);
    var cy = capePos.getY(i);
    capePos.setZ(i, -0.3 - Math.abs(cx) * 0.4 - Math.max(0, -cy) * 0.3 + Math.sin(t * 3 + cx * 5) * 0.05);
  }
  capePos.needsUpdate = true;

  // Star sparkle
  star.rotation.z = 0.3 + Math.sin(t * 4) * 0.2;
  star.scale.setScalar(1 + Math.sin(t * 3) * 0.1);

  // Eyes blink (occasionally)
  var blinkCycle = t % 4;
  if (blinkCycle > 3.8) {
    eyeLGroup.scale.y = 0.1;
    eyeRGroup.scale.y = 0.1;
  } else {
    eyeLGroup.scale.y = 1;
    eyeRGroup.scale.y = 1;
  }

  // Particles orbit
  for (var i = 0; i < particles.length; i++) {
    var pp = particles[i];
    var ud = pp.userData;
    pp.position.x = Math.sin(t * ud.speed * 10 + ud.offset) * ud.radius;
    pp.position.y = Math.cos(t * ud.speed * 8 + ud.offset) * ud.radius * 0.6;
    pp.position.z = Math.sin(t * ud.speed * 6 + ud.offset * 2) * 0.5;
    pp.material.opacity = 0.3 + Math.sin(t * 2 + ud.offset) * 0.3;
  }

  renderer.render(scene, camera);
}

// ── Visibility optimization ──
var observer = new IntersectionObserver(function(entries) {
  running = entries[0].isIntersecting;
  if (running) animate();
}, { threshold: 0.1 });
observer.observe(container);

// ── Resize handler ──
function onResize() {
  var w = container.offsetWidth;
  var h = container.offsetHeight;
  if (w > 0 && h > 0) {
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
}
window.addEventListener('resize', onResize);

// Start
animate();

})();
