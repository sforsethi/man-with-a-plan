const story = document.querySelector('.destination-story');
const polaroids = Array.from(document.querySelectorAll('.destination-polaroid'));
// Fallback timing for browsers that cannot render the Three.js cards.
const photoMoments = {
  delhi: { show: 0.015, hide: 0.110 },
  jaipur: { show: 0.105, hide: 0.200 },
  udaipur: { show: 0.195, hide: 0.290 },
  goa: { show: 0.285, hide: 0.380 },
  mumbai: { show: 0.375, hide: 0.470 },
  bangalore: { show: 0.465, hide: 0.560 },
  indore: { show: 0.555, hide: 0.650 },
  thailand: { show: 0.645, hide: 0.740 },
  istanbul: { show: 0.735, hide: 0.830 },
  kolkata: { show: 0.825, hide: 0.920 },
};
// Beyond this point the scene closes down into the MWP mask reveal, so no
// polaroid should still be mid-flight or lingering on screen.
const MASK_REVEAL_START = 0.885;

if (story && polaroids.length) {
  function updatePolaroids() {
    const rect = story.getBoundingClientRect();
    const distance = Math.max(story.offsetHeight - window.innerHeight, 1);
    const sequenceProgress = Math.min(Math.max(-rect.top / distance, 0), 1);
    // Match the Three.js pass-by journey timing.
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
