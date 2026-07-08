import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const loader = new FBXLoader();

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
  loader.load('assets/SIT.Fbx', (fbx) => {
    model = fbx;
    applyFurMaterial(model);
    normalizeModel(model, 3.4);
    model.rotation.set(-0.04, 5.08, 0.01);
    model.position.set(1.42, -1.55, 0);
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

  const streaks = new THREE.Group();
  const streakMaterial = new THREE.MeshBasicMaterial({ color: 0xf3d28b, transparent: true, opacity: 0.24 });
  for (let i = 0; i < 34; i++) {
    const streak = new THREE.Mesh(new THREE.PlaneGeometry(0.035, 2.5), streakMaterial);
    streak.rotation.x = -Math.PI / 2;
    streak.position.set((Math.random() - 0.5) * 12, -0.58, -Math.random() * 18);
    streaks.add(streak);
  }
  scene.add(streaks);

  let mixer = null;
  let model = null;
  loader.load('assets/RUN.Fbx', (fbx) => {
    model = fbx;
    applyFurMaterial(model);
    normalizeModel(model, 1.75);
    model.rotation.set(0.03, Math.PI, 0);
    model.position.set(0, -0.62, 0.5);
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
    streaks.children.forEach((streak, i) => {
      streak.position.z += delta * (5.5 + (i % 5));
      if (streak.position.z > 5) streak.position.z = -18 - Math.random() * 5;
    });
    camera.position.x = Math.sin(now * 0.0017) * 0.035;
    camera.position.y = 1.2 + Math.sin(now * 0.0024) * 0.035;
    camera.lookAt(0, 0.95, 0);
    renderer.render(scene, camera);
  });

  return renderer;
}

createPortraitScene();
createRunScene();
