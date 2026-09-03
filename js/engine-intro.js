/* =========================================================================
   REVENUE ENGINE — cinematic WebGL intro.

   One persistent Three.js scene. Scroll drives a single progress value
   (0..1) which moves a camera along a continuous spline through five
   named compositions (Overview / Video / Websites / Systems / Full
   Build). Nothing about the visuals is a discrete state machine except
   the floating chapter copy, which snaps between five fixed windows of
   that same progress value.

   Vendored dependency: vendor/three/three.module.min.js (MIT, self-hosted
   per CSP script-src 'self' -- no CDN).

   Progressive enhancement: this file only takes over the page when
   prefers-reduced-motion is off AND a WebGL context is actually
   available. Otherwise css/engine-intro.css's default (static stacked
   chapters, no pin) stands untouched -- see the guard at the top of
   ready().
   ========================================================================= */
import * as THREE from "../vendor/three/three.module.min.js";

(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  var GOLD = 0xC59A3C;
  var GOLD_HI = 0xE2BD64;
  var BG = 0x07090D;
  var METAL_DARK = 0x12151b;

  var CHAPTER_WINDOWS = [0, 0.125, 0.375, 0.625, 0.875, 1.0001];

  ready(function () {
    var section = document.getElementById("engine-intro");
    var canvas = document.getElementById("engineCanvas");
    var poster = document.getElementById("engineIntroPoster");
    var scrollHint = document.getElementById("engineScrollHint");
    var chapterEls = Array.prototype.slice.call(document.querySelectorAll(".engine-chapter"));
    if (!section || !canvas || !chapterEls.length) return;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return; // css default (static stacked chapters) stands

    var probe;
    try {
      probe = document.createElement("canvas");
      var gl = probe.getContext("webgl2") || probe.getContext("webgl");
      if (!gl) return; // no WebGL -> css default stands
    } catch (e) {
      return;
    }

    var isMobile = window.matchMedia("(max-width: 760px)").matches;
    document.documentElement.classList.add("engine-3d-active");
    if (isMobile) document.documentElement.classList.add("engine-3d-mobile");

    // QA-only: skip the chapter crossfade transition so a single-shot
    // screenshot tool (which can't wait out a real CSS transition) sees a
    // clean, settled frame. Never applies without the query string.
    if (/[?&]engine_t=/.test(location.search)) {
      chapterEls.forEach(function (el) { el.style.transition = "none"; });
    }

    startEngine({
      section: section,
      canvas: canvas,
      poster: poster,
      scrollHint: scrollHint,
      chapterEls: chapterEls,
      isMobile: isMobile
    });
  });

  /* -------------------------------------------------------------------
     Small canvas-generated textures. No image assets: a soft radial
     glow sprite and a faint UV grid for the Websites module. Both tiny
     and same-origin by construction.
     ------------------------------------------------------------------- */
  function makeGlowTexture() {
    var size = 128;
    var c = document.createElement("canvas");
    c.width = c.height = size;
    var ctx = c.getContext("2d");
    var g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.4, "rgba(255,255,255,.5)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    var tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function makeGridTexture() {
    var size = 256;
    var c = document.createElement("canvas");
    c.width = c.height = size;
    var ctx = c.getContext("2d");
    ctx.fillStyle = "#0c1119";
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = "rgba(197,154,60,.28)";
    ctx.lineWidth = 1;
    var step = size / 8;
    for (var i = 0; i <= 8; i++) {
      ctx.beginPath(); ctx.moveTo(i * step, 0); ctx.lineTo(i * step, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * step); ctx.lineTo(size, i * step); ctx.stroke();
    }
    var tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  /* -------------------------------------------------------------------
     Module builders. Deliberately abstract -- no screenshots, no
     literal client content. Each returns a THREE.Group and records the
     materials that should brighten/dim with that module's emphasis.
     ------------------------------------------------------------------- */
  function buildVideoModule() {
    // Deliberately no `transmission` (MeshPhysicalMaterial's glass effect
    // needs a real environment map to read correctly -- without one it
    // renders as a flat, muddy block). Plain transparency + a per-plane
    // tint step reads as layered glass without that dependency.
    var group = new THREE.Group();
    var edgeMats = [];
    for (var i = 0; i < 4; i++) {
      var tint = 0x0a1a2c + i * 0x040404;
      var planeMat = new THREE.MeshStandardMaterial({
        color: tint, metalness: 0.15, roughness: 0.35,
        transparent: true, opacity: 0.55 + i * 0.04, side: THREE.DoubleSide
      });
      var plane = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.74), planeMat);
      plane.position.set((i - 1.5) * 0.16, 0, i * 0.07);
      plane.rotation.y = (i - 1.5) * 0.1;
      group.add(plane);

      var edgeMat = new THREE.MeshStandardMaterial({
        color: BG, emissive: GOLD, emissiveIntensity: 0.35, metalness: 0.4, roughness: 0.4
      });
      var edge = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.035), edgeMat);
      edge.position.set(plane.position.x, -0.375, plane.position.z + 0.003);
      edge.rotation.y = plane.rotation.y;
      group.add(edge);
      edgeMats.push(edgeMat);
    }
    group.userData.emissiveMats = edgeMats;
    return group;
  }

  function buildWebsiteModule() {
    var group = new THREE.Group();
    var gridTex = makeGridTexture();
    for (var i = 0; i < 5; i++) {
      var shade = 0x0c1119 + i * 0x030303;
      var planeMat = new THREE.MeshStandardMaterial({
        color: shade, metalness: 0.1, roughness: 0.45,
        transparent: true, opacity: i === 0 ? 0.96 : 0.5,
        map: i === 0 ? gridTex : null, side: THREE.DoubleSide
      });
      var plane = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 0.6), planeMat);
      plane.position.set(0, (i - 2) * 0.035, i * -0.11);
      group.add(plane);
    }
    var frameMat = new THREE.MeshStandardMaterial({
      color: BG, emissive: GOLD, emissiveIntensity: 0.35, metalness: 0.4, roughness: 0.4
    });
    var frame = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 0.03), frameMat);
    frame.position.set(0, 0.32, 0.06);
    group.add(frame);
    group.userData.emissiveMats = [frameMat];
    return group;
  }

  function buildSystemsModule() {
    var group = new THREE.Group();
    var localPoints = [
      new THREE.Vector3(-0.5, -0.18, 0.1),
      new THREE.Vector3(-0.24, 0.14, 0.02),
      new THREE.Vector3(0, 0.26, 0),
      new THREE.Vector3(0.24, 0.14, -0.02),
      new THREE.Vector3(0.5, -0.18, -0.1)
    ];
    var pathCurve = new THREE.CatmullRomCurve3(localPoints, false, "catmullrom", 0.4);

    var nodeMats = [];
    localPoints.forEach(function (p) {
      var nodeMat = new THREE.MeshStandardMaterial({
        color: METAL_DARK, emissive: GOLD, emissiveIntensity: 0.2, metalness: 0.7, roughness: 0.3
      });
      var node = new THREE.Mesh(new THREE.IcosahedronGeometry(0.052, 1), nodeMat);
      node.position.copy(p);
      group.add(node);
      nodeMats.push(nodeMat);
    });

    var tubeMat = new THREE.MeshStandardMaterial({
      color: BG, emissive: GOLD, emissiveIntensity: 0.12, metalness: 0.3, roughness: 0.5
    });
    var tube = new THREE.Mesh(new THREE.TubeGeometry(pathCurve, 64, 0.008, 6, false), tubeMat);
    group.add(tube);

    var pulseMat = new THREE.MeshBasicMaterial({ color: GOLD_HI, transparent: true, opacity: 0 });
    var pulse = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 10), pulseMat);
    group.add(pulse);

    group.userData.emissiveMats = nodeMats.concat([tubeMat]);
    group.userData.pulse = pulse;
    group.userData.pulseMat = pulseMat;
    group.userData.pathCurve = pathCurve;
    return group;
  }

  function buildConnector(from, to) {
    var curve = new THREE.LineCurve3(from, to);
    var mat = new THREE.MeshStandardMaterial({
      color: BG, emissive: GOLD, emissiveIntensity: 0.08, metalness: 0.3, roughness: 0.6,
      transparent: true, opacity: 0.35
    });
    var mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 8, 0.006, 6, false), mat);
    return { mesh: mesh, mat: mat };
  }

  /* -------------------------------------------------------------------
     Scene assembly + scroll-driven render loop.
     ------------------------------------------------------------------- */
  function startEngine(ctx) {
    var section = ctx.section, canvas = ctx.canvas, poster = ctx.poster,
        scrollHint = ctx.scrollHint, chapterEls = ctx.chapterEls, isMobile = ctx.isMobile;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !isMobile, alpha: false, powerPreference: "high-performance" });
    } catch (e) {
      document.documentElement.classList.remove("engine-3d-active", "engine-3d-mobile");
      return;
    }
    renderer.setClearColor(BG, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    canvas.addEventListener("webglcontextlost", function (e) {
      e.preventDefault();
      running = false;
      document.documentElement.classList.remove("engine-3d-active", "engine-3d-mobile");
    }, false);

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(BG, 0.05);

    var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);

    scene.add(new THREE.AmbientLight(0x0c1018, 1.3));
    var keyLight = new THREE.DirectionalLight(0xffe7b3, 1.15);
    keyLight.position.set(2.2, 3.2, 3.5);
    scene.add(keyLight);
    var fillLight = new THREE.DirectionalLight(0x2a3444, 0.4);
    fillLight.position.set(-3, -1, -2);
    scene.add(fillLight);

    var engineGroup = new THREE.Group();
    scene.add(engineGroup);

    /* ---- hub ---- */
    var hub = new THREE.Group();
    engineGroup.add(hub);
    var metalMat = new THREE.MeshStandardMaterial({ color: METAL_DARK, metalness: 0.85, roughness: 0.32 });
    [1.0, 0.72, 0.46].forEach(function (r) {
      var torus = new THREE.Mesh(new THREE.TorusGeometry(r, 0.022, 10, 56), metalMat);
      torus.rotation.x = Math.PI / 2;
      hub.add(torus);
      var trim = new THREE.Mesh(new THREE.TorusGeometry(r, 0.006, 8, 56),
        new THREE.MeshStandardMaterial({ color: BG, emissive: GOLD, emissiveIntensity: 0.6, metalness: 0.6, roughness: 0.35 }));
      trim.rotation.x = Math.PI / 2;
      hub.add(trim);
    });

    var glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeGlowTexture(), color: GOLD, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    glowSprite.scale.set(2.6, 2.6, 1);
    glowSprite.position.z = -0.08;
    hub.add(glowSprite);

    var logoTex = new THREE.TextureLoader().load("assets/brand/rp-monogram.png");
    logoTex.colorSpace = THREE.SRGBColorSpace;
    var logoPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.56, 0.56),
      new THREE.MeshBasicMaterial({ map: logoTex, transparent: true })
    );
    logoPlane.position.z = 0.06;
    hub.add(logoPlane);

    /* ---- modules ---- */
    var videoModule = buildVideoModule();
    videoModule.position.set(0, 1.55, 0.75);
    engineGroup.add(videoModule);

    var websiteModule = buildWebsiteModule();
    websiteModule.position.set(-1.7, -0.4, -0.55);
    engineGroup.add(websiteModule);

    var systemsModule = buildSystemsModule();
    systemsModule.position.set(1.7, -0.4, -0.55);
    engineGroup.add(systemsModule);

    var connectors = [videoModule, websiteModule, systemsModule].map(function (m) {
      return buildConnector(new THREE.Vector3(0, 0, 0), m.position.clone());
    });
    connectors.forEach(function (c) { engineGroup.add(c.mesh); });

    var rimLights = [videoModule, websiteModule, systemsModule].map(function (m) {
      var light = new THREE.PointLight(GOLD_HI, 0, 4);
      light.position.copy(m.position).multiplyScalar(1.15);
      scene.add(light);
      return light;
    });

    /* ---- camera path: overview -> each module (with an in-between
       waypoint that swings past the hub, not through it) -> full build ---- */
    var posCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.6, 5.2),
      new THREE.Vector3(0.3, 1.05, 3.3),
      new THREE.Vector3(0.4, 1.3, 2.0),
      new THREE.Vector3(-0.9, 0.7, 2.6),
      new THREE.Vector3(-2.3, 0.3, 1.4),
      new THREE.Vector3(0.1, 0.05, 2.3),
      new THREE.Vector3(2.3, 0.2, 1.2),
      new THREE.Vector3(1.0, 1.0, 4.3),
      new THREE.Vector3(0, 1.8, 6.5)
    ], false, "catmullrom", 0.4);

    var lookCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0.85, 0.5),
      new THREE.Vector3(0, 1.55, 0.75),
      new THREE.Vector3(-0.9, 0.2, 0.1),
      new THREE.Vector3(-1.7, -0.4, -0.55),
      new THREE.Vector3(0.9, 0, 0.1),
      new THREE.Vector3(1.7, -0.4, -0.55),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0)
    ], false, "catmullrom", 0.4);

    var FOV_T = [0, 0.25, 0.5, 0.75, 1];
    var FOV_V = [45, 38, 38, 38, 50];

    function lerpFov(t) {
      for (var i = 0; i < FOV_T.length - 1; i++) {
        if (t <= FOV_T[i + 1]) {
          var seg = (t - FOV_T[i]) / (FOV_T[i + 1] - FOV_T[i] || 1);
          return FOV_V[i] + (FOV_V[i + 1] - FOV_V[i]) * seg;
        }
      }
      return FOV_V[FOV_V.length - 1];
    }

    function emphasisFor(center, t) {
      var width = 0.16;
      var bump = Math.exp(-Math.pow((t - center) / width, 2));
      var fullBuild = t > 0.82 ? Math.min(1, (t - 0.82) / 0.1) : 0;
      return Math.max(bump, fullBuild * 0.92);
    }

    var currentChapter = -1;
    function setChapter(i) {
      if (i === currentChapter) return;
      currentChapter = i;
      chapterEls.forEach(function (el, idx) {
        el.classList.toggle("is-active", idx === i);
      });
    }

    function chapterIndexFor(t) {
      for (var i = 0; i < CHAPTER_WINDOWS.length - 1; i++) {
        if (t < CHAPTER_WINDOWS[i + 1]) return i;
      }
      return CHAPTER_WINDOWS.length - 2;
    }

    var clock = new THREE.Clock();
    var lastT = 0;
    var posterHidden = false;

    function setT(t) {
      lastT = t;
      var p = posCurve.getPoint(Math.max(0, Math.min(1, t)));
      var l = lookCurve.getPoint(Math.max(0, Math.min(1, t)));
      camera.position.copy(p);
      camera.fov = lerpFov(t);
      camera.updateProjectionMatrix();
      camera.lookAt(l);

      var vE = emphasisFor(0.25, t);
      var wE = emphasisFor(0.5, t);
      var sE = emphasisFor(0.75, t);

      applyEmphasis(videoModule, vE);
      applyEmphasis(websiteModule, wE);
      applyEmphasis(systemsModule, sE);

      connectors[0].mat.opacity = 0.25 + vE * 0.6;
      connectors[0].mat.emissiveIntensity = 0.08 + vE * 0.5;
      connectors[1].mat.opacity = 0.25 + wE * 0.6;
      connectors[1].mat.emissiveIntensity = 0.08 + wE * 0.5;
      connectors[2].mat.opacity = 0.25 + sE * 0.6;
      connectors[2].mat.emissiveIntensity = 0.08 + sE * 0.5;

      rimLights[0].intensity = vE * 2.2;
      rimLights[1].intensity = wE * 2.2;
      rimLights[2].intensity = sE * 2.2;

      var pulseMat = systemsModule.userData.pulseMat;
      pulseMat.opacity = 0.25 + sE * 0.75;

      setChapter(chapterIndexFor(t));

      if (scrollHint) scrollHint.classList.toggle("is-hidden", t > 0.02);

      var fadeStart = 0.96;
      var canvasOpacity = t < fadeStart ? 1 : Math.max(0, 1 - (t - fadeStart) / (1 - fadeStart));
      canvas.style.opacity = String(canvasOpacity);
    }

    function applyEmphasis(mod, e) {
      var mats = mod.userData.emissiveMats;
      if (!mats) return;
      for (var i = 0; i < mats.length; i++) {
        mats[i].emissiveIntensity = 0.15 + e * 1.4;
      }
    }

    /* ---- resize ---- */
    function onResize() {
      var w = section.clientWidth || window.innerWidth;
      var h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / (h || 1);
      camera.updateProjectionMatrix();
    }
    onResize();

    /* ---- scroll (read-only; never drives scroll) ---- */
    var ticking = false;
    function pinnedRange() {
      return section.offsetHeight - window.innerHeight;
    }
    function onScrollUpdate() {
      ticking = false;
      var range = pinnedRange();
      if (range <= 0) { setT(0); return; }
      var scrolledIntoPin = -section.getBoundingClientRect().top;
      var t = Math.max(0, Math.min(1, scrolledIntoPin / range));
      setT(t);
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(onScrollUpdate);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () { onResize(); onScroll(); }, { passive: true });

    /* ---- idle motion + render loop, paused off-screen ---- */
    var running = false;
    function frame() {
      if (!running) return;
      window.requestAnimationFrame(frame);
      var elapsed = clock.getElapsedTime();
      engineGroup.rotation.y = elapsed * 0.0045; // ~1 turn per ~23 min: alive, never desyncs the path

      var pulse = systemsModule.userData.pulse;
      var curve = systemsModule.userData.pathCurve;
      if (pulse && curve) {
        var pt = curve.getPointAt((elapsed * 0.12) % 1);
        pulse.position.copy(pt);
      }

      if (!posterHidden && renderer.info.render.frame > 1) {
        posterHidden = true;
        poster.classList.add("is-hidden");
      }

      renderer.render(scene, camera);
    }
    function start() { if (!running) { running = true; window.requestAnimationFrame(frame); } }
    function stop() { running = false; }

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) start(); else stop();
        });
      }, { threshold: 0.01 });
      io.observe(section);
    } else {
      start();
    }

    /* QA-only: ?engine_t=0.25 forces the initial composition to that
       scroll-progress value (still fully interpolated -- no different
       code path) for deterministic screenshot capture. Inert for any
       visitor who doesn't type that query string. */
    var qaMatch = /[?&]engine_t=([\d.]+)/.exec(location.search);
    setT(qaMatch ? Math.max(0, Math.min(1, parseFloat(qaMatch[1]))) : 0);
    renderer.render(scene, camera); // paint immediately -- don't wait for the first rAF tick
    start();
  }
})();
