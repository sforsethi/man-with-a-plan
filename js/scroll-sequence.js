const sequence = document.querySelector('.hero-sequence');
const panels = Array.from(document.querySelectorAll('.sequence-panel'));

function smoothstep(edge0, edge1, value) {
  const t = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

function setPanelOpacities(progress) {
  const firstOut = smoothstep(0.12, 0.22, progress);
  const secondIn = firstOut;
  const secondOut = smoothstep(0.80, 0.90, progress);
  const thirdIn = secondOut;

  const opacities = [
    1 - firstOut,
    secondIn * (1 - secondOut),
    thirdIn,
  ];

  let activeIndex = 0;
  opacities.forEach((opacity, index) => {
    if (opacity > opacities[activeIndex]) activeIndex = index;
    panels[index].style.opacity = opacity.toFixed(3);
    panels[index].setAttribute('aria-hidden', opacity < 0.08 ? 'true' : 'false');
  });

  panels.forEach((panel, index) => {
    panel.classList.toggle('is-active', index === activeIndex);
  });
}

function updateSequence() {
  if (!sequence || panels.length !== 3) return;

  const rect = sequence.getBoundingClientRect();
  const scrollable = Math.max(sequence.offsetHeight - window.innerHeight, 1);
  const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
  setPanelOpacities(progress);
}

updateSequence();
window.addEventListener('scroll', updateSequence, { passive: true });
window.addEventListener('resize', updateSequence);
