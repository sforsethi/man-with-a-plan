const story = document.querySelector('.destination-story');
const polaroids = Array.from(document.querySelectorAll('.destination-polaroid'));
// Each photograph arrives after its matching floor title becomes readable.
const photoMoments = {
  delhi: { show: 0.058, hide: 0.093 },
  jaipur: { show: 0.115, hide: 0.190 },
  mumbai: { show: 0.282, hide: 0.352 },
  bangalore: { show: 0.612, hide: 0.690 },
  'hua-hin': { show: 0.943, hide: 0.990 },
};

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
        && progress < moment.hide;
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
