const story = document.querySelector('.destination-story');
const polaroids = Array.from(document.querySelectorAll('.destination-polaroid'));
// Each photograph arrives after its matching floor title becomes readable.
const photoMoments = {
  delhi: { show: 0.020, hide: 0.095 },
  udaipur: { show: 0.110, hide: 0.185 },
  mumbai: { show: 0.200, hide: 0.275 },
  indore: { show: 0.290, hide: 0.365 },
  goa: { show: 0.380, hide: 0.455 },
  kolkata: { show: 0.470, hide: 0.545 },
  bangalore: { show: 0.560, hide: 0.635 },
  istanbul: { show: 0.650, hide: 0.725 },
  'hua-hin': { show: 0.740, hide: 0.815 },
};
// Beyond this point the scene closes down into the MWP mask reveal, so no
// polaroid should still be mid-flight or lingering on screen.
const MASK_REVEAL_START = 0.885;

if (story && polaroids.length) {
  function updatePolaroids() {
    const rect = story.getBoundingClientRect();
    const distance = Math.max(story.offsetHeight - window.innerHeight, 1);
    const sequenceProgress = Math.min(Math.max(-rect.top / distance, 0), 1);
    // Match the Three.js journey timeline so each photograph and its ground
    // title arrive as one composed moment.
    const progress = Math.min(Math.max((sequenceProgress - 0.05) / 0.90, 0), 1);
    polaroids.forEach((polaroid) => {
      const moment = photoMoments[polaroid.dataset.destination];
      const visible = Boolean(moment)
        && progress >= moment.show
        && progress < moment.hide
        && progress < MASK_REVEAL_START;
      polaroid.classList.toggle('is-visible', visible);
    });
  }

  polaroids.forEach((polaroid) => {
    polaroid.addEventListener('click', () => {
      polaroids.forEach((item) => item.classList.toggle('is-selected', item === polaroid));
    });
  });

  updatePolaroids();
  window.addEventListener('scroll', updatePolaroids, { passive: true });
  window.addEventListener('resize', updatePolaroids);
}
