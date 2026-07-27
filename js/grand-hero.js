import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

/* ── Grand hero: the wedding stage, alive ──
   The reference plate is drawn as the stage; the sitting cheetah model is
   loaded as-is and placed on the right platform. */

const canvas = document.getElementById('grand-hero-canvas');
const section = document.querySelector('.grand-hero');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const IMG_W = 2752, IMG_H = 1536;
const IMG_ASPECT = IMG_W / IMG_H;

// where the cheetah sits, in image UV (y = 0 at the bottom)
const CHEETAH_UV = { x: 0.800, y: 0.355 };
const CHEETAH_IMG_HEIGHT = 0.27;            // height as a fraction of the plate
const CHEETAH_DEPTH = 0.686;                // rock-layer depth for coherent parallax
const CHEETAH_ROTATION = {
  x: 0,
  y: 5.24,
  z: 0,
};
const CHEETAH_ROTATION_STORAGE_KEY = 'mwp:cheetahRotation';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getSavedCheetahRotation() {
  try {
    const saved = JSON.parse(localStorage.getItem(CHEETAH_ROTATION_STORAGE_KEY));
    if (!saved || typeof saved !== 'object') return {};
    return {
      x: Number.isFinite(saved.x) ? saved.x : undefined,
      y: Number.isFinite(saved.y) ? saved.y : undefined,
      z: Number.isFinite(saved.z) ? saved.z : undefined,
    };
  } catch {
    return {};
  }
}

const cheetahRotation = {
  ...CHEETAH_ROTATION,
  ...getSavedCheetahRotation(),
};

function saveCheetahRotation() {
  try {
    localStorage.setItem(CHEETAH_ROTATION_STORAGE_KEY, JSON.stringify(cheetahRotation));
  } catch {
    // Ignore private browsing/storage failures; the live drag still works.
  }
}

function fallbackImage() {
  const img = document.createElement('img');
  img.src = 'assets/grand-hero.png';
  img.alt = canvas.getAttribute('aria-label');
  img.className = 'grand-hero-fallback';
  canvas.replaceWith(img);
}

let renderer;
if (reduceMotion) {
  // reduced motion: the still plate, no WebGL at all
  fallbackImage();
} else {
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  } catch {
    fallbackImage();
  }
}

if (renderer) {
  renderer.setClearColor(0x550c06, 1);
  renderer.autoClear = false;
  renderer.localClippingEnabled = true;

  /* ── Scene 1: the parallax plate (ortho fullscreen quad) ── */
  const plateScene = new THREE.Scene();
  const plateCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const loader = new THREE.TextureLoader();
  // NoColorSpace: the shader passes texels straight through, so the plate
  // displays exactly as authored (ShaderMaterial skips output encoding)
  const tPlate = loader.load('assets/grand-hero.png');
  tPlate.colorSpace = THREE.NoColorSpace;
  const tDepth = loader.load('assets/grand-hero-depth.jpg');

  const uniforms = {
    tPlate: { value: tPlate },
    tDepth: { value: tDepth },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uTime: { value: 0 },
    uUvScale: { value: new THREE.Vector2(1, 1) },
    uUvOffset: { value: new THREE.Vector2(0, 0) },
    uStrength: { value: 0.022 },
  };

  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }`,
      fragmentShader: /* glsl */`
        uniform sampler2D tPlate, tDepth;
        uniform vec2 uMouse, uUvScale, uUvOffset;
        uniform float uTime, uStrength;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv * uUvScale + uUvOffset;

          // depth-weighted parallax: far layers still, foreground moves more.
          // Keep the central jeweled ring stable so it remains the visual anchor.
          float depth = texture2D(tDepth, uv).r;
          vec2 ringCenter = vec2(0.503, 0.625);
          float outerRing = length((uv - ringCenter) / vec2(0.235, 0.330));
          float innerRing = length((uv - ringCenter) / vec2(0.143, 0.230));
          float ringMask = smoothstep(1.08, 0.96, outerRing) * smoothstep(0.86, 1.0, innerRing);
          depth = mix(depth, 0.35, ringMask);
          uv += uMouse * uStrength * (depth - 0.35);

          // water shimmer — ripple the reflections below the waterline
          float water = smoothstep(0.215, 0.165, uv.y);
          uv.x += sin(uv.y * 120.0 + uTime * 1.6) * 0.0015 * water;
          uv.y += sin(uv.x * 90.0 + uTime * 1.1) * 0.0009 * water;

          vec4 col = texture2D(tPlate, uv);

          // jewels, garlands and the gold path catch the light —
          // hashed phase so it sparkles instead of striping
          vec2 sunUv = vec2(0.965, 0.945);
          float lum = dot(col.rgb, vec3(0.299, 0.587, 0.114));
          float warm = max(col.r - col.b, 0.0);
          float h = fract(sin(dot(floor(uv * 480.0), vec2(12.9898, 78.233))) * 43758.5453);
          float tw = sin(uTime * 2.6 + h * 6.2832);
          float sunMask = smoothstep(0.10, 0.28, distance(uv, sunUv));
          col.rgb += col.rgb * smoothstep(0.72, 0.95, lum) * warm * tw * 0.25 * sunMask;

          // the sun breathes
          vec2 sd = (uv - sunUv) * vec2(1.0, 0.58);
          float glow = exp(-dot(sd, sd) * 55.0) * (0.10 + 0.06 * sin(uTime * 0.7));
          col.rgb += vec3(1.0, 0.85, 0.58) * glow;

          gl_FragColor = col;
        }`,
    })
  );
  plateScene.add(plate);

  /* ── Scene 2: the cheetah + gold dust (perspective, drawn on top) ── */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 20);
  camera.position.z = 3;

  scene.add(new THREE.AmbientLight(0xffe2b8, 1.8));
  const sun = new THREE.DirectionalLight(0xffe0a8, 3.4);
  sun.position.set(2.5, 3, 2);
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0x9fc4ff, 0.9);
  rim.position.set(-2, 1, 1);
  scene.add(rim);

  /* Gold statue fallback if the supplied FBX cannot load. */
  const cheetah = new THREE.Group();
  const platformClip = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  let cheetahModel = null;
  let cheetahMixer = null;

  function applyCheetahRotation() {
    if (!cheetahModel) return;
    cheetahModel.rotation.set(cheetahRotation.x, cheetahRotation.y, cheetahRotation.z);
  }

  window.MWP_CHEETAH_ROTATION = {
    get: () => ({ ...cheetahRotation }),
    set: (next) => {
      if (!next || typeof next !== 'object') return;
      if (Number.isFinite(next.x)) cheetahRotation.x = next.x;
      if (Number.isFinite(next.y)) cheetahRotation.y = next.y;
      if (Number.isFinite(next.z)) cheetahRotation.z = next.z;
      applyCheetahRotation();
      saveCheetahRotation();
    },
    reset: () => {
      Object.assign(cheetahRotation, CHEETAH_ROTATION);
      applyCheetahRotation();
      saveCheetahRotation();
    },
  };

  function buildStatue() {
    const gold = new THREE.MeshPhongMaterial({
      color: 0xcda45f, specular: 0xfff0c8, shininess: 55, emissive: 0x2a1c08,
    });
    const g = new THREE.Group();

    // seated feline: tall S-curve — haunch low, chest high, small head
    const haunch = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 18), gold);
    haunch.scale.set(0.95, 1.1, 0.7);
    haunch.position.set(-0.07, 0.26, 0);
    g.add(haunch);

    const spine = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 14), gold);
    spine.scale.set(0.9, 1.5, 0.62);
    spine.position.set(0.06, 0.45, 0);
    spine.rotation.z = -0.35;
    g.add(spine);

    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 18), gold);
    chest.scale.set(0.85, 1.35, 0.6);
    chest.position.set(0.17, 0.62, 0);
    chest.rotation.z = -0.12;
    g.add(chest);

    for (const s of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.042, 0.5, 12), gold);
      leg.position.set(0.245, 0.25, 0.065 * s);
      g.add(leg);
      const paw = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), gold);
      paw.scale.set(1.6, 0.6, 1);
      paw.position.set(0.28, 0.025, 0.065 * s);
      g.add(paw);
    }

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.085, 0.24, 14), gold);
    neck.position.set(0.23, 0.83, 0);
    neck.rotation.z = -0.18;
    g.add(neck);

    const head = new THREE.Group();
    head.position.set(0.26, 0.96, 0);
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.095, 22, 16), gold);
    skull.scale.set(1, 0.95, 0.85);
    head.add(skull);
    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10), gold);
    muzzle.scale.set(1.25, 0.7, 0.8);
    muzzle.position.set(0.075, -0.025, 0);
    head.add(muzzle);
    for (const s of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.065, 10), gold);
      ear.position.set(-0.025, 0.095, 0.055 * s);
      ear.rotation.x = 0.3 * s;
      head.add(ear);
    }
    g.add(head);

    // tail: hangs off the platform edge, tip curling and swishing
    let parent = g;
    for (let i = 0; i < 6; i++) {
      const seg = new THREE.Group();
      seg.position.set(i === 0 ? -0.22 : 0, i === 0 ? 0.24 : -0.105, 0);
      const bone = new THREE.Mesh(new THREE.CapsuleGeometry(0.023 - i * 0.0022, 0.1, 4, 10), gold);
      bone.position.y = -0.055;
      seg.add(bone);
      seg.rotation.z = i === 0 ? -0.5 : 0.16;   // drops down, tip curling outward
      parent.add(seg);
      parent = seg;
    }

    g.rotation.y = 2.5;   // seated, gazing toward the arch
    cheetah.add(g);
  }

  const fbxLoader = new FBXLoader();
  fbxLoader.loadAsync('assets/SIT.Fbx').then((model) => {
      if (model.animations.length) {
        cheetahMixer = new THREE.AnimationMixer(model);
        const sitAction = cheetahMixer.clipAction(model.animations[0]);
        sitAction.setLoop(THREE.LoopRepeat);
        sitAction.play();
      }
      model.traverse((o) => {
        if (o.isMesh && o.material) {
          o.material.transparent = true;
          o.material.alphaTest = 0.35;
          o.material.side = THREE.DoubleSide;
          o.material.clippingPlanes = [platformClip];
          o.material.clipShadows = true;
        }
      });
      model.updateMatrixWorld(true);
      // measure the actual skinned pose, not the (often stretched) bind pose
      const box = new THREE.Box3();
      const tmp = new THREE.Box3();
      model.traverse((o) => {
        if (o.isSkinnedMesh) {
          o.computeBoundingBox();
          box.union(tmp.copy(o.boundingBox).applyMatrix4(o.matrixWorld));
        } else if (o.isMesh) {
          o.geometry.computeBoundingBox();
          box.union(tmp.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld));
        }
      });
      const size = box.getSize(new THREE.Vector3());
      // unit height, but never let a long animal outgrow the platform
      const scale = Math.min(1.02 / size.y, 1.75 / Math.max(size.x, size.z));
      model.scale.setScalar(scale);
      cheetahModel = model;
      applyCheetahRotation();
      const center = box.getCenter(new THREE.Vector3());
      const off = new THREE.Vector3(-center.x, 0, -center.z)
        .multiplyScalar(scale)
        .applyEuler(model.rotation);
      model.position.set(off.x, -box.min.y * scale, off.z);
      cheetah.add(model);
    }).catch(() => buildStatue());
  scene.add(cheetah);

  // gold dust drifting up through the scene
  const COUNT = 60;
  const pos = new Float32Array(COUNT * 3);
  const speed = new Float32Array(COUNT);
  const phase = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 4.4;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 2.6;
    pos[i * 3 + 2] = -0.4 + Math.random() * 0.8;
    speed[i] = 0.04 + Math.random() * 0.09;
    phase[i] = Math.random() * Math.PI * 2;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      color: 0xe3c285, size: 0.016, sizeAttenuation: true,
      transparent: true, opacity: 0.5, depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  scene.add(dust);

  /* ── cover-fit + anchoring ── */
  const cover = { sx: 1, sy: 1, ox: 0, oy: 0 };

  function resize() {
    const w = section.clientWidth, h = section.clientHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    const va = w / h;
    const zoom = 1.04;   // overscan so parallax never reveals an edge
    let sx, sy;
    if (va > IMG_ASPECT) { sx = 1; sy = IMG_ASPECT / va; }
    else { sx = va / IMG_ASPECT; sy = 1; }
    cover.sx = sx / zoom; cover.sy = sy / zoom;
    cover.ox = (1 - cover.sx) / 2;
    cover.oy = (1 - cover.sy) / 2;
    uniforms.uUvScale.value.set(cover.sx, cover.sy);
    uniforms.uUvOffset.value.set(cover.ox, cover.oy);
    uniforms.uStrength.value = w < 700 ? 0.012 : 0.022;
    placeCheetah();
  }

  const anchor = new THREE.Vector3();
  function placeCheetah() {
    // image UV → screen fraction → world at z=0
    const sx = (CHEETAH_UV.x - cover.ox) / cover.sx;
    const sy = (CHEETAH_UV.y - cover.oy) / cover.sy;
    const half = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    anchor.set((sx * 2 - 1) * half * camera.aspect, (sy * 2 - 1) * half, 0);
    platformClip.constant = -(anchor.y - 0.012);
    const worldH = (CHEETAH_IMG_HEIGHT / cover.sy) * 2 * half;
    cheetah.scale.setScalar(worldH);
    cheetah.position.copy(anchor);
  }
  resize();
  window.addEventListener('resize', resize);

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const dragRotation = {
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0,
  };

  section.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('a, button')) return;
    dragRotation.active = true;
    dragRotation.pointerId = e.pointerId;
    dragRotation.startX = e.clientX;
    dragRotation.startY = e.clientY;
    dragRotation.baseX = cheetahRotation.x;
    dragRotation.baseY = cheetahRotation.y;
    section.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  section.addEventListener('pointermove', (e) => {
    if (dragRotation.active && e.pointerId === dragRotation.pointerId) {
      const dx = e.clientX - dragRotation.startX;
      const dy = e.clientY - dragRotation.startY;
      cheetahRotation.y = dragRotation.baseY + dx * 0.01;
      cheetahRotation.x = clamp(dragRotation.baseX + dy * 0.01, -Math.PI / 2, Math.PI / 2);
      applyCheetahRotation();
      e.preventDefault();
      return;
    }
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  section.addEventListener('pointerup', (e) => {
    if (!dragRotation.active || e.pointerId !== dragRotation.pointerId) return;
    dragRotation.active = false;
    dragRotation.pointerId = null;
    saveCheetahRotation();
  });
  section.addEventListener('pointercancel', (e) => {
    if (!dragRotation.active || e.pointerId !== dragRotation.pointerId) return;
    dragRotation.active = false;
    dragRotation.pointerId = null;
    saveCheetahRotation();
  });
  section.addEventListener('pointerleave', () => {
    if (dragRotation.active) return;
    mouse.tx = 0;
    mouse.ty = 0;
  });

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  const clock = new THREE.Clock();
  function renderFrame(t) {
    const delta = clock.getDelta();
    mouse.x += (mouse.tx - mouse.x) * 0.045;
    mouse.y += (mouse.ty - mouse.y) * 0.045;

    if (cheetahMixer) cheetahMixer.update(delta);

    uniforms.uTime.value = t;
    uniforms.uMouse.value.set(mouse.x, -mouse.y);

    const half = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const k = uniforms.uStrength.value * (CHEETAH_DEPTH - 0.35);
    cheetah.position.set(
      anchor.x - (mouse.x * k / cover.sx) * 2 * half * camera.aspect,
      anchor.y + (mouse.y * k / cover.sy) * 2 * half,
      0
    );

    const p = dustGeo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      p[i * 3 + 1] += speed[i] * 0.016;
      p[i * 3] += Math.sin(t * 0.6 + phase[i]) * 0.0007;
      if (p[i * 3 + 1] > 1.4) p[i * 3 + 1] = -1.4;
    }
    dustGeo.attributes.position.needsUpdate = true;

    renderer.clear();
    renderer.render(plateScene, plateCamera);
    renderer.clearDepth();
    renderer.render(scene, camera);
  }

  const start = performance.now();
  renderer.setAnimationLoop((now) => {
    if (visible && !document.hidden) renderFrame((now - start) / 1000);
  });
}
