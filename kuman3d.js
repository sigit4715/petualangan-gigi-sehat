/**
 * Kuman3D — 3-D sugar-germ characters for a kids dental-health site.
 * Self-contained IIFE · Three.js r128 (CDN) · procedural geometry only.
 *
 * Usage:  <div id="kuman3d"></div>
 *         <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"></script>
 *         <script src="kuman3d.js"></script>
 *
 * Auto-creates a 320 x 240 transparent canvas inside the target container,
 * renders 3-5 cute wobbling germs, follows the mouse cursor, and pauses when
 * scrolled out of view (IntersectionObserver).
 */
;(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /*  Constants                                                          */
  /* ------------------------------------------------------------------ */
  var W = 320, H = 240;
  var CONTAINER_ID = 'kuman3d';
  var GERMS_MIN = 3, GERMS_MAX = 5;
  var PI2 = Math.PI * 2;

  /* ------------------------------------------------------------------ */
  /*  Ensure Three.js r128 is available; load it on demand              */
  /* ------------------------------------------------------------------ */
  function ensureThree(cb) {
    if (window.THREE && window.THREE.REVISION) { cb(); return; }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js';
    s.onload = cb;
    (document.head || document.documentElement).appendChild(s);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { ensureThree(init); });
  } else {
    ensureThree(init);
  }

  /* ================================================================== */
  /*  MAIN                                                              */
  /* ================================================================== */
  function init() {
    var THREE = window.THREE;
    if (!THREE) return;

    var container = document.getElementById(CONTAINER_ID);
    if (!container) return;

    /* --- Renderer --------------------------------------------------- */
    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    /* --- Scene & Camera --------------------------------------------- */
    var scene  = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 100);
    camera.position.set(0, 0, 10);

    /* --- Lights ----------------------------------------------------- */
    scene.add(new THREE.AmbientLight(0xffffff, 0.65));

    var keyLight = new THREE.DirectionalLight(0xfff5d0, 0.8);
    keyLight.position.set(4, 6, 8);
    scene.add(keyLight);

    var rimLight = new THREE.PointLight(0x88ffaa, 0.45, 30);
    rimLight.position.set(-5, 3, -2);
    scene.add(rimLight);

    /* --- Mouse tracking (normalized -1..1) -------------------------- */
    var mouseNorm = { x: 0, y: 0 };
    renderer.domElement.addEventListener('mousemove', function (e) {
      var rect = renderer.domElement.getBoundingClientRect();
      mouseNorm.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNorm.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    });
    // reset gaze when the pointer leaves
    renderer.domElement.addEventListener('mouseleave', function () {
      mouseNorm.x = 0; mouseNorm.y = 0;
    });

    /* ================================================================ */
    /*  GERM FACTORY                                                    */
    /* ================================================================ */

    function createGerm() {
      var group = new THREE.Group();

      /* --- colour palette: green -> yellow-green -------------------- */
      var hue = 0.22 + Math.random() * 0.12;
      var bodyColor  = new THREE.Color().setHSL(hue, 0.55, 0.48);
      var bumpColor  = new THREE.Color().setHSL(hue + 0.04, 0.65, 0.55);
      var crystalCol = new THREE.Color().setHSL(0.14, 0.9, 0.72); // sugar gold

      /* --- body: squashed noisy sphere (blob) ---------------------- */
      var bodyGeo = new THREE.SphereGeometry(0.62, 24, 18);
      var pos = bodyGeo.attributes.position;
      var v = new THREE.Vector3();
      for (var i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        v.y *= 0.72; // squash
        var wobble = 1 + 0.08 * Math.sin(v.x * 5.7) * Math.cos(v.z * 4.3);
        v.x *= wobble;
        v.z *= wobble;
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      bodyGeo.computeVertexNormals();

      var bodyMat = new THREE.MeshPhongMaterial({
        color: bodyColor, shininess: 60, specular: 0x333322
      });
      var bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      group.add(bodyMesh);

      /* --- bumps stuck on the surface ------------------------------ */
      var numBumps = 6 + Math.floor(Math.random() * 5);
      var bumpMat = new THREE.MeshPhongMaterial({
        color: bumpColor, shininess: 40, specular: 0x222211
      });
      for (var b = 0; b < numBumps; b++) {
        var theta = Math.random() * PI2;
        var phi   = (0.25 + Math.random() * 0.5) * Math.PI;
        var r     = 0.60;
        var bumpGeo = new THREE.SphereGeometry(0.06 + Math.random() * 0.08, 8, 6);
        var bump = new THREE.Mesh(bumpGeo, bumpMat);
        bump.position.set(
          r * Math.sin(phi) * Math.cos(theta),
          r * 0.72 * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta)
        );
        group.add(bump);
      }

      /* --- googly eyes (pupils track the mouse) -------------------- */
      var pupils = [];
      for (var e = -1; e <= 1; e += 2) {
        var whiteMat = new THREE.MeshPhongMaterial({
          color: 0xffffff, shininess: 120, specular: 0xffffff
        });
        var white = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), whiteMat);
        white.position.set(e * 0.20, 0.18, 0.52);
        group.add(white);

        var pupilMat = new THREE.MeshPhongMaterial({
          color: 0x111111, shininess: 200, specular: 0xffffff
        });
        var pupil = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), pupilMat);
        // base position sits just in front of the white of the eye
        pupil.userData.base = new THREE.Vector3(e * 0.20, 0.18, 0.61);
        pupil.position.copy(pupil.userData.base);
        group.add(pupil);
        pupils.push(pupil);
      }
      group.userData.pupils = pupils;

      /* --- tiny arms ----------------------------------------------- */
      var armMat = new THREE.MeshPhongMaterial({
        color: bodyColor, shininess: 40, specular: 0x222211
      });
      var arms = [];
      for (var a = -1; a <= 1; a += 2) {
        var armGroup = new THREE.Group();
        // upper segment (Capsule if available, else Cylinder)
        var segGeo = THREE.CapsuleGeometry
          ? new THREE.CapsuleGeometry(0.04, 0.2, 4, 6)
          : (function () {
              var g = new THREE.CylinderGeometry(0.04, 0.035, 0.24, 6);
              return g;
            })();
        var seg = new THREE.Mesh(segGeo, armMat);
        seg.position.y = -0.12;
        armGroup.add(seg);

        var hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), armMat);
        hand.position.y = -0.24;
        armGroup.add(hand);

        armGroup.position.set(a * 0.52, -0.05, 0.15);
        armGroup.rotation.z = a * 0.6;
        group.add(armGroup);
        arms.push(armGroup);
      }
      group.userData.arms = arms;

      /* --- tiny legs ----------------------------------------------- */
      for (var l = -1; l <= 1; l += 2) {
        var leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.035, 0.03, 0.16, 6), armMat);
        leg.position.set(l * 0.18, -0.55, 0.1);
        group.add(leg);
      }

      /* --- sugar crystals (octahedra) ------------------------------ */
      var crystalMat = new THREE.MeshPhongMaterial({
        color: crystalCol, transparent: true, opacity: 0.82,
        shininess: 140, specular: 0xffffff
      });
      var numCrystals = 2 + Math.floor(Math.random() * 3);
      for (var c = 0; c < numCrystals; c++) {
        var ct = Math.random() * PI2;
        var cp = (0.3 + Math.random() * 0.4) * Math.PI;
        var cr = 0.60;
        var crystal = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.05 + Math.random() * 0.04, 0), crystalMat);
        crystal.position.set(
          cr * Math.sin(cp) * Math.cos(ct),
          cr * 0.72 * Math.cos(cp),
          cr * Math.sin(cp) * Math.sin(ct)
        );
        crystal.rotation.set(Math.random() * PI2, Math.random() * PI2, Math.random() * PI2);
        group.add(crystal);
      }

      /* --- cute little smile (half torus) -------------------------- */
      var mouth = new THREE.Mesh(
        new THREE.TorusGeometry(0.07, 0.014, 6, 12, Math.PI),
        new THREE.MeshPhongMaterial({ color: 0x442222 }));
      mouth.position.set(0, -0.02, 0.60);
      mouth.rotation.z = Math.PI; // smile curves upward
      group.add(mouth);

      /* --- per-germ animation metadata ----------------------------- */
      group.userData.wobblePhaseX = Math.random() * PI2;
      group.userData.wobblePhaseY = Math.random() * PI2;
      group.userData.wobbleSpeed  = 0.6 + Math.random() * 0.6;
      group.userData.rotSpeed     = 0.15 + Math.random() * 0.25;
      group.userData.floatAmp     = 0.15 + Math.random() * 0.1;
      group.userData.floatSpeed   = 0.8 + Math.random() * 0.6;
      group.userData.floatPhase   = Math.random() * PI2;
      group.userData.armPhase     = Math.random() * PI2;

      return group;
    }

    /* ================================================================ */
    /*  BUILD THE SCENE                                                 */
    /* ================================================================ */
    var numGerms = GERMS_MIN + Math.floor(Math.random() * (GERMS_MAX - GERMS_MIN + 1));
    var germs = [];

    for (var g = 0; g < numGerms; g++) {
      var germ = createGerm();
      var baseX = (Math.random() - 0.5) * 5;
      var baseY = (Math.random() - 0.5) * 2.8;
      var baseZ = (Math.random() - 0.5) * 2;
      germ.position.set(baseX, baseY, baseZ);
      germ.userData.baseX = baseX;
      germ.userData.baseY = baseY;

      var s = 0.55 + Math.random() * 0.45; // size variety
      germ.scale.set(s, s, s);
      scene.add(germ);
      germs.push(germ);
    }

    /* ================================================================ */
    /*  ANIMATION LOOP                                                   */
    /* ================================================================ */
    var clock = new THREE.Clock();
    var running = false;
    var rafId = null;

    function animate() {
      if (!running) return;
      rafId = requestAnimationFrame(animate);

      var t = clock.getElapsedTime();

      /* --- camera gently follows the mouse -------------------------- */
      camera.position.x += (mouseNorm.x * 1.4 - camera.position.x) * 0.04;
      camera.position.y += (mouseNorm.y * 1.0 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      /* --- per-germ animation --------------------------------------- */
      for (var i = 0; i < germs.length; i++) {
        var gm = germs[i];
        var ud = gm.userData;

        // floating + horizontal wobble around the germ's home position
        gm.position.x = ud.baseX + 0.12 * Math.sin(t * ud.wobbleSpeed + ud.wobblePhaseX);
        gm.position.y = ud.baseY + ud.floatAmp * Math.sin(t * ud.floatSpeed + ud.floatPhase);

        // squishy rotation wobble
        gm.rotation.x = 0.15 * Math.sin(t * ud.wobbleSpeed * 0.7 + ud.wobblePhaseX);
        gm.rotation.z = 0.10 * Math.cos(t * ud.wobbleSpeed * 0.5 + ud.wobblePhaseY);
        gm.rotation.y += ud.rotSpeed * 0.005;

        // squash-and-stretch breathing
        var breathe = 1 + 0.05 * Math.sin(t * ud.floatSpeed * 1.5 + ud.floatPhase);
        gm.scale.y = gm.scale.x * breathe;

        // arm swing
        var arms = ud.arms;
        if (arms) {
          arms[0].rotation.x = 0.3 * Math.sin(t * 2.2 + ud.armPhase);
          arms[1].rotation.x = 0.3 * Math.sin(t * 2.2 + ud.armPhase + Math.PI);
          arms[0].rotation.z = -0.6 + 0.15 * Math.sin(t * 1.8 + ud.armPhase);
          arms[1].rotation.z =  0.6 - 0.15 * Math.sin(t * 1.8 + ud.armPhase);
        }

        // pupils track the mouse within the eye
        var pupils = ud.pupils;
        if (pupils) {
          for (var p = 0; p < pupils.length; p++) {
            var pu = pupils[p];
            var base = pu.userData.base;
            pu.position.x = base.x + mouseNorm.x * 0.04;
            pu.position.y = base.y + mouseNorm.y * 0.04;
          }
        }
      }

      renderer.render(scene, camera);
    }

    function start() {
      if (running) return;
      running = true;
      clock.getDelta(); // discard the paused gap so animation resumes smoothly
      animate();
    }

    function stop() {
      running = false;
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    }

    /* ================================================================ */
    /*  VISIBILITY (IntersectionObserver) — pause when off-screen       */
    /* ================================================================ */
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        for (var k = 0; k < entries.length; k++) {
          if (entries[k].isIntersecting) { start(); } else { stop(); }
        }
      }, { threshold: 0.1 });
      observer.observe(container);
    } else {
      start(); // graceful fallback
    }

    // render one initial frame so the germs are visible immediately
    renderer.render(scene, camera);
    start();
  }
})();
