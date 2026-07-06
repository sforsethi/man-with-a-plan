import * as THREE from 'three';

/* ── Scroll reveals ── */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveals = document.querySelectorAll('.reveal');
if (reduceMotion) {
  reveals.forEach((el) => el.classList.add('in'));
} else {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }),
    { threshold: 0.15 }
  );
  reveals.forEach((el) => io.observe(el));
}

/* ── Hero: the leopard medallion, gently alive ── */
const canvas = document.getElementById('leopard-canvas');

function fallbackImage() {
  const img = document.createElement('img');
  img.src = 'assets/leopard.png';
  img.alt = 'The MWP leopard emblem';
  canvas.replaceWith(img);
}

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
} catch {
  fallbackImage();
}

if (renderer) {
  // opaque clear in the exact page maroon: the canvas disappears into the
  // flat hero background and alpha-fringe artifacts can't occur
  renderer.setClearColor(0x550c06, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 20);
  camera.position.z = 3.0;

  // The approved artwork, as-is (texture is 410 x 572)
  const ASPECT = 410 / 572;
  const tex = new THREE.TextureLoader().load('assets/leopard.png', () => {
    if (reduceMotion) {
      leopard.material.opacity = 1;
      dust.material.opacity = 0.4;
      renderer.render(scene, camera);
    }
  });
  tex.colorSpace = THREE.SRGBColorSpace;
  const leopard = new THREE.Mesh(
    new THREE.PlaneGeometry(2 * ASPECT, 2),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0 })
  );
  scene.add(leopard);

  // Gold dust — a few slow motes rising around the medallion
  const COUNT = 70;
  const pos = new Float32Array(COUNT * 3);
  const speed = new Float32Array(COUNT);
  const phase = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 2.6;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 2.6;
    pos[i * 3 + 2] = 0.2 + Math.random() * 0.4;
    speed[i] = 0.05 + Math.random() * 0.1;
    phase[i] = Math.random() * Math.PI * 2;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      color: 0xe3c285, size: 0.018, sizeAttenuation: true,
      transparent: true, opacity: 0, depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  scene.add(dust);

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // Mouse parallax (hero only), eased
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  document.querySelector('.hero').addEventListener('pointermove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  const start = performance.now();
  function renderTick(now) {
    const t = (now - start) / 1000;

    // fade in on load
    const intro = Math.min(1, t / 1.8);
    leopard.material.opacity = intro;
    dust.material.opacity = intro * 0.55;

    // breathe, sway, follow the cursor — all very small
    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;
    leopard.rotation.z = Math.sin(t * 0.35) * 0.012;
    leopard.rotation.y = mouse.x * 0.07;
    leopard.rotation.x = mouse.y * 0.04;
    leopard.position.y = Math.sin(t * 0.5) * 0.012;
    const breathe = 1 + Math.sin(t * 0.55) * 0.005;
    leopard.scale.set(breathe, breathe, 1);

    const p = dustGeo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      p[i * 3 + 1] += speed[i] * 0.016;
      p[i * 3] += Math.sin(t * 0.6 + phase[i]) * 0.0006;
      if (p[i * 3 + 1] > 1.4) p[i * 3 + 1] = -1.4;
    }
    dustGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  const alwaysRender = new URLSearchParams(location.search).has('always');
  if (!reduceMotion) {
    renderer.setAnimationLoop((now) => {
      if (alwaysRender || (visible && !document.hidden)) renderTick(now);
    });
  }
}
