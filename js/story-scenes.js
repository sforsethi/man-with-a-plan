import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const LiquidMetalShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uFlowStrength: { value: 0 },
    uTint: { value: new THREE.Color(0xd0a15a) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uFlowStrength;
    uniform vec3 uTint;
    varying vec2 vUv;

    void main() {
      float broadWave = sin(vUv.y * 18.0 + vUv.x * 7.0 + uTime * 0.72);
      float crossWave = cos(vUv.x * 22.0 - vUv.y * 5.0 - uTime * 0.58);
      vec2 liquidFlow = vec2(crossWave, broadWave) * 0.00115 * uFlowStrength;
      vec2 distortedUv = vUv + liquidFlow;
      distortedUv = clamp(distortedUv, vec2(0.002), vec2(0.998));

      vec2 fromCenter = vUv - 0.5;
      float edgeAmt = pow(clamp(length(fromCenter) * 1.35, 0.0, 1.0), 2.2);
      vec2 caOffset = fromCenter * edgeAmt * 0.014;

      vec4 sceneColor = texture2D(tDiffuse, distortedUv);
      sceneColor.r = texture2D(tDiffuse, distortedUv + caOffset).r;
      sceneColor.b = texture2D(tDiffuse, distortedUv - caOffset).b;
      float metalCrest = pow(max(0.0, broadWave * 0.5 + crossWave * 0.5), 8.0);
      vec3 metalTint = mix(vec3(0.68, 0.73, 0.76), uTint, 0.38);
      sceneColor.rgb += metalTint * metalCrest * 0.035 * uFlowStrength;
      gl_FragColor = sceneColor;
    }
  `,
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const loader = new FBXLoader();
let lastStoryScrollAt = performance.now();
window.addEventListener('scroll', () => { lastStoryScrollAt = performance.now(); }, { passive: true });
let experienceStarted = false;
let experienceStartedAt = null;
const OPENING_CAMERA_DURATION = 2200;

function beginExperience() {
  if (experienceStarted) return;
  experienceStarted = true;
  experienceStartedAt = performance.now();
  document.body.classList.add('experience-started');
  lastStoryScrollAt = performance.now();
}

const beginExperienceButton = document.getElementById('begin-experience');
beginExperienceButton?.addEventListener('click', beginExperience);

// Bump this when a composed scene's baseline changes so an old drag-tuning
// value cannot keep the opening portrait framed off-canvas.
const TUNING_STORAGE_KEY = 'mwp:storySceneTuning:v3';
const DEFAULT_TUNING = {
  portrait: {
    // A complete, seated portrait facing the visitor — rather than the
    // previous extreme right-hand close crop, which exposed only the tail.
    rotation: { x: -0.04, y: 1.94, z: 0.01 },
    position: { x: 0.28, y: -0.98, z: 0 },
  },
  run: {
    rotation: { x: 4.542, y: -0.025, z: 0 },
    position: { x: 0.238, y: -0.714, z: 0.512 },
  },
};
const RUN_SCROLL_KEYFRAMES = [
  {
    progress: 0,
    rotation: { x: 7.957, y: 3.150, z: 0 },
    position: { x: 0.5, y: -0.58, z: 0.4 },
  },
  {
    progress: 0.38,
    rotation: { x: 7.957, y: 3.150, z: 0 },
    position: { x: 0.38, y: -0.58, z: -0.25 },
  },
  {
    progress: 1,
    rotation: { x: 7.957, y: 3.150, z: 0 },
    position: { x: 1.2, y: -0.58, z: -4.2 },
  },
];

const RUN_DESTINATIONS = [
  { name: 'DELHI', x: 1.8, z: 1.52, start: 0.020, end: 0.095, cameraAngle: -0.62, cameraRadius: 5.25, cameraHeight: 0.72, lightAngle: -0.85, lightColor: 0xff68ad, accentColor: 0xd72573 },
  { name: 'UDAIPUR', x: -1.8, z: 1.21, start: 0.110, end: 0.185, cameraAngle: -0.90, cameraRadius: 4.55, cameraHeight: 0.54, lightAngle: -1.15, lightColor: 0x28c8c1, accentColor: 0x397fd6 },
  { name: 'MUMBAI', x: 1.8, z: 0.90, start: 0.200, end: 0.275, cameraAngle: 0.88, cameraRadius: 4.50, cameraHeight: 0.68, lightAngle: 1.18, lightColor: 0x3d6eff, accentColor: 0x657bd8 },
  { name: 'INDORE', x: -1.8, z: 0.28, start: 0.290, end: 0.365, cameraAngle: -0.40, cameraRadius: 4.35, cameraHeight: 0.52, lightAngle: -0.52, lightColor: 0xf0805f, accentColor: 0xe0b36a },
  { name: 'GOA', x: 1.8, z: -0.34, start: 0.380, end: 0.455, cameraAngle: 0.52, cameraRadius: 5.05, cameraHeight: 1.04, lightAngle: 0.92, lightColor: 0xd8c08d, accentColor: 0x8f4d38 },
  { name: 'KOLKATA', x: -1.8, z: -0.96, start: 0.470, end: 0.545, cameraAngle: 0.12, cameraRadius: 4.10, cameraHeight: 0.58, lightAngle: 0.20, lightColor: 0x91a9c7, accentColor: 0xd9c394 },
  { name: 'BANGALORE', x: 1.8, z: -1.58, start: 0.560, end: 0.635, cameraAngle: 0.58, cameraRadius: 4.80, cameraHeight: 0.90, lightAngle: 0.72, lightColor: 0xe43c32, accentColor: 0xff7956 },
  { name: 'ISTANBUL', x: -1.8, z: -2.20, start: 0.650, end: 0.725, cameraAngle: -0.90, cameraRadius: 4.55, cameraHeight: 0.54, lightAngle: -1.15, lightColor: 0x28c8c1, accentColor: 0x397fd6 },
  { name: 'HUA HIN', x: 1.8, z: -2.82, start: 0.740, end: 0.815, cameraAngle: 0.18, cameraRadius: 5.15, cameraHeight: 1.02, lightAngle: 0.35, lightColor: 0xe0a340, accentColor: 0xa94d20 },
  { name: 'VENICE', x: -1.8, z: -3.44, start: 0.830, end: 0.965, cameraAngle: -0.72, cameraRadius: 4.75, cameraHeight: 0.78, lightAngle: -1.04, lightColor: 0x45ca78, accentColor: 0x2f8f70 },
];

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
  overlay.querySelector('[data-scene-name]').textContent = sceneName === 'portrait'
    ? 'Slide 1 cheetah'
    : 'Slide 2 cheetah';
  overlay.querySelector('[data-scene-rotation]').textContent = `rotation { ${formatVector(values.rotation)} }`;
  overlay.querySelector('[data-scene-position]').textContent = `position { ${formatVector(values.position)} }`;
}

function applyTuning(model, sceneName) {
  const values = tuning[sceneName];
  model.rotation.set(values.rotation.x, values.rotation.y, values.rotation.z);
  model.position.set(values.position.x, values.position.y, values.position.z);
}

function lerp(start, end, progress) {
  return start + (end - start) * progress;
}

function cubicBezierVector(from, controlA, controlB, to, progress) {
  const inverse = 1 - progress;
  return new THREE.Vector3(
    inverse ** 3 * from.x
      + 3 * inverse ** 2 * progress * controlA.x
      + 3 * inverse * progress ** 2 * controlB.x
      + progress ** 3 * to.x,
    inverse ** 3 * from.y
      + 3 * inverse ** 2 * progress * controlA.y
      + 3 * inverse * progress ** 2 * controlB.y
      + progress ** 3 * to.y,
    inverse ** 3 * from.z
      + 3 * inverse ** 2 * progress * controlA.z
      + 3 * inverse * progress ** 2 * controlB.z
      + progress ** 3 * to.z
  );
}

function interpolateVector(from, to, progress) {
  return {
    x: lerp(from.x, to.x, progress),
    y: lerp(from.y, to.y, progress),
    z: lerp(from.z, to.z, progress),
  };
}

function getDestinationMood(progress) {
  let from = RUN_DESTINATIONS[0];
  let to = RUN_DESTINATIONS[0];
  for (let i = 0; i < RUN_DESTINATIONS.length - 1; i++) {
    if (progress >= RUN_DESTINATIONS[i].start && progress <= RUN_DESTINATIONS[i + 1].start) {
      from = RUN_DESTINATIONS[i];
      to = RUN_DESTINATIONS[i + 1];
      break;
    }
    if (progress > RUN_DESTINATIONS[i + 1].start) {
      from = RUN_DESTINATIONS[i + 1];
      to = RUN_DESTINATIONS[i + 1];
    }
  }
  const rawBlend = to.start === from.start ? 0 : (progress - from.start) / (to.start - from.start);
  const blend = THREE.MathUtils.smoothstep(rawBlend, 0.12, 0.88);
  return {
    cameraAngle: lerp(from.cameraAngle, to.cameraAngle, blend),
    cameraRadius: lerp(from.cameraRadius, to.cameraRadius, blend),
    cameraHeight: lerp(from.cameraHeight, to.cameraHeight, blend),
    lightAngle: lerp(from.lightAngle, to.lightAngle, blend),
    lightColor: new THREE.Color(from.lightColor).lerp(new THREE.Color(to.lightColor), blend),
    accentColor: new THREE.Color(from.accentColor).lerp(new THREE.Color(to.accentColor), blend),
  };
}

function getRunScrollProgress() {
  const sequence = document.querySelector('.hero-sequence');
  if (!sequence) return 0;
  const rect = sequence.getBoundingClientRect();
  const scrollable = Math.max(sequence.offsetHeight - window.innerHeight, 1);
  const sequenceProgress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
  // Use nearly the full pinned journey: each destination gets a deliberate,
  // sustained shot while the cheetah continues running between locations.
  return Math.min(Math.max((sequenceProgress - 0.05) / 0.90, 0), 1);
}

function getRunScrollPose(progress) {
  let from = RUN_SCROLL_KEYFRAMES[0];
  let to = RUN_SCROLL_KEYFRAMES[RUN_SCROLL_KEYFRAMES.length - 1];
  for (let i = 0; i < RUN_SCROLL_KEYFRAMES.length - 1; i++) {
    if (progress >= RUN_SCROLL_KEYFRAMES[i].progress && progress <= RUN_SCROLL_KEYFRAMES[i + 1].progress) {
      from = RUN_SCROLL_KEYFRAMES[i];
      to = RUN_SCROLL_KEYFRAMES[i + 1];
      break;
    }
  }
  const localProgress = to.progress === from.progress
    ? 0
    : (progress - from.progress) / (to.progress - from.progress);
  return {
    rotation: interpolateVector(from.rotation, to.rotation, localProgress),
    position: interpolateVector(from.position, to.position, localProgress),
  };
}

function applyRunScrollPose(model, progress) {
  const pose = getRunScrollPose(progress);
  model.rotation.set(pose.rotation.x, pose.rotation.y, pose.rotation.z);
  model.position.set(pose.position.x, pose.position.y, pose.position.z);
  return pose;
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
      if ('emissive' in material) {
        material.emissive.set(0x1b0b02);
        material.emissiveIntensity = 0.28;
      }
    });
  });
}

function createFractureField(scene) {
  // Fracture debris is intentionally disabled; the running scene stays clean.
  return () => {};

  const group = new THREE.Group();
  const crackMaterial = new THREE.LineBasicMaterial({
    color: 0xd26c28,
    transparent: true,
    opacity: 0.48,
  });
  const pieces = [];

  // Stable pseudo-random values keep the fracture composition consistent on reload.
  let seed = 9137;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < 46; i++) {
    const trail = i / 45;
    const z = 1.3 - trail * 10.5;
    const side = i % 2 ? 1 : -1;
    const x = side * (0.22 + random() * 1.15) + Math.sin(i * 2.7) * 0.12;
    const points = [new THREE.Vector3(x * 0.1, -0.585, z)];
    for (let j = 1; j < 5; j++) {
      points.push(new THREE.Vector3(
        x * (j / 4) + Math.sin(i + j) * 0.065,
        -0.584,
        z + Math.cos(i * 1.7 + j) * 0.095
      ));
    }
    const crack = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), crackMaterial.clone());
    crack.userData = { trail, birthTravel: null };
    group.add(crack);
    pieces.push(crack);
  }

  const dustCount = 240;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    const trail = i / dustCount;
    dustPositions[i * 3] = (random() - 0.5) * (0.9 + trail * 2.8);
    dustPositions[i * 3 + 1] = -0.44 + random() * 0.62;
    dustPositions[i * 3 + 2] = 1.2 - trail * 11;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({
    color: 0xe58b43,
    size: 0.009,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.NormalBlending,
  }));
  group.add(dust);
  scene.add(group);

  let dustBirthTravel = null;
  return (progress, now, groundTravel) => {
    const fractureProgress = THREE.MathUtils.smoothstep(progress, 0.58, 0.94);
    pieces.forEach((piece) => {
      const fractureAge = THREE.MathUtils.clamp(
        (fractureProgress - piece.userData.trail) / 0.18,
        0,
        1
      );
      const reveal = THREE.MathUtils.smoothstep(fractureAge, 0, 0.28);
      piece.visible = reveal > 0.01;
      if (!piece.visible) {
        piece.userData.birthTravel = null;
        return;
      }
      if (piece.userData.birthTravel === null) piece.userData.birthTravel = groundTravel;
      const travelSinceImpact = groundTravel - piece.userData.birthTravel;
      if (piece.isMesh) {
        const burst = Math.sin(fractureAge * Math.PI);
        piece.position.x = piece.userData.baseX + piece.userData.scatterX * fractureAge;
        piece.position.y = piece.userData.baseY + burst * piece.userData.lift;
        piece.position.z = piece.userData.baseZ + travelSinceImpact + piece.userData.scatterZ * fractureAge;
        piece.rotation.x = piece.userData.baseRotation.x + piece.userData.spinX * fractureAge;
        piece.rotation.y = piece.userData.baseRotation.y + piece.userData.spinY * fractureAge;
        piece.rotation.z = piece.userData.baseRotation.z + piece.userData.spinZ * fractureAge;
        piece.material.emissiveIntensity = 0.06 + reveal * 0.22;
      } else {
        piece.position.z = travelSinceImpact;
        piece.material.opacity = reveal * 0.54;
      }
    });
    if (fractureProgress <= 0.001) {
      dustBirthTravel = null;
      dust.position.z = 0;
    } else if (dustBirthTravel === null) {
      dustBirthTravel = groundTravel;
    }
    dust.material.opacity = fractureProgress * 0.12;
    dust.position.z = dustBirthTravel === null ? 0 : groundTravel - dustBirthTravel;
    dust.position.y = Math.sin(now * 0.00045) * 0.035;
  };
}

function createGround(scene) {
  const surfaceOffset = (x, y) => {
    const broad = Math.sin(x * 0.72) * Math.cos(y * 0.34) * 0.026;
    const grain = Math.sin(x * 5.7 + y * 3.1) * 0.008 + Math.cos(x * 8.2 - y * 4.4) * 0.006;
    return broad + grain;
  };
  // A broad disc avoids the visible rectangular boundary of a conventional
  // floor plane while still extending well beyond every camera angle.
  const geometry = new THREE.CircleGeometry(22, 160);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    positions.setZ(i, surfaceOffset(x, y));
  }
  geometry.computeVertexNormals();

  const textureSize = 512;
  const data = new Uint8Array(textureSize * textureSize * 4);
  let seed = 4421;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  // Smooth value noise gives the floor irregular mineral variation without
  // introducing the horizontal and vertical rhythm of repeating sine bands.
  const hashNoise = (x, y) => {
    const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
    return value - Math.floor(value);
  };
  const smoothNoise = (x, y) => {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const tx = x - x0;
    const ty = y - y0;
    const sx = tx * tx * (3 - 2 * tx);
    const sy = ty * ty * (3 - 2 * ty);
    const top = lerp(hashNoise(x0, y0), hashNoise(x0 + 1, y0), sx);
    const bottom = lerp(hashNoise(x0, y0 + 1), hashNoise(x0 + 1, y0 + 1), sx);
    return lerp(top, bottom, sy);
  };
  const mineralNoise = (x, y) => {
    let total = 0;
    let amplitude = 0.58;
    let frequency = 1;
    for (let octave = 0; octave < 4; octave++) {
      // Rotate each octave so no single axis becomes visible in the texture.
      const nx = (x * 0.82 - y * 0.57) * frequency + octave * 13.7;
      const ny = (x * 0.57 + y * 0.82) * frequency - octave * 8.9;
      total += smoothNoise(nx, ny) * amplitude;
      amplitude *= 0.5;
      frequency *= 2.07;
    }
    return total;
  };

  // Fine perpendicular threads read as a woven carpet pile once tiled small.
  const weaveThread = 4.2;
  for (let y = 0; y < textureSize; y++) {
    for (let x = 0; x < textureSize; x++) {
      const i = y * textureSize + x;
      const broadMineral = mineralNoise(x * 0.018, y * 0.018);
      const brokenDust = mineralNoise(x * 0.061 + 31, y * 0.061 - 17);
      const fineGrain = (random() - 0.5) * 18;
      const grit = random() > 0.993 ? 24 + random() * 38 : 0;
      // Bend the thread grid through low-frequency noise and patch its
      // strength unevenly so it reads as a worn, hand-woven pile rather
      // than a perfect machine-printed checker.
      const threadBend = mineralNoise(x * 0.05 + 50, y * 0.05 - 50) * 3.4;
      const warp = Math.sin(((x + threadBend) / weaveThread) * Math.PI * 2);
      const weft = Math.sin(((y - threadBend) / weaveThread) * Math.PI * 2);
      const wear = 0.3 + 0.7 * Math.abs(mineralNoise(x * 0.026 - 20, y * 0.026 + 20));
      const weave = warp * weft * 34 * wear;
      const value = THREE.MathUtils.clamp(
        46 + broadMineral * 70 + brokenDust * 34 + fineGrain + grit + weave,
        34,
        166
      );
      // A literal maroon carpet texture: mineral-noise dye variation plus a
      // fine, irregular woven-thread grain from the warp/weft interference above.
      data[i * 4] = Math.min(255, 42 + value * 0.42);
      data[i * 4 + 1] = Math.min(255, 7 + value * 0.065);
      data[i * 4 + 2] = Math.min(255, 5 + value * 0.05);
      data[i * 4 + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, textureSize, textureSize, THREE.RGBAFormat);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(7, 10);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  const edgeFadeSize = 256;
  // RGBA (not single-channel RedFormat) because alphaMap sampling reads the
  // texture's alpha channel, which a RedFormat texture leaves undefined.
  const edgeFadeData = new Uint8Array(edgeFadeSize * edgeFadeSize * 4);
  for (let y = 0; y < edgeFadeSize; y++) {
    for (let x = 0; x < edgeFadeSize; x++) {
      const nx = (x + 0.5) / edgeFadeSize * 2 - 1;
      const ny = (y + 0.5) / edgeFadeSize * 2 - 1;
      const radius = Math.sqrt(nx * nx + ny * ny);
      const radialFade = 1 - THREE.MathUtils.smoothstep(radius, 0.74, 1);
      // Local +y maps to the distant/horizon side of the ground once rotated
      // into the scene, so start fading that side out well before the disc's
      // outer rim while leaving the near side (under the camera) solid.
      const horizonFade = ny > 0 ? 1 - THREE.MathUtils.smoothstep(ny, 0.02, 0.72) : 1;
      const opacity = Math.round(radialFade * horizonFade * 255);
      const i = (y * edgeFadeSize + x) * 4;
      edgeFadeData[i] = opacity;
      edgeFadeData[i + 1] = opacity;
      edgeFadeData[i + 2] = opacity;
      edgeFadeData[i + 3] = opacity;
    }
  }
  const edgeFadeTexture = new THREE.DataTexture(
    edgeFadeData,
    edgeFadeSize,
    edgeFadeSize,
    THREE.RGBAFormat
  );
  edgeFadeTexture.needsUpdate = true;

  const ground = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
    color: 0x74716c,
    map: texture,
    bumpMap: texture,
    alphaMap: edgeFadeTexture,
    bumpScale: 0.14,
    roughness: 1,
    metalness: 0,
    emissive: 0x380504,
    emissiveIntensity: 0.1,
    transparent: true,
    alphaTest: 0.015,
  }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.62, -5.5);
  ground.receiveShadow = true;
  scene.add(ground);

  const stoneGroup = new THREE.Group();
  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a3429,
    roughness: 0.98,
    metalness: 0,
  });
  const stones = [];
  for (let i = 0; i < 70; i++) {
    const radius = 0.025 + random() * 0.07;
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(radius, 0), stoneMaterial);
    stone.userData.baseZ = -14 + random() * 28;
    stone.position.set((random() - 0.5) * 12, -0.575 + random() * 0.018, stone.userData.baseZ);
    stone.scale.set(1.1 + random() * 1.4, 0.28 + random() * 0.35, 0.8 + random() * 0.7);
    stone.rotation.y = random() * Math.PI;
    stone.castShadow = true;
    stone.receiveShadow = true;
    stoneGroup.add(stone);
    stones.push(stone);
  }
  scene.add(stoneGroup);

  const contact = new THREE.Mesh(
    new THREE.CircleGeometry(1.05, 48),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.34, depthWrite: false })
  );
  contact.rotation.x = -Math.PI / 2;
  contact.scale.set(1.65, 0.55, 1);
  contact.position.y = -0.575;
  scene.add(contact);
  return {
    ground,
    contact,
    heightAt: (worldX, worldZ) => ground.position.y + surfaceOffset(worldX, ground.position.z - worldZ),
    setTravel: (progress, locomotion) => {
      const travel = progress * 5.2 + locomotion;
      texture.offset.y = travel;
      texture.offset.x = Math.sin(progress * Math.PI) * 0.035;
      const worldTravel = progress * 10.5 + locomotion * 18;
      stones.forEach((stone) => {
        stone.position.z = THREE.MathUtils.euclideanModulo(stone.userData.baseZ + worldTravel + 14, 28) - 14;
      });
      return worldTravel;
    },
  };
}

function createStarfield(scene) {
  const starCount = 190;
  const positions = new Float32Array(starCount * 3);
  const radius = 34;
  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    // Spread from near the horizon up to overhead, uniform by solid angle,
    // relative to the camera's own eye height (set in update() below) so
    // stars stay in view regardless of how far the camera pitches to
    // follow the ground.
    const phi = Math.acos(THREE.MathUtils.lerp(0.02, 0.9, Math.random()));
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Color kept dim on purpose: the scene's bloom pass blooms anything past
  // a fairly low brightness threshold, and a bright color here smears into
  // a uniform haze instead of reading as distinct stars. Size needs to be
  // fairly large in world units since stars sit ~34 units out.
  const material = new THREE.PointsMaterial({
    color: 0x4a5570,
    size: 0.22,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    fog: false,
  });
  const stars = new THREE.Points(geometry, material);
  scene.add(stars);

  return {
    stars,
    update: (now, cameraPosition) => {
      stars.position.copy(cameraPosition);
      material.opacity = 0.42 + Math.sin(now * 0.00055) * 0.13;
    },
  };
}

function createDestinationGroundMarkers(scene, heightAt) {
  const markers = RUN_DESTINATIONS.map((destination) => {
    const label = document.createElement('canvas');
    // Keep longer location names legible on the ground plane.
    label.width = 2200;
    label.height = 500;
    const context = label.getContext('2d');
    context.clearRect(0, 0, label.width, label.height);
    context.strokeStyle = 'rgba(242, 230, 197, 0.36)';
    context.lineWidth = 5;
    context.strokeRect(26, 26, label.width - 52, label.height - 52);
    context.fillStyle = '#f2e6c5';
    let fontSize = 182;
    context.font = `500 ${fontSize}px Marcellus, Georgia, serif`;
    while (context.measureText(destination.name).width > label.width - 180 && fontSize > 112) {
      fontSize -= 4;
      context.font = `500 ${fontSize}px Marcellus, Georgia, serif`;
    }
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(destination.name, label.width / 2, label.height / 2 + 4);

    const texture = new THREE.CanvasTexture(label);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const marker = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 0.795), material);
    marker.rotation.x = -Math.PI / 2;
    marker.position.set(destination.x, heightAt(destination.x, destination.z) + 0.04, destination.z);
    marker.visible = false;
    scene.add(marker);
    return { ...destination, marker };
  });

  return (progress) => {
    markers.forEach(({ marker, start, end }) => {
      const reveal = THREE.MathUtils.smoothstep(progress, start - 0.018, start + 0.018);
      const fade = 1 - THREE.MathUtils.smoothstep(progress, end - 0.025, end);
      const opacity = reveal * fade;
      marker.visible = opacity > 0.01;
      marker.material.opacity = opacity;
      const zoom = 1 + THREE.MathUtils.smoothstep(progress, start, end) * 0.18;
      marker.scale.setScalar(zoom);
    });
  };
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
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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
  let modelBaseScale = null;
  const modelRef = { current: null };
  createDragTuner({ canvas, modelRef, sceneName: 'portrait' });
  loader.load('/assets/SIT.Fbx', (fbx) => {
    model = fbx;
    modelRef.current = model;
    applyFurMaterial(model);
    // Keep the full sitting silhouette in the opening frame.
    // Retain the visitor-selected placement while giving the seated portrait
    // a stronger presence in the opening composition.
    normalizeModel(model, 3.055);
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
  const maskBackdrop = document.getElementById('mwp-mask-backdrop');
  const logoMask = document.getElementById('mwp-mask-overlay');
  const finalActions = document.getElementById('final-actions');
  if (!canvas || !section || reduceMotion) return null;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  // The post-processing chain (bloom, liquid-metal pass) doesn't carry the
  // render target's alpha through to the canvas, so the "empty sky" area
  // always composites as fully opaque — paint it navy instead of relying on
  // the CSS backdrop showing through.
  renderer.setClearColor(0x020509, 1);

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.22;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x081527, 0.026);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
  camera.position.set(0, 1.15, 5.8);
  camera.lookAt(0, 0.95, 0);

  scene.add(new THREE.AmbientLight(0x633024, 1.12));
  scene.add(new THREE.HemisphereLight(0x7f7770, 0x32120b, 0.72));
  const sun = new THREE.DirectionalLight(0xffc071, 4.2);
  sun.position.set(-3.8, 4.8, 3.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -7;
  sun.shadow.camera.right = 7;
  sun.shadow.camera.top = 7;
  sun.shadow.camera.bottom = -7;
  sun.shadow.bias = -0.0004;
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0x8a3324, 2.4);
  rim.position.set(3.6, 1.8, -3.5);
  scene.add(rim);
  const { contact, heightAt, setTravel } = createGround(scene);
  const updateFractures = createFractureField(scene);
  const updateDestinationMarkers = createDestinationGroundMarkers(scene, heightAt);
  const { update: updateStars } = createStarfield(scene);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const liquidMetalPass = new ShaderPass(LiquidMetalShader);
  composer.addPass(liquidMetalPass);
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.72, 0.7, 0.72);
  composer.addPass(bloom);

  let mixer = null;
  let model = null;
  let modelBaseScale = null;
  loader.load('/assets/RUN.Fbx', (fbx) => {
    model = fbx;
    applyFurMaterial(model);
    normalizeModel(model, 1.75);
    modelBaseScale = model.scale.x;
    applyRunScrollPose(model, getRunScrollProgress());
    model.traverse((object) => {
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        if (!('emissive' in material)) return;
        material.emissive.set(0x170702);
        material.emissiveIntensity = 0.16;
        if ('roughness' in material) material.roughness = Math.max(material.roughness, 0.8);
      });
    });
    scene.add(model);

    if (model.animations.length) {
      mixer = new THREE.AnimationMixer(model);
      const action = mixer.clipAction(model.animations[0]);
      action.setLoop(THREE.LoopRepeat);
      action.play();
    }
  });

  function resizeRunScene() {
    fitRenderer(renderer, canvas, camera);
    const rect = canvas.getBoundingClientRect();
    composer.setSize(Math.max(1, rect.width), Math.max(1, rect.height));
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  resizeRunScene();
  window.addEventListener('resize', resizeRunScene);

  let visible = true;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(section);

  const clock = new THREE.Clock();
  let previousRunProgress = getRunScrollProgress();
  let animationSpeed = 0;
  let locomotionDistance = 0;
  let distanceCameraAnchor = null;
  renderer.setAnimationLoop((now) => {
    const delta = clock.getDelta();
    if (!visible || document.hidden) return;
    const runProgress = getRunScrollProgress();
    const scrollVelocity = Math.abs(runProgress - previousRunProgress) / Math.max(delta, 0.001);
    const isScrolling = now - lastStoryScrollAt < 180;
    const movingSpeed = lerp(0.72, 1.55, Math.min(scrollVelocity / 0.55, 1));
    // Keep the animal moving into the distance before the final reveal begins.
    const abyssRun = THREE.MathUtils.smoothstep(runProgress, 0.92, 0.985);
    const showAbyssMessage = abyssRun >= 0.62;
    section.classList.toggle('is-abyss-message-visible', showAbyssMessage);
    // As the cheetah recedes into the distance, the full-bleed scene closes
    // down into the MWP mark's silhouette: a big, softly out-of-focus mask
    // zooms in and resolves down to the small logo-shaped window.
    if (logoMask) {
      const logoRun = THREE.MathUtils.smoothstep(runProgress, 0.90, 0.995);
      const logoScale = lerp(3.6, 1, logoRun);
      // The mask enters only after the cheetah has started receding.
      const logoOpacity = THREE.MathUtils.smoothstep(runProgress, 0.945, 0.972);
      logoMask.style.opacity = String(logoOpacity);
      logoMask.style.transform = `scale(${logoScale.toFixed(4)})`;
      // Let the white lift arrive after the mask, rather than washing out the
      // running scene at the same time as the logo appears.
      if (maskBackdrop) {
        const whiteLift = THREE.MathUtils.smoothstep(runProgress, 0.972, 0.998);
        maskBackdrop.style.opacity = String(whiteLift * 0.2);
      }
      if (finalActions) finalActions.classList.toggle('is-visible', runProgress >= 0.998);
    }
    // Once the visitor enters, the animal barely moves when scrolling stops.
    // Scroll velocity adds urgency, with faster scrolling producing a faster run.
    const targetAnimationSpeed = experienceStarted
      ? (isScrolling ? movingSpeed : 0.12) * lerp(1, 0.72, abyssRun)
      : 0.10;
    animationSpeed = THREE.MathUtils.damp(animationSpeed, targetAnimationSpeed, isScrolling ? 8 : 4.5, delta);
    if (mixer) mixer.update(delta * animationSpeed);
    locomotionDistance += delta * animationSpeed * 0.19;
    previousRunProgress = runProgress;
    const pose = model
      ? applyRunScrollPose(model, runProgress)
      : getRunScrollPose(runProgress);
    pose.position.z -= abyssRun * 8;
    pose.position.y = heightAt(pose.position.x, pose.position.z) + 0.008;
    if (model) {
      model.position.x = pose.position.x;
      model.position.y = pose.position.y;
      model.position.z = pose.position.z;
      const maskScale = THREE.MathUtils.smoothstep(runProgress, 0.945, 0.998);
      model.scale.setScalar(modelBaseScale * lerp(1, 0.56, maskScale));
    }
    const groundTravel = setTravel(runProgress, locomotionDistance);
    updateDestinationMarkers(runProgress);
    const finalApproach = THREE.MathUtils.smoothstep(runProgress, 0.86, 0.98);
    scene.fog.density = 0.026 + runProgress * 0.012 + abyssRun * 0.024;
    const gaitPhase = locomotionDistance * 15.5;
    const gaitEnergy = THREE.MathUtils.smoothstep(animationSpeed, 0.08, 0.68);
    const bobX = Math.sin(gaitPhase) * 0.014 * gaitEnergy;
    const bobY = Math.abs(Math.sin(gaitPhase * 2)) * 0.026 * gaitEnergy;
    const target = new THREE.Vector3(
      pose.position.x,
      pose.position.y + 0.92,
      pose.position.z
    );

    const mood = getDestinationMood(runProgress);
    const finalCameraMove = 0;
    const orbitPosition = new THREE.Vector3(
      target.x + Math.sin(mood.cameraAngle) * mood.cameraRadius,
      target.y + mood.cameraHeight + bobY,
      target.z + Math.cos(mood.cameraAngle) * mood.cameraRadius
    );
    const pawTarget = new THREE.Vector3(pose.position.x + 0.12, pose.position.y + 0.12, pose.position.z + 0.22);
    const pawCamera = new THREE.Vector3(pawTarget.x + 0.48, pawTarget.y + 0.42, pawTarget.z + 1.42);
    const chaseCamera = orbitPosition.clone().lerp(pawCamera, finalCameraMove);
    chaseCamera.x += bobX;
    const lookTarget = target.clone().lerp(pawTarget, finalCameraMove);

    // Once the cheetah begins receding, hold the camera in world space so the
    // animal visibly travels away instead of being followed at a fixed size.
    if (runProgress < 0.92) {
      distanceCameraAnchor = null;
    } else if (!distanceCameraAnchor) {
      distanceCameraAnchor = {
        // The animal runs away from us along -Z, so hold a centered rear
        // camera to make the back view and increasing distance unmistakable.
        camera: new THREE.Vector3(
          pose.position.x,
          pose.position.y + 1.12,
          pose.position.z + 5.8
        ),
        look: new THREE.Vector3(
          pose.position.x,
          pose.position.y + 0.78,
          pose.position.z - 2.3
        ),
      };
    }
    if (distanceCameraAnchor) {
      const distanceHold = THREE.MathUtils.smoothstep(runProgress, 0.92, 0.955);
      chaseCamera.lerp(distanceCameraAnchor.camera, distanceHold);
      lookTarget.lerp(distanceCameraAnchor.look, distanceHold);
    }

    // Only after the white lift has arrived, swing to a clean side profile so
    // the cheetah remains readable behind the centered MWP mark.
    const finaleCameraMove = THREE.MathUtils.smoothstep(runProgress, 0.985, 1);
    const finaleCamera = new THREE.Vector3(
      pose.position.x + 6.2,
      // Lower the final camera and aim together so the cheetah rises within
      // the centered MWP glyph instead of sitting too low behind it.
      pose.position.y + 1.05,
      pose.position.z + 0.28
    );
    const finaleLook = new THREE.Vector3(
      pose.position.x,
      pose.position.y + 0.61,
      pose.position.z
    );
    chaseCamera.lerp(finaleCamera, finaleCameraMove);
    lookTarget.lerp(finaleLook, finaleCameraMove);

    // Hold a complete, slow-motion side profile before interaction, then rise
    // across the shoulder and stitch into the established rear chase camera.
    const openingRaw = experienceStartedAt === null
      ? 0
      : THREE.MathUtils.clamp((now - experienceStartedAt) / OPENING_CAMERA_DURATION, 0, 1);
    const openingProgress = THREE.MathUtils.smootherstep(openingRaw, 0, 1);
    if (openingRaw < 1) {
      const closeDetail = new THREE.Vector3(target.x + 4.15, target.y + 0.18, target.z + 0.04);
      const risingProfile = new THREE.Vector3(target.x + 3.72, target.y + 1.38, target.z - 0.72);
      const shoulderCross = new THREE.Vector3(target.x - 0.82, target.y + 2.18, target.z + 2.34);
      camera.position.copy(cubicBezierVector(
        closeDetail,
        risingProfile,
        shoulderCross,
        chaseCamera,
        openingProgress
      ));
      const closeLook = new THREE.Vector3(target.x, target.y - 0.02, target.z - 0.10);
      camera.lookAt(closeLook.lerp(lookTarget, openingProgress));
      // The roll peaks during the overhead cross and returns level at handoff.
      camera.rotateZ(Math.sin(openingProgress * Math.PI) * -0.105);
      camera.fov = lerp(36, 42, openingProgress)
        + Math.sin(openingProgress * Math.PI) * 4;
      camera.updateProjectionMatrix();
    } else {
      camera.position.copy(chaseCamera);
      camera.lookAt(lookTarget);
      if (camera.fov !== 42) {
        camera.fov = 42;
        camera.updateProjectionMatrix();
      }
    }

    updateFractures(runProgress, now, groundTravel);

    contact.position.x = pose.position.x;
    contact.position.z = pose.position.z + 0.08;
    contact.position.y = pose.position.y + 0.004;
    contact.scale.x = 1.55 + Math.sin(gaitPhase * 2) * 0.08 * gaitEnergy;
    contact.scale.z = 0.52 + Math.abs(Math.cos(gaitPhase * 2)) * 0.045 * gaitEnergy;
    const fractureBuild = THREE.MathUtils.smoothstep(runProgress, 0.58, 0.82);
    contact.material.opacity = lerp(0.4, 0.22, fractureBuild)
      * (0.82 + gaitEnergy * 0.18)
      * (1 - THREE.MathUtils.smoothstep(abyssRun, 0.65, 1));
    bloom.strength = lerp(0.64, 0.84, fractureBuild)
      + finalApproach * 0.12;
    liquidMetalPass.uniforms.uTime.value = now * 0.001;
    liquidMetalPass.uniforms.uFlowStrength.value = experienceStarted ? 1 : 0;
    liquidMetalPass.uniforms.uTint.value.copy(mood.lightColor);
    updateStars(now, camera.position);
    composer.render();
  });

  return renderer;
}

createPortraitScene();
createRunScene();
