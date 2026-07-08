import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const loader = new FBXLoader();
const TUNING_STORAGE_KEY = 'mwp:storySceneTuning:v2';
const DEFAULT_TUNING = {
  portrait: {
    rotation: { x: -0.04, y: 5.08, z: 0.01 },
    position: { x: 1.42, y: -1.55, z: 0 },
  },
  run: {
    rotation: { x: 4.542, y: -0.025, z: 0 },
    position: { x: 0.238, y: -0.714, z: 0.512 },
  },
};

function cloneTuning(value) {
  return JSON.parse(JSON.stringify(value));
}

function readTuning() {
  try {
    const saved = JSON.parse(localStorage.getItem(TUNING_STORAGE_KEY));
    return {
      portrait: {
        rotation: { ...DEFAULT_TUNING.portrait.rotation, ...saved?.portrait?.rotation },
        position: { ...DEFAULT_TUNING.portrait.position, ...saved?.portrait?.position },
      },
      run: {
        rotation: { ...DEFAULT_TUNING.run.rotation, ...saved?.run?.rotation },
        position: { ...DEFAULT_TUNING.run.position, ...saved?.run?.position },
      },
    };
  } catch {
    return cloneTuning(DEFAULT_TUNING);
  }
}

const tuning = readTuning();

function saveTuning() {
  try {
    localStorage.setItem(TUNING_STORAGE_KEY, JSON.stringify(tuning));
  } catch {
    // Storage can fail in private browsing; live tuning still works.
  }
}

function formatVector(vector) {
  return `x: ${vector.x.toFixed(3)}, y: ${vector.y.toFixed(3)}, z: ${vector.z.toFixed(3)}`;
}

function ensureTuningOverlay() {
  let overlay = document.querySelector('.scene-tuning-panel');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.className = 'scene-tuning-panel';
  overlay.innerHTML = `
    <strong>Scene tuning</strong>
    <span data-scene-name>Slide 2 cheetah</span>
    <span>Drag: rotate · Shift-drag: move X/Y · Option-drag: move Z</span>
    <code data-scene-rotation></code>
    <code data-scene-position></code>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

function updateTuningOverlay(sceneName) {
  const overlay = ensureTuningOverlay();
  const values = tuning[sceneName];
  overlay.querySelector('[data-scene-name]').textContent = 'Slide 2 cheetah';
  overlay.querySelector('[data-scene-rotation]').textContent = `rotation { ${formatVector(values.rotation)} }`;
  overlay.querySelector('[data-scene-position]').textContent = `position { ${formatVector(values.position)} }`;
}

function applyTuning(model, sceneName) {
  const values = tuning[sceneName];
  model.rotation.set(values.rotation.x, values.rotation.y, values.rotation.z);
  model.position.set(values.position.x, values.position.y, values.position.z);
}

function createDragTuner({ canvas, modelRef, sceneName }) {
  const target = canvas.closest('.story-screen') || canvas;
  const drag = {
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    baseRotationX: 0,
    baseRotationY: 0,
    basePositionX: 0,
    basePositionY: 0,
    basePositionZ: 0,
  };

  canvas.style.cursor = 'grab';
  canvas.style.touchAction = 'none';
  target.style.cursor = 'grab';
  target.style.touchAction = 'none';

  target.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    if (event.target.closest('a, button')) return;
    drag.active = true;
    drag.pointerId = event.pointerId;
    drag.startX = event.clientX;
    drag.startY = event.clientY;
    drag.baseRotationX = tuning[sceneName].rotation.x;
    drag.baseRotationY = tuning[sceneName].rotation.y;
    drag.basePositionX = tuning[sceneName].position.x;
    drag.basePositionY = tuning[sceneName].position.y;
    drag.basePositionZ = tuning[sceneName].position.z;
    target.setPointerCapture(event.pointerId);
    canvas.style.cursor = 'grabbing';
    target.style.cursor = 'grabbing';
    updateTuningOverlay(sceneName);
    event.preventDefault();
  });

  target.addEventListener('pointermove', (event) => {
    if (!drag.active || event.pointerId !== drag.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (event.shiftKey) {
      tuning[sceneName].position.x = drag.basePositionX + dx * 0.01;
      tuning[sceneName].position.y = drag.basePositionY - dy * 0.01;
    } else if (event.altKey) {
      tuning[sceneName].position.z = drag.basePositionZ + dy * 0.01;
    } else {
      tuning[sceneName].rotation.y = drag.baseRotationY + dx * 0.01;
      tuning[sceneName].rotation.x = drag.baseRotationX + dy * 0.01;
    }
    if (modelRef.current) applyTuning(modelRef.current, sceneName);
    updateTuningOverlay(sceneName);
    event.preventDefault();
  });

  function endDrag(event) {
    if (!drag.active || event.pointerId !== drag.pointerId) return;
    drag.active = false;
    drag.pointerId = null;
    canvas.style.cursor = 'grab';
    target.style.cursor = 'grab';
    saveTuning();
    updateTuningOverlay(sceneName);
  }

  target.addEventListener('pointerup', endDrag);
  target.addEventListener('pointercancel', endDrag);
}

window.MWP_STORY_TUNING = {
  get: () => cloneTuning(tuning),
  reset: () => {
    Object.assign(tuning.portrait.rotation, DEFAULT_TUNING.portrait.rotation);
    Object.assign(tuning.portrait.position, DEFAULT_TUNING.portrait.position);
    Object.assign(tuning.run.rotation, DEFAULT_TUNING.run.rotation);
    Object.assign(tuning.run.position, DEFAULT_TUNING.run.position);
    saveTuning();
    location.reload();
  },
};

function fitRenderer(renderer, canvas, camera) {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function applyFurMaterial(model) {
  model.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    const materials = Array.isArray(o.material) ? o.material : [o.material];
    materials.forEach((material) => {
      material.transparent = true;
      material.alphaTest = 0.35;
      material.side = THREE.DoubleSide;
    });
  });
}

function normalizeModel(model, targetHeight) {
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const scale = targetHeight / Math.max(size.y, 0.001);
  model.scale.setScalar(scale);
  model.updateMatrixWorld(true);
  const scaledBox = new THREE.Box3().setFromObject(model);
  const center = scaledBox.getCenter(new THREE.Vector3());
  model.position.sub(center);
  model.position.y -= scaledBox.min.y - center.y;
}

function createPortraitScene() {
  const canvas = document.getElementById('cheetah-face-canvas');
  const section = document.querySelector('.cheetah-intro');
  if (!canvas || !section || reduceMotion) return null;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 30);
  camera.position.set(0, 0.45, 4.5);

  scene.add(new THREE.AmbientLight(0xffd2a0, 1.35));
  const key = new THREE.DirectionalLight(0xffcf92, 2.6);
  key.position.set(-2.2, 2.8, 3.4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x6f3f2d, 1.2);
  rim.position.set(2.8, 1.2, -1.6);
  scene.add(rim);

  let mixer = null;
  let model = null;
  const modelRef = { current: null };
  loader.load('assets/SIT.Fbx', (fbx) => {
    model = fbx;
    modelRef.current = model;
    applyFurMaterial(model);
    normalizeModel(model, 3.4);
    applyTuning(model, 'portrait');
    scene.add(model);

    if (model.animations.length) {
      mixer = new THREE.AnimationMixer(model);
      const action = mixer.clipAction(model.animations[0]);
      action.setLoop(THREE.LoopRepeat);
      action.play();
    }
  });

  fitRenderer(renderer, canvas, camera);
  window.addEventListener('resize', () => fitRenderer(renderer, canvas, camera));

  let visible = true;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(section);

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const delta = clock.getDelta();
    if (!visible || document.hidden) return;
    if (mixer) mixer.update(delta * 0.45);
    renderer.render(scene, camera);
  });

  return renderer;
}

function createRunScene() {
  const canvas = document.getElementById('cheetah-run-canvas');
  const section = document.querySelector('.run-hero');
  if (!canvas || !section || reduceMotion) return null;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xcaa76e, 0.055);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
  camera.position.set(0, 1.2, 5.8);
  camera.lookAt(0, 0.95, 0);

  scene.add(new THREE.AmbientLight(0xffd3a2, 1.15));
  const sun = new THREE.DirectionalLight(0xffe1a8, 3.1);
  sun.position.set(-3, 4.2, 2.8);
  scene.add(sun);
  const groundLight = new THREE.DirectionalLight(0x7b3a1f, 1.2);
  groundLight.position.set(1.5, -1, 2);
  scene.add(groundLight);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x8d5a31, transparent: true, opacity: 0.42 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.62;
  scene.add(ground);

  let mixer = null;
  let model = null;
  const modelRef = { current: null };
  createDragTuner({ canvas, modelRef, sceneName: 'run' });
  updateTuningOverlay('run');
  loader.load('assets/RUN.Fbx', (fbx) => {
    model = fbx;
    modelRef.current = model;
    applyFurMaterial(model);
    normalizeModel(model, 1.75);
    applyTuning(model, 'run');
    scene.add(model);

    if (model.animations.length) {
      mixer = new THREE.AnimationMixer(model);
      const action = mixer.clipAction(model.animations[0]);
      action.setLoop(THREE.LoopRepeat);
      action.play();
    }
  });

  fitRenderer(renderer, canvas, camera);
  window.addEventListener('resize', () => fitRenderer(renderer, canvas, camera));

  let visible = true;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(section);

  const clock = new THREE.Clock();
  renderer.setAnimationLoop((now) => {
    const delta = clock.getDelta();
    if (!visible || document.hidden) return;
    if (mixer) mixer.update(delta * 1.18);
    camera.position.x = Math.sin(now * 0.0017) * 0.035;
    camera.position.y = 1.2 + Math.sin(now * 0.0024) * 0.035;
    camera.lookAt(0, 0.95, 0);
    renderer.render(scene, camera);
  });

  return renderer;
}

createPortraitScene();
createRunScene();
