const story = document.querySelector('.destination-story');
const polaroids = Array.from(document.querySelectorAll('.destination-polaroid'));
// Fallback timing for browsers that cannot render the Three.js cards.
const photoMoments = {
  delhi: { show: 0.015, hide: 0.102 },
  jaipur: { show: 0.097, hide: 0.184 },
  udaipur: { show: 0.179, hide: 0.266 },
  goa: { show: 0.261, hide: 0.348 },
  mumbai: { show: 0.343, hide: 0.430 },
  bangalore: { show: 0.425, hide: 0.512 },
  indore: { show: 0.507, hide: 0.594 },
  thailand: { show: 0.671, hide: 0.758 },
  venice: { show: 0.753, hide: 0.840 },
  istanbul: { show: 0.835, hide: 0.922 },
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
      window.location.assign(`/portfolio/${polaroid.dataset.destination}/`);
    });
  });

  updatePolaroids();
  window.addEventListener('scroll', updatePolaroids, { passive: true });
  window.addEventListener('resize', updatePolaroids);
}
