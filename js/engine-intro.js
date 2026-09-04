/* =========================================================================
   REVENUE ENGINE — persistent WebGL world.

   One Three.js scene rendered on a single position:fixed, full-viewport
   canvas that sits behind the ENTIRE page, not just the hero. Scroll
   drives two continuous progress values:

   - `t` (0..1): the five-state camera journey (Overview / Video /
     Websites / Systems / Full Build), scoped to the hero's own scroll
     range exactly as before. Also drives which chapter of floating
     hero copy is visible.
   - `atmosphere` (0..1): eases in only after the hero has been fully
     scrolled past. It carries the camera from the Full Build framing
     to a further-back, dimmed resting position, and holds there while
     the rest of the page (Services / Work / Packages / Process / FAQ /
     Contact) scrolls over it. The engine never disappears -- it recedes
     into a quiet, literal background, per the brief.

   Nothing about the visuals is a discrete state machine except the
   floating chapter copy, which snaps between five fixed windows of `t`.

   Vendored dependencies (all MIT, self-hosted per CSP script-src 'self'
   -- no CDN): vendor/three/three.module.min.js, plus a small slice of
   the three.js examples/jsm addon set (postprocessing + one procedural
   environment, no image assets) under vendor/three/addons/.

   Progressive enhancement: this file only takes over the page when
   prefers-reduced-motion is off AND a WebGL context is actually
   available. Otherwise css/engine-intro.css's default (static stacked
   chapters, no canvas) stands untouched -- see the guard at the top of
   ready().
   ========================================================================= */
import * as THREE from "../vendor/three/three.module.min.js";
import { EffectComposer } from "../vendor/three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "../vendor/three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "../vendor/three/addons/postprocessing/UnrealBloomPass.js";
import { RoomEnvironment } from "../vendor/three/addons/environments/RoomEnvironment.js";

(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function smoothstep(v) { v = clamp01(v); return v * v * (3 - 2 * v); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* Palette. Champagne gold stays the *brand* gold (--gold in css/styles.css)
     rather than the art board's #D4AF37 -- the difference is barely
     perceptible and brand consistency wins. The board's warm-light value is
     used where it belongs: light sources and specular highlights, not paint. */
  var GOLD = 0xC59A3C;
  var GOLD_HI = 0xE2BD64;
  var WARM_LIGHT = 0xFFC871;
  var BG = 0x07090D;      // matches --bg; the canvas *is* the page background
  var METAL_DARK = 0x12151b;
  var GUNMETAL = 0x1a1a1a;
  var DEEP_BLACK = 0x0b0b0b;
  var GROUND_DARK = 0x0b0d12;
  var ENAMEL = 0xB8B0A0; // mid-toned on purpose: near-white clips and blooms

  var textureLoader = null;
  function loadTexture(path) {
    if (!textureLoader) textureLoader = new THREE.TextureLoader();
    var tex = textureLoader.load(path);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  var CHAPTER_WINDOWS = [0, 0.125, 0.375, 0.625, 0.875, 1.0001];

  /* Screen + label content. Declared up here, not beside their builders:
     ready() can fire synchronously on an already-loaded document, so
     anything the builders read must be assigned before that call below. */
  var VIDEO_SCREENS = [
    "assets/posters/01-home-services-roofing.jpg",
    "assets/posters/02-hospitality-restaurant.jpg",
    "assets/posters/03-ecommerce-beauty-product.jpg"
  ];

  var SYSTEM_STAGES = [
    { label: "INTAKE", glyph: "doc" },
    { label: "BOOKING", glyph: "calendar" },
    { label: "PAYMENT", glyph: "card" },
    { label: "FOLLOW-UP", glyph: "bubble" },
    { label: "CRM", glyph: "person" }
  ];

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
    if (/[?&]engine_t=/.test(location.search) || /[?&]engine_atmo=/.test(location.search)) {
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
     glow sprite, a faint UV grid for the Websites module, and a
     concentric-ring / radial-groove pattern for the ground platform.
     All tiny and same-origin by construction.
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

  function makeGroundTexture() {
    var size = 512;
    var c = document.createElement("canvas");
    c.width = c.height = size;
    var ctx = c.getContext("2d");
    var cx = size / 2, cy = size / 2, maxR = size / 2;
    ctx.fillStyle = "#0a0c11";
    ctx.fillRect(0, 0, size, size);

    // radial grooves
    ctx.strokeStyle = "rgba(255,255,255,.05)";
    ctx.lineWidth = 1;
    var spokes = 28;
    for (var i = 0; i < spokes; i++) {
      var a = (i / spokes) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * maxR * 0.16, cy + Math.sin(a) * maxR * 0.16);
      ctx.lineTo(cx + Math.cos(a) * maxR * 0.98, cy + Math.sin(a) * maxR * 0.98);
      ctx.stroke();
    }

    // concentric tracks, alternating faint bands for a segmented-floor read
    var rings = [0.22, 0.34, 0.34, 0.5, 0.5, 0.64, 0.78, 0.9];
    for (var r = 0.2; r < 0.99; r += 0.055) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * maxR, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255," + (r % 0.11 < 0.02 ? 0.09 : 0.035) + ")";
      ctx.lineWidth = r % 0.11 < 0.02 ? 1.4 : 1;
      ctx.stroke();
    }

    // soft vignette toward the rim
    var vg = ctx.createRadialGradient(cx, cy, maxR * 0.2, cx, cy, maxR);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,.55)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, size, size);

    var tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /* -------------------------------------------------------------------
     Shared physical-geometry helpers. Real thickness and bevelled edges
     are what make these read as machined equipment rather than flat
     planes -- edge highlights come from geometry, not from more glow.
     ------------------------------------------------------------------- */
  function roundedRectShape(w, h, r) {
    var s = new THREE.Shape();
    var x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }

  // Extruded rounded slab, centred on its own depth. Only untextured metal
  // uses this -- ExtrudeGeometry's UVs are in world units, not 0..1, so
  // anything that carries a texture gets a separate inset PlaneGeometry.
  function beveledSlab(w, h, r, depth, isMobile) {
    var bevel = Math.min(0.009, r * 0.4, depth * 0.35);
    var geo = new THREE.ExtrudeGeometry(roundedRectShape(w, h, r), {
      depth: depth,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: isMobile ? 1 : 2,
      curveSegments: isMobile ? 3 : 6
    });
    geo.translate(0, 0, -depth / 2);
    return geo;
  }

  function metalMaterial(color, roughness, metalness) {
    return new THREE.MeshPhysicalMaterial({
      color: color,
      metalness: metalness === undefined ? 0.88 : metalness,
      roughness: roughness === undefined ? 0.34 : roughness,
      clearcoat: 0.35,
      clearcoatRoughness: 0.28
    });
  }

  function goldTrimMaterial(intensity) {
    return new THREE.MeshStandardMaterial({
      color: DEEP_BLACK, emissive: GOLD,
      emissiveIntensity: intensity === undefined ? 0.45 : intensity,
      metalness: 0.6, roughness: 0.32
    });
  }

  // Low tiered plinth a module physically stands on.
  function buildPedestal(radius, isMobile) {
    var group = new THREE.Group();
    var seg = isMobile ? 24 : 48;
    var body = metalMaterial(GUNMETAL, 0.4, 0.85);

    var lower = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.07, 0.055, seg), body);
    group.add(lower);
    var upper = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.8, radius * 0.87, 0.05, seg), body);
    upper.position.y = 0.052;
    group.add(upper);

    var trimMat = goldTrimMaterial(0.5);
    var trim = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.93, 0.007, 6, seg), trimMat);
    trim.rotation.x = Math.PI / 2;
    trim.position.y = 0.03;
    group.add(trim);

    group.userData.trimMats = [trimMat];
    return group;
  }

  /* ---- canvas-drawn labels. Functional text and generic symbols only:
     the five system stages, and the machine's own name. No client marks,
     no metrics, no invented product names. ---- */
  function drawSpacedText(ctx, text, cx, y, spacing) {
    var chars = text.split("");
    var total = 0, i;
    for (i = 0; i < chars.length; i++) total += ctx.measureText(chars[i]).width + spacing;
    total -= spacing;
    var x = cx - total / 2;
    for (i = 0; i < chars.length; i++) {
      ctx.fillText(chars[i], x, y);
      x += ctx.measureText(chars[i]).width + spacing;
    }
  }

  function drawGlyph(ctx, kind, cx, cy, s) {
    ctx.strokeStyle = "#C59A3C";
    ctx.fillStyle = "#C59A3C";
    ctx.lineWidth = Math.max(2, s * 0.11);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    if (kind === "doc") {                       // intake: a form
      ctx.rect(cx - s * 0.34, cy - s * 0.46, s * 0.68, s * 0.92);
      ctx.moveTo(cx - s * 0.16, cy - s * 0.16); ctx.lineTo(cx + s * 0.16, cy - s * 0.16);
      ctx.moveTo(cx - s * 0.16, cy + s * 0.04); ctx.lineTo(cx + s * 0.16, cy + s * 0.04);
      ctx.moveTo(cx - s * 0.16, cy + s * 0.24); ctx.lineTo(cx + s * 0.02, cy + s * 0.24);
    } else if (kind === "calendar") {           // booking
      ctx.rect(cx - s * 0.44, cy - s * 0.34, s * 0.88, s * 0.74);
      ctx.moveTo(cx - s * 0.44, cy - s * 0.1); ctx.lineTo(cx + s * 0.44, cy - s * 0.1);
      ctx.moveTo(cx - s * 0.22, cy - s * 0.5); ctx.lineTo(cx - s * 0.22, cy - s * 0.26);
      ctx.moveTo(cx + s * 0.22, cy - s * 0.5); ctx.lineTo(cx + s * 0.22, cy - s * 0.26);
    } else if (kind === "card") {               // payment
      ctx.rect(cx - s * 0.46, cy - s * 0.32, s * 0.92, s * 0.64);
      ctx.moveTo(cx - s * 0.46, cy - s * 0.1); ctx.lineTo(cx + s * 0.46, cy - s * 0.1);
      ctx.moveTo(cx - s * 0.3, cy + s * 0.14); ctx.lineTo(cx - s * 0.08, cy + s * 0.14);
    } else if (kind === "bubble") {             // follow-up
      ctx.moveTo(cx - s * 0.44, cy - s * 0.36);
      ctx.lineTo(cx + s * 0.44, cy - s * 0.36);
      ctx.lineTo(cx + s * 0.44, cy + s * 0.16);
      ctx.lineTo(cx - s * 0.1, cy + s * 0.16);
      ctx.lineTo(cx - s * 0.28, cy + s * 0.44);
      ctx.lineTo(cx - s * 0.28, cy + s * 0.16);
      ctx.lineTo(cx - s * 0.44, cy + s * 0.16);
      ctx.closePath();
    } else {                                    // crm: a person
      ctx.arc(cx, cy - s * 0.18, s * 0.24, 0, Math.PI * 2);
      ctx.moveTo(cx - s * 0.42, cy + s * 0.46);
      ctx.bezierCurveTo(cx - s * 0.42, cy + s * 0.08, cx + s * 0.42, cy + s * 0.08, cx + s * 0.42, cy + s * 0.46);
    }
    ctx.stroke();
  }

  function makeTileLabelTexture(label, glyph, isMobile) {
    var w = isMobile ? 192 : 384, h = isMobile ? 160 : 320;
    var c = document.createElement("canvas");
    c.width = w; c.height = h;
    var ctx = c.getContext("2d");
    var scale = w / 384;
    drawGlyph(ctx, glyph, w / 2, h * 0.36, 74 * scale);
    ctx.fillStyle = "#EFE9DC";
    ctx.font = "700 " + Math.round(46 * scale) + "px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.textBaseline = "middle";
    drawSpacedText(ctx, label, w / 2, h * 0.76, 4 * scale);
    var tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  function makeRimTextTexture(text, isMobile) {
    var w = isMobile ? 1024 : 2048, h = isMobile ? 64 : 128;
    var c = document.createElement("canvas");
    c.width = w; c.height = h;
    var ctx = c.getContext("2d");
    ctx.fillStyle = "#C59A3C";
    ctx.font = "700 " + Math.round(h * 0.46) + "px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.textBaseline = "middle";
    drawSpacedText(ctx, text, w / 2, h / 2, h * 0.28);
    var tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  // Circular alpha mask, so the square brand plate can be inlaid as a round
  // medallion. The bitmap's own pixels are never touched -- only the blank
  // margin around the mark is masked, exactly as mounting a cut medallion.
  function makeDiscMaskTexture() {
    var size = 256;
    var c = document.createElement("canvas");
    c.width = c.height = size;
    var ctx = c.getContext("2d");
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    return new THREE.CanvasTexture(c);
  }

  function makeContactShadowTexture() {
    var size = 256;
    var c = document.createElement("canvas");
    c.width = c.height = size;
    var ctx = c.getContext("2d");
    var g = ctx.createRadialGradient(size / 2, size / 2, size * 0.12, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(0,0,0,.85)");
    g.addColorStop(0.55, "rgba(0,0,0,.35)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }

  // Concentric machined tracks + radial segment grooves for the hub deck.
  // Drawn rather than modelled: saves ~8 meshes for an identical read.
  function makeDeckTexture() {
    var size = 512;
    var c = document.createElement("canvas");
    c.width = c.height = size;
    var ctx = c.getContext("2d");
    var cx = size / 2, cy = size / 2, maxR = size / 2;
    ctx.fillStyle = "#15181e";
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = "rgba(0,0,0,.55)";
    ctx.lineWidth = 2;
    var spokes = 16, i;
    for (i = 0; i < spokes; i++) {
      var a = (i / spokes) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * maxR * 0.34, cy + Math.sin(a) * maxR * 0.34);
      ctx.lineTo(cx + Math.cos(a) * maxR * 0.99, cy + Math.sin(a) * maxR * 0.99);
      ctx.stroke();
    }
    for (var r = 0.3; r < 0.99; r += 0.075) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * maxR, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,.055)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    var tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /* -------------------------------------------------------------------
     Module builders. Physical equipment, no invented content: screens
     carry the company's own existing portfolio/concept imagery, and the
     Systems tiles carry only the five approved stage names. Each returns
     a THREE.Group and records the materials that brighten/dim with that
     module's emphasis.
     ------------------------------------------------------------------- */
  // Two or three physically real handsets, fanned on a raised pedestal.
  // Screens carry existing approved Revenue Pilots portfolio posters
  // (already shipped on the homepage and /video-ads/) -- no invented
  // creative, no performance claims.
  function buildVideoModule(isMobile) {
    var group = new THREE.Group();
    var count = isMobile ? 2 : 3;
    var bodyGeo = beveledSlab(0.30, 0.62, 0.045, 0.032, isMobile);
    var screenGeo = new THREE.PlaneGeometry(0.262, 0.575);
    var goldMats = [];
    var screenMats = [];

    for (var i = 0; i < count; i++) {
      var phone = new THREE.Group();
      var offset = i - (count - 1) / 2;

      var body = new THREE.Mesh(bodyGeo, metalMaterial(GUNMETAL, 0.3, 0.9));
      phone.add(body);

      // Screen is a separate inset plane: proper 0..1 UVs, and doubling the
      // poster as an emissive map makes the handset read as powered on
      // without stacking another transparent "glass" layer over it.
      var tex = loadTexture(VIDEO_SCREENS[i % VIDEO_SCREENS.length]);
      var screenMat = new THREE.MeshStandardMaterial({
        map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.66,
        metalness: 0.1, roughness: 0.32
      });
      var screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.z = 0.032;
      phone.add(screen);
      screenMats.push(screenMat);

      // rear camera bump -- cheap, but it's the detail that says "phone"
      var bump = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.022, 0.008, isMobile ? 8 : 14),
        metalMaterial(DEEP_BLACK, 0.25, 0.6)
      );
      bump.rotation.x = Math.PI / 2;
      bump.position.set(-0.085, 0.22, -0.019);
      phone.add(bump);

      // thin champagne edge along the bottom rail
      var railMat = goldTrimMaterial(0.4);
      var rail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.006, 0.006), railMat);
      rail.position.set(0, -0.318, 0.030);
      phone.add(rail);
      goldMats.push(railMat);

      phone.position.set(offset * 0.245, Math.abs(offset) * -0.035, -Math.abs(offset) * 0.05);
      phone.rotation.y = -offset * 0.34;
      phone.rotation.z = offset * 0.045;
      group.add(phone);
    }

    var pedestal = buildPedestal(0.46, isMobile);
    pedestal.position.y = -0.4;
    group.add(pedestal);
    goldMats = goldMats.concat(pedestal.userData.trimMats);

    group.userData.emissiveMats = goldMats;
    group.userData.screenMats = screenMats;
    return group;
  }

  // One premium display slab on a pedestal. The screen carries the
  // company's own existing website concept crop (assets/hero/
  // engine-website-panel.jpg -- a 900x422 slice of /work/northline-hvac/,
  // already in the repo), so it reads instantly as a real designed site
  // rather than placeholder bars. Nothing here is a client or a claim.
  function buildWebsiteModule(isMobile) {
    var group = new THREE.Group();
    var goldMats = [];

    var frame = new THREE.Mesh(
      beveledSlab(0.94, 0.50, 0.022, 0.036, isMobile),
      metalMaterial(GUNMETAL, 0.32, 0.88)
    );
    group.add(frame);

    var tex = loadTexture("assets/hero/engine-website-panel.jpg");
    var screenMat = new THREE.MeshStandardMaterial({
      map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.62,
      metalness: 0.1, roughness: 0.32
    });
    var screen = new THREE.Mesh(new THREE.PlaneGeometry(0.885, 0.445), screenMat);
    screen.position.z = 0.034;
    group.add(screen);

    // champagne strip along the top bezel
    var topMat = goldTrimMaterial(0.42);
    var topStrip = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.005, 0.006), topMat);
    topStrip.position.set(0, 0.2465, 0.032);
    group.add(topStrip);
    goldMats.push(topMat);

    // short angled foot, so the slab is mounted rather than floating
    var stand = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.13, 0.028),
      metalMaterial(GUNMETAL, 0.4, 0.85)
    );
    stand.position.set(0, -0.3, -0.03);
    stand.rotation.x = 0.32;
    group.add(stand);

    var pedestal = buildPedestal(0.5, isMobile);
    pedestal.position.y = -0.375;
    group.add(pedestal);
    goldMats = goldMats.concat(pedestal.userData.trimMats);

    group.userData.emissiveMats = goldMats;
    group.userData.screenMats = [screenMat];
    return group;
  }

  // Five machined tiles carrying the five approved stage names, wired in
  // order along the existing connector path. Icons are generic functional
  // symbols drawn in-canvas -- no third-party software marks.
  function buildSystemsModule(isMobile) {
    var group = new THREE.Group();
    var localPoints = [
      new THREE.Vector3(-0.5, -0.18, 0.1),
      new THREE.Vector3(-0.24, 0.14, 0.02),
      new THREE.Vector3(0, 0.26, 0),
      new THREE.Vector3(0.24, 0.14, -0.02),
      new THREE.Vector3(0.5, -0.18, -0.1)
    ];
    var pathCurve = new THREE.CatmullRomCurve3(localPoints, false, "catmullrom", 0.4);

    var tileGeo = beveledSlab(0.2, 0.166, 0.03, 0.036, isMobile);
    var labelGeo = new THREE.PlaneGeometry(0.176, 0.146);
    var goldMats = [];

    localPoints.forEach(function (p, i) {
      var stage = SYSTEM_STAGES[i];
      var tile = new THREE.Group();

      var body = new THREE.Mesh(tileGeo, metalMaterial(GUNMETAL, 0.33, 0.86));
      tile.add(body);

      var labelMat = new THREE.MeshBasicMaterial({
        map: makeTileLabelTexture(stage.label, stage.glyph, isMobile),
        transparent: true
      });
      var label = new THREE.Mesh(labelGeo, labelMat);
      label.position.z = 0.034;
      tile.add(label);

      var edgeMat = goldTrimMaterial(0.35);
      var edge = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.004, 0.005), edgeMat);
      edge.position.set(0, -0.085, 0.032);
      tile.add(edge);
      goldMats.push(edgeMat);

      tile.position.copy(p);
      tile.rotation.y = -0.22 * (i - 2);
      group.add(tile);
    });

    var tubeMat = new THREE.MeshStandardMaterial({
      color: BG, emissive: GOLD, emissiveIntensity: 0.12, metalness: 0.3, roughness: 0.5
    });
    var tube = new THREE.Mesh(new THREE.TubeGeometry(pathCurve, isMobile ? 32 : 64, 0.008, 6, false), tubeMat);
    group.add(tube);

    var pulseMat = new THREE.MeshBasicMaterial({ color: GOLD_HI, transparent: true, opacity: 0 });
    var pulse = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 10), pulseMat);
    group.add(pulse);

    group.userData.emissiveMats = goldMats.concat([tubeMat]);
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
     Ground / platform environment. One large dark circular stage the
     engine sits on -- tapered rim (a bevelled pedestal edge), a flat
     top disc carrying the concentric/radial texture above, and three
     thin recessed gold-trim rings. Persists for the whole page; does
     not idle-spin with the engine group (a fixed stage under a
     turning mechanism reads as more deliberate than everything
     spinning together).
     ------------------------------------------------------------------- */
  function buildGround(isMobile) {
    var group = new THREE.Group();
    var segments = isMobile ? 40 : 72;
    var radius = 2.95;

    var rimMat = new THREE.MeshPhysicalMaterial({
      color: GROUND_DARK, metalness: 0.75, roughness: 0.4, clearcoat: 0.25, clearcoatRoughness: 0.35
    });
    var rim = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius * 1.05, 0.14, segments, 1, true),
      rimMat
    );
    group.add(rim);

    var topMat = new THREE.MeshPhysicalMaterial({
      color: 0x14181f, metalness: 0.65, roughness: 0.4, clearcoat: 0.3, clearcoatRoughness: 0.3,
      map: makeGroundTexture()
    });
    var top = new THREE.Mesh(new THREE.CircleGeometry(radius, segments), topMat);
    top.rotation.x = -Math.PI / 2;
    top.position.y = 0.071;
    group.add(top);

    var trimMat = new THREE.MeshStandardMaterial({
      color: BG, emissive: GOLD, emissiveIntensity: 0.4, metalness: 0.55, roughness: 0.35
    });
    [1.35, 2.0, 2.65].forEach(function (r) {
      var ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.011, 8, segments), trimMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.073;
      group.add(ring);
    });

    group.userData.trimMat = trimMat;
    return group;
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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    canvas.addEventListener("webglcontextlost", function (e) {
      e.preventDefault();
      running = false;
      document.documentElement.classList.remove("engine-3d-active", "engine-3d-mobile");
    }, false);

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(BG, 0.05);

    var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);

    // Desktop only: a small, self-contained procedural environment map
    // (no image asset) so metal/clearcoat surfaces get real reflections
    // instead of reading flat. Skipped on mobile to keep the one-time
    // PMREM cost off lower-power devices.
    if (!isMobile) {
      try {
        var pmrem = new THREE.PMREMGenerator(renderer);
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.045).texture;
        pmrem.dispose();
      } catch (e) { /* environment map is an enhancement, never fatal */ }
    }

    scene.add(new THREE.AmbientLight(0x141a24, 1.5));
    var keyLight = new THREE.DirectionalLight(WARM_LIGHT, 1.45);
    keyLight.position.set(2.2, 3.2, 3.5);
    scene.add(keyLight);
    var fillLight = new THREE.DirectionalLight(0x2a3444, 0.55);
    fillLight.position.set(-3, -1, -2);
    scene.add(fillLight);
    // Cool back-rim: this is what separates gunmetal edges from a black
    // background and makes the tier bevels read as machined steps.
    var rimLight = new THREE.DirectionalLight(0x7286a3, 0.42);
    rimLight.position.set(-2.4, 1.6, -3.4);
    scene.add(rimLight);
    var KEY_BASE = keyLight.intensity, FILL_BASE = fillLight.intensity;

    /* ---- ground / stage (persists, does not idle-spin) ---- */
    var ground = buildGround(isMobile);
    ground.position.y = -1.5;
    scene.add(ground);

    var engineGroup = new THREE.Group();
    scene.add(engineGroup);

    /* ---- hub: a multi-tier machined plinth with real mass, rising off
       the floor. Tier radii are deliberately kept under the module anchor
       radius (~1.79) so the base never collides with the locked module
       positions -- the tiers shrink, the anchors never move. ---- */
    var hub = new THREE.Group();
    engineGroup.add(hub);
    var hubSeg = isMobile ? 32 : 64;
    var hubGoldMats = [];

    // [outer radius, inner/top radius, height, centre Y]
    var TIERS = [
      [1.22, 1.16, 0.34, -1.26],
      [1.02, 0.97, 0.30, -0.94],
      [0.86, 0.82, 0.28, -0.65],
      [0.76, 0.74, 0.22, -0.40]
    ];
    TIERS.forEach(function (t, i) {
      var tier = new THREE.Mesh(
        new THREE.CylinderGeometry(t[1], t[0], t[2], hubSeg),
        metalMaterial(i % 2 ? GUNMETAL : METAL_DARK, 0.28 + i * 0.05, 0.9)
      );
      tier.position.y = t[3];
      hub.add(tier);

      // chamfered lip at each tier seam: a cheap, convincing bevel read
      var lip = new THREE.Mesh(
        new THREE.CylinderGeometry(t[1] * 1.012, t[1] * 1.028, 0.022, hubSeg),
        metalMaterial(DEEP_BLACK, 0.22, 0.95)
      );
      lip.position.y = t[3] + t[2] / 2;
      hub.add(lip);

      // recessed champagne strip seated in the seam
      var seamMat = goldTrimMaterial(0.5);
      var seam = new THREE.Mesh(new THREE.TorusGeometry(t[1] * 1.005, 0.0075, 6, hubSeg), seamMat);
      seam.rotation.x = Math.PI / 2;
      seam.position.y = t[3] + t[2] / 2 - 0.014;
      hub.add(seam);
      hubGoldMats.push(seamMat);
    });

    // top deck cap: concentric tracks + radial grooves as a texture
    var deck = new THREE.Mesh(
      new THREE.CircleGeometry(0.745, hubSeg),
      new THREE.MeshPhysicalMaterial({
        map: makeDeckTexture(), metalness: 0.82, roughness: 0.38,
        clearcoat: 0.3, clearcoatRoughness: 0.3
      })
    );
    deck.rotation.x = -Math.PI / 2;
    deck.position.y = -0.286;
    hub.add(deck);

    [0.46, 0.6, 0.71].forEach(function (r, i) {
      var ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, i === 1 ? 0.006 : 0.009, 6, hubSeg),
        i === 1 ? goldTrimMaterial(0.4) : metalMaterial(DEEP_BLACK, 0.3, 0.92)
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.279;
      hub.add(ring);
      if (i === 1) hubGoldMats.push(ring.material);
    });

    // outer rim band carrying the machine's own name
    var rimBand = new THREE.Mesh(
      new THREE.CylinderGeometry(1.232, 1.232, 0.105, hubSeg, 1, true),
      new THREE.MeshStandardMaterial({
        map: makeRimTextTexture("REVENUE ENGINE", isMobile),
        color: 0x0e1116, emissive: GOLD, emissiveIntensity: 0.22,
        emissiveMap: makeRimTextTexture("REVENUE ENGINE", isMobile),
        metalness: 0.7, roughness: 0.36, transparent: true
      })
    );
    rimBand.position.y = -1.245;
    rimBand.rotation.y = Math.PI; // put the texture's centre on the camera-facing side
    hub.add(rimBand);
    hubGoldMats.push(rimBand.material);

    // FULL REVENUE BUILD plaque -- small, and dark until the final state
    var fullBuildMat = new THREE.MeshStandardMaterial({
      map: makeRimTextTexture("FULL REVENUE BUILD", isMobile),
      transparent: true, color: 0x0b0e13,
      emissive: GOLD, emissiveIntensity: 0,
      metalness: 0.6, roughness: 0.4
    });
    var fullBuildPlaque = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.058), fullBuildMat);
    fullBuildPlaque.position.set(0, -0.66, 1.12);
    hub.add(fullBuildPlaque);

    var glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeGlowTexture(), color: GOLD, transparent: true, opacity: 0.16,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    glowSprite.scale.set(1.5, 1.5, 1);
    glowSprite.position.set(0, -0.2, -0.35);
    hub.add(glowSprite);

    /* ---- logo plaque: the real asset, unaltered, mounted as a physical
       enamel disc with a gold bezel. Tilted back ~20deg like an
       instrument panel: flat-on-the-deck would read edge-on to this
       camera, which sits only a few degrees above the hub. ---- */
    var plaque = new THREE.Group();
    plaque.position.set(0, -0.075, 0.09);
    plaque.rotation.x = -0.32;
    hub.add(plaque);

    var boss = new THREE.Mesh(
      new THREE.CylinderGeometry(0.245, 0.27, 0.05, hubSeg),
      metalMaterial(GUNMETAL, 0.3, 0.9)
    );
    boss.rotation.x = Math.PI / 2;
    plaque.add(boss);

    // Recessed seat behind the medallion.
    var seat = new THREE.Mesh(
      new THREE.CircleGeometry(0.232, hubSeg),
      new THREE.MeshStandardMaterial({ color: DEEP_BLACK, metalness: 0.4, roughness: 0.65 })
    );
    seat.position.z = 0.026;
    plaque.add(seat);

    var bezelMat = goldTrimMaterial(0.3);
    var bezel = new THREE.Mesh(new THREE.TorusGeometry(0.236, 0.014, 8, hubSeg), bezelMat);
    bezel.position.z = 0.042;
    plaque.add(bezel);
    hubGoldMats.push(bezelMat);

    /* The locked asset itself -- untouched bitmap, mounted as the plaque
       face. Lit rather than MeshBasic so it reads as something physically
       printed rather than a lamp.

       Two things this needs to render at all, both learned the hard way:
       the z gap from the seat behind it must clear depth-buffer precision
       at this camera distance (a 2mm offset loses, and the seat hides the
       mark), and the circular mask must go through alphaTest rather than
       the transparent pass -- as a sorted transparent it lost to the
       opaque hub geometry around it and vanished entirely. */
    var logoPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.44, 0.44),
      new THREE.MeshStandardMaterial({
        map: loadTexture("assets/brand/rp-monogram.png"),
        alphaMap: makeDiscMaskTexture(),
        alphaTest: 0.5, transparent: false,
        metalness: 0.0, roughness: 0.68
      })
    );
    logoPlane.position.z = 0.044;
    plaque.add(logoPlane);

    hub.userData.goldMats = hubGoldMats;
    hub.userData.fullBuildMat = fullBuildMat;

    // contact shadow: the hub genuinely rests on the floor, so it gets weight
    if (!isMobile) {
      var shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(4.6, 4.6),
        new THREE.MeshBasicMaterial({
          map: makeContactShadowTexture(), transparent: true, opacity: 0.75, depthWrite: false
        })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = -1.424;
      scene.add(shadow);
    }

    /* ---- modules ---- */
    var videoModule = buildVideoModule(isMobile);
    videoModule.position.set(0, 1.55, 0.75);
    engineGroup.add(videoModule);

    var websiteModule = buildWebsiteModule(isMobile);
    websiteModule.position.set(-1.7, -0.4, -0.55);
    engineGroup.add(websiteModule);

    var systemsModule = buildSystemsModule(isMobile);
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
       waypoint that swings past the hub, not through it) -> full build.
       Unchanged from the verified hero journey -- the atmosphere state
       below extends past it rather than re-tuning it. ---- */
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

    /* ---- atmosphere: where the journey settles once the hero has
       fully scrolled past. Further back, slightly higher, dimmer --
       still clearly the same machine, now a backdrop rather than the
       subject. Everything below is a continuous function of scroll,
       so scrolling back up smoothly un-does it. ---- */
    var ATMO_POS = new THREE.Vector3(0, 2.6, 8.8);
    var ATMO_LOOK = new THREE.Vector3(0, 0.5, 0);
    var ATMO_FOV = 55;

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
    var lastT = 0, lastAtmo = 0;
    var posterHidden = false;

    function setT(t, atmosphere) {
      t = clamp01(t);
      atmosphere = clamp01(atmosphere || 0);
      lastT = t;
      lastAtmo = atmosphere;

      var ease = smoothstep(atmosphere);
      var p = posCurve.getPoint(t);
      var l = lookCurve.getPoint(t);
      var fov = lerpFov(t);

      if (ease > 0) {
        p = p.clone().lerp(ATMO_POS, ease);
        l = l.clone().lerp(ATMO_LOOK, ease);
        fov = lerp(fov, ATMO_FOV, ease);
      }

      camera.position.copy(p);
      camera.fov = fov;
      camera.updateProjectionMatrix();
      camera.lookAt(l);

      // As the engine recedes into the background, its emphasis pulses
      // and rim lights settle to a calmer, more ambient baseline instead
      // of holding the "Full Build, everything lit" peak forever.
      var restFactor = 1 - ease * 0.55;

      var vE = emphasisFor(0.25, t) * restFactor;
      var wE = emphasisFor(0.5, t) * restFactor;
      var sE = emphasisFor(0.75, t) * restFactor;

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
      pulseMat.opacity = (0.25 + sE * 0.75) * (1 - ease * 0.3);

      keyLight.intensity = KEY_BASE * (1 - ease * 0.35);
      fillLight.intensity = FILL_BASE * (1 - ease * 0.15);
      ground.userData.trimMat.emissiveIntensity = 0.4 * (1 - ease * 0.4);

      // Hub trim holds a calm baseline so the machine stays legible all the
      // way down the page; the FULL REVENUE BUILD plaque stays dark until
      // the final state, then lights just enough to be read, not to shout.
      var hubGlow = (0.34 + 0.22 * Math.max(vE, wE, sE)) * (1 - ease * 0.45);
      hub.userData.goldMats.forEach(function (m) { m.emissiveIntensity = hubGlow; });

      var fullBuild = t > 0.82 ? Math.min(1, (t - 0.82) / 0.1) : 0;
      hub.userData.fullBuildMat.emissiveIntensity = fullBuild * 1.5 * (1 - ease * 0.6);

      // Screens are self-lit, so they need to settle too or they'd stay
      // punching through the page's later sections.
      dimScreens(videoModule, 0.6 + vE * 0.22, ease);
      dimScreens(websiteModule, 0.58 + wE * 0.2, ease);

      setChapter(chapterIndexFor(t));

      if (scrollHint) scrollHint.classList.toggle("is-hidden", t > 0.02);

      // The engine dims into the page's background rather than fading
      // to nothing -- it stays visibly present behind later sections.
      canvas.style.opacity = String(1 - ease * 0.38);
    }

    function dimScreens(mod, base, ease) {
      var mats = mod.userData.screenMats;
      if (!mats) return;
      for (var i = 0; i < mats.length; i++) {
        mats[i].emissiveIntensity = base * (1 - ease * 0.5);
      }
    }

    function applyEmphasis(mod, e) {
      var mats = mod.userData.emissiveMats;
      if (!mats) return;
      for (var i = 0; i < mats.length; i++) {
        mats[i].emissiveIntensity = 0.15 + e * 1.4;
      }
    }

    /* ---- post-processing: restrained bloom on gold/emissive highlights
       only, desktop only (mobile stays on the plain renderer for perf,
       per the brief's mobile fallback allowance). ---- */
    var composer = null;
    if (!isMobile) {
      try {
        composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        // Threshold sits high on purpose: the gold trim should be the only
        // thing that blooms. Lower values start catching lit metal and the
        // logo plaque, which turns precision hardware into a glow blob.
        var bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.22, 0.25, 1.0);
        composer.addPass(bloom);
      } catch (e) {
        composer = null;
      }
    }

    /* ---- resize: canvas is a fixed full-viewport layer now, not
       confined to the hero section's own width. A plain `resize`
       listener alone isn't reliable here -- a viewport that starts out
       laid-out at 0x0 (e.g. a container becoming visible after first
       paint) never fires a `resize` event once it settles, so the
       renderer would stay stuck at a zero-size drawing buffer. A
       ResizeObserver on the root element catches that first real
       measurement too, not just subsequent changes. Guarding against
       w<=0/h<=0 keeps a transient zero reading from ever reaching the
       renderer. ---- */
    var atmosphereSpan = 600;
    function applySize(w, h) {
      if (!(w > 0) || !(h > 0)) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (composer) composer.setSize(w, h);
      atmosphereSpan = h * 0.85;
    }
    function onResize() {
      applySize(window.innerWidth, window.innerHeight);
    }
    onResize();
    if ("ResizeObserver" in window) {
      // Observe the canvas itself, not <html>/<body>: this section makes
      // <html> hundreds of vh tall on purpose (the hero's scroll-through
      // range), so its own content-box height is the *document's* height,
      // not the viewport's. The canvas is `position:fixed` with a
      // percentage size, so its box resolves against the viewport (the
      // fixed-position containing block) regardless of document length.
      var resizeObserver = new ResizeObserver(function (entries) {
        var box = entries[0].contentRect;
        applySize(Math.round(box.width), Math.round(box.height));
        onScroll();
      });
      resizeObserver.observe(canvas);
    }

    /* ---- scroll (read-only; never drives scroll) ----
       `t` still comes from the hero section's own scroll-through range
       (unchanged). `atmosphere` eases in over a fixed distance once the
       user has scrolled past the hero's bottom edge, and holds at 1
       for the rest of the page. ---- */
    var ticking = false;
    function pinnedRange() {
      return section.offsetHeight - window.innerHeight;
    }
    function onScrollUpdate() {
      ticking = false;
      var range = pinnedRange();
      var rect = section.getBoundingClientRect();
      var t = range <= 0 ? 0 : clamp01(-rect.top / range);
      var pastIntro = Math.max(0, -rect.bottom);
      var atmosphere = clamp01(pastIntro / atmosphereSpan);
      setT(t, atmosphere);
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(onScrollUpdate);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    /* ---- idle motion + render loop, paused only when the tab itself
       is hidden -- the canvas is a full-viewport fixed layer now, so
       it's always "on screen" in the scroll sense; there is no section
       to intersection-observe against. ---- */
    var running = false;
    function frame() {
      if (!running) return;
      window.requestAnimationFrame(frame);
      var elapsed = clock.getElapsedTime();
      engineGroup.rotation.y = elapsed * 0.0045; // ~1 turn per ~23 min: alive, never desyncs the path
      ground.rotation.y = -elapsed * 0.0015; // stage turns the other way, slower: a mechanism, not a merry-go-round

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

      if (composer) composer.render(); else renderer.render(scene, camera);
    }
    function start() { if (!running) { running = true; window.requestAnimationFrame(frame); } }
    function stop() { running = false; }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });

    /* QA-only: ?engine_t=0.25 and/or ?engine_atmo=0.5 force the initial
       composition to those scroll-progress values (still fully
       interpolated -- no different code path) for deterministic
       screenshot capture. Inert for any visitor who doesn't type that
       query string. */
    var qaT = /[?&]engine_t=([\d.]+)/.exec(location.search);
    var qaAtmo = /[?&]engine_atmo=([\d.]+)/.exec(location.search);
    setT(qaT ? parseFloat(qaT[1]) : 0, qaAtmo ? parseFloat(qaAtmo[1]) : 0);
    if (composer) composer.render(); else renderer.render(scene, camera); // paint immediately -- don't wait for the first rAF tick
    start();

  }
})();
